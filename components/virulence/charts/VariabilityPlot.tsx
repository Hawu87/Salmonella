'use client';

import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import { plotlyBaseLayout, plotlyResponsiveConfig, usePlotlyResizeOnMount } from '@/lib/virulence/plotlyResponsive';
import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type VariabilityMode = 'hosts' | 'species' | 'combined';
type SortMode = 'variability-desc' | 'variability-asc' | 'alphabetical';
type ErrorMetric = 'range' | 'sd';

function quantile(sortedArray: number[], q: number): number {
  if (sortedArray.length === 0) return 0;
  if (sortedArray.length === 1) return sortedArray[0];
  const index = (sortedArray.length - 1) * q;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return lower === upper ? sortedArray[lower] : sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Adhesion': '#3B82F6', 'Invasion': '#10B981', 'Toxin': '#EF4444',
  'Motility': '#F59E0B', 'Iron uptake': '#8B5CF6', 'Stress response': '#EC4899', 'Other': '#6B7280',
};

function categorizeFunction(functionName: string): string {
  const func = functionName.toLowerCase();
  if (func.includes('adhesion') || func.includes('adhere')) return 'Adhesion';
  if (func.includes('invasion') || func.includes('invade')) return 'Invasion';
  if (func.includes('toxin') || func.includes('cdt')) return 'Toxin';
  if (func.includes('flagella') || func.includes('fla') || func.includes('motility') || func.includes('mobility')) return 'Motility';
  if (func.includes('iron') || func.includes('fe')) return 'Iron uptake';
  if (func.includes('stress') || func.includes('response') || func.includes('survival')) return 'Stress response';
  return 'Other';
}

interface GeneVariability {
  geneName: string; category: string; meanPrevalence: number; stdDev: number;
  minPrevalence: number; maxPrevalence: number; range: number;
  values: number[]; minSource: string; maxSource: string;
}

export default function VariabilityPlot() {
  const { data, loading, error } = useVirulenceData();
  const [mode, setMode] = useState<VariabilityMode>('hosts');
  const [sortMode, setSortMode] = useState<SortMode>('variability-desc');
  const [errorMetric, setErrorMetric] = useState<ErrorMetric>('range');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => { setIsMobile(window.innerWidth < 640); setIsTablet(window.innerWidth < 1024 && window.innerWidth >= 640); };
    check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check);
  }, []);

  usePlotlyResizeOnMount();

  const geneVariability = useMemo(() => {
    if (!data) return [];
    const allGenes = new Set<string>();
    Object.values(data.hostPrevalence).forEach(hd => Object.keys(hd).forEach(g => allGenes.add(g)));
    const geneFunction: Record<string, string> = {};
    data.genes.forEach(g => { if (!geneFunction[g.geneName]) geneFunction[g.geneName] = g.function; });
    const hostCategories = ['Poultry', 'Cattle', 'Swine', 'Human', 'Multiple'];
    const availableHosts = hostCategories.filter(h => data.hostPrevalence[h]);
    const speciesPrevalence: Record<string, Record<string, number>> = { 'C. jejuni': {}, 'C. coli': {} };
    const speciesGeneCounts: Record<string, Record<string, number>> = { 'jejuni': {}, 'coli': {} };
    const speciesTotals: Record<string, number> = { 'jejuni': 0, 'coli': 0 };
    data.genes.forEach(gene => {
      gene.species.forEach(sp => {
        const ns = sp.toLowerCase().includes('jejuni') ? 'jejuni' : sp.toLowerCase().includes('coli') ? 'coli' : null;
        if (ns) { speciesGeneCounts[ns][gene.geneName] = (speciesGeneCounts[ns][gene.geneName] || 0) + 1; speciesTotals[ns]++; }
      });
    });
    Object.keys(speciesGeneCounts).forEach(sp => {
      const label = sp === 'jejuni' ? 'C. jejuni' : 'C. coli';
      const total = speciesTotals[sp];
      Object.keys(speciesGeneCounts[sp]).forEach(gene => {
        speciesPrevalence[label][gene] = total > 0 ? Math.round((speciesGeneCounts[sp][gene] / total) * 10000) / 100 : 0;
      });
    });
    const results: GeneVariability[] = [];
    allGenes.forEach(geneName => {
      const values: number[] = [];
      const labeled: Array<{ label: string; value: number }> = [];
      if (mode === 'hosts' || mode === 'combined') availableHosts.forEach(h => { const v = data.hostPrevalence[h]?.[geneName] || 0; values.push(v); labeled.push({ label: h, value: v }); });
      if (mode === 'species' || mode === 'combined') Object.keys(speciesPrevalence).forEach(sp => { const v = speciesPrevalence[sp]?.[geneName] || 0; values.push(v); labeled.push({ label: sp, value: v }); });
      if (values.length === 0) return;
      const mean = values.reduce((s, v) => s + v, 0) / values.length;
      const min = Math.min(...values); const max = Math.max(...values); const range = max - min;
      const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      results.push({
        geneName, category: categorizeFunction(geneFunction[geneName] || 'Unknown'),
        meanPrevalence: Math.round(mean * 100) / 100, stdDev: Math.round(stdDev * 100) / 100,
        minPrevalence: Math.round(min * 100) / 100, maxPrevalence: Math.round(max * 100) / 100, range: Math.round(range * 100) / 100,
        values, minSource: labeled.find(lv => lv.value === min)?.label || 'Unknown', maxSource: labeled.find(lv => lv.value === max)?.label || 'Unknown',
      });
    });
    if (sortMode === 'variability-desc') results.sort((a, b) => errorMetric === 'range' ? b.range - a.range : b.stdDev - a.stdDev);
    else if (sortMode === 'variability-asc') results.sort((a, b) => errorMetric === 'range' ? a.range - b.range : a.stdDev - b.stdDev);
    else results.sort((a, b) => a.geneName.localeCompare(b.geneName));
    return results;
  }, [data, mode, sortMode, errorMetric]);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading variability plot...</div>;
  if (error || !data) return <div className="text-center py-8 text-red-600">Error: {error || 'No data available'}</div>;

  const categories = [...new Set(geneVariability.map(g => g.category))];
  const traces: Array<Record<string, unknown>> = categories.map(category => {
    const cg = geneVariability.filter(g => g.category === category);
    const errorBars = errorMetric === 'range'
      ? { type: 'data' as const, symmetric: false, array: cg.map(g => g.maxPrevalence - g.meanPrevalence), arrayminus: cg.map(g => g.meanPrevalence - g.minPrevalence) }
      : { type: 'data' as const, symmetric: true, array: cg.map(g => g.stdDev), arrayminus: cg.map(g => g.stdDev) };
    return {
      type: 'scatter', mode: 'markers', name: category,
      x: cg.map(g => g.geneName), y: cg.map(g => g.meanPrevalence),
      error_y: { ...errorBars, color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'], thickness: 1.5, width: 4 },
      marker: { color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'], size: isMobile ? 8 : 10, line: { color: 'white', width: 1 } },
      hovertemplate: cg.map(g =>
        `<b>${g.geneName}</b><br>Category: ${g.category}<br>Mean: ${g.meanPrevalence.toFixed(1)}%<br>SD: ${g.stdDev.toFixed(1)}%<br>Min: ${g.minPrevalence.toFixed(1)}% (${g.minSource})<br>Max: ${g.maxPrevalence.toFixed(1)}% (${g.maxSource})<br>Range: ${g.range.toFixed(1)}%<extra></extra>`
      ),
    };
  });

  const variabilityValues = geneVariability.map(g => errorMetric === 'range' ? g.range : g.stdDev);
  const sorted = [...variabilityValues].sort((a, b) => a - b);
  const lowThreshold = quantile(sorted, 0.25);
  const highThreshold = quantile(sorted, 0.75);
  const plotH = isMobile ? Math.max(450, geneVariability.length * 8) : isTablet ? Math.max(500, geneVariability.length * 10) : Math.max(550, geneVariability.length * 12);

  const layout = plotlyBaseLayout({
    title: { text: 'Gene Prevalence Variability (Stability)', font: { size: isMobile ? 14 : isTablet ? 16 : 18, color: '#111827' } },
    xaxis: { title: { text: 'Gene', font: { size: isMobile ? 10 : 12 } }, tickangle: -45, tickfont: { size: isMobile ? 7 : isTablet ? 8 : 9 }, automargin: true, categoryorder: 'array', categoryarray: geneVariability.map(g => g.geneName) },
    yaxis: { title: { text: 'Prevalence (%)', font: { size: isMobile ? 10 : 12 } }, tickfont: { size: isMobile ? 9 : 10 }, range: [0, 105], gridcolor: 'rgba(128, 128, 128, 0.2)' },
    legend: { orientation: isMobile ? 'h' : 'v', x: isMobile ? 0 : 1.02, y: isMobile ? -0.3 : 1, xanchor: isMobile ? 'left' : 'left', yanchor: 'top', font: { size: isMobile ? 9 : 11 }, bgcolor: 'rgba(255,255,255,0.9)', bordercolor: 'rgba(0,0,0,0.1)', borderwidth: 1 },
    margin: { l: isMobile ? 50 : 60, r: isMobile ? 40 : 150, t: isMobile ? 80 : 60, b: isMobile ? 150 : 180 },
    hovermode: 'closest', showlegend: true,
    font: { color: '#374151' },
    annotations: [{ x: 0, y: -0.22, xref: 'paper', yref: 'paper', text: '<b>Interpretation:</b> Low variability = Core gene | High variability = Host/species-adaptive gene', showarrow: false, font: { size: isMobile ? 8 : 10, color: '#666' }, align: 'left', xanchor: 'left' }],
    shapes: [{ type: 'line', x0: 0, x1: 1, xref: 'paper', y0: 50, y1: 50, line: { color: 'rgba(100,100,100,0.3)', width: 1, dash: 'dot' } }],
  });

  const selectClass = "border border-gray-300 rounded px-3 py-1.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Calculate across:</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as VariabilityMode)} className={selectClass}><option value="hosts">Hosts only</option><option value="species">Species only</option><option value="combined">Hosts + Species</option></select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} className={selectClass}><option value="variability-desc">Highest variability first</option><option value="variability-asc">Lowest variability first</option><option value="alphabetical">Alphabetical</option></select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Error bars:</label>
          <select value={errorMetric} onChange={(e) => setErrorMetric(e.target.value as ErrorMetric)} className={selectClass}><option value="range">Min to Max range</option><option value="sd">± 1 SD</option></select>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gradient-to-r from-teal-50 to-amber-50 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm" /><span className="text-gray-700">Dot = Mean prevalence</span></div>
          <div className="flex items-center gap-2"><div className="flex flex-col items-center"><div className="w-0.5 h-2 bg-gray-500" /><div className="w-2 h-0.5 bg-gray-500" /><div className="w-0.5 h-2 bg-gray-500" /></div><span className="text-gray-700">Error bar = {errorMetric === 'range' ? 'Min to Max range' : '± 1 SD'}</span></div>
          <div className="flex items-center gap-2 text-gray-600"><span className="font-medium">Colors:</span><span>Gene functional category</span></div>
        </div>
      </div>

      <div className="w-full" style={{ height: plotH }}>
        <Plot data={traces} layout={layout} config={{ ...plotlyResponsiveConfig, modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'] }} useResizeHandler style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Functional Categories</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} /><span className="text-xs text-gray-600">{cat}</span></div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="text-lg font-bold text-emerald-700">{geneVariability.filter(g => (errorMetric === 'range' ? g.range : g.stdDev) <= lowThreshold).length}</div>
          <div className="text-xs text-emerald-600">Core genes (low var)</div>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="text-lg font-bold text-amber-700">{geneVariability.filter(g => { const v = errorMetric === 'range' ? g.range : g.stdDev; return v > lowThreshold && v < highThreshold; }).length}</div>
          <div className="text-xs text-amber-600">Moderate variability</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-lg font-bold text-red-700">{geneVariability.filter(g => (errorMetric === 'range' ? g.range : g.stdDev) >= highThreshold).length}</div>
          <div className="text-xs text-red-600">Adaptive genes (high var)</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-lg font-bold text-gray-700">{geneVariability.length}</div>
          <div className="text-xs text-gray-600">Total genes</div>
        </div>
      </div>
    </div>
  );
}
