'use client';

import { useData } from '../DataProvider';
import { plotlyBaseLayout, plotlyResponsiveConfig, usePlotlyResizeOnMount } from '@/components/plotlyResponsive';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Use Plotly for sunburst
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface SunburstNode {
  name: string;
  children?: SunburstNode[];
  value?: number;
}

interface SunburstProps {
  onSectorClick?: (path: string[]) => void;
}

/**
 * Sunburst diagram: Human isolates → Species → gene count (non-human hosts excluded).
 */
export default function Sunburst({ onSectorClick }: SunburstProps) {
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
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading sunburst...</div>;
  }

  if (error || !data || !data.sunburstHierarchy) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error || 'No data available'}</div>;
  }

  if (!data.sunburstHierarchy.children || data.sunburstHierarchy.children.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400 text-sm">
        No human isolate data available for this chart.
      </div>
    );
  }

  // Color scheme: Blue tones for C. jejuni, Red/Orange tones for C. coli
  const getColorForSegment = (label: string, parentPath: string): string => {
    // Root level - neutral gray
    if (label === 'Human isolates' || label === 'All isolates') {
      return '#6b7280';
    }
    
    // Species level
    if (label === 'C. jejuni') {
      return '#3b82f6'; // Blue-500
    }
    if (label === 'C. coli') {
      return '#ef4444'; // Red-500
    }
    if (label === 'Other') {
      return '#9ca3af'; // Gray-400
    }
    
    // Legacy host ring (if present under species): shade by parent species
    const pathParts = parentPath.split('|');
    const species = pathParts.find(part => part === 'C. jejuni' || part === 'C. coli' || part === 'Other');

    if (species === 'C. jejuni') {
      const blueShades = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'];
      const hash = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return blueShades[hash % blueShades.length];
    }
    if (species === 'C. coli') {
      const redShades = ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b'];
      const hash = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return redShades[hash % redShades.length];
    }

    return '#9ca3af';
  };

  // Convert hierarchy to Plotly sunburst format
  const buildSunburstData = (node: SunburstNode, parent: string = ''): { ids: string[]; labels: string[]; parents: string[]; values: number[]; colors: string[] } => {
    const result = { ids: [] as string[], labels: [] as string[], parents: [] as string[], values: [] as number[], colors: [] as string[] };
    
    const processNode = (n: SunburstNode, p: string = '') => {
      const id = p ? `${p}|${n.name}` : n.name;
      const color = getColorForSegment(n.name, p);
      
      result.ids.push(id);
      result.labels.push(n.name);
      result.parents.push(p);
      result.values.push(n.value ?? 0);
      result.colors.push(color);
      
      if (n.children && n.children.length > 0) {
        n.children.forEach((child: SunburstNode) => processNode(child, id));
      }
    };
    
    processNode(node, parent);
    return result;
  };

  const sunburstData = buildSunburstData(data.sunburstHierarchy);

  const plotData: Array<Record<string, unknown>> = [
    {
      type: 'sunburst',
      ids: sunburstData.ids,
      labels: sunburstData.labels,
      parents: sunburstData.parents,
      values: sunburstData.values,
      marker: {
        colors: sunburstData.colors,
        line: { width: 2, color: '#ffffff' },
      },
      hovertemplate: '<b>%{label}</b><br>Count: %{value}<extra></extra>',
    },
  ];

  const layout: Record<string, unknown> = plotlyBaseLayout({
    title: {
      text: 'Human isolates → Species → Gene count',
      font: { size: isMobile ? 12 : isTablet ? 14 : 16 },
    },
    margin: {
      t: isMobile ? 60 : 50,
      l: 40,
      r: 40,
      b: 40,
    },
    extendsunburstcolors: false,
  });

  const config: Record<string, unknown> = { ...plotlyResponsiveConfig };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 sm:gap-4 items-center mb-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
          <span className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Blue:</span> Campylobacter jejuni
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Red:</span> Campylobacter coli
          </span>
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-xs">
          <span className="font-medium">Segment size:</span> Gene count (human isolates)
        </div>
      </div>
      <div className="w-full h-[500px] sm:h-[560px]">
        <Plot
        data={plotData}
        layout={layout}
        config={config}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        onClick={(event: Record<string, unknown>) => {
          if (onSectorClick && event.points && Array.isArray(event.points) && event.points[0]) {
            const point = event.points[0] as Record<string, unknown>;
            const id = point.id as string;
            const path = id.split('|');
            onSectorClick(path);
          }
        }}
      />
      </div>
    </div>
  );
}

