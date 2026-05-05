import 'server-only';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { parseSpeciesCellToKeys, sortSpeciesKeys } from './species';

const DATA_FILE = path.join(
  process.cwd(),
  'public',
  'data',
  'virulence',
  'campylobacter (1).xlsx',
);

function resolvePrimarySheetName(sheetNames: string[]): string {
  if (!sheetNames.length) return '';
  const sheet1 = sheetNames.find(
    n => n.replace(/^\s+|\s+$/g, '').toLowerCase() === 'sheet1',
  );
  return sheet1 ?? sheetNames[0];
}

let cachedKeys: string[] | null = null;

/**
 * Reads the virulence spreadsheet on the server and returns a sorted list
 * of canonical species keys present in the dataset. Used by SSR pages
 * (homepage, biology) so adding a species to the spreadsheet flows through
 * to the UI without requiring a client fetch.
 */
export function getDatasetSpeciesKeys(): string[] {
  if (cachedKeys) return cachedKeys;

  if (!fs.existsSync(DATA_FILE)) {
    cachedKeys = [];
    return cachedKeys;
  }

  const buf = fs.readFileSync(DATA_FILE);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheetName = resolvePrimarySheetName(wb.SheetNames);
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[];
  if (rows.length === 0) {
    cachedKeys = [];
    return cachedKeys;
  }

  const firstRow = Array.isArray(rows[0]) ? (rows[0] as unknown[]) : [];
  const headers = firstRow.map(h => (h ?? '').toString().toLowerCase().trim());
  const speciesCol = headers.findIndex(h => h.includes('species'));
  if (speciesCol < 0) {
    cachedKeys = [];
    return cachedKeys;
  }

  const found = new Set<string>();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;
    const cell = ((row[speciesCol] as unknown) ?? '').toString();
    parseSpeciesCellToKeys(cell).forEach(k => found.add(k));
  }

  cachedKeys = sortSpeciesKeys([...found]);
  return cachedKeys;
}
