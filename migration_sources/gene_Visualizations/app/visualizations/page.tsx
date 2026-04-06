'use client';

import { useState } from 'react';
import { DataProvider } from '@/components/DataProvider';
import CooccurrenceNetwork from '@/components/visualizations/CooccurrenceNetwork';
import SpeciesBarChart from '@/components/visualizations/SpeciesBarChart';
import FunctionPie from '@/components/visualizations/FunctionPie';
import Sunburst from '@/components/visualizations/Sunburst';
import Sankey from '@/components/visualizations/Sankey';
import StoryCard from '@/components/StoryCard';


export default function VisualizationsPage() {
  const [selectedGene, setSelectedGene] = useState<string | null>(null);

  const handleGeneClick = (geneName: string) => {
    setSelectedGene(geneName);
    const element = document.getElementById('gene-profiles');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Campylobacter Virulence Gene Visualizations
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Explore interactive visualizations of virulence gene data across hosts and species
            </p>
          </div>

          {/* Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Co-occurrence Network */}
            <div className="lg:col-span-2">
              <StoryCard
                title="Gene Co-Occurrence Network"
                desc="This network visualization shows which virulence genes tend to appear together in the same bacterial isolates. Each circle (node) represents a gene. Larger circles mean the gene appears more frequently. Lines (links) connect genes that co-occur. Thicker lines mean those genes are found together more often. Genes are color-coded by function: red (toxin), blue (adhesion), green (invasion), orange (motility). Hover over nodes to see details, or click to explore specific genes."
              >
                <CooccurrenceNetwork onNodeClick={handleGeneClick} />
              </StoryCard>
            </div>

            {/* Species Bar Chart */}
            <div className="lg:col-span-2">
              <StoryCard
                title="Comparison of Virulence Gene Presence Between Species"
                desc="This chart compares the presence of selected virulence-associated genes between Campylobacter jejuni and Campylobacter coli. Bars indicate whether a gene is present for each species among the selected top genes."
              >
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">
                  A value of 1 indicates gene presence; 0 indicates absence. When percentages are enabled, values represent prevalence.
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">
                  This view highlights genes that are shared across species versus those that appear species-specific in the dataset.
                </p>
                <SpeciesBarChart topN={20} showPercent={false} />
              </StoryCard>
            </div>

            {/* Function Pie Chart */}
            <div>
              <StoryCard
                title="Gene Function Distribution"
                desc="Distribution of genes by functional category (Adhesion, Invasion, Toxin, Motility, etc.)"
              >
                <FunctionPie />
              </StoryCard>
            </div>

            {/* Sunburst */}
            <div>
              <StoryCard
                title="Hierarchical View: Species → Human Isolates → Gene Count"
                desc="This visualization shows how gene counts are distributed across human isolates, grouped by species. Non-human hosts are excluded. Segment size reflects relative gene count; color indicates species."
              >
                <Sunburst />
              </StoryCard>
            </div>

            {/* Sankey Diagram */}
            <div className="lg:col-span-2">
              <StoryCard
                title="Distribution of Virulence Genes Across Host Categories"
                desc="This visualization shows how virulence-associated genes are distributed across different host categories. Connections link host groups to genes, with thicker connections indicating a higher number of isolates containing that gene within the host."
              >
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">
                  This view highlights which genes are most commonly associated with specific host categories in the dataset.
                </p>
                <Sankey topK={20} onGeneClick={handleGeneClick} />
              </StoryCard>
            </div>

          </div>

          {/* Selected Gene Info */}
          {selectedGene && (
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Selected Gene: {selectedGene}
              </h3>
              <p className="text-blue-700 dark:text-blue-400">
                Gene information and profiles are available in the main dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </DataProvider>
  );
}

