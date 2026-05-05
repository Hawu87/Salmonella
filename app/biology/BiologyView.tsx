"use client";

import { useState, type ReactNode } from "react";
import Container from "@/components/Container";
import Divider from "@/components/Divider";
import VerticalNav, { type BiologySection } from "@/components/VerticalNav";

export interface BiologyEntry {
  title: string;
  navLabel: string;
  /**
   * String content is rendered as paragraphs. ReactNode is rendered as-is so
   * curated sections can include citations, figures, or other rich JSX.
   */
  content: string | ReactNode;
  accent?: string;
}

interface BiologyViewProps {
  entries: BiologyEntry[];
}

export default function BiologyView({ entries }: BiologyViewProps) {
  const [activeId, setActiveId] = useState(0);
  const safeIndex = Math.max(0, Math.min(activeId, entries.length - 1));
  const section = entries[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === entries.length - 1;

  const navSections: BiologySection[] = entries.map((entry, idx) => ({
    id: idx,
    number: String(idx + 1).padStart(2, "0"),
    label: entry.navLabel,
  }));

  return (
    <div className="bg-white">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[200px_1fr] lg:gap-16">
          <VerticalNav
            sections={navSections}
            activeId={safeIndex}
            onSelect={setActiveId}
          />
          <div>
            <div className="space-y-6 text-[#111827]">
              <h1 className="text-2xl font-bold">{section.title}</h1>
              <Divider />
              <div className="space-y-4">
                {typeof section.content === "string" ? (
                  section.content
                    .split(/\n\n+/)
                    .map((para, i) => <p key={i}>{para}</p>)
                ) : (
                  section.content
                )}
              </div>
            </div>
            <div className="mt-12 flex gap-8 border-t border-[#E5E7EB] pt-8">
              {!isFirst && (
                <button
                  type="button"
                  onClick={() => setActiveId(n => Math.max(0, n - 1))}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Previous
                </button>
              )}
              {!isLast && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveId(n => Math.min(entries.length - 1, n + 1))
                  }
                  className="text-sm font-medium text-primary hover:underline"
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
