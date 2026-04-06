'use client';

import { useEffect, useRef } from 'react';
import { references } from '@/app/data/references';

const HIGHLIGHT_DURATION_MS = 2000;

/**
 * References section with numbered entries. Inline citations link here.
 * Highlights the target reference briefly when navigated to via hash (click or direct load).
 */
export default function ReferencesSection() {
  const highlightedRef = useRef<string | null>(null);

  useEffect(() => {
    const applyHighlight = (id: string) => {
      const el = document.getElementById(id);
      if (!el || highlightedRef.current === id) return;
      highlightedRef.current = id;
      el.classList.add('reference-highlight');
      const t = setTimeout(() => {
        el.classList.remove('reference-highlight');
        highlightedRef.current = null;
      }, HIGHLIGHT_DURATION_MS);
      return () => clearTimeout(t);
    };

    const checkHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash && references.some((r) => r.id === hash)) applyHighlight(hash);
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  return (
    <section
      id="references"
      className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 text-center bg-gray-50 dark:bg-gray-900 scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
          References
        </h2>
        <div className="max-w-3xl mx-auto text-left mt-8 space-y-4">
          {references.map((ref) => (
            <div
              key={ref.id}
              id={ref.id}
              className="scroll-mt-24 text-gray-700 dark:text-gray-300 text-sm sm:text-base transition-colors duration-300 rounded px-2 py-1 -mx-2 -my-1"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">{ref.number}.</span>{' '}
              {(ref.url ?? ref.doiUrl) ? (
                <a
                  href={ref.url ?? ref.doiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {ref.fullCitation}
                </a>
              ) : (
                ref.fullCitation
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
