'use client';

import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import GeneTooltip from '@/components/virulence/shared/GeneTooltip';
import { useMemo } from 'react';

export default function Matrix() {
  const { data, loading, error } = useVirulenceData();

  const geneMetadata = useMemo(() => {
    const metadata: Record<string, {
      function?: string;
      notes?: string;
      locusTag?: string;
      chromosomeLocation?: string;
    }> = {};
    const genes = data?.genes || [];
    genes.forEach(gene => {
      if (!metadata[gene.geneName]) {
        metadata[gene.geneName] = {
          function: gene.function && gene.function !== 'Unknown' ? gene.function : undefined,
          notes: gene.notes || undefined,
          locusTag: gene.notes?.match(/locus[:\s]+([^\s,;]+)/i)?.[1] ||
                    gene.notes?.match(/locus tag[:\s]+([^\s,;]+)/i)?.[1] || undefined,
          chromosomeLocation: gene.notes?.match(/chromosome[:\s]+([^\s,;]+)/i)?.[1] ||
                              gene.notes?.match(/location[:\s]+([^\s,;]+)/i)?.[1] || undefined,
        };
      } else {
        if (gene.notes && !metadata[gene.geneName].notes) {
          metadata[gene.geneName].notes = gene.notes;
          metadata[gene.geneName].locusTag = gene.notes.match(/locus[:\s]+([^\s,;]+)/i)?.[1] || metadata[gene.geneName].locusTag;
          metadata[gene.geneName].chromosomeLocation = gene.notes.match(/chromosome[:\s]+([^\s,;]+)/i)?.[1] || metadata[gene.geneName].chromosomeLocation;
        }
        if (gene.function && gene.function !== 'Unknown' && !metadata[gene.geneName].function) {
          metadata[gene.geneName].function = gene.function;
        }
      }
    });
    return metadata;
  }, [data?.genes]);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading matrix data...</div>;
  if (error || !data) return <div className="text-center py-8 text-red-600">Error: {error || 'No data available'}</div>;

  const matrix = data.speciesMatrix;
  const genes = Object.keys(matrix).sort();
  if (genes.length === 0) return <div className="text-center py-8 text-gray-500">No gene data available</div>;

  return (
    <div className="-mx-4 sm:mx-0" style={{ overflowX: 'auto', overflowY: 'visible' }}>
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 sm:px-4 py-2 text-left font-semibold text-gray-900 text-xs sm:text-sm">Gene</th>
              <th className="border border-gray-300 px-3 sm:px-4 py-2 text-center font-semibold text-gray-900 text-xs sm:text-sm">C. jejuni</th>
              <th className="border border-gray-300 px-3 sm:px-4 py-2 text-center font-semibold text-gray-900 text-xs sm:text-sm">C. coli</th>
              <th className="border border-gray-300 px-3 sm:px-4 py-2 text-center font-semibold text-gray-900 text-xs sm:text-sm">Salmonella typhi</th>
            </tr>
          </thead>
          <tbody>
            {genes.map((gene, index) => {
              const presence = matrix[gene];
              const meta = geneMetadata[gene] || {};
              const tooltipId = `gene-tooltip-${gene}-${index}`;
              return (
                <tr key={gene} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 sm:px-4 py-2 font-medium text-gray-900 text-xs sm:text-sm">
                    <GeneTooltip geneName={gene} functionalAnnotation={meta.function} knownVirulenceRole={meta.notes} locusTag={meta.locusTag} chromosomeLocation={meta.chromosomeLocation} tooltipId={tooltipId}>
                      <button type="button" className="cursor-pointer hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 rounded px-1 -mx-1 text-left inline-block bg-transparent border-none p-0 m-0 font-medium text-gray-900 text-xs sm:text-sm" tabIndex={0} aria-describedby={tooltipId}>
                        {gene}
                      </button>
                    </GeneTooltip>
                  </td>
                  <td className="border border-gray-300 px-3 sm:px-4 py-2 text-center">
                    <span className={`inline-block w-5 h-5 sm:w-6 sm:h-6 rounded ${presence.jejuni ? 'bg-green-500' : 'bg-red-500'}`} title={presence.jejuni ? 'Expressed' : 'Not expressed'} />
                  </td>
                  <td className="border border-gray-300 px-3 sm:px-4 py-2 text-center">
                    <span className={`inline-block w-5 h-5 sm:w-6 sm:h-6 rounded ${presence.coli ? 'bg-green-500' : 'bg-red-500'}`} title={presence.coli ? 'Expressed' : 'Not expressed'} />
                  </td>
                  <td className="border border-gray-300 px-3 sm:px-4 py-2 text-center">
                    <span className={`inline-block w-5 h-5 sm:w-6 sm:h-6 rounded ${presence.salmonellaTyphi ? 'bg-green-500' : 'bg-red-500'}`} title={presence.salmonellaTyphi ? 'Expressed' : 'Not expressed'} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
