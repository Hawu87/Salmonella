'use client';

import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { useState, useEffect } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SpeciesBarChartProps {
  topN?: number;
  showPercent?: boolean;
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

  const geneOccurrences: Record<string, number> = {};
  data.genes.forEach(g => {
    geneOccurrences[g.geneName] = (geneOccurrences[g.geneName] || 0) + 1;
  });
  const allSorted = Object.entries(geneOccurrences)
    .sort(([, a], [, b]) => b - a)
    .map(([gene]) => gene);
  const selectedGenes = topN >= allSorted.length ? allSorted : allSorted.slice(0, topN);

  if (selectedGenes.length === 0) return <div className="text-center py-8 text-gray-500">No gene data available</div>;

  const jejuniCounts: number[] = [];
  const coliCounts: number[] = [];
  const typhiCounts: number[] = [];
  let totalJejuni = 0;
  let totalColi = 0;
  let totalTyphi = 0;

  selectedGenes.forEach(gene => {
    let jc = 0, cc = 0, tc = 0;
    data.genes.forEach(g => {
      if (g.geneName === gene) {
        if (g.species.includes('jejuni')) jc++;
        if (g.species.includes('coli')) cc++;
        if (g.species.includes('salmonella_typhi')) tc++;
      }
    });
    jejuniCounts.push(jc);
    coliCounts.push(cc);
    typhiCounts.push(tc);
    totalJejuni += jc;
    totalColi += cc;
    totalTyphi += tc;
  });

  const jejuniData = showPercent && totalJejuni > 0 ? jejuniCounts.map(c => Math.round((c / totalJejuni) * 10000) / 100) : jejuniCounts;
  const coliData = showPercent && totalColi > 0 ? coliCounts.map(c => Math.round((c / totalColi) * 10000) / 100) : coliCounts;
  const typhiData = showPercent && totalTyphi > 0 ? typhiCounts.map(c => Math.round((c / totalTyphi) * 10000) / 100) : typhiCounts;

  const chartData = {
    labels: selectedGenes,
    datasets: [
      { label: 'C. jejuni', data: jejuniData, backgroundColor: 'rgba(59, 130, 246, 0.8)' },
      { label: 'C. coli', data: coliData, backgroundColor: 'rgba(239, 68, 68, 0.8)' },
      { label: 'S. typhi', data: typhiData, backgroundColor: 'rgba(15, 118, 110, 0.8)' },
    ],
  };

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
