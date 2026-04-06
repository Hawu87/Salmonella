'use client';

import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import { plotlyBaseLayout, plotlyResponsiveConfig, usePlotlyResizeOnMount } from '@/lib/virulence/plotlyResponsive';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface SankeyProps {
  topK?: number;
  onGeneClick?: (geneName: string) => void;
}

export default function Sankey({ topK = 20, onGeneClick }: SankeyProps) {
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

  if (loading) return <div className="text-center py-8 text-gray-500">Loading visualization...</div>;
  if (error || !data?.sankeyData) return <div className="text-center py-8 text-red-600">Error: {error || 'No data available'}</div>;

  const { nodes, links } = data.sankeyData;
  if (nodes.length === 0 || links.length === 0) return <div className="text-center py-8 text-gray-500">No data available</div>;

  const plotData: Array<Record<string, unknown>> = [{
    type: 'sankey', orientation: 'h',
    node: {
      pad: 15, thickness: 20,
      line: { color: '#e5e7eb', width: 0.5 },
      label: nodes.map(n => n.label ?? ''),
      color: nodes.map((_, idx) => idx < Object.keys(data.hostStats).length ? '#0f766e' : '#ef4444'),
    },
    link: {
      source: links.map(l => l.source), target: links.map(l => l.target), value: links.map(l => l.value),
      color: links.map(() => 'rgba(15, 118, 110, 0.3)'),
      hovertemplate: 'Host: %{source.label}<br>Gene: %{target.label}<br>Count: %{value}<extra></extra>',
    },
  }];

  const layout = plotlyBaseLayout({
    title: { text: `Distribution Across Host Categories (Top ${topK} Genes)`, font: { size: isMobile ? 12 : isTablet ? 13 : 14, color: '#111827' } },
    font: { size: isMobile ? 10 : isTablet ? 11 : 12, color: '#374151' },
    margin: { l: isMobile ? 40 : 50, r: isMobile ? 40 : 50, t: isMobile ? 60 : 50, b: isMobile ? 40 : 50 },
  });

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 sm:gap-4 items-center mb-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#0f766e' }} />
          <span className="text-gray-600"><span className="font-medium">Teal nodes:</span> Host categories</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef553b' }} />
          <span className="text-gray-600"><span className="font-medium">Red nodes:</span> Genes</span>
        </div>
        <span className="text-gray-500 text-xs"><span className="font-medium">Connection thickness:</span> Number of isolates</span>
      </div>
      <p className="text-gray-500 text-xs mb-3 italic">Tip: Hover over a connection to see the isolate count.</p>
      <div className="w-full h-[500px] sm:h-[560px]">
        <Plot
          data={plotData} layout={layout} config={plotlyResponsiveConfig}
          useResizeHandler style={{ width: '100%', height: '100%' }}
          onClick={(event: Record<string, unknown>) => {
            if (onGeneClick && event.points && Array.isArray(event.points) && event.points[0]) {
              const point = event.points[0] as Record<string, unknown>;
              if (point.curveNumber === 0 && point.pointNumber !== undefined) {
                const linkData = plotData[0].link as Record<string, unknown>;
                const targets = linkData.target as number[];
                const nodeIndex = targets[point.pointNumber as number];
                const geneName = (nodes[nodeIndex] as { label: string })?.label;
                if (geneName && !data.hostStats[geneName]) onGeneClick(geneName);
              }
            }
          }}
        />
      </div>
    </div>
  );
}
