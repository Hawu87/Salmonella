'use client';

import { useEffect, useMemo, useRef } from 'react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import { useData } from '@/components/DataProvider';
import type { Api } from 'datatables.net';

type FlatRow = {
  gene: string;
  species: string;
  host: string;
  function: string;
  category: string;
  presence: number; // 1/0
  prevalence: number; // percentage
  cluster?: string;
  notes?: string;
};

function categorizeProcess(functionName: string): string {
  const func = (functionName || '').toLowerCase();
  if (func.includes('adhesion') || func.includes('adhere')) return 'adhesion';
  if (func.includes('invasion') || func.includes('invade')) return 'invasion';
  if (func.includes('flagella') || func.includes('fla')) return 'motility';
  if (func.includes('motility') || func.includes('mobility')) return 'motility';
  if (func.includes('toxin') || func.includes('cdt')) return 'toxin';
  if (func.includes('colonization')) return 'colonization';
  if (func.includes('survival')) return 'survival';
  return 'other';
}

function getSpeciesLabel(
  speciesMatrix: Record<string, { jejuni: boolean; coli: boolean; salmonellaTyphi?: boolean }>,
  geneName: string
) {
  const m = speciesMatrix?.[geneName];
  if (!m) return 'Other';
  const hasSal = Boolean(m.salmonellaTyphi);
  if (m.jejuni && m.coli && !hasSal) return 'Both (C. jejuni + C. coli)';
  if (m.jejuni && !m.coli && !hasSal) return 'C. jejuni';
  if (!m.jejuni && m.coli && !hasSal) return 'C. coli';
  const parts: string[] = [];
  if (m.jejuni) parts.push('C. jejuni');
  if (m.coli) parts.push('C. coli');
  if (hasSal) parts.push('Salmonella typhi');
  if (parts.length === 0) return 'Other';
  return parts.join(' + ');
}

export default function DataExplorerTable() {
  const { data, loading, error } = useData();
  const tableRef = useRef<HTMLTableElement | null>(null);
  const dataTableRef = useRef<Api<unknown> | null>(null);

  const rows: FlatRow[] = useMemo(() => {
    if (!data) return [];

    const hosts = Object.keys(data.hostPrevalence || {});
    const genes = data.genes || [];
    const speciesMatrix = data.speciesMatrix || {};

    const flat: FlatRow[] = [];

    // Deterministic ordering for stable UX.
    const sortedGenes = [...genes].sort((a, b) => a.geneName.localeCompare(b.geneName));
    const sortedHosts = [...hosts].sort((a, b) => a.localeCompare(b));

    for (const gene of sortedGenes) {
      const geneName = gene.geneName;
      const speciesLabel = getSpeciesLabel(speciesMatrix, geneName);
      const functionName = gene.function || 'Unknown';
      const category = categorizeProcess(functionName);

      for (const host of sortedHosts) {
        const prevalence = data.hostPrevalence?.[host]?.[geneName] ?? data.hostStats?.[host]?.genes?.[geneName] ?? 0;
        const presence = prevalence > 0 ? 1 : 0;

        flat.push({
          gene: geneName,
          species: speciesLabel,
          host,
          function: functionName,
          category,
          presence,
          prevalence,
          cluster: gene.cluster,
          notes: gene.notes,
        });
      }
    }

    return flat;
  }, [data]);

  useEffect(() => {
    if (!tableRef.current) return;
    if (loading || !data) return;

    const el = tableRef.current;

    // Guard against double initialization in React dev mode / re-renders.
    if ($.fn.dataTable.isDataTable(el)) {
      $(el).DataTable().destroy();
    }

    dataTableRef.current = $(el).DataTable({
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      searching: true,
      ordering: true,
      info: true,
      autoWidth: false,
      scrollX: true,
      scrollCollapse: true,
      order: [[0, 'asc']],
      language: {
        search: '',
        searchPlaceholder: 'Search dataset...',
        lengthMenu: 'Show _MENU_ rows',
      },
      // Keep DOM simple so our CSS integration stays predictable.
      dom: '<"dt-top"f>rt<"dt-bottom"lip><"dt-info"i>',
    }) as unknown as Api<unknown>;

    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, [loading, data]);

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Loading dataset preview...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        Error: {error || 'No data available'}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full min-w-[980px]">
          <thead>
            <tr>
              <th>Gene</th>
              <th>Species</th>
              <th>Host</th>
              <th>Function</th>
              <th>Category</th>
              <th>Presence</th>
              <th>Prevalence (%)</th>
              <th>Cluster</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={`${r.gene}-${r.host}-${idx}`}>
                <td>{r.gene}</td>
                <td>{r.species}</td>
                <td>{r.host}</td>
                <td>{r.function}</td>
                <td>{r.category}</td>
                <td>{r.presence}</td>
                <td>{Number(r.prevalence.toFixed(2))}</td>
                <td>{r.cluster || ''}</td>
                <td>{r.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

