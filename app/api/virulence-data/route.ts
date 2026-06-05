import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { parseSpeciesCellToKeys, sortSpeciesKeys, speciesShortLabel } from '@/lib/virulence/species';

interface GeneData {
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

interface ProcessedData {
  genes: GeneData[];
  speciesList: string[];
  speciesLabels: Record<string, string>;
  hostStats: Record<string, { total: number; genes: Record<string, number> }>;
  hostTotals: Record<string, number>;
  hostPrevalence: Record<string, Record<string, number>>;
  speciesMatrix: Record<string, Record<string, boolean>>;
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

function categorizeProcess(functionName: string): string {
  const func = functionName.toLowerCase();
  if (func.includes('adhesion') || func.includes('adhere')) return 'adhesion';
  if (func.includes('invasion') || func.includes('invade')) return 'invasion';
  if (func.includes('flagella') || func.includes('fla') || func.includes('motility') || func.includes('mobility')) return 'mobility';
  if (func.includes('toxin') || func.includes('cdt')) return 'toxin';
  if (func.includes('colonization')) return 'colonization';
  if (func.includes('survival')) return 'survival';
  return 'other';
}

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'virulence', 'campylobacter.xlsx');

function findColumnIndex(headers: string[], ...candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = headers.findIndex(h => h === candidate || h.includes(candidate));
    if (idx >= 0) return idx;
  }
  return -1;
}

/** Map regulation text (e.g. "avian↑↑, bovine ↑, humans ↑↑") to chart host categories. */
function parseRegulationToHosts(regulation: string): string[] {
  const text = regulation.trim();
  if (!text || text.length > 200) return [];

  const lower = text.toLowerCase();
  if (
    (lower.includes('upregulated') || lower.includes('downregulated')) &&
    !/\b(avian|bovine|human|swine|poultry|cattle)\b/.test(lower)
  ) {
    return [];
  }

  const hosts = new Set<string>();
  const segments = text.split(/[,;]/);

  for (const segment of segments) {
    const seg = segment.toLowerCase().trim();
    if (!seg || seg.length > 100) continue;
    if (seg.includes('upregulated') && !/\b(avian|bovine|human|swine|poultry|cattle)\b/.test(seg)) {
      continue;
    }

    if (/\b(avian|poultry|chicken)\b/.test(seg)) hosts.add('Poultry');
    if (/\b(bovine|cattle|cow|beef)\b/.test(seg)) hosts.add('Cattle');
    if (/\b(swine|pig|porcine)\b/.test(seg)) hosts.add('Swine');
    if (/\b(humans?)\b/.test(seg)) hosts.add('Human');
  }

  if (hosts.size === 0 && /\b(humans?)\b/.test(lower)) hosts.add('Human');

  return [...hosts];
}

function resolvePrimaryDataSheetName(sheetNames: string[]): string {
  if (!sheetNames.length) return '';
  const sheet1 = sheetNames.find(n => n.replace(/^\s+|\s+$/g, '').toLowerCase() === 'sheet1');
  return sheet1 ?? sheetNames[0];
}

export async function GET() {
  try {
    const filePath = DATA_FILE;
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Excel file not found at public/data/virulence/' },
        { status: 404 }
      );
    }
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    const sheetName = resolvePrimaryDataSheetName(workbook.SheetNames);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[];

    if (data.length === 0) {
      return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 });
    }

    const firstRow = Array.isArray(data[0]) ? data[0] : [];
    const headers = firstRow.map((h: unknown) => (h || '').toString().toLowerCase().trim());

    const geneNameCol = findColumnIndex(headers, 'gene name');
    const clusterCol = findColumnIndex(headers, 'cluster');
    const functionCol = findColumnIndex(headers, 'functional annotation (ensembl)', 'functional annotation');
    const virulenceRoleCol = findColumnIndex(headers, 'known virulence role');
    const speciesCol = findColumnIndex(headers, 'campylobacter species', 'species');
    const regulationCol = findColumnIndex(headers, 'regulation in host environments', 'regulation in host');
    const notesCol = headers.findIndex(h => h === 'notes' || (h.includes('notes') && !h.includes('virulence')));
    const locusTagCol = findColumnIndex(headers, 'locus tag');
    const chromosomeCol = findColumnIndex(headers, 'chromosomal location', 'chromosome');

    const isolateMap: Record<string, Set<string>> = {};
    const genes: GeneData[] = [];
    const hostStats: Record<string, Record<string, number> & { totalIsolates: number }> = {};
    const speciesMatrix: Record<string, Record<string, boolean>> = {};
    const speciesGeneCounts: Record<string, Record<string, number>> = {};
    const processes: Record<string, string[]> = {};
    const geneCounts: Record<string, number> = {};
    const allSpeciesKeys = new Set<string>();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!Array.isArray(row) || row.length === 0) continue;

      const geneName = ((row[geneNameCol] as unknown) || '').toString().trim();
      if (!geneName) continue;

      const cluster = clusterCol >= 0 ? ((row[clusterCol] as unknown) || '').toString().trim() : undefined;
      const functionName = functionCol >= 0 ? ((row[functionCol] as unknown) || '').toString().trim() : 'Unknown';
      const speciesStr = speciesCol >= 0 ? ((row[speciesCol] as unknown) || '').toString().trim() : '';
      const regulationStr =
        regulationCol >= 0 ? ((row[regulationCol] as unknown) || '').toString().trim() : '';
      const knownVirulenceRole =
        virulenceRoleCol >= 0 ? ((row[virulenceRoleCol] as unknown) || '').toString().trim() : undefined;
      const notesCell = notesCol >= 0 ? ((row[notesCol] as unknown) || '').toString().trim() : undefined;
      const locusTag = locusTagCol >= 0 ? ((row[locusTagCol] as unknown) || '').toString().trim() : undefined;
      const chromosomeLocation =
        chromosomeCol >= 0 ? ((row[chromosomeCol] as unknown) || '').toString().trim() : undefined;

      const speciesKeys = parseSpeciesCellToKeys(speciesStr);
      speciesKeys.forEach(k => allSpeciesKeys.add(k));

      const hosts = parseRegulationToHosts(regulationStr);

      genes.push({
        geneName,
        cluster,
        function: functionName,
        species: speciesKeys,
        hosts,
        regulation: regulationStr || undefined,
        knownVirulenceRole,
        locusTag: locusTag || undefined,
        chromosomeLocation: chromosomeLocation || undefined,
        notes: notesCell || undefined,
      });
      geneCounts[geneName] = (geneCounts[geneName] || 0) + 1;

      const primarySpeciesKey = speciesKeys[0] ?? 'unknown';

      hosts.forEach((host: string) => {
        const isolateKey = `${host}::${primarySpeciesKey}`;
        if (!isolateMap[isolateKey]) isolateMap[isolateKey] = new Set();
        isolateMap[isolateKey].add(geneName);

        if (!hostStats[host]) hostStats[host] = { totalIsolates: 0 };
        hostStats[host][geneName] = (hostStats[host][geneName] || 0) + 1;
        hostStats[host].totalIsolates++;
      });

      if (!speciesMatrix[geneName]) speciesMatrix[geneName] = {};
      speciesKeys.forEach(key => {
        speciesMatrix[geneName][key] = true;
        if (!speciesGeneCounts[key]) speciesGeneCounts[key] = {};
        speciesGeneCounts[key][geneName] = (speciesGeneCounts[key][geneName] || 0) + 1;
      });

      const processName = categorizeProcess(functionName);
      if (!processes[processName]) processes[processName] = [];
      if (!processes[processName].includes(geneName)) processes[processName].push(geneName);
    }

    const speciesList = sortSpeciesKeys([...allSpeciesKeys]);
    const speciesLabels: Record<string, string> = {};
    speciesList.forEach(key => {
      speciesLabels[key] = speciesShortLabel(key);
    });

    for (const geneName of Object.keys(speciesMatrix)) {
      for (const key of speciesList) {
        if (!(key in speciesMatrix[geneName])) speciesMatrix[geneName][key] = false;
      }
    }

    const hostTotals: Record<string, number> = {};
    const hostPrevalence: Record<string, Record<string, number>> = {};
    const hostStatsWithPrevalence: Record<string, { total: number; genes: Record<string, number> }> = {};

    Object.keys(hostStats).forEach(host => {
      const stats = hostStats[host];
      const total = stats.totalIsolates;
      hostTotals[host] = total;
      hostPrevalence[host] = {};
      const statsRecord = stats as Record<string, number>;
      hostStatsWithPrevalence[host] = { total, genes: {} };
      Object.keys(stats).forEach(key => {
        if (key !== 'totalIsolates') {
          const value = statsRecord[key];
          const prevalence = total > 0 && typeof value === 'number'
            ? Math.round((value / total) * 100 * 100) / 100
            : 0;
          hostStatsWithPrevalence[host].genes[key] = prevalence;
          hostPrevalence[host][key] = prevalence;
        }
      });
    });

    const cooccurrenceCounts: Record<string, Record<string, number>> = {};
    const minOccurrenceThreshold = 1;
    const filteredGenes = Object.keys(geneCounts).filter(gene => geneCounts[gene] >= minOccurrenceThreshold);
    const genesToUse = filteredGenes.length > 0 ? filteredGenes : Object.keys(geneCounts);

    genesToUse.forEach(gene => { cooccurrenceCounts[gene] = {}; });

    Object.values(isolateMap).forEach(geneSet => {
      const geneArray = Array.from(geneSet).filter(g => genesToUse.includes(g));
      if (geneArray.length >= 2) {
        for (let i = 0; i < geneArray.length; i++) {
          for (let j = i + 1; j < geneArray.length; j++) {
            const gene1 = geneArray[i];
            const gene2 = geneArray[j];
            cooccurrenceCounts[gene1][gene2] = (cooccurrenceCounts[gene1][gene2] || 0) + 1;
            cooccurrenceCounts[gene2][gene1] = (cooccurrenceCounts[gene2][gene1] || 0) + 1;
          }
        }
      }
    });

    const cooccurrenceNodes: CooccurrenceNode[] = genesToUse.map(gene => ({
      id: gene, count: geneCounts[gene],
    }));

    const cooccurrenceLinks: CooccurrenceLink[] = [];
    const processedPairs = new Set<string>();
    genesToUse.forEach(gene1 => {
      Object.keys(cooccurrenceCounts[gene1] || {}).forEach(gene2 => {
        if (genesToUse.includes(gene2) && gene1 < gene2) {
          const pairKey = `${gene1}::${gene2}`;
          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey);
            const count = cooccurrenceCounts[gene1][gene2] || 0;
            if (count > 0) {
              cooccurrenceLinks.push({ source: gene1, target: gene2, count });
            }
          }
        }
      });
    });

    const humanSpeciesTotals: Record<string, number> = {};
    Object.keys(isolateMap).forEach(isolateKey => {
      const sepIdx = isolateKey.indexOf('::');
      const host = isolateKey.slice(0, sepIdx);
      const speciesKey = isolateKey.slice(sepIdx + 2);
      if (host !== 'Human') return;
      const label = speciesLabels[speciesKey] ?? speciesShortLabel(speciesKey) ?? 'Other';
      humanSpeciesTotals[label] = (humanSpeciesTotals[label] || 0) + isolateMap[isolateKey].size;
    });

    const speciesChildren: SunburstNode[] = Object.keys(humanSpeciesTotals)
      .filter(s => humanSpeciesTotals[s] > 0)
      .map(speciesLabelStr => ({ name: speciesLabelStr, value: humanSpeciesTotals[speciesLabelStr] }));

    const sunburstHierarchy: SunburstNode = {
      name: 'Human isolates',
      children: speciesChildren,
    };

    const topK = 20;
    const allGeneHostCounts: Array<{ gene: string; total: number }> = [];
    Object.keys(geneCounts).forEach(gene => {
      let total = 0;
      Object.keys(hostStats).forEach(host => { total += hostStats[host][gene] || 0; });
      allGeneHostCounts.push({ gene, total });
    });
    allGeneHostCounts.sort((a, b) => b.total - a.total);
    const topGenes = allGeneHostCounts.slice(0, topK).map(item => item.gene);

    const sankeyNodes: SankeyNode[] = [];
    const hostIndexMap: Record<string, number> = {};
    const geneIndexMap: Record<string, number> = {};

    Object.keys(hostStats).forEach((host, idx) => {
      hostIndexMap[host] = idx;
      sankeyNodes.push({ label: host });
    });

    const geneStartIndex = sankeyNodes.length;
    topGenes.forEach((gene, idx) => {
      geneIndexMap[gene] = geneStartIndex + idx;
      sankeyNodes.push({ label: gene });
    });

    const sankeyLinks: SankeyLink[] = [];
    Object.keys(hostStats).forEach(host => {
      const hostIdx = hostIndexMap[host];
      topGenes.forEach(gene => {
        const count = hostStats[host][gene] || 0;
        if (count > 0) {
          sankeyLinks.push({ source: hostIdx, target: geneIndexMap[gene], value: count });
        }
      });
    });

    const result: ProcessedData = {
      genes,
      speciesList,
      speciesLabels,
      hostStats: hostStatsWithPrevalence,
      hostTotals,
      hostPrevalence,
      speciesMatrix,
      speciesGeneCounts,
      processes,
      cooccurrence: { nodes: cooccurrenceNodes, links: cooccurrenceLinks },
      sunburstHierarchy,
      sankeyData: { nodes: sankeyNodes, links: sankeyLinks },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return NextResponse.json(
      { error: 'Failed to process Excel file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
