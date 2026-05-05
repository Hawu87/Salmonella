import Container from "@/components/Container";
import VirulenceDashboard from "@/components/virulence/VirulenceDashboard";
import { getDatasetSpeciesKeys } from "@/lib/virulence/serverData";
import { getSpeciesMeta } from "@/lib/virulence/species";

export default function VisualizationsPage() {
  const speciesKeys = getDatasetSpeciesKeys();
  const organisms = speciesKeys.map(key => getSpeciesMeta(key));

  return (
    <div className="bg-white">
      <Container>
        <section className="mb-14">
          <h1 className="text-3xl font-bold text-[#111827] lg:text-4xl">
            Visualizations
          </h1>
          <p className="mt-4 text-[#6B7280] max-w-2xl leading-relaxed">
            Interactive visualizations exploring virulence gene data across host
            associations, bacterial species, and functional categories. The
            current dataset covers{" "}
            {organisms.length > 0
              ? organisms.map((o, i) => (
                  <span key={o.key}>
                    <strong>{o.fullLabel}</strong>
                    {i < organisms.length - 2
                      ? ", "
                      : i === organisms.length - 2
                        ? ", and "
                        : ""}
                  </span>
                ))
              : "the organisms in this dataset"}
            , enabling cross-species comparisons of gene prevalence and
            distribution.
          </p>
        </section>

        {/* Scope legend */}
        <div className="mb-10 flex flex-wrap gap-3">
          {organisms.map(org => (
            <span
              key={org.key}
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#6B7280]"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: org.accent }}
              />
              {org.shortLabel}
            </span>
          ))}
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#6B7280]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#7C3AED]" />
            Cross-species / comparative
          </span>
        </div>

        <VirulenceDashboard />
      </Container>
    </div>
  );
}
