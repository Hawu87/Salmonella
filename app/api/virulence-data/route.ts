import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

interface GeneData {
  geneName: string;
  cluster?: string;
  function: string;
  species: string[];
  hosts: string[];
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
  hostStats: Record<string, { total: number; genes: Record<string, number> }>;
  hostTotals: Record<string, number>;
  hostPrevalence: Record<string, Record<string, number>>;
  speciesMatrix: Record<string, { jejuni: boolean; coli: boolean; salmonellaTyphi: boolean }>;
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

function normalizeHost(host: string): string {
  const h = host.toLowerCase().trim();
  if (h.includes('poultry') || h.includes('chicken')) return 'Poultry';
  if (h.includes('cattle') || h.includes('cow') || h.includes('beef')) return 'Cattle';
  if (h.includes('swine') || h.includes('pig')) return 'Swine';
  if (h.includes('human')) return 'Human';
  if (h.includes('multiple') || h.includes('mixed')) return 'Multiple';
  return host || 'Unknown';
}

const SPECIES_TOKEN_SALMONELLA_TYPHI = 'salmonella_typhi' as const;
type SpeciesBucket = 'jejuni' | 'coli' | typeof SPECIES_TOKEN_SALMONELLA_TYPHI;

function resolvePrimaryDataSheetName(sheetNames: string[]): string {
  if (!sheetNames.length) return '';
  const sheet1 = sheetNames.find(n => n.replace(/^\s+|\s+$/g, '').toLowerCase() === 'sheet1');
  return sheet1 ?? sheetNames[0];
}

function mapSpeciesBucket(raw: string): SpeciesBucket | null {
  const t = raw.toLowerCase().trim();
  if (!t) return null;
  if (t.includes('salmonella typhi') || (t.includes('salmonella') && t.includes('typhi'))) {
    return SPECIES_TOKEN_SALMONELLA_TYPHI;
  }
  if (t.includes('campylobacter jejuni')) return 'jejuni';
  if (t.includes('campylobacter coli')) return 'coli';
  if (/\bc\.?\s*jejuni\b/.test(t)) return 'jejuni';
  if (/\bc\.?\s*coli\b/.test(t)) return 'coli';
  return null;
}

function parseSpeciesBuckets(speciesStr: string): SpeciesBucket[] {
  const buckets = new Set<SpeciesBucket>();
  const fragments = speciesStr
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  for (const frag of fragments) {
    const b = mapSpeciesBucket(frag);
    if (b) buckets.add(b);
  }
  return [...buckets];
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'virulence', 'campylobacter (1).xlsx');
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

    const geneNameCol = headers.findIndex(h => h.includes('gene') || h.includes('name'));
    const clusterCol = headers.findIndex(h => h.includes('cluster'));
    const functionCol = headers.findIndex(h => h.includes('function') || h.includes('role'));
    const speciesCol = headers.findIndex(h => h.includes('species'));
    let salmonellaTyphiFlagCol = headers.findIndex(
      (h, idx) => idx !== speciesCol && h.includes('salmonella') && h.includes('typhi')
    );
    if (salmonellaTyphiFlagCol < 0) {
      salmonellaTyphiFlagCol = headers.findIndex(
        (h, idx) => idx !== speciesCol && h.includes('salmonella')
      );
    }
    const hostCol = headers.findIndex(h => h.includes('host'));
    const notesCol = headers.findIndex(h => h.includes('note') || h.includes('comment'));

    const isolateMap: Record<string, Set<string>> = {};
    const genes: GeneData[] = [];
    const hostStats: Record<string, Record<string, number> & { totalIsolates: number }> = {};
    const speciesMatrix: Record<string, { jejuni: boolean; coli: boolean; salmonellaTyphi: boolean }> = {};
    const processes: Record<string, string[]> = {};
    const geneCounts: Record<string, number> = {};

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!Array.isArray(row) || row.length === 0) continue;

      const geneName = ((row[geneNameCol] as unknown) || '').toString().trim();
      if (!geneName) continue;

      const cluster = clusterCol >= 0 ? ((row[clusterCol] as unknown) || '').toString().trim() : undefined;
      const functionName = functionCol >= 0 ? ((row[functionCol] as unknown) || '').toString().trim() : 'Unknown';
      const speciesStr = speciesCol >= 0 ? ((row[speciesCol] as unknown) || '').toString().trim() : '';
      const hostStr = hostCol >= 0 ? ((row[hostCol] as unknown) || '').toString().trim() : '';
      const notes = notesCol >= 0 ? ((row[notesCol] as unknown) || '').toString().trim() : undefined;

      let species: string[] = parseSpeciesBuckets(speciesStr).map(b => b as string);

      if (salmonellaTyphiFlagCol >= 0) {
        const raw = ((row[salmonellaTyphiFlagCol] as unknown) || '').toString().trim();
        const cell = raw.toLowerCase();
        const positive =
          raw === '1' || cell === 'y' || cell === 'yes' || cell === 'true' ||
          cell === 'present' || cell === 'positive' || cell === 'x';
        if (positive && !species.includes(SPECIES_TOKEN_SALMONELLA_TYPHI)) {
          species = [...species, SPECIES_TOKEN_SALMONELLA_TYPHI];
        }
      }

      const hosts = hostStr
        .split(/[,;]/)
        .map((h: string) => normalizeHost(h))
        .filter((h: string) => h.length > 0 && h !== 'Unknown');

      genes.push({ geneName, cluster, function: functionName, species, hosts, notes });
      geneCounts[geneName] = (geneCounts[geneName] || 0) + 1;

      const primarySpecies = species.includes('jejuni')
        ? 'jejuni'
        : species.includes('coli')
          ? 'coli'
          : species.includes(SPECIES_TOKEN_SALMONELLA_TYPHI)
            ? SPECIES_TOKEN_SALMONELLA_TYPHI
            : 'other';

      hosts.forEach((host: string) => {
        const isolateKey = `${host}::${primarySpecies}`;
        if (!isolateMap[isolateKey]) isolateMap[isolateKey] = new Set();
        isolateMap[isolateKey].add(geneName);

        if (!hostStats[host]) hostStats[host] = { totalIsolates: 0 };
        hostStats[host][geneName] = (hostStats[host][geneName] || 0) + 1;
        hostStats[host].totalIsolates++;
      });

      if (!speciesMatrix[geneName]) {
        speciesMatrix[geneName] = { jejuni: false, coli: false, salmonellaTyphi: false };
      }
      if (species.includes('jejuni')) speciesMatrix[geneName].jejuni = true;
      if (species.includes('coli')) speciesMatrix[geneName].coli = true;
      if (species.includes(SPECIES_TOKEN_SALMONELLA_TYPHI)) speciesMatrix[geneName].salmonellaTyphi = true;

      const processName = categorizeProcess(functionName);
      if (!processes[processName]) processes[processName] = [];
      if (!processes[processName].includes(geneName)) processes[processName].push(geneName);
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
      const [host, species] = isolateKey.split('::');
      if (host !== 'Human') return;
      const normalizedSpecies =
        species === 'jejuni' ? 'C. jejuni' : species === 'coli' ? 'C. coli' : 'Other';
      humanSpeciesTotals[normalizedSpecies] =
        (humanSpeciesTotals[normalizedSpecies] || 0) + isolateMap[isolateKey].size;
    });

    const speciesChildren: SunburstNode[] = Object.keys(humanSpeciesTotals)
      .filter(s => humanSpeciesTotals[s] > 0)
      .map(species => ({ name: species, value: humanSpeciesTotals[species] }));

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
      hostStats: hostStatsWithPrevalence,
      hostTotals,
      hostPrevalence,
      speciesMatrix,
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
