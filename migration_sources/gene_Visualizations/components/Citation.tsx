'use client';

import { getReferenceByNumber } from '@/app/data/references';

interface CitationProps {
  number: number;
  className?: string;
}

/**
 * Renders an inline citation link [n] that scrolls to the matching reference.
 */
export default function Citation({ number, className = '' }: CitationProps) {
  const refItem = getReferenceByNumber(number);
  if (!refItem) return <span className={className}>[{number}]</span>;

  return (
    <a
      href={`#${refItem.id}`}
      className={`text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition ${className}`}
      aria-label={`Reference ${number}`}
    >
      [{number}]
    </a>
  );
}
