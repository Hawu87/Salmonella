import Link from "next/link";
import Container from "@/components/Container";
import SectionNumber from "@/components/SectionNumber";
import Divider from "@/components/Divider";

const MAYO_URL =
  "https://www.mayoclinic.org/diseases-conditions/salmonella/symptoms-causes/syc-20355329";

const MAYO_P1 =
  "Salmonella infection (salmonellosis) is a common bacterial disease that affects the intestinal tract. Salmonella bacteria typically live in animal and human intestines and are shed through stool (feces). Humans become infected most frequently through contaminated water or food.";

const MAYO_P2 =
  "Some people with salmonella infection have no symptoms. Most people develop diarrhea, fever and stomach (abdominal) cramps within 8 to 72 hours after exposure. Most healthy people recover within a few days to a week without specific treatment.";

const STRUCTURE_BLOCKS = [
  {
    title: "Biology",
    description:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    href: "/biology",
  },
  {
    title: "Visualizations",
    description:
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    href: "/visualizations",
  },
  {
    title: "References",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    href: "/references",
  },
];

export default function Home() {
  return (
    <div className="bg-white">
      <Container>
        <section className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <SectionNumber number="01" />
          <div>
            <h1 className="text-3xl font-bold text-[#111827] lg:text-4xl">
              Salmonella
            </h1>
            <p className="mt-3 text-[#6B7280] lg:text-lg">
              A structured knowledge base for biology and visualizations.
            </p>
            <div className="mt-8 space-y-4 text-[#111827]">
              <p>{MAYO_P1}</p>
              <p>{MAYO_P2}</p>
            </div>
            <p className="mt-6 text-sm text-[#6B7280]">
              Source:{" "}
              <a
                href={MAYO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F766E] hover:underline"
              >
                Mayo Clinic — Salmonella (Symptoms & causes)
              </a>
            </p>
          </div>
        </section>

        <Divider />

        <section className="grid gap-10 pt-14 lg:grid-cols-[auto_1fr] lg:gap-16">
          <SectionNumber number="02" />
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Structure</h2>
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
      </Container>
    </div>
  );
}
