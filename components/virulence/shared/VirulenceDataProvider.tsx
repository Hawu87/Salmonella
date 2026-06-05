'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  ALL_SPECIES_FILTER,
  filterDataBySpecies,
  type SpeciesFilter,
} from '@/lib/virulence/filterData';

export interface GeneData {
  geneName: string;
  cluster?: string;
  function: string;
  species: string[];
  hosts: string[];
  regulation?: string;
  knownVirulenceRole?: string;
  locusTag?: string;
  chromosomeLocation?: string;
  notes?: string;
}

interface HostStats {
  total: number;
  genes: Record<string, number>;
}

interface CooccurrenceNode {
  id: string;
  count: number;
}

interface CooccurrenceLink {
  source: string;
  target: string;
  count: number;
}

interface SunburstNode {
  name: string;
  children?: SunburstNode[];
  value?: number;
}

interface SankeyNode {
  label: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

export interface ProcessedData {
  genes: GeneData[];
  /** Canonical species keys (e.g. `campylobacter_jejuni`) present in the dataset, in display order. */
  speciesList: string[];
  /** Map from species key → short label (e.g. `C. jejuni`). */
  speciesLabels: Record<string, string>;
  hostStats: Record<string, HostStats>;
  hostTotals: Record<string, number>;
  hostPrevalence: Record<string, Record<string, number>>;
  /** `speciesMatrix[geneName][speciesKey] = true` if the gene is present in that species. */
  speciesMatrix: Record<string, Record<string, boolean>>;
  /** `speciesGeneCounts[speciesKey][geneName] = count` of times the gene is annotated for that species. */
  speciesGeneCounts: Record<string, Record<string, number>>;
  processes: Record<string, string[]>;
  cooccurrence: {
    nodes: CooccurrenceNode[];
    links: CooccurrenceLink[];
  };
  sunburstHierarchy: SunburstNode;
  sankeyData: {
    nodes: SankeyNode[];
    links: SankeyLink[];
  };
}

interface DataContextType {
  data: ProcessedData | null;
  loading: boolean;
  error: string | null;
  selectedSpecies: SpeciesFilter;
  setSelectedSpecies: (species: SpeciesFilter) => void;
  getTopGenes: (k: number) => string[];
  filterByGene: (geneName: string) => GeneData | undefined;
}

const DataContext = createContext<DataContextType>({
  data: null,
  loading: true,
  error: null,
  selectedSpecies: ALL_SPECIES_FILTER,
  setSelectedSpecies: () => {},
  getTopGenes: () => [],
  filterByGene: () => undefined,
});

export function VirulenceDataProvider({ children }: { children: ReactNode }) {
  const [rawData, setRawData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesFilter>(ALL_SPECIES_FILTER);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/virulence-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        setRawData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching virulence data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const data = useMemo<ProcessedData | null>(() => {
    if (!rawData) return null;
    return filterDataBySpecies(rawData, selectedSpecies);
  }, [rawData, selectedSpecies]);

  const getTopGenes = (k: number): string[] => {
    if (!data) return [];
    const geneCounts: Array<{ gene: string; count: number }> = [];
    const allGenes = new Set<string>();

    Object.values(data.hostStats).forEach(hostData => {
      Object.keys(hostData.genes || {}).forEach(gene => allGenes.add(gene));
    });

    allGenes.forEach(gene => {
      let total = 0;
      Object.values(data.hostStats).forEach(hostData => {
        total += hostData.genes[gene] || 0;
      });
      geneCounts.push({ gene, count: total });
    });

    geneCounts.sort((a, b) => b.count - a.count);
    return geneCounts.slice(0, k).map(item => item.gene);
  };

  const filterByGene = (geneName: string): GeneData | undefined => {
    if (!data) return undefined;
    return data.genes.find(g => g.geneName === geneName);
  };

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        error,
        selectedSpecies,
        setSelectedSpecies,
        getTopGenes,
        filterByGene,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useVirulenceData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useVirulenceData must be used within VirulenceDataProvider');
  }
  return context;
}
