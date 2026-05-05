/**
 * Centralized helpers for handling species across the codebase.
 *
 * All species-aware UI/visualization code should:
 *   - Get the list of species from the data (`speciesList`) or via
 *     `getDatasetSpeciesKeys()` on the server
 *   - Call `toSpeciesKey(raw)` to normalize raw spreadsheet text into a
 *     canonical key
 *   - Use `getSpeciesMeta(key)` for any display label / color / description
 *
 * Adding a new species to the spreadsheet is enough for it to flow through
 * the API, charts, tables, homepage, biology page, etc. Optional registry
 * entries below let you override placeholder copy with curated content.
 */

export interface SpeciesMeta {
  key: string;
  shortLabel: string;
  fullLabel: string;
  scientificName: string;
  accent: string;
  homepageDescription: string;
  biologySections: { title: string; content: string }[];
}

/**
 * Default qualitative palette used to color any species that is not
 * explicitly in the registry. Picked to be distinguishable in charts.
 */
const DYNAMIC_COLOR_PALETTE = [
  '#3b82f6',
  '#ef4444',
  '#0f766e',
  '#f59e0b',
  '#8b5cf6',
  '#10b981',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
  '#f97316',
  '#84cc16',
  '#06b6d4',
];

const PLACEHOLDER_DESCRIPTION = (full: string) =>
  `${full} — placeholder description`;

const PLACEHOLDER_BIOLOGY = (full: string) => [
  {
    title: `What is ${full}`,
    content: `Placeholder content for ${full}. Detailed biology and infection mechanisms will be added here.`,
  },
  {
    title: `Virulence (${full})`,
    content: `Placeholder content. Virulence factors and gene-level annotations for ${full} will be summarized here.`,
  },
];

/**
 * Curated overrides for species we have written content for. Anything not
 * listed here still works — it just gets placeholder text and a palette
 * color assigned automatically.
 */
const SPECIES_REGISTRY: Record<string, Partial<SpeciesMeta>> = {
  campylobacter_jejuni: {
    shortLabel: 'C. jejuni',
    fullLabel: 'Campylobacter jejuni',
    scientificName: 'Campylobacter jejuni',
    accent: '#3b82f6',
    homepageDescription:
      'A leading cause of bacterial gastroenteritis globally. Commonly profiled for virulence-associated genes involved in adhesion, invasion, toxin production, and environmental persistence.',
    biologySections: [
      {
        title: 'What is Campylobacter jejuni',
        content:
          'Campylobacter jejuni is a Gram-negative, spiral-shaped bacterium and the species most commonly associated with human campylobacteriosis. Transmission occurs primarily through consumption of contaminated poultry, unpasteurized milk, and contaminated water.',
      },
      {
        title: 'Virulence (C. jejuni)',
        content:
          'C. jejuni virulence is mediated by a repertoire of genes involved in motility (flaA), adhesion (cadF), invasion (ciaB), and toxin production (cdtA/B/C). Distribution of these genes varies across host environments, making comparative analysis essential for understanding pathogenicity patterns.',
      },
    ],
  },
  campylobacter_coli: {
    shortLabel: 'C. coli',
    fullLabel: 'Campylobacter coli',
    scientificName: 'Campylobacter coli',
    accent: '#ef4444',
    homepageDescription:
      'A close relative of C. jejuni and a frequent cause of bacterial gastroenteritis. Often co-profiled with C. jejuni for shared virulence mechanisms across food-animal reservoirs.',
    biologySections: [
      {
        title: 'What is Campylobacter coli',
        content:
          'Campylobacter coli is a Gram-negative, spiral-shaped bacterium closely related to C. jejuni. It shares many transmission routes (poultry, swine, contaminated water) and is a notable cause of human campylobacteriosis worldwide.',
      },
      {
        title: 'Virulence (C. coli)',
        content:
          'C. coli carries an overlapping but not identical repertoire of virulence factors compared to C. jejuni, including genes for motility, adhesion, invasion, and toxin activity. Comparative gene presence patterns highlight species-specific virulence strategies.',
      },
    ],
  },
  salmonella_typhi: {
    shortLabel: 'S. typhi',
    fullLabel: 'Salmonella typhi',
    scientificName: 'Salmonella typhi',
    accent: '#0f766e',
    homepageDescription:
      'The causative agent of typhoid fever, a severe systemic infection transmitted through contaminated food and water. Studied for its specialized virulence mechanisms and host-adapted pathogenicity.',
    biologySections: [
      {
        title: 'What is Salmonella typhi',
        content:
          'Salmonella typhi is a Gram-negative, rod-shaped bacterium that causes typhoid fever, a systemic illness transmitted through contaminated food or water. Unlike non-typhoidal Salmonella, S. typhi is host-adapted to humans.',
      },
      {
        title: 'Infection (S. typhi)',
        content:
          'After ingestion, S. typhi survives stomach acid, invades intestinal epithelium via type III secretion systems, and disseminates systemically through the lymphatic system. Pathogenicity islands encode the machinery required for invasion and intracellular survival.',
      },
    ],
  },
  escherichia_coli: {
    shortLabel: 'E. coli',
    fullLabel: 'Escherichia coli',
    scientificName: 'Escherichia coli',
    accent: '#8b5cf6',
    homepageDescription: PLACEHOLDER_DESCRIPTION('Escherichia coli'),
    biologySections: PLACEHOLDER_BIOLOGY('Escherichia coli'),
  },
};

const GENUS_ABBREVIATIONS: Array<[RegExp, string]> = [
  [/\bcampylobacter\s+jejuni\b/, 'campylobacter jejuni'],
  [/\bcampylobacter\s+coli\b/, 'campylobacter coli'],
  [/\bsalmonella\s+typhi\b/, 'salmonella typhi'],
  [/\bescherichia\s+coli\b/, 'escherichia coli'],
  [/\bc\.?\s*jejuni\b/, 'campylobacter jejuni'],
  [/\bc\.?\s*coli\b/, 'campylobacter coli'],
  [/\bs\.?\s*typhi\b/, 'salmonella typhi'],
  [/\be\.?\s*coli\b/, 'escherichia coli'],
];

/**
 * Convert raw spreadsheet text (e.g. "Campylobacter jejuni (NCTC 11168)",
 * "C. jejuni", "E. coli", "Salmonella typhi") into a stable canonical key
 * such as "campylobacter_jejuni" / "escherichia_coli".
 */
export function toSpeciesKey(raw: string): string {
  if (!raw) return '';
  let s = raw.toLowerCase();
  s = s.replace(/\([^)]*\)/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  for (const [re, rep] of GENUS_ABBREVIATIONS) {
    if (re.test(s)) {
      s = s.replace(re, rep);
      break;
    }
  }
  s = s.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return s;
}

/**
 * Parse a possibly multi-valued species cell into a deduplicated list of
 * canonical keys. Splits on commas / semicolons / slashes / "and".
 */
export function parseSpeciesCellToKeys(cell: string): string[] {
  if (!cell) return [];
  const fragments = cell
    .split(/[,;/]|\sand\s/i)
    .map(f => f.trim())
    .filter(f => f.length > 0);
  const keys = new Set<string>();
  for (const frag of fragments) {
    const k = toSpeciesKey(frag);
    if (k) keys.add(k);
  }
  return [...keys];
}

function deriveShortLabel(key: string): string {
  const parts = key.split('_').filter(Boolean);
  if (parts.length === 0) return key;
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  const genusInitial = parts[0].charAt(0).toUpperCase();
  const species = parts.slice(1).join(' ');
  return `${genusInitial}. ${species}`;
}

function deriveFullLabel(key: string): string {
  const parts = key.split('_').filter(Boolean);
  if (parts.length === 0) return key;
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

/**
 * Stable color assignment for a species key. Registry entries win;
 * everything else gets a deterministic color from the palette based on a
 * hash of the key so the same species always renders the same color.
 */
export function getSpeciesAccent(key: string): string {
  const meta = SPECIES_REGISTRY[key];
  if (meta?.accent) return meta.accent;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % DYNAMIC_COLOR_PALETTE.length;
  return DYNAMIC_COLOR_PALETTE[idx];
}

/**
 * Resolve full meta for a species key, falling back to placeholders so
 * unknown species still render correctly across the UI.
 */
export function getSpeciesMeta(key: string): SpeciesMeta {
  const fallbackFull = deriveFullLabel(key);
  const fallbackShort = deriveShortLabel(key);
  const reg = SPECIES_REGISTRY[key] ?? {};
  const fullLabel = reg.fullLabel ?? fallbackFull;
  return {
    key,
    shortLabel: reg.shortLabel ?? fallbackShort,
    fullLabel,
    scientificName: reg.scientificName ?? fullLabel,
    accent: reg.accent ?? getSpeciesAccent(key),
    homepageDescription:
      reg.homepageDescription ?? PLACEHOLDER_DESCRIPTION(fullLabel),
    biologySections: reg.biologySections ?? PLACEHOLDER_BIOLOGY(fullLabel),
  };
}

export function speciesShortLabel(key: string): string {
  return getSpeciesMeta(key).shortLabel;
}

export function speciesFullLabel(key: string): string {
  return getSpeciesMeta(key).fullLabel;
}

/**
 * Sort a list of species keys deterministically. Registry-known species
 * come first (in declaration order) so curated organisms stay grouped,
 * then any new species get sorted alphabetically.
 */
export function sortSpeciesKeys(keys: string[]): string[] {
  const known = Object.keys(SPECIES_REGISTRY);
  const knownRank = new Map(known.map((k, i) => [k, i]));
  return [...keys].sort((a, b) => {
    const ra = knownRank.has(a) ? knownRank.get(a)! : Number.MAX_SAFE_INTEGER;
    const rb = knownRank.has(b) ? knownRank.get(b)! : Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}
