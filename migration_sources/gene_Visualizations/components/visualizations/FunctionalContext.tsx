'use client';

import { useData } from '../DataProvider';
import { useMemo, useState, useEffect } from 'react';
import GeneTooltip from '../GeneTooltip';
import Citation from '../Citation';

/**
 * Functional role categories based on virulence gene functions.
 * These categories align with common virulence mechanisms described in review literature.
 * NOTE: Gene-to-function mappings should be verified against the referenced review paper.
 */
const FUNCTIONAL_ROLES = {
  'Motility and chemotaxis': {
    color: '#D97706', // Amber-600 (reduced saturation)
    keywords: ['flagella', 'fla', 'motility', 'mobility', 'chemotaxis', 'flagellar'],
  },
  'Adhesion and epithelial attachment': {
    color: '#2563EB', // Blue-600 (reduced saturation)
    keywords: ['adhesion', 'adhere', 'cadf', 'attachment', 'epithelial'],
  },
  'Invasion and host interaction': {
    color: '#059669', // Emerald-600 (reduced saturation)
    keywords: ['invasion', 'invade', 'ciab', 'host interaction', 'internalization'],
  },
  'Toxin activity': {
    color: '#DC2626', // Red-600 (reduced saturation)
    keywords: ['toxin', 'cdt', 'cytolethal', 'distending'],
  },
  'Survival, efflux, and persistence': {
    color: '#7C3AED', // Purple-600 (reduced saturation)
    keywords: ['survival', 'efflux', 'persistence', 'stress', 'resistance'],
  },
} as const;

type FunctionalRole = keyof typeof FUNCTIONAL_ROLES;

/**
 * Gene function descriptions based on review literature.
 * These should be updated with specific descriptions from the referenced paper.
 */
const GENE_DESCRIPTIONS: Record<string, string> = {
  // Adhesion genes
  cadF: 'Fibronectin-binding protein involved in adhesion to host epithelial cells',
  // Invasion genes
  ciaB: 'Invasion-associated protein involved in host cell internalization',
  // Toxin genes
  cdtA: 'Cytolethal distending toxin subunit A',
  cdtB: 'Cytolethal distending toxin subunit B with toxin activity',
  cdtC: 'Cytolethal distending toxin subunit C',
  // Motility genes
  flaA: 'Flagellar protein involved in motility and colonization',
};

/**
 * Categorize a gene function string into a functional role category.
 */
function categorizeGeneFunction(functionName: string): FunctionalRole | 'Other' {
  const func = functionName.toLowerCase();
  
  for (const [role, config] of Object.entries(FUNCTIONAL_ROLES)) {
    if (config.keywords.some(keyword => func.includes(keyword))) {
      return role as FunctionalRole;
    }
  }
  
  return 'Other';
}

/**
 * Visualization showing genes grouped by their functional roles in virulence.
 * Provides biological context for host-to-gene distribution patterns.
 */
export default function FunctionalContext() {
  const { data, loading, error } = useData();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Group genes by functional role
  const genesByRole = useMemo(() => {
    if (!data) return {} as Record<FunctionalRole | 'Other', Array<{ geneName: string; function: string }>>;

    const grouped: Record<string, Array<{ geneName: string; function: string }>> = {};
    const seenGenes = new Set<string>();

    data.genes.forEach(gene => {
      if (seenGenes.has(gene.geneName)) return;
      seenGenes.add(gene.geneName);

      const role = categorizeGeneFunction(gene.function);
      if (!grouped[role]) {
        grouped[role] = [];
      }
      grouped[role].push({
        geneName: gene.geneName,
        function: gene.function,
      });
    });

    // Sort genes within each role alphabetically
    Object.keys(grouped).forEach(role => {
      grouped[role].sort((a, b) => a.geneName.localeCompare(b.geneName));
    });

    return grouped as Record<FunctionalRole | 'Other', Array<{ geneName: string; function: string }>>;
  }, [data]);

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading functional context...</div>;
  }

  if (error || !data) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error || 'No data available'}</div>;
  }

  const roleOrder: (FunctionalRole | 'Other')[] = [
    'Motility and chemotaxis',
    'Adhesion and epithelial attachment',
    'Invasion and host interaction',
    'Toxin activity',
    'Survival, efflux, and persistence',
    'Other',
  ];

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3 sm:gap-4 items-center text-xs sm:text-sm">
        {roleOrder
          .filter(role => genesByRole[role] && genesByRole[role].length > 0)
          .map(role => {
            const color = role === 'Other' ? '#6B7280' : FUNCTIONAL_ROLES[role as FunctionalRole]?.color || '#6B7280';
            return (
              <div key={role} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                <span className="text-gray-600 dark:text-gray-400">{role}</span>
              </div>
            );
          })}
      </div>

      {/* Why this matters */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Why this matters</h4>
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Grouping genes by functional role provides biological context for host- and species-associated patterns observed elsewhere in the dashboard. Differences in functional composition across hosts may reflect variation in host interaction, pathogenic mechanisms, and persistence strategies described in the reference literature.<Citation number={1} />
        </p>
      </div>

      {/* Gene groups by functional role */}
      <div className="space-y-4">
        {roleOrder
          .filter(role => genesByRole[role] && genesByRole[role].length > 0)
          .map(role => {
            const genes = genesByRole[role];
            const color = role === 'Other' ? '#6B7280' : FUNCTIONAL_ROLES[role as FunctionalRole]?.color || '#6B7280';
            
            return (
              <div key={role} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div
                  className="px-4 py-3 font-semibold text-sm sm:text-base text-white flex items-center justify-between"
                  style={{ backgroundColor: color }}
                >
                  <span>{role}</span>
                  <span className="text-xs font-normal opacity-90">
                    {genes.length} {genes.length === 1 ? 'gene' : 'genes'}
                  </span>
                </div>
                <div className="px-4 py-4 bg-white dark:bg-gray-900">
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {genes.map(gene => {
                      const description = GENE_DESCRIPTIONS[gene.geneName] || gene.function;
                      const tooltipId = `functional-gene-${gene.geneName}-${role}`;
                      
                      return (
                        <GeneTooltip
                          key={gene.geneName}
                          geneName={gene.geneName}
                          functionalAnnotation={`${role}. ${description}`}
                          knownVirulenceRole="Based on review literature"
                          tooltipId={tooltipId}
                        >
                          <div
                            className="px-3 py-2 rounded-md border text-xs sm:text-sm font-medium cursor-pointer hover:shadow-md transition"
                            style={{
                              backgroundColor: `${color}15`,
                              borderColor: color,
                              color: color,
                            }}
                          >
                            {gene.geneName}
                          </div>
                        </GeneTooltip>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
