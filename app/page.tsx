import Link from "next/link";
import Container from "@/components/Container";
import Divider from "@/components/Divider";
import { TEAM_MEMBERS } from "@/lib/pathogens/config";
import { getSpeciesMeta } from "@/lib/virulence/species";
import { getDatasetSpeciesKeys } from "@/lib/virulence/serverData";

const STRUCTURE_BLOCKS = [
  {
    title: "Biology",
    description:
      "Explore the biology of the organisms in this dataset — how they infect hosts, cause disease, and differ in their virulence strategies.",
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

export default function Home() {
  const speciesKeys = getDatasetSpeciesKeys();
  const organisms = speciesKeys.map(key => getSpeciesMeta(key));

  return (
    <div className="bg-white">
      <Container>
        {/* Hero */}
        <section>
          <h1 className="text-3xl font-bold text-[#111827] lg:text-4xl">
            Gerald <span className="text-primary">Virulence</span> Explorer
          </h1>
          <p className="mt-3 text-[#6B7280] lg:text-lg max-w-2xl">
            A comparative research platform for exploring virulence biology,
            gene expression, and host associations across bacterial pathogens.
          </p>
          <div className="mt-8 space-y-4 text-[#111827]">
            <p>
              This platform brings together structured biology, interactive
              visualizations, and curated references for major foodborne
              pathogens. The current dataset covers{" "}
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
              . It supports comparative analysis of virulence-associated genes
              across species and host environments.
            </p>
            <p>
              Understanding how these organisms differ in their virulence
              strategies — from invasion mechanisms to toxin production — is
              critical for public health, food safety, and antimicrobial
              research.
            </p>
          </div>
        </section>

        <div className="mt-12">
          <Divider />
        </div>

        {/* Organisms */}
        <section className="pt-14">
          <h2 className="text-2xl font-bold text-[#111827]">
            Organisms Covered
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {organisms.map((org) => (
              <div
                key={org.key}
                className="rounded-lg border border-[#E5E7EB] border-l-4 p-6"
                style={{ borderLeftColor: org.accent }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: org.accent }}
                  />
                  <h3 className="text-lg font-semibold text-[#111827]">
                    {org.shortLabel}
                  </h3>
                </div>
                <p className="text-xs text-[#6B7280] italic mb-3">
                  {org.scientificName}
                </p>
                <p className="text-sm text-[#111827] leading-relaxed">
                  {org.homepageDescription}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12">
          <Divider />
        </div>

        {/* Site Structure */}
        <section className="pt-14">
          <h2 className="text-2xl font-bold text-[#111827]">
            Explore the Platform
          </h2>
          <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {STRUCTURE_BLOCKS.map(({ title, description, href }) => (
              <div key={href}>
                <Link
                  href={href}
                  className="text-lg font-semibold text-[#111827] hover:text-primary transition-colors"
                >
                  {title}
                </Link>
                <p className="mt-2 text-sm text-[#6B7280]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12">
          <Divider />
        </div>

        {/* Team */}
        <section className="pt-14">
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
        </section>

        <div className="mt-12">
          <Divider />
        </div>

        {/* About */}
        <section className="pt-14 pb-4">
          <h2 className="text-2xl font-bold text-[#111827]">
            About This Project
          </h2>
          <div className="mt-6 space-y-4 text-[#111827] max-w-2xl">
            <p>
              Pathogen Virulence Explorer is a student-led data storytelling
              project that visualizes patterns in virulence factors across
              foodborne bacterial species through interactive charts and
              structured biology content.
            </p>
          </div>
        </section>
      </Container>
    </div>
  );
}
