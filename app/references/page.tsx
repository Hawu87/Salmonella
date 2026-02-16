import Container from "@/components/Container";
import SectionNumber from "@/components/SectionNumber";
import ReferenceItem from "@/components/ReferenceItem";

const MAYO_URL =
  "https://www.mayoclinic.org/diseases-conditions/salmonella/symptoms-causes/syc-20355329";

const REFERENCES = [
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
  {
    id: "ref-SAL-002",
    title: "Bacterial foodborne pathogens overview",
    source: "Placeholder source",
    link: "#",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    notes: [
      "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
      "Ut enim ad minim veniam quis nostrud exercitation.",
    ],
  },
  {
    id: "ref-SAL-003",
    title: "High-risk populations and surveillance",
    source: "Placeholder source",
    link: "#",
    description:
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    notes: [
      "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
      "Excepteur sint occaecat cupidatat non proident.",
    ],
  },
  {
    id: "ref-SAL-004",
    title: "Food safety and prevention guidelines",
    source: "Placeholder source",
    link: "#",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    notes: [
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod.",
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
