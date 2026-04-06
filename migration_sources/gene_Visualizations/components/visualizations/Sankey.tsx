'use client';

import { useData } from '../DataProvider';
import { plotlyBaseLayout, plotlyResponsiveConfig, usePlotlyResizeOnMount } from '@/components/plotlyResponsive';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Use Plotly for Sankey diagram
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface SankeyProps {
  topK?: number;
  onGeneClick?: (geneName: string) => void;
}

/**
 * Sankey diagram showing flow from Host categories to top K genes.
 * Link values represent counts (how many isolates for that host contain that gene).
 */
export default function Sankey({ topK = 20, onGeneClick }: SankeyProps) {
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
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading visualization...</div>;
  }

  if (error || !data || !data.sankeyData) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error || 'No data available'}</div>;
  }

  const { nodes, links } = data.sankeyData;

  if (nodes.length === 0 || links.length === 0) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">No data available</div>;
  }

  // Recompute with topK if different
  const plotData: Array<Record<string, unknown>> = [
    {
      type: 'sankey',
      orientation: 'h',
      node: {
        pad: 15,
        thickness: 20,
        line: {
          color: 'black',
          width: 0.5,
        },
        label: nodes.map(n => n.label ?? ''),
        color: nodes.map((n, idx) => {
          // Color hosts differently from genes
          const hostCount = Object.keys(data.hostStats).length;
          return idx < hostCount ? '#636efa' : '#ef553b';
        }),
      },
      link: {
        source: links.map(l => l.source),
        target: links.map(l => l.target),
        value: links.map(l => l.value),
        color: links.map(() => {
          // Color links based on source (host)
          return 'rgba(99, 110, 250, 0.4)';
        }),
        hovertemplate: 'Host: %{source.label}<br>Gene: %{target.label}<br>Count: %{value}<extra></extra>',
      },
    },
  ];

  const layout: Record<string, unknown> = plotlyBaseLayout({
    title: {
      text: `Distribution Across Host Categories (Top ${topK} Genes)`,
      font: { size: isMobile ? 12 : isTablet ? 13 : 14 },
    },
    font: { size: isMobile ? 10 : isTablet ? 11 : 12 },
    margin: {
      l: isMobile ? 40 : 50,
      r: isMobile ? 40 : 50,
      t: isMobile ? 60 : 50,
      b: isMobile ? 40 : 50,
    },
  });

  const config: Record<string, unknown> = { ...plotlyResponsiveConfig };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 sm:gap-4 items-center mb-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#636efa' }}></div>
          <span className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Blue nodes:</span> Host categories
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef553b' }}></div>
          <span className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Red nodes:</span> Genes
          </span>
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-xs">
          <span className="font-medium">Connection thickness:</span> Number of isolates
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-500 text-xs mb-3 italic">
        Tip: Hover over a connection to see the isolate count.
      </p>
      <div className="w-full h-[500px] sm:h-[560px]">
        <Plot
        data={plotData}
        layout={layout}
        config={config}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        onClick={(event: Record<string, unknown>) => {
          if (onGeneClick && event.points && Array.isArray(event.points) && event.points[0]) {
            const point = event.points[0] as Record<string, unknown>;
            // If clicked on a target node (gene), extract gene name
            if (point.curveNumber === 0 && point.pointNumber !== undefined) {
              const linkData = plotData[0].link as Record<string, unknown>;
              const targets = linkData.target as number[];
              const nodeIndex = targets[point.pointNumber as number];
              const geneName = (nodes[nodeIndex] as { label: string })?.label;
              if (geneName && !data.hostStats[geneName]) {
                // It's a gene, not a host
                onGeneClick(geneName);
              }
            }
          }
        }}
      />
      </div>
    </div>
  );
}

