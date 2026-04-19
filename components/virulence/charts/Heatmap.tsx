'use client';

import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import { plotlyBaseLayout, plotlyResponsiveConfig, usePlotlyResizeOnMount } from '@/lib/virulence/plotlyResponsive';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface HeatmapProps {
  onGeneClick?: (geneName: string) => void;
}

export default function Heatmap({ onGeneClick }: HeatmapProps) {
  const { data, loading, error } = useVirulenceData();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 1024 && window.innerWidth >= 640);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  usePlotlyResizeOnMount();

  if (loading) return <div className="text-center py-8 text-gray-500">Loading heatmap...</div>;
  if (error || !data) return <div className="text-center py-8 text-red-600">Error: {error || 'No data available'}</div>;

  const allGenes = new Set<string>();
  Object.values(data.hostPrevalence).forEach(hostData => {
    Object.keys(hostData).forEach(gene => allGenes.add(gene));
  });
  const sortedGenes = Array.from(allGenes).sort();

  const hostCategories = ['Poultry', 'Cattle', 'Swine', 'Human', 'Multiple', 'Other'];
  const availableHosts = hostCategories.filter(host => data.hostPrevalence[host]);

  const z = sortedGenes.map(gene => availableHosts.map(host => data.hostPrevalence[host]?.[gene] || 0));

  const plotHeightPx = isMobile
    ? Math.max(400, sortedGenes.length * 15)
    : isTablet ? Math.max(450, sortedGenes.length * 18)
    : Math.max(400, sortedGenes.length * 20);

  const plotData: Array<Record<string, unknown>> = [{
    z, x: availableHosts, y: sortedGenes, type: 'heatmap', colorscale: 'Viridis',
    hoverongaps: false,
    hovertemplate: '<b>%{y}</b><br>Host: %{x}<br>Prevalence: %{z}%<extra></extra>',
    colorbar: { title: 'Prevalence (%)', titlefont: { size: isMobile ? 10 : 12 }, tickfont: { size: isMobile ? 9 : 10 } },
  }];

  const layout = plotlyBaseLayout({
    title: { text: 'Gene Prevalence Across Hosts (%)', font: { size: isMobile ? 12 : isTablet ? 14 : 16, color: '#111827' } },
    xaxis: { title: 'Host Association', titlefont: { size: isMobile ? 11 : 12 }, tickfont: { size: isMobile ? 9 : 10 } },
    yaxis: { title: 'Gene', automargin: true, titlefont: { size: isMobile ? 11 : 12 }, tickfont: { size: isMobile ? 8 : 9 } },
    margin: { l: isMobile ? 80 : isTablet ? 100 : 150, r: isMobile ? 40 : 50, t: isMobile ? 60 : 50, b: isMobile ? 80 : 100 },
    font: { size: isMobile ? 10 : 12, color: '#374151' },
  });

  return (
    <div className="w-full">
      <div className="mb-4 p-3 sm:p-4 bg-teal-50 border border-teal-200 rounded-lg">
        <h4 className="font-semibold text-teal-900 mb-2 text-sm sm:text-base">How to Read This Heatmap:</h4>
        <ul className="text-xs sm:text-sm text-teal-800 space-y-1 list-disc list-inside">
          <li><strong>Rows</strong> = Genes (sorted alphabetically)</li>
          <li><strong>Columns</strong> = Host associations (Poultry, Cattle, Swine, Human, etc.)</li>
          <li><strong>Brighter colors</strong> = Higher prevalence</li>
          <li><strong>Darker colors</strong> = Lower or absent prevalence</li>
        </ul>
      </div>

      <div className="w-full" style={{ height: plotHeightPx }}>
        <Plot
          data={plotData} layout={layout}
          config={{ ...plotlyResponsiveConfig, modeBarButtonsToRemove: ['pan2d', 'lasso2d'] }}
          useResizeHandler style={{ width: '100%', height: '100%' }}
          onClick={(event: Record<string, unknown>) => {
            if (onGeneClick && event.points && Array.isArray(event.points) && event.points[0]) {
              const point = event.points[0] as Record<string, unknown>;
              onGeneClick(sortedGenes[point.y as number]);
            }
          }}
        />
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs sm:text-sm text-gray-700">
          <strong>Interpretation:</strong> Genes with consistently bright colors across all hosts are conserved (core virulence genes), while genes with bright colors in only some hosts are host-associated.
        </p>
      </div>
    </div>
  );
}
