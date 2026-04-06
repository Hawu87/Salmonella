'use client';

import Container from "@/components/Container";
import SectionNumber from "@/components/SectionNumber";
import VirulenceDashboard from "@/components/virulence/VirulenceDashboard";

export default function VisualizationsPage() {
  return (
    <div className="bg-white">
      <Container>
        <section className="mb-14 grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <SectionNumber number="03" />
          <div>
            <h1 className="text-3xl font-bold text-[#111827] lg:text-4xl">
              Visualizations
            </h1>
            <p className="mt-4 text-[#6B7280] max-w-2xl leading-relaxed">
              Interactive visualizations of virulence gene data across host
              associations and bacterial species. Explore gene prevalence,
              functional distribution, co-occurrence networks, and more.
            </p>
          </div>
        </section>

        <VirulenceDashboard />
      </Container>
    </div>
  );
}
