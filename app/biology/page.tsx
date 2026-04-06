"use client";

import { useState } from "react";
import Container from "@/components/Container";
import Divider from "@/components/Divider";
import VerticalNav from "@/components/VerticalNav";

function Cite({ id }: { id: string }) {
  const num = id.replace("ref", "");
  return (
    <a
      href={`/references#${id}`}
      className="text-[#0F766E] hover:underline"
      title={`Reference ${num}`}
    >
      [{num}]
    </a>
  );
}

const SECTIONS = [
  {
    title: "Overview",
    content: (
      <>
        <p>
          This section covers the biology of two major foodborne bacterial
          pathogens: <strong>Salmonella</strong> and{" "}
          <strong>Campylobacter</strong>. Both are leading causes of bacterial
          gastroenteritis worldwide and are commonly studied for their
          virulence-associated genes.
        </p>
        <p>
          While they share certain transmission pathways — particularly through
          contaminated poultry and food products — they differ significantly in
          their biology, infection mechanisms, and virulence strategies.
          Understanding these differences is central to comparative pathogen
          research.
        </p>
        <div className="mt-8 border-l-4 border-[#0F766E] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Salmonella and Campylobacter are both major foodborne pathogens, but
            they employ distinct virulence mechanisms and affect hosts
            differently.
          </p>
        </div>
      </>
    ),
  },
  {
    title: "What is Salmonella",
    content: (
      <>
        <p>
          Salmonella is a genus of Gram-negative, rod-shaped bacteria
          responsible for salmonellosis, one of the most common foodborne
          infections worldwide <Cite id="ref1" /> <Cite id="ref2" />. The
          bacteria are typically transmitted through contaminated food or water
          and can infect both humans and animals.
        </p>
        <p>
          More than 2,500 Salmonella serotypes have been identified, with many
          infections caused by strains of Salmonella enterica <Cite id="ref1" />.
          These infections are generally categorized into two major groups:
          non-typhoidal Salmonella, which usually causes gastrointestinal
          illness, and typhoidal Salmonella, which causes enteric fever and more
          severe systemic disease <Cite id="ref2" />.
        </p>
        <div className="mt-8 border-l-4 border-[#0F766E] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Salmonella is a diverse group of bacteria mainly spread through
            contaminated food or water, causing millions of infections worldwide
            each year <Cite id="ref1" /> <Cite id="ref2" />.
          </p>
        </div>
      </>
    ),
  },
  {
    title: "Infection Process (Salmonella)",
    content: (
      <>
        <p>
          Infection typically begins when contaminated food or water is
          ingested. After entering the digestive system, Salmonella bacteria
          reach the intestinal tract where they attach to and invade epithelial
          cells lining the intestine <Cite id="ref1" />.
        </p>
        <p>
          The invasion process is mediated by specialized genetic regions called
          Salmonella pathogenicity islands. These regions encode a type III
          secretion system that allows the bacterium to inject proteins into host
          cells and trigger its own uptake <Cite id="ref1" />.
        </p>
        <p>
          Once inside the host cell, Salmonella can survive within a
          membrane-bound compartment called the Salmonella-containing vacuole,
          which helps protect the bacteria from immune defenses while it
          replicates <Cite id="ref1" /> <Cite id="ref2" />.
        </p>
        <p>
          Food products such as poultry remain a common source of contamination,
          and research shows antimicrobial interventions can significantly reduce
          Salmonella levels in chicken products <Cite id="ref3" />.
        </p>
        <div className="my-8">
          <img
            src="/infection-process.png"
            alt="Illustration of the Salmonella infection process"
            className="mx-auto w-full max-w-3xl rounded-md"
          />
          <p className="mt-3 text-xs text-[#6B7280]">
            Figure 1. Illustration of the Salmonella infection process. Image
            generated using OpenAI DALL·E.
          </p>
        </div>
        <div className="mt-8 border-l-4 border-[#0F766E] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Salmonella infection begins with ingestion of contaminated food,
            followed by bacterial invasion of intestinal cells and intracellular
            survival mechanisms <Cite id="ref1" />.
          </p>
        </div>
      </>
    ),
  },
  {
    title: "What is Campylobacter",
    content: (
      <>
        <p>
          Campylobacter is a genus of Gram-negative, spiral-shaped bacteria and
          the leading cause of bacterial gastroenteritis worldwide.{" "}
          <em>Campylobacter jejuni</em> and <em>Campylobacter coli</em> are the
          species most commonly associated with human disease{" "}
          <Cite id="ref-CAM-001" />.
        </p>
        <p>
          Transmission occurs primarily through consumption of contaminated
          poultry, unpasteurized milk, and contaminated water. In endemic
          regions, environmental contamination and direct animal contact are also
          significant risk factors <Cite id="ref-CAM-001" />.
        </p>
        <p>
          Unlike Salmonella, Campylobacter is microaerophilic and thermophilic,
          requiring specific atmospheric conditions for growth. Despite being
          fragile outside of hosts, it remains a persistent public health
          challenge due to its prevalence in the poultry supply chain{" "}
          <Cite id="ref-CAM-002" />.
        </p>
        <div className="my-8">
          <img
            src="/images/cover-page.png"
            alt="Campylobacter transmission and environmental reservoirs"
            className="mx-auto w-full max-w-3xl rounded-md"
          />
          <p className="mt-3 text-xs text-[#6B7280]">
            Figure 2. Transmission, environmental reservoirs, and risk factors
            for human Campylobacteriosis <Cite id="ref-CAM-001" />.
          </p>
        </div>
        <div className="mt-8 border-l-4 border-[#1D4ED8] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Campylobacter jejuni and C. coli are the leading causes of bacterial
            gastroenteritis globally, transmitted primarily through contaminated
            poultry and water <Cite id="ref-CAM-001" />.
          </p>
        </div>
      </>
    ),
  },
  {
    title: "Virulence Factors (Campylobacter)",
    content: (
      <>
        <p>
          Campylobacter virulence is mediated by a repertoire of genes involved
          in motility, adhesion, invasion, and toxin production. Key virulence
          factors include:
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-[#111827]">
          <li>
            <strong>flaA</strong> — Flagellar protein essential for motility and
            colonization of the intestinal tract.
          </li>
          <li>
            <strong>cadF</strong> — Fibronectin-binding protein that mediates
            adhesion to host epithelial cells.
          </li>
          <li>
            <strong>ciaB</strong> — Invasion-associated protein required for
            host cell internalization.
          </li>
          <li>
            <strong>cdtA/B/C</strong> — Cytolethal distending toxin subunits
            that cause DNA damage in host cells.
          </li>
        </ul>
        <p className="mt-4">
          The distribution of these genes varies across species and host
          environments, making comparative analysis essential for understanding
          pathogenicity patterns <Cite id="ref-CAM-003" />.
        </p>
        <div className="mt-8 border-l-4 border-[#1D4ED8] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Campylobacter virulence depends on a set of genes for motility,
            adhesion, invasion, and toxin activity, whose distribution varies
            across species and hosts <Cite id="ref-CAM-003" />.
          </p>
        </div>
      </>
    ),
  },
  {
    title: "Risk Groups",
    content: (
      <>
        <p>
          Both Salmonella and Campylobacter infections can affect anyone, but
          certain populations are more vulnerable to severe outcomes. These
          include young children, older adults, and individuals with weakened
          immune systems <Cite id="ref2" /> <Cite id="ref-CAM-002" />.
        </p>
        <p>
          For Salmonella, reduced stomach acidity, underlying illness, and
          exposure to contaminated food or animals increase the risk of
          complications. Typhoidal Salmonella can cause systemic disease
          requiring antibiotic treatment <Cite id="ref2" />.
        </p>
        <p>
          For Campylobacter, children under five in endemic regions are
          disproportionately affected. Post-infectious complications such as
          Guillain-Barré syndrome — an autoimmune condition affecting the
          nervous system — are a recognized risk following Campylobacter
          infection <Cite id="ref-CAM-001" />.
        </p>
        <div className="mt-8 border-l-4 border-[#0F766E] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Children, elderly individuals, and immunocompromised people face the
            highest risk from both pathogens. Campylobacter carries additional
            risk of post-infectious neurological complications.
          </p>
        </div>
      </>
    ),
  },
];

export default function BiologyPage() {
  const [activeId, setActiveId] = useState(0);
  const section = SECTIONS[activeId];
  const isFirst = activeId === 0;
  const isLast = activeId === SECTIONS.length - 1;

  return (
    <div className="bg-white">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[200px_1fr] lg:gap-16">
          <VerticalNav activeId={activeId} onSelect={setActiveId} />
          <div>
            <div className="space-y-6 text-[#111827]">
              <h1 className="text-2xl font-bold">{section.title}</h1>
              <Divider />
              <div className="space-y-4">{section.content}</div>
            </div>
            <div className="mt-12 flex gap-8 border-t border-[#E5E7EB] pt-8">
              {!isFirst && (
                <button
                  type="button"
                  onClick={() => setActiveId((n) => Math.max(0, n - 1))}
                  className="text-sm font-medium text-[#0F766E] hover:underline"
                >
                  Previous
                </button>
              )}
              {!isLast && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveId((n) => Math.min(SECTIONS.length - 1, n + 1))
                  }
                  className="text-sm font-medium text-[#0F766E] hover:underline"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
