'use client';

import dynamic from 'next/dynamic';
import { VirulenceDataProvider } from '@/components/virulence/shared/VirulenceDataProvider';
import SpeciesFilterControl from '@/components/virulence/shared/SpeciesFilterControl';
import VizSourceFooter from '@/components/virulence/shared/VizSourceFooter';

const BarChart = dynamic(() => import('@/components/virulence/charts/BarChart'), { ssr: false });
const Matrix = dynamic(() => import('@/components/virulence/charts/Matrix'), { ssr: false });
const CooccurrenceNetwork = dynamic(() => import('@/components/virulence/charts/CooccurrenceNetwork'), { ssr: false });
const FunctionPie = dynamic(() => import('@/components/virulence/charts/FunctionPie'), { ssr: false });
const GeneFunctionSunburst = dynamic(() => import('@/components/virulence/charts/GeneFunctionSunburst'), { ssr: false });
const Sankey = dynamic(() => import('@/components/virulence/charts/Sankey'), { ssr: false });
const SpeciesBarChart = dynamic(() => import('@/components/virulence/charts/SpeciesBarChart'), { ssr: false });
const Sunburst = dynamic(() => import('@/components/virulence/charts/Sunburst'), { ssr: false });
const GeneProfiles = dynamic(() => import('@/components/virulence/charts/GeneProfiles'), { ssr: false });

function VizCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4">{description}</p>
      <div>{children}</div>
    </section>
  );
}

const TOP_N = 20;

export default function VirulenceDashboard() {
  return (
    <VirulenceDataProvider>
      <div className="space-y-8">
        <SpeciesFilterControl />

        <VizCard
          title="Gene prevalence by host environment"
          description="Bar chart comparing prevalence of key virulence genes across host environments inferred from regulation annotations (avian/poultry, bovine/cattle, human)."
        >
          <BarChart />
        </VizCard>

        <VizCard
          title="Species Presence Matrix"
          description="Table showing which virulence genes are present in each species in the dataset. Green indicates expression, red indicates absence. Columns are derived from the data, so new species appear automatically."
        >
          <Matrix />
        </VizCard>

        <VizCard
          title="Gene Function Sunburst"
          description="Hierarchical sunburst showing virulence genes organized by functional category. Click to zoom into categories."
        >
          <GeneFunctionSunburst />
        </VizCard>

        <VizCard
          title="Gene Function Distribution"
          description="Pie chart showing the proportion of virulence genes grouped by functional category."
        >
          <FunctionPie />
        </VizCard>

        <VizCard
          title="Host environment–gene Sankey"
          description="Flow diagram showing how the top genes distribute across host environments (mapped from regulation in host environments). Connection thickness reflects annotation count."
        >
          <Sankey topK={TOP_N} />
        </VizCard>

        <VizCard
          title="Human host environment sunburst"
          description="Sunburst of gene counts for rows with human upregulation, broken down by species in the dataset."
        >
          <Sunburst />
        </VizCard>

        <VizCard
          title="Gene Co-occurrence Network"
          description="Interactive network graph showing which virulence genes are found together in the same isolates. Node size reflects frequency, link thickness reflects co-occurrence strength."
        >
          <CooccurrenceNetwork />
        </VizCard>

        <VizCard
          title="Gene Profiles by Process"
          description="Expandable list of virulence genes organized by biological process. Click any gene for detailed information."
        >
          <GeneProfiles />
        </VizCard>

        <VizCard
          title="Gene Counts by Species"
          description="Comparison of gene occurrences across all species present in the dataset."
        >
          <SpeciesBarChart topN={50} showPercent={false} />
        </VizCard>

        <VizSourceFooter />
      </div>
    </VirulenceDataProvider>
  );
}
