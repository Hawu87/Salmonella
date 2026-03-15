"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "@/components/Container";
import Divider from "@/components/Divider";
import VerticalNav from "@/components/VerticalNav";

function Cite({ id }: { id: string }) {
  return (
    <a
      href={`/references#${id}`}
      className="text-[#0F766E] hover:underline"
      title={`Reference ${id}`}
    >
      [{id.replace("ref", "")}]
    </a>
  );
}

const SECTIONS = [
  {
    title: "What is Salmonella",
    content: (
      <>
        <p>
          Salmonella is a genus of Gram-negative, rod-shaped bacteria responsible
          for salmonellosis, one of the most common foodborne infections
          worldwide <Cite id="ref1" />
          <Cite id="ref2" />. The bacteria are typically transmitted through
          contaminated food or water and can infect both humans and animals.
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
            each year <Cite id="ref1" />
            <Cite id="ref2" />.
          </p>
        </div>
      </>
    ),
  },
  {
    title: "Infection process",
    content: (
      <>
        <p>
          Infection typically begins when contaminated food or water is ingested.
          After entering the digestive system, Salmonella bacteria reach the
          intestinal tract where they attach to and invade epithelial cells
          lining the intestine <Cite id="ref1" />.
        </p>
        <p>
          The invasion process is mediated by specialized genetic regions called
          Salmonella pathogenicity islands. These regions encode a type III
          secretion system that allows the bacterium to inject proteins into
          host cells and trigger its own uptake <Cite id="ref1" />.
        </p>
        <p>
          Once inside the host cell, Salmonella can survive within a
          membrane-bound compartment called the Salmonella-containing vacuole,
          which helps protect the bacteria from immune defenses while it
          replicates <Cite id="ref1" />
          <Cite id="ref2" />.
        </p>
        <p>
          Food products such as poultry remain a common source of contamination,
          and research shows antimicrobial interventions can significantly reduce
          Salmonella levels in chicken products <Cite id="ref3" />.
        </p>
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
    title: "Symptoms timeline",
    content: (
      <>
        <p>
          Symptoms of salmonellosis vary depending on the type of infection.
          Non-typhoidal Salmonella infections commonly cause diarrhea, abdominal
          cramps, fever, nausea, and sometimes vomiting <Cite id="ref2" />.
        </p>
        <p>
          Symptoms typically appear within hours to a few days after exposure.
          Many infections resolve without treatment, although severe cases can
          involve dehydration or spread of the bacteria into the bloodstream{" "}
          <Cite id="ref2" />.
        </p>
        <p>
          Typhoidal Salmonella infections cause enteric fever, a more serious
          illness characterized by prolonged fever, fatigue, headache, and
          systemic infection requiring medical treatment <Cite id="ref2" />.
        </p>
        <div className="mt-8 border-l-4 border-[#0F766E] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Most Salmonella infections cause gastrointestinal illness that
            resolves within days, but severe systemic disease can occur in some
            cases <Cite id="ref2" />.
          </p>
        </div>
      </>
    ),
  },
  {
    title: "Risk groups",
    content: (
      <>
        <p>
          Although Salmonella infection can affect anyone, certain populations are
          more vulnerable to severe disease. These include young children, older
          adults, and individuals with weakened immune systems <Cite id="ref2" />.
        </p>
        <p>
          Reduced stomach acidity, underlying illness, and exposure to
          contaminated food or animals can also increase the likelihood of
          infection or complications <Cite id="ref2" />.
        </p>
        <div className="mt-8 border-l-4 border-[#0F766E] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Children, elderly individuals, and immunocompromised people face the
            highest risk of severe Salmonella infections <Cite id="ref2" />.
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
