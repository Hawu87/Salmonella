'use client';

import { getReferenceByNumber } from '@/lib/virulence/references';

interface CitationProps {
  number: number;
  className?: string;
}

export default function Citation({ number, className = '' }: CitationProps) {
  const refItem = getReferenceByNumber(number);
  if (!refItem) return <span className={className}>[{number}]</span>;

  return (
    <a
      href={`#${refItem.id}`}
      className={`text-teal-700 hover:text-teal-800 hover:underline transition ${className}`}
      aria-label={`Reference ${number}`}
    >
      [{number}]
    </a>
  );
}
