'use client';

import { useData } from '../DataProvider';
import dynamic from 'next/dynamic';
import { useMemo, useRef, useEffect, useState } from 'react';
import type { ForceGraphMethods } from 'react-force-graph-2d';

// Use react-force-graph-2d for network visualization
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { 
  ssr: false 
});

interface CooccurrenceNetworkProps {
  onNodeClick?: (geneName: string) => void;
}

/**
 * Network graph showing co-occurrence relationships between genes.
 * Nodes represent genes (size proportional to total occurrences).
 * Links represent co-occurrence (thickness proportional to co-occurrence count).
 */
export default function CooccurrenceNetwork({ onNodeClick }: CooccurrenceNetworkProps) {
  const { data, loading, error } = useData();
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });

  const graphData = useMemo(() => {
    if (!data || !data.cooccurrence) {
      return { nodes: [], links: [] };
    }

    const { nodes, links } = data.cooccurrence;

    // Calculate max counts for normalization
    const maxNodeCount = Math.max(...nodes.map(n => n.count), 1);
    const maxLinkCount = Math.max(...links.map(l => l.count), 1);

    return {
      nodes: nodes.map(node => ({
        id: node.id,
        name: node.id,
        value: node.count,
        // Size proportional to count - made larger
        size: Math.sqrt(node.count / maxNodeCount) * 15 + 5,
      })),
      links: links.map(link => ({
        source: link.source,
        target: link.target,
        value: link.count,
        // Thickness proportional to co-occurrence count
        width: (link.count / maxLinkCount) * 3 + 1,
      })),
    };
  }, [data]);

  // Set responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 640;
      const isTablet = window.innerWidth < 1024;
      
      if (isMobile) {
        setDimensions({ width: window.innerWidth - 32, height: 500 });
      } else if (isTablet) {
        setDimensions({ width: window.innerWidth - 64, height: 600 });
      } else {
        setDimensions({ width: 1000, height: 700 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Set initial zoom after component mounts - must be called before conditional returns
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // Zoom in after a short delay to allow graph to initialize
      const timer = setTimeout(() => {
        const isMobile = window.innerWidth < 640;
        fgRef.current?.zoom?.(isMobile ? 1.2 : 1.5, 400); // zoom level adjusted for mobile
      }, 500);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [graphData.nodes.length]);

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading network graph...</div>;
  }

  if (error || !data || !data.cooccurrence) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error || 'No data available'}</div>;
  }

  if (graphData.nodes.length === 0) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">No co-occurrence data available</div>;
  }

  return (
    <div className="w-full">
      {/* Explanation Box */}
      <div className="mb-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm sm:text-base">How to Read This Network:</h4>
        <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li><strong>Circles (Nodes)</strong> = Genes. Larger circles = more common genes</li>
          <li><strong>Lines (Links)</strong> = Co-occurrence. Thicker lines = genes found together more often</li>
          <li><strong>Colors</strong> = Gene function: Red (Toxin), Blue (Adhesion), Green (Invasion), Orange (Motility), Gray (Other)</li>
          <li><strong>Interactions</strong>: Hover to see gene details, click to explore, drag nodes to rearrange</li>
        </ul>
        <p className="text-xs text-blue-700 dark:text-blue-500 mt-2 italic">
          Co-occurrence means genes that appear in the same bacterial isolate (same host + species combination).
        </p>
      </div>
      
      <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={(node: Record<string, unknown>) => {
          const nodeId = node.id as string;
          const geneData = data.genes.find(g => g.geneName === nodeId);
          const connectedGenes = graphData.links
            .filter((l: Record<string, unknown>) => (l.source as string) === nodeId || (l.target as string) === nodeId)
            .length;
          return `<b>${nodeId}</b><br>Total Occurrences: ${node.value as number}<br>Function: ${geneData?.function || 'Unknown'}<br>Connected to ${connectedGenes} other gene(s)`;
        }}
        nodeColor={(node: Record<string, unknown>) => {
          // Color based on function category if available
          const nodeId = node.id as string;
          const geneData = data.genes.find(g => g.geneName === nodeId);
          if (!geneData) return '#888';
          const func = geneData.function.toLowerCase();
          if (func.includes('toxin')) return '#ef4444';
          if (func.includes('adhesion')) return '#3b82f6';
          if (func.includes('invasion')) return '#10b981';
          if (func.includes('motility') || func.includes('mobility')) return '#f59e0b';
          return '#6b7280';
        }}
        linkWidth={(link: Record<string, unknown>) => (link.width as number) || 1}
        linkLabel={(link: Record<string, unknown>) => `Co-occur ${link.value as number} time(s)`}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={(node: Record<string, unknown>) => {
          if (onNodeClick) {
            onNodeClick(node.id as string);
          }
        }}
        width={dimensions.width}
        height={dimensions.height}
        minZoom={0.3}
        maxZoom={4}
        />
      </div>
    </div>
  );
}

