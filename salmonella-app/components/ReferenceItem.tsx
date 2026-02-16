"use client";

import { useState } from "react";

interface ReferenceItemProps {
  id: string;
  title: string;
  source: string;
  link: string;
  description: string;
  notes: string[];
}

export default function ReferenceItem({
  id,
  title,
  source,
  link,
  description,
  notes,
}: ReferenceItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      id={id}
      className="border-b border-[#E5E7EB] py-6 transition-colors hover:bg-[#FAFAFA] last:border-b-0"
    >
      <div className="flex gap-8">
        <div className="w-28 shrink-0 font-mono text-sm text-[#6B7280]">
          {id}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[#111827]">{title}</h3>
          <p className="mt-1 text-sm text-[#6B7280]">{source}</p>
          <a
            href={link}
            className="mt-2 inline-block text-sm text-[#0F766E] hover:underline"
          >
            {link.startsWith("http") ? "View source" : link}
          </a>
          <p className="mt-3 text-sm text-[#6B7280]">{description}</p>
          {notes.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-sm font-medium text-[#0F766E] hover:underline"
                aria-expanded={expanded}
              >
                {expanded ? "Hide notes" : "Show notes"}
              </button>
              {expanded && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[#6B7280]">
                  {notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
