import type { ProcessedData } from '@/components/virulence/shared/VirulenceDataProvider';
import { speciesShortLabel } from './species';

export const ALL_SPECIES_FILTER = 'all' as const;
export type SpeciesFilter = typeof ALL_SPECIES_FILTER | string;

export interface SpeciesOption {
  value: SpeciesFilter;
  label: string;
  short: string;
}

/**
 * Build the dropdown options for the species filter from whatever species
 * are present in the dataset. The "All species" entry is always first.
 */
export function buildSpeciesOptions(speciesList: string[]): SpeciesOption[] {
  return [
    { value: ALL_SPECIES_FILTER, label: 'All species', short: 'All' },
    ...speciesList.map(key => ({
      value: key,
      label: speciesShortLabel(key),
      short: speciesShortLabel(key),
    })),
  ];
}

export function getSpeciesShortLabel(species: SpeciesFilter): string {
  if (species === ALL_SPECIES_FILTER) return 'All';
  return speciesShortLabel(species);
}

function categorizeProcess(functionName: string): string {
  const func = (functionName || '').toLowerCase();
  if (func.includes('adhesion') || func.includes('adhere')) return 'adhesion';
  if (func.includes('invasion') || func.includes('invade')) return 'invasion';
  if (
    func.includes('flagella') ||
    func.includes('fla') ||
    func.includes('motility') ||
    func.includes('mobility')
  ) {
    return 'mobility';
  }
  if (func.includes('toxin') || func.includes('cdt')) return 'toxin';
  if (func.includes('colonization')) return 'colonization';
  if (func.includes('survival')) return 'survival';
  return 'other';
}

const TOP_K_SANKEY = 20;

const EMPTY_DATA: ProcessedData = {
  genes: [],
  speciesList: [],
  speciesLabels: {},
  hostStats: {},
  hostTotals: {},
  hostPrevalence: {},
  speciesMatrix: {},
  speciesGeneCounts: {},
  processes: {},
  cooccurrence: { nodes: [], links: [] },
  sunburstHierarchy: { name: 'Human isolates', children: [] },
  sankeyData: { nodes: [], links: [] },
};

/**
 * Derives a species-scoped view of `ProcessedData`. When `species ===
 * 'all'`, the original data is returned unchanged. Otherwise every
 * derived structure is rebuilt from the subset of genes that include the
 * selected species so all charts see a consistent filtered dataset.
 */
export function filterDataBySpecies(
  data: ProcessedData,
  species: SpeciesFilter,
): ProcessedData {
  if (species === ALL_SPECIES_FILTER) return data;

  const filteredGenes = data.genes.filter(g => g.species.includes(species));
  if (filteredGenes.length === 0) {
    return {
      ...EMPTY_DATA,
      speciesList: data.speciesList,
      speciesLabels: data.speciesLabels,
    };
  }

  const speciesList = data.speciesList;

  const speciesMatrix: ProcessedData['speciesMatrix'] = {};
  for (const g of filteredGenes) {
    if (!speciesMatrix[g.geneName]) {
      speciesMatrix[g.geneName] = {};
      for (const key of speciesList) speciesMatrix[g.geneName][key] = false;
    }
    speciesMatrix[g.geneName][species] = true;
  }

  const processes: Record<string, string[]> = {};
  for (const g of filteredGenes) {
    const proc = categorizeProcess(g.function);
    if (!processes[proc]) processes[proc] = [];
    if (!processes[proc].includes(g.geneName)) processes[proc].push(g.geneName);
  }

  const isolateMap: Record<string, Set<string>> = {};
  const hostStatsRaw: Record<string, Record<string, number> & { totalIsolates: number }> = {};
  const geneCounts: Record<string, number> = {};
  const speciesGeneCounts: ProcessedData['speciesGeneCounts'] = { [species]: {} };

  for (const g of filteredGenes) {
    geneCounts[g.geneName] = (geneCounts[g.geneName] || 0) + 1;
    speciesGeneCounts[species][g.geneName] = (speciesGeneCounts[species][g.geneName] || 0) + 1;
    g.hosts.forEach(host => {
      if (!host) return;
      const key = `${host}::${species}`;
      if (!isolateMap[key]) isolateMap[key] = new Set();
      isolateMap[key].add(g.geneName);
      if (!hostStatsRaw[host]) hostStatsRaw[host] = { totalIsolates: 0 };
      hostStatsRaw[host][g.geneName] = (hostStatsRaw[host][g.geneName] || 0) + 1;
      hostStatsRaw[host].totalIsolates++;
    });
  }

  const hostStats: ProcessedData['hostStats'] = {};
  const hostTotals: ProcessedData['hostTotals'] = {};
  const hostPrevalence: ProcessedData['hostPrevalence'] = {};
  Object.keys(hostStatsRaw).forEach(host => {
    const stats = hostStatsRaw[host];
    const total = stats.totalIsolates;
    hostTotals[host] = total;
    hostPrevalence[host] = {};
    hostStats[host] = { total, genes: {} };
    Object.keys(stats).forEach(key => {
      if (key === 'totalIsolates') return;
      const value = stats[key];
      const prev = total > 0 ? Math.round((value / total) * 10000) / 100 : 0;
      hostStats[host].genes[key] = prev;
      hostPrevalence[host][key] = prev;
    });
  });

  const allFilteredGenes = Object.keys(geneCounts);
  const cooccCounts: Record<string, Record<string, number>> = {};
  allFilteredGenes.forEach(g => { cooccCounts[g] = {}; });
  Object.values(isolateMap).forEach(geneSet => {
    const arr = Array.from(geneSet);
    if (arr.length < 2) return;
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i];
        const b = arr[j];
        cooccCounts[a][b] = (cooccCounts[a][b] || 0) + 1;
        cooccCounts[b][a] = (cooccCounts[b][a] || 0) + 1;
      }
    }
  });
  const cooccurrenceNodes = allFilteredGenes.map(g => ({ id: g, count: geneCounts[g] }));
  const cooccurrenceLinks: { source: string; target: string; count: number }[] = [];
  const seenPairs = new Set<string>();
  allFilteredGenes.forEach(g1 => {
    Object.keys(cooccCounts[g1] || {}).forEach(g2 => {
      if (g1 < g2) {
        const k = `${g1}::${g2}`;
        if (!seenPairs.has(k)) {
          seenPairs.add(k);
          const c = cooccCounts[g1][g2];
          if (c > 0) cooccurrenceLinks.push({ source: g1, target: g2, count: c });
        }
      }
    });
  });

  const speciesLabel = data.speciesLabels[species] ?? speciesShortLabel(species);
  const humanGeneSet = new Set<string>();
  Object.keys(isolateMap).forEach(key => {
    const [host] = key.split('::');
    if (host === 'Human') {
      isolateMap[key].forEach(g => humanGeneSet.add(g));
    }
  });
  const sunburstHierarchy: ProcessedData['sunburstHierarchy'] = {
    name: 'Human isolates',
    children: humanGeneSet.size > 0 ? [{ name: speciesLabel, value: humanGeneSet.size }] : [],
  };

  const allGeneHostCounts: Array<{ gene: string; total: number }> = [];
  Object.keys(geneCounts).forEach(gene => {
    let total = 0;
    Object.keys(hostStatsRaw).forEach(host => {
      total += hostStatsRaw[host][gene] || 0;
    });
    allGeneHostCounts.push({ gene, total });
  });
  allGeneHostCounts.sort((a, b) => b.total - a.total);
  const topGenes = allGeneHostCounts.slice(0, TOP_K_SANKEY).map(i => i.gene);

  const sankeyNodes: { label: string }[] = [];
  const hostIdx: Record<string, number> = {};
  Object.keys(hostStatsRaw).forEach((host, idx) => {
    hostIdx[host] = idx;
    sankeyNodes.push({ label: host });
  });
  const geneStartIdx = sankeyNodes.length;
  const geneIdx: Record<string, number> = {};
  topGenes.forEach((gene, idx) => {
    geneIdx[gene] = geneStartIdx + idx;
    sankeyNodes.push({ label: gene });
  });
  const sankeyLinks: { source: number; target: number; value: number }[] = [];
  Object.keys(hostStatsRaw).forEach(host => {
    const hi = hostIdx[host];
    topGenes.forEach(gene => {
      const c = hostStatsRaw[host][gene] || 0;
      if (c > 0) sankeyLinks.push({ source: hi, target: geneIdx[gene], value: c });
    });
  });

  return {
    genes: filteredGenes,
    speciesList: data.speciesList,
    speciesLabels: data.speciesLabels,
    hostStats,
    hostTotals,
    hostPrevalence,
    speciesMatrix,
    speciesGeneCounts,
    processes,
    cooccurrence: { nodes: cooccurrenceNodes, links: cooccurrenceLinks },
    sunburstHierarchy,
    sankeyData: { nodes: sankeyNodes, links: sankeyLinks },
  };
}
