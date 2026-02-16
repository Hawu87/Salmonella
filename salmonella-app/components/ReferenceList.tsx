"use client";

import { useState, useEffect } from "react";
import Chip from "@/components/Chip";
import Card from "@/components/Card";

const MAYO_URL =
  "https://www.mayoclinic.org/diseases-conditions/salmonella/symptoms-causes/syc-20355329";

const FILTER_OPTIONS = [
  "All",
  "biology",
  "symptoms",
  "transmission",
  "prevention",
  "public-health",
] as const;

export type FilterTag = (typeof FILTER_OPTIONS)[number];

export interface ReferenceItem {
  id: string;
  title: string;
  source: string;
  link: string;
  tags: string[];
  notes: string[];
}

const REFERENCES: ReferenceItem[] = [
  {
    id: "ref-SAL-001",
    title: "Salmonella (Symptoms & causes)",
    source: "Mayo Clinic",
    link: MAYO_URL,
    tags: ["symptoms", "transmission", "prevention"],
    notes: [
      "Defines typical symptoms and timing.",
      "Describes foodborne and waterborne transmission.",
      "Covers prevention and when to see a doctor.",
    ],
  },
  {
    id: "ref-SAL-002",
    title: "Bacterial foodborne pathogens",
    source: "Placeholder source",
    link: "#",
    tags: ["biology", "transmission"],
    notes: [
      "Overview of foodborne bacterial pathogens.",
      "Includes Salmonella epidemiology.",
    ],
  },
  {
    id: "ref-SAL-003",
    title: "High-risk populations and Salmonella",
    source: "Placeholder source",
    link: "#",
    tags: ["biology", "public-health"],
    notes: [
      "Risk factors for severe illness.",
      "Guidance for immunocompromised individuals.",
    ],
  },
  {
    id: "ref-SAL-004",
    title: "Food safety guidelines",
    source: "Placeholder source",
    link: "#",
    tags: ["prevention", "public-health"],
    notes: [
      "Cooking temperatures and storage.",
      "Cross-contamination prevention.",
    ],
  },
  {
    id: "ref-SAL-005",
    title: "Outbreak surveillance methods",
    source: "Placeholder source",
    link: "#",
    tags: ["public-health", "transmission"],
    notes: [
      "How outbreaks are detected and traced.",
      "Data sources and reporting.",
    ],
  },
  {
    id: "ref-SAL-006",
    title: "Salmonella biology and serotypes",
    source: "Placeholder source",
    link: "#",
    tags: ["biology"],
    notes: [
      "Bacterial structure and classification.",
      "Common serotypes and virulence.",
    ],
  },
];

export default function ReferenceList() {
  const [filter, setFilter] = useState<FilterTag>("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered =
    filter === "All"
      ? REFERENCES
      : REFERENCES.filter((ref) => ref.tags.includes(filter));

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-[#E5E7EB]" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#E5E7EB]" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#E5E7EB]" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => (
          <Chip
            key={option}
            as="button"
            active={filter === option}
            onClick={() => setFilter(option)}
          >
            {option}
          </Chip>
        ))}
      </div>
      <ul className="space-y-6" aria-label="Reference list">
        {filtered.map((ref) => (
          <li key={ref.id} id={ref.id}>
            <Card>
              <div className="flex flex-wrap items-start gap-3">
                <span className="rounded-lg border border-[#E5E7EB] bg-[#F6F7F8] px-2.5 py-1 font-mono text-xs text-[#111827]">
                  {ref.id}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#111827]">{ref.title}</h3>
                  <p className="mt-1 text-sm text-[#6B7280]">{ref.source}</p>
                  <a
                    href={ref.link}
                    className="mt-2 inline-block text-sm text-[#0F766E] hover:underline"
                  >
                    {ref.link === "#" ? "Link (placeholder)" : "View source"}
                  </a>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ref.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg border border-[#E5E7EB] px-2 py-0.5 text-xs text-[#6B7280]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-[#6B7280]">
                    {ref.notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
