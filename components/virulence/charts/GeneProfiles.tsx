'use client';

import { useState, useMemo, useRef } from 'react';
import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import GeneDetailsModal from '@/components/virulence/shared/GeneDetailsModal';

export default function GeneProfiles() {
  const { data, loading, error } = useVirulenceData();
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);
  const [selectedGene, setSelectedGene] = useState<string | null>(null);
  const triggerElementRef = useRef<Record<string, HTMLButtonElement | null>>({});

  const geneMetadata = useMemo(() => {
    const metadata: Record<string, {
      function?: string; notes?: string; locusTag?: string; chromosomeLocation?: string;
    }> = {};
    const genes = data?.genes || [];
    genes.forEach(gene => {
      if (!metadata[gene.geneName]) {
        metadata[gene.geneName] = {
          function: gene.function && gene.function !== 'Unknown' ? gene.function : undefined,
          notes: gene.notes || undefined,
          locusTag: gene.notes?.match(/locus[:\s]+([^\s,;]+)/i)?.[1] || gene.notes?.match(/locus tag[:\s]+([^\s,;]+)/i)?.[1] || undefined,
          chromosomeLocation: gene.notes?.match(/chromosome[:\s]+([^\s,;]+)/i)?.[1] || gene.notes?.match(/location[:\s]+([^\s,;]+)/i)?.[1] || undefined,
        };
      } else {
        if (gene.notes && !metadata[gene.geneName].notes) {
          metadata[gene.geneName].notes = gene.notes;
          metadata[gene.geneName].locusTag = gene.notes.match(/locus[:\s]+([^\s,;]+)/i)?.[1] || metadata[gene.geneName].locusTag;
          metadata[gene.geneName].chromosomeLocation = gene.notes.match(/chromosome[:\s]+([^\s,;]+)/i)?.[1] || metadata[gene.geneName].chromosomeLocation;
        }
        if (gene.function && gene.function !== 'Unknown' && !metadata[gene.geneName].function) metadata[gene.geneName].function = gene.function;
      }
    });
    return metadata;
  }, [data?.genes]);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading gene profiles...</div>;
  if (error || !data) return <div className="text-center py-8 text-red-600">Error: {error || 'No data available'}</div>;

  const processes = data.processes || {};
  const processOrder = ['adhesion', 'invasion', 'mobility', 'toxin', 'colonization', 'survival', 'other'];
  const sortedProcesses = processOrder
    .filter(p => processes[p]?.length > 0)
    .concat(Object.keys(processes).filter(p => !processOrder.includes(p)));

  return (
    <div className="space-y-4">
      {sortedProcesses.map(processName => {
        const genes = processes[processName] || [];
        const isExpanded = expandedProcess === processName;
        return (
          <details
            key={processName} open={isExpanded}
            onToggle={(e) => setExpandedProcess((e.target as HTMLDetailsElement).open ? processName : null)}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <summary className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 cursor-pointer font-semibold hover:bg-gray-100 transition text-gray-900 text-sm sm:text-base">
              {processName.charAt(0).toUpperCase() + processName.slice(1)} ({genes.length} genes)
            </summary>
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {genes.map(gene => {
                  const geneData = data.genes.find(g => g.geneName === gene);
                  return (
                    <button
                      key={gene}
                      ref={(el) => { triggerElementRef.current[gene] = el; }}
                      onClick={() => setSelectedGene(gene)}
                      className="group px-2 sm:px-3 py-1 bg-teal-50 border border-teal-200 rounded text-xs sm:text-sm hover:bg-teal-100 hover:border-teal-300 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
                      title={`Click to view details: ${geneData?.function || 'Gene information'}`}
                      aria-label={`View details for ${gene}`}
                    >
                      <span className="font-medium text-gray-900">{gene}</span>
                      {geneData?.cluster && <span className="text-gray-600 ml-1">({geneData.cluster})</span>}
                      <svg className="inline-block ml-1.5 w-3 h-3 text-gray-500 group-hover:text-gray-700 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          </details>
        );
      })}

      {selectedGene && (
        <GeneDetailsModal
          isOpen={!!selectedGene} onClose={() => setSelectedGene(null)} geneName={selectedGene}
          functionalAnnotation={geneMetadata[selectedGene]?.function}
          knownVirulenceRole={geneMetadata[selectedGene]?.notes}
          locusTag={geneMetadata[selectedGene]?.locusTag}
          chromosomeLocation={geneMetadata[selectedGene]?.chromosomeLocation}
          triggerElement={triggerElementRef.current[selectedGene]}
        />
      )}
    </div>
  );
}
