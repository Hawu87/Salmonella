'use client';

import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { useState, useEffect } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FunctionPie() {
  const { data, loading, error } = useVirulenceData();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading pie chart...</div>;
  if (error || !data) return <div className="text-center py-8 text-red-600">Error: {error || 'No data available'}</div>;

  const categorizeFunction = (functionName: string): string => {
    const func = functionName.toLowerCase();
    if (func.includes('adhesion') || func.includes('adhere')) return 'Adhesion';
    if (func.includes('invasion') || func.includes('invade')) return 'Invasion';
    if (func.includes('toxin') || func.includes('cdt')) return 'Toxin';
    if (func.includes('flagella') || func.includes('fla') || func.includes('motility') || func.includes('mobility')) return 'Motility';
    if (func.includes('iron') || func.includes('fe')) return 'Iron uptake';
    if (func.includes('stress') || func.includes('response') || func.includes('survival')) return 'Stress response';
    return 'Other';
  };

  const functionCounts: Record<string, number> = {};
  const allGeneNames = new Set<string>();
  data.genes.forEach(gene => {
    if (!allGeneNames.has(gene.geneName)) {
      allGeneNames.add(gene.geneName);
      const category = categorizeFunction(gene.function);
      functionCounts[category] = (functionCounts[category] || 0) + 1;
    }
  });

  const categories = ['Adhesion', 'Invasion', 'Toxin', 'Motility', 'Iron uptake', 'Stress response', 'Other'];
  const labels = categories.filter(cat => functionCounts[cat] > 0);
  const values = labels.map(cat => functionCounts[cat]);
  const total = values.reduce((sum, val) => sum + val, 0);

  const chartData = {
    labels: labels.map((cat, idx) => `${cat} (${values[idx]}, ${Math.round((values[idx] / total) * 100)}%)`),
    datasets: [{
      data: values,
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)',
        'rgba(107, 114, 128, 0.8)',
      ],
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: (isMobile ? 'bottom' : 'right') as 'bottom' | 'right',
        labels: { font: { size: isMobile ? 10 : 12 }, boxWidth: isMobile ? 12 : 14, padding: isMobile ? 8 : 12 },
      },
      title: { display: true, text: 'Gene Function Distribution', font: { size: isMobile ? 14 : 16 } },
      tooltip: {
        callbacks: {
          label: (item: TooltipItem<'pie'>) => {
            const label = typeof item.label === 'string' ? item.label : '';
            const value = typeof item.raw === 'number' ? item.raw : 0;
            return `${label.split(' (')[0]}: ${value} genes (${Math.round((value / total) * 100)}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full" style={{ height: isMobile ? '450px' : '400px' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}
