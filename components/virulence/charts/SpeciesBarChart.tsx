'use client';

import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { useState, useEffect } from 'react';
import { getSpeciesAccent, speciesShortLabel } from '@/lib/virulence/species';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SpeciesBarChartProps {
  topN?: number;
  showPercent?: boolean;
}

function withAlpha(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function SpeciesBarChart({ topN = 20, showPercent = false }: SpeciesBarChartProps) {
  const { data, loading, error } = useVirulenceData();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading chart...</div>;
  if (error || !data) return <div className="text-center py-8 text-red-600">Error: {error || 'No data available'}</div>;

  const speciesKeys = data.speciesList;
  if (speciesKeys.length === 0) {
    return <div className="text-center py-8 text-gray-500">No species available in the dataset</div>;
  }

  const geneOccurrences: Record<string, number> = {};
  data.genes.forEach(g => {
    geneOccurrences[g.geneName] = (geneOccurrences[g.geneName] || 0) + 1;
  });
  const allSorted = Object.entries(geneOccurrences)
    .sort(([, a], [, b]) => b - a)
    .map(([gene]) => gene);
  const selectedGenes = topN >= allSorted.length ? allSorted : allSorted.slice(0, topN);

  if (selectedGenes.length === 0) return <div className="text-center py-8 text-gray-500">No gene data available</div>;

  const speciesCountsPerGene: Record<string, number[]> = {};
  const speciesTotals: Record<string, number> = {};
  speciesKeys.forEach(key => {
    speciesCountsPerGene[key] = [];
    speciesTotals[key] = 0;
  });

  selectedGenes.forEach(gene => {
    const counts: Record<string, number> = {};
    speciesKeys.forEach(key => { counts[key] = 0; });
    data.genes.forEach(g => {
      if (g.geneName !== gene) return;
      g.species.forEach(speciesKey => {
        if (counts[speciesKey] !== undefined) counts[speciesKey] += 1;
      });
    });
    speciesKeys.forEach(key => {
      speciesCountsPerGene[key].push(counts[key]);
      speciesTotals[key] += counts[key];
    });
  });

  const datasets = speciesKeys.map(key => {
    const accent = getSpeciesAccent(key);
    const raw = speciesCountsPerGene[key];
    const total = speciesTotals[key];
    const dataArr = showPercent && total > 0
      ? raw.map(c => Math.round((c / total) * 10000) / 100)
      : raw;
    return {
      label: data.speciesLabels[key] ?? speciesShortLabel(key),
      data: dataArr,
      backgroundColor: withAlpha(accent, 0.8),
      borderColor: accent,
      borderWidth: 1,
    };
  });

  const chartData = { labels: selectedGenes, datasets };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: isMobile ? 11 : 12 }, boxWidth: 12 } },
      title: { display: true, text: showPercent ? 'Gene Distribution by Species (%)' : 'Gene Counts by Species', font: { size: isMobile ? 14 : 16 } },
      tooltip: {
        callbacks: {
          label: (item: TooltipItem<'bar'>) => {
            const label = item.dataset.label || '';
            const value = item.parsed?.y ?? (typeof item.raw === 'number' ? item.raw : 0);
            return `${label}: ${value}${showPercent ? '%' : ''}`;
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: showPercent ? 'Percentage (%)' : 'Count', font: { size: isMobile ? 12 : 14 } }, ticks: { font: { size: isMobile ? 10 : 12 } } },
      x: { title: { display: true, text: 'Gene', font: { size: isMobile ? 12 : 14 } }, ticks: { maxRotation: isMobile ? 90 : 45, minRotation: isMobile ? 45 : 45, font: { size: isMobile ? 9 : 12 } } },
    },
  };

  return (
    <div className="w-full" style={{ height: isMobile ? '450px' : '500px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
