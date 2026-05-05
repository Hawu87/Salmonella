'use client';

import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import { plotlyBaseLayout, plotlyResponsiveConfig, usePlotlyResizeOnMount } from '@/lib/virulence/plotlyResponsive';
import { getSpeciesAccent, speciesShortLabel } from '@/lib/virulence/species';
import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface SunburstNode {
  name: string;
  children?: SunburstNode[];
  value?: number;
}

interface SunburstProps {
  onSectorClick?: (path: string[]) => void;
}

export default function Sunburst({ onSectorClick }: SunburstProps) {
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

  /**
   * Build a label → accent color lookup from the dataset's species list so
   * the chart can colorize whatever species appear under "Human isolates"
   * (the data layer emits species short labels for sunburst children).
   */
  const labelToAccent = useMemo(() => {
    const map = new Map<string, string>();
    (data?.speciesList ?? []).forEach(key => {
      const label = data?.speciesLabels?.[key] ?? speciesShortLabel(key);
      map.set(label, getSpeciesAccent(key));
    });
    return map;
  }, [data?.speciesList, data?.speciesLabels]);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading sunburst...</div>;
  if (error || !data?.sunburstHierarchy) return <div className="text-center py-8 text-red-600">Error: {error || 'No data available'}</div>;
  if (!data.sunburstHierarchy.children?.length) return <div className="text-center py-8 text-gray-500 text-sm">No human isolate data available for this chart.</div>;

  const getColor = (label: string): string => {
    if (label === 'Human isolates' || label === 'All isolates') return '#6b7280';
    return labelToAccent.get(label) ?? '#9ca3af';
  };

  const build = (node: SunburstNode, parent = '') => {
    const result = { ids: [] as string[], labels: [] as string[], parents: [] as string[], values: [] as number[], colors: [] as string[] };
    const process = (n: SunburstNode, p = '') => {
      const id = p ? `${p}|${n.name}` : n.name;
      result.ids.push(id); result.labels.push(n.name); result.parents.push(p);
      result.values.push(n.value ?? 0); result.colors.push(getColor(n.name));
      n.children?.forEach(child => process(child, id));
    };
    process(node, parent);
    return result;
  };

  const sb = build(data.sunburstHierarchy);

  const plotData: Array<Record<string, unknown>> = [{
    type: 'sunburst', ids: sb.ids, labels: sb.labels, parents: sb.parents, values: sb.values,
    marker: { colors: sb.colors, line: { width: 2, color: '#ffffff' } },
    hovertemplate: '<b>%{label}</b><br>Count: %{value}<extra></extra>',
  }];

  const layout = plotlyBaseLayout({
    title: { text: 'Human isolates → Species → Gene count', font: { size: isMobile ? 12 : isTablet ? 14 : 16, color: '#111827' } },
    margin: { t: isMobile ? 60 : 50, l: 40, r: 40, b: 40 },
    extendsunburstcolors: false,
    font: { color: '#374151' },
  });

  const legendEntries = (data.speciesList ?? []).map(key => ({
    key,
    label: data.speciesLabels?.[key] ?? speciesShortLabel(key),
    color: getSpeciesAccent(key),
  }));

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 sm:gap-4 items-center mb-3 text-xs sm:text-sm">
        {legendEntries.map(entry => (
          <div key={entry.key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">
              <span className="font-medium">{entry.label}</span>
            </span>
          </div>
        ))}
        <span className="text-gray-500 text-xs"><span className="font-medium">Segment size:</span> Gene count (human isolates)</span>
      </div>
      <div className="w-full h-[500px] sm:h-[560px]">
        <Plot
          data={plotData} layout={layout} config={plotlyResponsiveConfig}
          useResizeHandler style={{ width: '100%', height: '100%' }}
          onClick={(event: Record<string, unknown>) => {
            if (onSectorClick && event.points && Array.isArray(event.points) && event.points[0]) {
              const point = event.points[0] as Record<string, unknown>;
              onSectorClick((point.id as string).split('|'));
            }
          }}
        />
      </div>
    </div>
  );
}
