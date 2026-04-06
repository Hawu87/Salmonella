'use client';

import { useData } from '../DataProvider';
import { plotlyBaseLayout, plotlyResponsiveConfig, usePlotlyResizeOnMount } from '@/components/plotlyResponsive';
import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type VariabilityMode = 'hosts' | 'species' | 'combined';
type SortMode = 'variability-desc' | 'variability-asc' | 'alphabetical';
type ErrorMetric = 'range' | 'sd';

// Helper function to compute quantile with linear interpolation
function quantile(sortedArray: number[], q: number): number {
  if (sortedArray.length === 0) return 0;
  if (sortedArray.length === 1) return sortedArray[0];
  
  const index = (sortedArray.length - 1) * q;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) {
    return sortedArray[lower];
  }
  
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

// Consistent color palette for functional categories across all visualizations
const CATEGORY_COLORS: Record<string, string> = {
  'Adhesion': '#3B82F6',      // Blue
  'Invasion': '#10B981',      // Emerald
  'Toxin': '#EF4444',         // Red
  'Motility': '#F59E0B',      // Amber
  'Iron uptake': '#8B5CF6',   // Purple
  'Stress response': '#EC4899', // Pink
  'Other': '#6B7280',         // Gray
};

// Helper to categorize gene function
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
  geneName: string;
  category: string;
  meanPrevalence: number;
  stdDev: number;
  minPrevalence: number;
  maxPrevalence: number;
  range: number;
  values: number[];
  minSource: string;
  maxSource: string;
}

/**
 * Gene Prevalence Variability (Stability) Plot
 * 
 * Shows how stable or variable each virulence gene's prevalence is across hosts and species.
 * Helps distinguish core virulence genes (consistently present) from host- or species-specific genes.
 */
export default function VariabilityPlot() {
  const { data, loading, error } = useData();
  const [mode, setMode] = useState<VariabilityMode>('hosts');
  const [sortMode, setSortMode] = useState<SortMode>('variability-desc');
  const [errorMetric, setErrorMetric] = useState<ErrorMetric>('range');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 1024 && window.innerWidth >= 640);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  usePlotlyResizeOnMount();

  // Compute variability metrics for each gene
  const geneVariability = useMemo(() => {
    if (!data) return [];

    // Get all unique genes
    const allGenes = new Set<string>();
    Object.values(data.hostPrevalence).forEach(hostData => {
      Object.keys(hostData).forEach(gene => allGenes.add(gene));
    });

    // Get gene function mapping
    const geneFunction: Record<string, string> = {};
    data.genes.forEach(g => {
      if (!geneFunction[g.geneName]) {
        geneFunction[g.geneName] = g.function;
      }
    });

    // Host categories
    const hostCategories = ['Poultry', 'Cattle', 'Swine', 'Human', 'Multiple'];
    const availableHosts = hostCategories.filter(host => data.hostPrevalence[host]);

    // Compute species prevalence from speciesMatrix (presence/absence as 0 or 100)
    // For a more accurate species prevalence, we'd need the actual counts
    // Here we'll compute it from the genes array
    const speciesPrevalence: Record<string, Record<string, number>> = {
      'C. jejuni': {},
      'C. coli': {},
    };

    // Count genes per species
    const speciesGeneCounts: Record<string, Record<string, number>> = {
      'jejuni': {},
      'coli': {},
    };
    const speciesTotals: Record<string, number> = { 'jejuni': 0, 'coli': 0 };

    data.genes.forEach(gene => {
      gene.species.forEach(sp => {
        const normalizedSpecies = sp.toLowerCase().includes('jejuni') ? 'jejuni' : 
                                  sp.toLowerCase().includes('coli') ? 'coli' : null;
        if (normalizedSpecies) {
          speciesGeneCounts[normalizedSpecies][gene.geneName] = 
            (speciesGeneCounts[normalizedSpecies][gene.geneName] || 0) + 1;
          speciesTotals[normalizedSpecies]++;
        }
      });
    });

    // Convert to prevalence percentages
    Object.keys(speciesGeneCounts).forEach(sp => {
      const speciesLabel = sp === 'jejuni' ? 'C. jejuni' : 'C. coli';
      const total = speciesTotals[sp];
      Object.keys(speciesGeneCounts[sp]).forEach(gene => {
        // Normalize to a percentage (relative to total occurrences in that species)
        speciesPrevalence[speciesLabel][gene] = total > 0 
          ? Math.round((speciesGeneCounts[sp][gene] / total) * 100 * 100) / 100 
          : 0;
      });
    });

    const results: GeneVariability[] = [];

    allGenes.forEach(geneName => {
      const values: number[] = [];
      const labeledValues: Array<{ label: string; value: number }> = [];

      if (mode === 'hosts' || mode === 'combined') {
        availableHosts.forEach(host => {
          const prevalence = data.hostPrevalence[host]?.[geneName] || 0;
          values.push(prevalence);
          labeledValues.push({ label: host, value: prevalence });
        });
      }

      if (mode === 'species' || mode === 'combined') {
        Object.keys(speciesPrevalence).forEach(sp => {
          const prevalence = speciesPrevalence[sp]?.[geneName] || 0;
          values.push(prevalence);
          labeledValues.push({ label: sp, value: prevalence });
        });
      }

      // Use all values if we want to include zeros in variability calculation
      const valuesForStats = values;

      if (valuesForStats.length === 0) return;

      const mean = valuesForStats.reduce((sum, v) => sum + v, 0) / valuesForStats.length;
      const min = Math.min(...valuesForStats);
      const max = Math.max(...valuesForStats);
      const range = max - min;

      // Find sources for min and max
      const minSource = labeledValues.find(lv => lv.value === min)?.label || 'Unknown';
      const maxSource = labeledValues.find(lv => lv.value === max)?.label || 'Unknown';

      // Standard deviation
      const variance = valuesForStats.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / valuesForStats.length;
      const stdDev = Math.sqrt(variance);

      const funcName = geneFunction[geneName] || 'Unknown';
      const category = categorizeFunction(funcName);

      results.push({
        geneName,
        category,
        meanPrevalence: Math.round(mean * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        minPrevalence: Math.round(min * 100) / 100,
        maxPrevalence: Math.round(max * 100) / 100,
        range: Math.round(range * 100) / 100,
        values: valuesForStats,
        minSource,
        maxSource,
      });
    });

    // Sort based on selected mode
    // When sorting by variability, use range if errorMetric = range, stdDev if errorMetric = sd
    if (sortMode === 'variability-desc') {
      if (errorMetric === 'range') {
        results.sort((a, b) => b.range - a.range);
      } else {
        results.sort((a, b) => b.stdDev - a.stdDev);
      }
    } else if (sortMode === 'variability-asc') {
      if (errorMetric === 'range') {
        results.sort((a, b) => a.range - b.range);
      } else {
        results.sort((a, b) => a.stdDev - b.stdDev);
      }
    } else {
      results.sort((a, b) => a.geneName.localeCompare(b.geneName));
    }

    return results;
  }, [data, mode, sortMode, errorMetric]);

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading variability plot...</div>;
  }

  if (error || !data) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error || 'No data available'}</div>;
  }

  // Group genes by category for coloring
  const categories = [...new Set(geneVariability.map(g => g.category))];
  
  // Create traces for each category
  const traces: Array<Record<string, unknown>> = categories.map(category => {
    const categoryGenes = geneVariability.filter(g => g.category === category);
    
    // Determine error bars based on errorMetric
    const errorBars = errorMetric === 'range'
      ? {
          type: 'data' as const,
          symmetric: false,
          array: categoryGenes.map(g => g.maxPrevalence - g.meanPrevalence),
          arrayminus: categoryGenes.map(g => g.meanPrevalence - g.minPrevalence),
        }
      : {
          type: 'data' as const,
          symmetric: true,
          array: categoryGenes.map(g => g.stdDev),
          arrayminus: categoryGenes.map(g => g.stdDev),
        };
    
    return {
      type: 'scatter',
      mode: 'markers',
      name: category,
      x: categoryGenes.map(g => g.geneName),
      y: categoryGenes.map(g => g.meanPrevalence),
      error_y: {
        ...errorBars,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'],
        thickness: 1.5,
        width: 4,
      },
      marker: {
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'],
        size: isMobile ? 8 : 10,
        line: {
          color: 'white',
          width: 1,
        },
      },
      hovertemplate: categoryGenes.map(g => 
        `<b>${g.geneName}</b><br>` +
        `Category: ${g.category}<br>` +
        `Mean Prevalence: ${g.meanPrevalence.toFixed(1)}%<br>` +
        `Std Dev: ${g.stdDev.toFixed(1)}%<br>` +
        `Min: ${g.minPrevalence.toFixed(1)}% (${g.minSource})<br>` +
        `Max: ${g.maxPrevalence.toFixed(1)}% (${g.maxSource})<br>` +
        `Range: ${g.range.toFixed(1)}%<extra></extra>`
      ),
    };
  });

  // Calculate percentile-based thresholds from variability metric distribution
  // Variability is range or stdDev depending on errorMetric
  const variabilityValues = geneVariability.map(g => errorMetric === 'range' ? g.range : g.stdDev);
  const sortedVariability = [...variabilityValues].sort((a, b) => a - b);
  const lowThreshold = quantile(sortedVariability, 0.25); // 25th percentile
  const highThreshold = quantile(sortedVariability, 0.75); // 75th percentile

  const variabilityPlotHeightPx = isMobile
    ? Math.max(450, geneVariability.length * 8)
    : isTablet
      ? Math.max(500, geneVariability.length * 10)
      : Math.max(550, geneVariability.length * 12);

  const layout: Record<string, unknown> = plotlyBaseLayout({
    title: {
      text: 'Gene Prevalence Variability (Stability)',
      font: { size: isMobile ? 14 : isTablet ? 16 : 18 },
    },
    xaxis: {
      title: {
        text: 'Gene',
        font: { size: isMobile ? 10 : 12 },
      },
      tickangle: -45,
      tickfont: { size: isMobile ? 7 : isTablet ? 8 : 9 },
      automargin: true,
      categoryorder: 'array',
      categoryarray: geneVariability.map(g => g.geneName),
    },
    yaxis: {
      title: {
        text: 'Prevalence (%)',
        font: { size: isMobile ? 10 : 12 },
      },
      tickfont: { size: isMobile ? 9 : 10 },
      range: [0, 105],
      gridcolor: 'rgba(128, 128, 128, 0.2)',
    },
    legend: {
      orientation: isMobile ? 'h' : 'v',
      x: isMobile ? 0 : 1.02,
      y: isMobile ? -0.3 : 1,
      xanchor: isMobile ? 'left' : 'left',
      yanchor: 'top',
      font: { size: isMobile ? 9 : 11 },
      bgcolor: 'rgba(255, 255, 255, 0.9)',
      bordercolor: 'rgba(0, 0, 0, 0.1)',
      borderwidth: 1,
    },
    margin: {
      l: isMobile ? 50 : 60,
      r: isMobile ? 40 : 150,
      t: isMobile ? 80 : 60,
      b: isMobile ? 150 : 180,
    },
    hovermode: 'closest',
    showlegend: true,
    annotations: [
      {
        x: 0,
        y: -0.22,
        xref: 'paper',
        yref: 'paper',
        text: '<b>Interpretation:</b> Low variability (small error bars) = Core, conserved gene | High variability (large error bars) = Host/species-adaptive gene',
        showarrow: false,
        font: { size: isMobile ? 8 : 10, color: '#666' },
        align: 'left',
        xanchor: 'left',
      },
    ],
    shapes: [
      // Reference line for context (at 50% prevalence)
      {
        type: 'line',
        x0: 0,
        x1: 1,
        xref: 'paper',
        y0: 50,
        y1: 50,
        line: {
          color: 'rgba(100, 100, 100, 0.3)',
          width: 1,
          dash: 'dot',
        },
      },
    ],
  });

  const config: Record<string, unknown> = {
    ...plotlyResponsiveConfig,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center flex-wrap">
        {/* Data Source Toggle */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Calculate across:
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as VariabilityMode)}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select data source for variability calculation"
          >
            <option value="hosts">Hosts only</option>
            <option value="species">Species only</option>
            <option value="combined">Hosts + Species</option>
          </select>
        </div>

        {/* Sort Toggle */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select sort order"
          >
            <option value="variability-desc">Highest variability first</option>
            <option value="variability-asc">Lowest variability first</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        {/* Error bars Toggle */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Error bars:
          </label>
          <select
            value={errorMetric}
            onChange={(e) => setErrorMetric(e.target.value as ErrorMetric)}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select error bar metric"
          >
            <option value="range">Min to Max range</option>
            <option value="sd">± 1 SD</option>
          </select>
        </div>
      </div>

      {/* Legend explanation */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-amber-50 dark:from-gray-800 dark:to-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm"></div>
            <span className="text-gray-700 dark:text-gray-300">Dot = Mean prevalence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-2 bg-gray-500"></div>
              <div className="w-2 h-0.5 bg-gray-500"></div>
              <div className="w-0.5 h-2 bg-gray-500"></div>
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              Error bar = {errorMetric === 'range' ? 'Min to Max range' : '± 1 SD'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="font-medium">Colors:</span>
            <span>Gene functional category</span>
          </div>
        </div>
      </div>

      {/* Plot */}
      <div className="w-full" style={{ height: variabilityPlotHeightPx }}>
        <Plot
          data={traces}
          layout={layout}
          config={config}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Category Legend with Colors */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Functional Categories</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-full border border-white shadow-sm" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {geneVariability.filter(g => {
              const variability = errorMetric === 'range' ? g.range : g.stdDev;
              return variability <= lowThreshold;
            }).length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-500">Core genes (low var)</div>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
            {geneVariability.filter(g => {
              const variability = errorMetric === 'range' ? g.range : g.stdDev;
              return variability > lowThreshold && variability < highThreshold;
            }).length}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-500">Moderate variability</div>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-lg font-bold text-red-700 dark:text-red-400">
            {geneVariability.filter(g => {
              const variability = errorMetric === 'range' ? g.range : g.stdDev;
              return variability >= highThreshold;
            }).length}
          </div>
          <div className="text-xs text-red-600 dark:text-red-500">Adaptive genes (high var)</div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
            {geneVariability.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total genes</div>
        </div>
      </div>
    </div>
  );
}

