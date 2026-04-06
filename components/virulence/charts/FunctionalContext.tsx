'use client';

import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import { useMemo, useState, useEffect } from 'react';
import GeneTooltip from '@/components/virulence/shared/GeneTooltip';
import Citation from '@/components/virulence/shared/Citation';

const FUNCTIONAL_ROLES = {
  'Motility and chemotaxis': {
    color: '#D97706',
    keywords: ['flagella', 'fla', 'motility', 'mobility', 'chemotaxis', 'flagellar'],
  },
  'Adhesion and epithelial attachment': {
    color: '#2563EB',
    keywords: ['adhesion', 'adhere', 'cadf', 'attachment', 'epithelial'],
  },
  'Invasion and host interaction': {
    color: '#059669',
    keywords: ['invasion', 'invade', 'ciab', 'host interaction', 'internalization'],
  },
  'Toxin activity': {
    color: '#DC2626',
    keywords: ['toxin', 'cdt', 'cytolethal', 'distending'],
  },
  'Survival, efflux, and persistence': {
    color: '#7C3AED',
    keywords: ['survival', 'efflux', 'persistence', 'stress', 'resistance'],
  },
} as const;

type FunctionalRole = keyof typeof FUNCTIONAL_ROLES;

const GENE_DESCRIPTIONS: Record<string, string> = {
  cadF: 'Fibronectin-binding protein involved in adhesion to host epithelial cells',
  ciaB: 'Invasion-associated protein involved in host cell internalization',
  cdtA: 'Cytolethal distending toxin subunit A',
  cdtB: 'Cytolethal distending toxin subunit B with toxin activity',
  cdtC: 'Cytolethal distending toxin subunit C',
  flaA: 'Flagellar protein involved in motility and colonization',
};

function categorizeGeneFunction(functionName: string): FunctionalRole | 'Other' {
  const func = functionName.toLowerCase();
  for (const [role, config] of Object.entries(FUNCTIONAL_ROLES)) {
    if (config.keywords.some(keyword => func.includes(keyword))) return role as FunctionalRole;
  }
  return 'Other';
}

export default function FunctionalContext() {
  const { data, loading, error } = useVirulenceData();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check);
  }, []);

  const genesByRole = useMemo(() => {
    if (!data) return {} as Record<FunctionalRole | 'Other', Array<{ geneName: string; function: string }>>;
    const grouped: Record<string, Array<{ geneName: string; function: string }>> = {};
    const seen = new Set<string>();
    data.genes.forEach(gene => {
      if (seen.has(gene.geneName)) return;
      seen.add(gene.geneName);
      const role = categorizeGeneFunction(gene.function);
      if (!grouped[role]) grouped[role] = [];
      grouped[role].push({ geneName: gene.geneName, function: gene.function });
    });
    Object.keys(grouped).forEach(role => grouped[role].sort((a, b) => a.geneName.localeCompare(b.geneName)));
    return grouped as Record<FunctionalRole | 'Other', Array<{ geneName: string; function: string }>>;
  }, [data]);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading functional context...</div>;
  if (error || !data) return <div className="text-center py-8 text-red-600">Error: {error || 'No data available'}</div>;

  const roleOrder: (FunctionalRole | 'Other')[] = [
    'Motility and chemotaxis', 'Adhesion and epithelial attachment',
    'Invasion and host interaction', 'Toxin activity',
    'Survival, efflux, and persistence', 'Other',
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-3 sm:gap-4 items-center text-xs sm:text-sm">
        {roleOrder.filter(role => genesByRole[role]?.length > 0).map(role => {
          const color = role === 'Other' ? '#6B7280' : FUNCTIONAL_ROLES[role as FunctionalRole]?.color || '#6B7280';
          return (
            <div key={role} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span className="text-gray-600">{role}</span>
            </div>
          );
        })}
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Why this matters</h4>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          Grouping genes by functional role provides biological context for host- and species-associated patterns observed elsewhere in the dashboard. Differences in functional composition across hosts may reflect variation in host interaction, pathogenic mechanisms, and persistence strategies described in the reference literature.<Citation number={1} />
        </p>
      </div>

      <div className="space-y-4">
        {roleOrder.filter(role => genesByRole[role]?.length > 0).map(role => {
          const genes = genesByRole[role];
          const color = role === 'Other' ? '#6B7280' : FUNCTIONAL_ROLES[role as FunctionalRole]?.color || '#6B7280';
          return (
            <div key={role} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 font-semibold text-sm sm:text-base text-white flex items-center justify-between" style={{ backgroundColor: color }}>
                <span>{role}</span>
                <span className="text-xs font-normal opacity-90">{genes.length} {genes.length === 1 ? 'gene' : 'genes'}</span>
              </div>
              <div className="px-4 py-4 bg-white">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {genes.map(gene => {
                    const description = GENE_DESCRIPTIONS[gene.geneName] || gene.function;
                    return (
                      <GeneTooltip key={gene.geneName} geneName={gene.geneName} functionalAnnotation={`${role}. ${description}`} knownVirulenceRole="Based on review literature" tooltipId={`functional-gene-${gene.geneName}-${role}`}>
                        <div className="px-3 py-2 rounded-md border text-xs sm:text-sm font-medium cursor-pointer hover:shadow-md transition" style={{ backgroundColor: `${color}15`, borderColor: color, color }}>
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
