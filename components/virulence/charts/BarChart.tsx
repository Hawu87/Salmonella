'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import { useState, useEffect } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const geneFunctionMap: Record<string, string> = {
  cadF: 'Adhesion to host epithelial cells',
  ciaB: 'Invasion-associated protein',
  cdtA: 'Cytolethal distending toxin subunit A',
  cdtB: 'Cytolethal distending toxin subunit B (toxin activity)',
  cdtC: 'Cytolethal distending toxin subunit C',
  flaA: 'Flagellar motility / colonization',
};

export default function BarChart() {
  const { data, loading, error } = useVirulenceData();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading chart data...</div>;
  if (error || !data) return <div className="text-center py-8 text-red-600">Error: {error || 'No data available'}</div>;

  const majorGenes = ['cdtA', 'cdtB', 'cdtC', 'cadF', 'ciaB', 'flaA'];
  const allGenes = new Set<string>();
  Object.values(data.hostStats).forEach(hostData => {
    Object.keys(hostData.genes || {}).forEach(gene => allGenes.add(gene));
  });

  const genesToDisplay = Array.from(allGenes).filter(gene =>
    majorGenes.some(mg => gene.toLowerCase().includes(mg.toLowerCase())) || majorGenes.includes(gene)
  );
  if (genesToDisplay.length === 0) genesToDisplay.push(...Array.from(allGenes).slice(0, 10));

  const findHostKey = (searchTerms: string[]): string | null => {
    const hostKeys = Object.keys(data.hostStats);
    const normalized = searchTerms.map(t => t.toLowerCase().trim());
    for (const key of hostKeys) {
      if (normalized.includes(key.toLowerCase().trim())) return key;
    }
    for (const key of hostKeys) {
      for (const term of normalized) {
        if (key.toLowerCase().includes(term) || term.includes(key.toLowerCase())) return key;
      }
    }
    return null;
  };

  const foodAnimalsKey = findHostKey(['Food animals']);
  const bothKey = findHostKey(['Multiple (food animals, humans)', 'Multiple']);

  const hostCategoryMap = [
    { key: foodAnimalsKey, label: 'Food animals', color: '#eab308' },
    { key: bothKey, label: 'Both (Humans + Food animals)', color: '#ef4444' },
  ];

  const datasets = hostCategoryMap
    .filter(cat => cat.key && data.hostStats[cat.key])
    .map(cat => ({
      label: cat.label,
      data: genesToDisplay.map(gene => data.hostStats[cat.key!].genes[gene] || 0),
      backgroundColor: cat.color,
    }));

  const chartData = { labels: genesToDisplay, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: isMobile ? 11 : 12 }, boxWidth: 12 } },
      title: { display: true, text: 'Gene Virulence by Host Association (%)', font: { size: isMobile ? 14 : 16 } },
      tooltip: {
        callbacks: {
          title: (items: TooltipItem<'bar'>[]) => `Gene: ${items[0].label}`,
          label: (item: TooltipItem<'bar'>) => {
            const geneName = item.label as string;
            const hostGroup = item.dataset.label || '';
            const virulence = typeof item.parsed.y === 'number' ? item.parsed.y.toFixed(1) : '0.0';
            const geneLower = geneName.toLowerCase();
            let geneFunction = '';
            for (const [key, value] of Object.entries(geneFunctionMap)) {
              if (geneLower.includes(key.toLowerCase()) || geneName === key) { geneFunction = value; break; }
            }
            const lines = [`Host: ${hostGroup}`, `Virulence: ${virulence}%`];
            if (geneFunction) lines.push(`Function: ${geneFunction}`);
            return lines;
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, max: 30, title: { display: true, text: 'Virulence (%)', font: { size: isMobile ? 12 : 14 } }, ticks: { stepSize: 5, font: { size: isMobile ? 10 : 12 } } },
      x: { title: { display: true, text: 'Gene/Cluster', font: { size: isMobile ? 12 : 14 } }, ticks: { font: { size: isMobile ? 9 : 12 }, maxRotation: isMobile ? 90 : 0, minRotation: isMobile ? 45 : 0 } },
    },
  };

  return (
    <div className="w-full">
      <p className="text-gray-500 text-xs sm:text-sm italic mb-3">
        Tip: Hover over a bar to see gene function and group differences.
      </p>
      <div style={{ height: isMobile ? '350px' : '400px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
