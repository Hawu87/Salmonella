import Container from "@/components/Container";
import SectionNumber from "@/components/SectionNumber";
import ReferenceItem from "@/components/ReferenceItem";

const MAYO_URL =
  "https://www.mayoclinic.org/diseases-conditions/salmonella/symptoms-causes/syc-20355329";

const REF1_URL =
  "https://www.sciencedirect.com/science/article/pii/S2772416624000081";
const REF2_URL = "https://pmc.ncbi.nlm.nih.gov/articles/PMC8057844/";
const REF3_URL =
  "https://www.sciencedirect.com/science/article/pii/S0032579119314324";

const REFERENCES = [
  {
    id: "ref1",
    title:
      "Salmonella in the environment: A review on ecology, antimicrobial resistance, seafood contaminations, and human health implications",
    source: "Journal of Hazardous Materials Advances",
    link: REF1_URL,
    description:
      "Review of Salmonella ecology, antimicrobial resistance, and implications for human health and seafood safety.",
    notes: [
      "Covers environmental persistence and transmission pathways.",
      "Discusses pathogenicity islands and invasion mechanisms.",
    ],
  },
  {
    id: "ref2",
    title: "Salmonella spp. infection – a continuous threat worldwide",
    source: "GERMS",
    link: REF2_URL,
    description:
      "Overview of Salmonella as a global health threat, serotypes, clinical presentation, and risk groups.",
    notes: [
      "Distinguishes non-typhoidal and typhoidal Salmonella.",
      "Describes symptoms, timeline, and vulnerable populations.",
    ],
  },
  {
    id: "ref3",
    title:
      "Evaluation of USDA approved antimicrobials on the reduction of Salmonella and Campylobacter in ground chicken frames and their effect on meat quality",
    source: "Poultry Science",
    link: REF3_URL,
    description:
      "Research on antimicrobial interventions to reduce Salmonella in poultry products.",
    notes: [
      "Evaluates interventions in chicken processing.",
      "Discusses impact on meat quality.",
    ],
  },
  {
    id: "ref-SAL-001",
    title: "Salmonella (Symptoms & causes)",
    source: "Mayo Clinic",
    link: MAYO_URL,
    description: "Defines typical symptoms and transmission patterns.",
    notes: [
      "Covers incubation period and common symptoms.",
      "Describes foodborne and waterborne transmission.",
      "Includes when to seek medical care.",
    ],
  },
];

export default function ReferencesPage() {
  return (
    <div className="bg-white">
      <Container>
        <section className="mb-14 grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <SectionNumber number="04" />
          <div>
            <h1 className="text-3xl font-bold text-[#111827] lg:text-4xl">
              References
            </h1>
            <p className="mt-3 text-[#6B7280]">
              Sources cited in this knowledge base.
            </p>
          </div>
        </section>

        <div className="max-w-3xl">
          {REFERENCES.map((ref) => (
            <ReferenceItem
              key={ref.id}
              id={ref.id}
              title={ref.title}
              source={ref.source}
              link={ref.link}
              description={ref.description}
              notes={ref.notes}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
