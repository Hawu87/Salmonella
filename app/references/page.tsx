"use client";

import { useState } from "react";
import Container from "@/components/Container";
import ReferenceItem from "@/components/ReferenceItem";
import {
  ALL_REFERENCES,
  getReferencesByOrganism,
} from "@/lib/pathogens/config";

type Filter = "all" | "salmonella" | "campylobacter" | "shared";

const FILTER_DOTS: Record<Filter, string | null> = {
  all: null,
  salmonella: "var(--primary)",
  campylobacter: "var(--secondary)",
  shared: "#7C3AED",
};

export default function ReferencesPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filteredRefs =
    filter === "all"
      ? ALL_REFERENCES
      : getReferencesByOrganism(filter);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "salmonella", label: "Salmonella" },
    { key: "campylobacter", label: "Campylobacter" },
    { key: "shared", label: "Shared" },
  ];

  return (
    <div className="bg-white">
      <Container>
        <section className="mb-14">
          <h1 className="text-3xl font-bold text-[#111827] lg:text-4xl">
            References
          </h1>
          <p className="mt-3 text-[#6B7280] max-w-2xl">
            Sources cited across the platform, covering Salmonella typhi,
            Campylobacter, and shared research on virulence and food safety.
          </p>
        </section>

        {/* Filter chips */}
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map(({ key, label }) => {
            const dot = FILTER_DOTS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === key
                    ? "border-primary bg-primary text-white"
                    : "border-[#E5E7EB] text-[#6B7280] hover:border-primary hover:text-[#111827]"
                }`}
              >
                {dot && (
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: filter === key ? "#fff" : dot }}
                  />
                )}
                {label}
                <span className="text-xs opacity-75">
                  ({key === "all"
                    ? ALL_REFERENCES.length
                    : getReferencesByOrganism(key).length})
                </span>
              </button>
            );
          })}
        </div>

        <div className="max-w-3xl">
          {filteredRefs.length === 0 ? (
            <p className="py-8 text-center text-[#6B7280]">
              No references match this filter.
            </p>
          ) : (
            filteredRefs.map((ref) => (
              <ReferenceItem
                key={ref.id}
                id={ref.id}
                title={ref.title}
                source={ref.source}
                link={ref.link}
                description={ref.description}
                notes={ref.notes}
              />
            ))
          )}
        </div>
      </Container>
    </div>
  );
}
