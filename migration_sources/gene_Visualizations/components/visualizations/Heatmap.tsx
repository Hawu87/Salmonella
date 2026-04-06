'use client';

import { useData } from '../DataProvider';
import { plotlyBaseLayout, plotlyResponsiveConfig, usePlotlyResizeOnMount } from '@/components/plotlyResponsive';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Use Plotly for heatmap
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface HeatmapProps {
  onGeneClick?: (geneName: string) => void;
}

/**
 * Heatmap visualization showing gene prevalence across different host associations.
 * Rows represent genes (sorted alphabetically), columns represent hosts.
 * Cell values show prevalence percentage (0-100).
 */
export default function Heatmap({ onGeneClick }: HeatmapProps) {
  const { data, loading, error } = useData();
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

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading heatmap...</div>;
  }

  if (error || !data) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error || 'No data available'}</div>;
  }

  // Get all unique genes and sort alphabetically
  const allGenes = new Set<string>();
  Object.values(data.hostPrevalence).forEach(hostData => {
    Object.keys(hostData).forEach(gene => allGenes.add(gene));
  });
  const sortedGenes = Array.from(allGenes).sort();

  // Host categories in order
  const hostCategories = ['Poultry', 'Cattle', 'Swine', 'Human', 'Multiple', 'Other'];
  const availableHosts = hostCategories.filter(host => data.hostPrevalence[host]);

  // Build data matrix
  const z: number[][] = sortedGenes.map(gene => 
    availableHosts.map(host => data.hostPrevalence[host]?.[gene] || 0)
  );

  const plotHeightPx = isMobile
    ? Math.max(400, sortedGenes.length * 15)
    : isTablet
      ? Math.max(450, sortedGenes.length * 18)
      : Math.max(400, sortedGenes.length * 20);

  const plotData: Array<Record<string, unknown>> = [
    {
      z,
      x: availableHosts,
      y: sortedGenes,
      type: 'heatmap',
      colorscale: 'Viridis',
      hoverongaps: false,
      hovertemplate: '<b>%{y}</b><br>Host: %{x}<br>Prevalence: %{z}%<extra></extra>',
      colorbar: {
        title: 'Prevalence (%)',
        titlefont: { size: isMobile ? 10 : 12 },
        tickfont: { size: isMobile ? 9 : 10 },
      },
    },
  ];

  const layout: Record<string, unknown> = plotlyBaseLayout({
    title: {
      text: 'Gene Prevalence Across Hosts (%)',
      font: { size: isMobile ? 12 : isTablet ? 14 : 16 },
    },
    xaxis: {
      title: 'Host Association',
      titlefont: { size: isMobile ? 11 : 12 },
      tickfont: { size: isMobile ? 9 : 10 },
    },
    yaxis: {
      title: 'Gene',
      automargin: true,
      titlefont: { size: isMobile ? 11 : 12 },
      tickfont: { size: isMobile ? 8 : 9 },
    },
    margin: {
      l: isMobile ? 80 : isTablet ? 100 : 150,
      r: isMobile ? 40 : 50,
      t: isMobile ? 60 : 50,
      b: isMobile ? 80 : 100,
    },
    font: { size: isMobile ? 10 : 12 },
  });

  const config: Record<string, unknown> = {
    ...plotlyResponsiveConfig,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
  };

  return (
    <div className="w-full">
      {/* How to Read This Heatmap */}
      <div className="mb-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm sm:text-base">How to Read This Heatmap:</h4>
        <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li><strong>Rows</strong> = Genes (sorted alphabetically)</li>
          <li><strong>Columns</strong> = Host associations (Poultry, Cattle, Swine, Human, etc.)</li>
          <li><strong>Brighter colors</strong> = Higher prevalence (gene found in more isolates)</li>
          <li><strong>Darker colors</strong> = Lower or absent prevalence (gene found in fewer or no isolates)</li>
        </ul>
      </div>

      <div className="w-full" style={{ height: plotHeightPx }}>
        <Plot
        data={plotData}
        layout={layout}
        config={config}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        onClick={(event: Record<string, unknown>) => {
          if (onGeneClick && event.points && Array.isArray(event.points) && event.points[0]) {
            const point = event.points[0] as Record<string, unknown>;
            const geneIndex = point.y as number;
            onGeneClick(sortedGenes[geneIndex]);
          }
        }}
      />
      </div>

      {/* Interpretation Example */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          <strong>Interpretation:</strong> Genes with consistently bright colors across all hosts are conserved (core virulence genes), while genes with bright colors in only some hosts are host-associated. For example, a gene with 80% prevalence in Poultry but 5% in Cattle suggests it&apos;s important for poultry infection but not for cattle.
        </p>
      </div>
    </div>
  );
}

