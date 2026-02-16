"use client";

export const BIOLOGY_SECTIONS = [
  { id: 0, number: "01", label: "What is Salmonella" },
  { id: 1, number: "02", label: "Infection process" },
  { id: 2, number: "03", label: "Symptoms timeline" },
  { id: 3, number: "04", label: "Risk groups" },
] as const;

interface VerticalNavProps {
  activeId: number;
  onSelect: (id: number) => void;
}

export default function VerticalNav({ activeId, onSelect }: VerticalNavProps) {
  return (
    <nav
      className="lg:sticky lg:top-8 lg:self-start"
      aria-label="Page contents"
    >
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        Contents
      </h2>
      <ul className="space-y-1">
        {BIOLOGY_SECTIONS.map(({ id, number, label }) => {
          const isActive = activeId === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                className={`w-full border-l-2 py-2 pl-4 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "border-[#0F766E] text-[#0F766E]"
                    : "border-transparent text-[#6B7280] hover:text-[#111827]"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="tabular-nums">{number}</span> {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
