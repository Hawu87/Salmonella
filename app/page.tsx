import Link from "next/link";
import Container from "@/components/Container";
import SectionNumber from "@/components/SectionNumber";
import Divider from "@/components/Divider";
import { TEAM_MEMBERS } from "@/lib/pathogens/config";

const STRUCTURE_BLOCKS = [
  {
    title: "Biology",
    description:
      "Explore the biology of Salmonella and Campylobacter — how they infect hosts, cause disease, and differ in their virulence strategies.",
    href: "/biology",
  },
  {
    title: "Visualizations",
    description:
      "Interactive charts and data narratives covering virulence gene prevalence, host associations, co-occurrence networks, and cross-species comparisons.",
    href: "/visualizations",
  },
  {
    title: "References",
    description:
      "Browse the scientific sources used throughout this platform, organized by pathogen and topic area.",
    href: "/references",
  },
];

const ORGANISMS = [
  {
    name: "Salmonella",
    scientific: "Salmonella enterica",
    summary:
      "A genus of Gram-negative bacteria responsible for salmonellosis, one of the most common foodborne infections worldwide. With over 2,500 serotypes, Salmonella infections range from self-limiting gastroenteritis to severe systemic disease.",
    accent: "#0F766E",
  },
  {
    name: "Campylobacter",
    scientific: "Campylobacter jejuni / C. coli",
    summary:
      "The leading cause of bacterial gastroenteritis globally. Campylobacter jejuni and Campylobacter coli are commonly profiled for their virulence-associated genes, which play roles in adhesion, invasion, toxin production, and environmental persistence.",
    accent: "#1D4ED8",
  },
];

export default function Home() {
  return (
    <div className="bg-white">
      <Container>
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <SectionNumber number="01" />
          <div>
            <h1 className="text-3xl font-bold text-[#111827] lg:text-4xl">
              Pathogen Virulence Explorer
            </h1>
            <p className="mt-3 text-[#6B7280] lg:text-lg max-w-2xl">
              A comparative research platform for exploring virulence biology,
              gene expression, and host associations across bacterial pathogens.
            </p>
            <div className="mt-8 space-y-4 text-[#111827]">
              <p>
                This platform brings together structured biology, interactive
                visualizations, and curated references for two major foodborne
                pathogens: <strong>Salmonella</strong> and{" "}
                <strong>Campylobacter</strong>. It supports comparative analysis
                of virulence-associated genes across species and host
                environments.
              </p>
              <p>
                Understanding how these organisms differ in their virulence
                strategies — from invasion mechanisms to toxin production — is
                critical for public health, food safety, and antimicrobial
                research.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12">
          <Divider />
        </div>

        {/* Organisms */}
        <section className="grid gap-10 pt-14 lg:grid-cols-[auto_1fr] lg:gap-16">
          <SectionNumber number="02" />
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">
              Organisms Covered
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {ORGANISMS.map((org) => (
                <div
                  key={org.name}
                  className="rounded-lg border border-[#E5E7EB] p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: org.accent }}
                    />
                    <h3 className="text-lg font-semibold text-[#111827]">
                      {org.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#6B7280] italic mb-3">
                    {org.scientific}
                  </p>
                  <p className="text-sm text-[#111827] leading-relaxed">
                    {org.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-12">
          <Divider />
        </div>

        {/* Site Structure */}
        <section className="grid gap-10 pt-14 lg:grid-cols-[auto_1fr] lg:gap-16">
          <SectionNumber number="03" />
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">
              Explore the Platform
            </h2>
            <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {STRUCTURE_BLOCKS.map(({ title, description, href }) => (
                <div key={href}>
                  <Link
                    href={href}
                    className="text-lg font-semibold text-[#111827] hover:underline"
                  >
                    {title}
                  </Link>
                  <p className="mt-2 text-sm text-[#6B7280]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-12">
          <Divider />
        </div>

        {/* Team */}
        <section className="grid gap-10 pt-14 lg:grid-cols-[auto_1fr] lg:gap-16">
          <SectionNumber number="04" />
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Our Team</h2>
            <p className="mt-3 text-sm text-[#6B7280] max-w-2xl">
              Developed by a group of research enthusiasts exploring data-driven
              pathogen biology.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col items-center text-center"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-24 w-24 rounded-full border-2 border-[#E5E7EB] object-cover shadow-sm sm:h-28 sm:w-28"
                  />
                  <h4 className="mt-3 text-sm font-semibold text-[#111827] sm:text-base">
                    {member.name}
                  </h4>
                  <p className="text-xs text-[#6B7280]">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-12">
          <Divider />
        </div>

        {/* About */}
        <section className="grid gap-10 pt-14 pb-4 lg:grid-cols-[auto_1fr] lg:gap-16">
          <SectionNumber number="05" />
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">
              About This Project
            </h2>
            <div className="mt-6 space-y-4 text-[#111827] max-w-2xl">
              <p>
                Pathogen Virulence Explorer is a student-led data storytelling
                project that visualizes patterns in virulence factors across{" "}
                <em>Salmonella</em> and <em>Campylobacter</em> species through
                interactive charts and structured biology content.
              </p>
              <p className="text-sm text-[#6B7280] italic">
                Funding: Supported by grant (Grant ID: GRANT-XXXX).
              </p>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
