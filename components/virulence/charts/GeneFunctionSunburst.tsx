'use client';

import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import { plotlyBaseLayout, plotlyResponsiveConfig, usePlotlyResizeOnMount } from '@/lib/virulence/plotlyResponsive';
import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const CATEGORY_COLORS: Record<string, string> = {
  adhesion: '#3b82f6',
  invasion: '#22c55e',
  toxin: '#ef4444',
  mobility: '#f59e0b',
  colonization: '#8b5cf6',
  survival: '#06b6d4',
  other: '#6b7280',
};

const CATEGORY_LABELS: Record<string, string> = {
  adhesion: 'Adhesion',
  invasion: 'Invasion',
  toxin: 'Toxin',
  mobility: 'Motility',
  colonization: 'Colonization',
  survival: 'Survival',
  other: 'Other',
};

const CATEGORY_ORDER = ['adhesion', 'invasion', 'toxin', 'mobility', 'colonization', 'survival', 'other'];

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function annotationFromGene(
  geneName: string,
  filterByGene: (name: string) => { function: string; notes?: string } | undefined
): string | null {
  const g = filterByGene(geneName);
  if (!g) return null;
  const fn = g.function?.trim();
  if (fn && fn.length > 0 && fn.toLowerCase() !== 'unknown') return fn;
  const notes = g.notes?.trim();
  if (notes && notes.length > 0) return notes.length > 200 ? `${notes.slice(0, 197)}…` : notes;
  return null;
}

export default function GeneFunctionSunburst() {
  const { data, loading, error, filterByGene } = useVirulenceData();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  usePlotlyResizeOnMount();

  const sunburstArrays = useMemo(() => {
    if (!data?.processes) return null;
    const processes = data.processes;
    const sortedCategories = CATEGORY_ORDER
      .filter(c => processes[c]?.length > 0)
      .concat(Object.keys(processes).filter(c => !CATEGORY_ORDER.includes(c) && processes[c]?.length > 0));
    if (sortedCategories.length === 0) return null;

    const totalGenes = sortedCategories.reduce((sum, cat) => sum + processes[cat].length, 0);
    const ids: string[] = ['root'];
    const labels: string[] = ['Virulence Genes'];
    const parents: string[] = [''];
    const values: number[] = [totalGenes];
    const colors: string[] = ['#374151'];
    const hovertext: string[] = [`<b>Virulence Genes</b><br>Total genes: ${totalGenes}`];

    for (const cat of sortedCategories) {
      const genes = processes[cat];
      const displayLabel = CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
      const catColor = CATEGORY_COLORS[cat] || '#6b7280';
      ids.push(`cat-${cat}`);
      labels.push(displayLabel);
      parents.push('root');
      values.push(genes.length);
      colors.push(catColor);
      hovertext.push(`<b>${escapeHtml(displayLabel)}</b><br>Genes: ${genes.length}`);

      for (const gene of genes) {
        ids.push(`cat-${cat}|${gene}`);
        labels.push(gene);
        parents.push(`cat-${cat}`);
        values.push(1);
        colors.push(catColor);
        const ann = annotationFromGene(gene, filterByGene);
        let leaf = `<b>${escapeHtml(gene)}</b><br>Category: ${escapeHtml(displayLabel)}<br>Role: Virulence-associated gene`;
        if (ann) leaf += `<br>Annotation: ${escapeHtml(ann)}`;
        hovertext.push(leaf);
      }
    }
    return { ids, labels, parents, values, colors, hovertext, totalGenes, sortedCategories };
  }, [data?.processes, filterByGene]);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading chart...</div>;
  if (error || !data || !sunburstArrays) return <div className="text-center py-8 text-red-600">Error: {error || 'No data available'}</div>;

  const { sortedCategories } = sunburstArrays;
  const processes = data.processes;

  const plotData: Array<Record<string, unknown>> = [{
    type: 'sunburst',
    ids: sunburstArrays.ids, labels: sunburstArrays.labels, parents: sunburstArrays.parents,
    values: sunburstArrays.values, hovertext: sunburstArrays.hovertext, branchvalues: 'total',
    marker: { colors: sunburstArrays.colors, line: { width: 1.5, color: '#ffffff' } },
    textfont: { color: '#ffffff', size: isMobile ? 10 : 12 },
    insidetextorientation: 'radial',
    hovertemplate: '%{hovertext}<extra></extra>',
  }];

  const layout = plotlyBaseLayout({ margin: { t: 40, l: 40, r: 40, b: 40 }, font: { color: '#374151' } });

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 text-xs sm:text-sm">
        {sortedCategories.map(cat => {
          const label = CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
          const color = CATEGORY_COLORS[cat] || '#6b7280';
          const count = processes[cat]?.length ?? 0;
          return (
            <div key={cat} className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
              <span className="text-gray-600">{label} ({count})</span>
            </div>
          );
        })}
      </div>
      <div className="w-full h-[500px] sm:h-[560px]">
        <Plot data={plotData} layout={layout} config={plotlyResponsiveConfig} useResizeHandler style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
