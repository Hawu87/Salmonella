"use client";

import { useState } from "react";
import Container from "@/components/Container";
import Divider from "@/components/Divider";
import VerticalNav from "@/components/VerticalNav";

const MAYO_P1 =
  "Salmonella infection (salmonellosis) is a common bacterial disease that affects the intestinal tract. Salmonella bacteria typically live in animal and human intestines and are shed through stool (feces). Humans become infected most frequently through contaminated water or food.";

const MAYO_P2 =
  "Some people with salmonella infection have no symptoms. Most people develop diarrhea, fever and stomach (abdominal) cramps within 8 to 72 hours after exposure. Most healthy people recover within a few days to a week without specific treatment.";

const SECTIONS = [
  {
    title: "What is Salmonella",
    content: (
      <>
        <p>{MAYO_P1}</p>
        <p>{MAYO_P2}</p>
        <div className="mt-8 border-l-4 border-[#0F766E] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
          Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam quis nostrud exercitation ullamco laboris.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <div className="mt-8 border-l-4 border-[#0F766E] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Lorem ipsum dolor sit amet consectetur adipiscing elit.
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
          Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident.
        </p>
        <div className="mt-8 border-l-4 border-[#0F766E] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Ut enim ad minim veniam quis nostrud exercitation ullamco laboris.
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
          Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur.
        </p>
        <div className="mt-8 border-l-4 border-[#0F766E] pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Key point
          </p>
          <p className="mt-2 text-sm text-[#111827]">
            Excepteur sint occaecat cupidatat non proident sunt in culpa qui
            officia deserunt.
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
