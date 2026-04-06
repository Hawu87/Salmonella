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
      className={`text-primary hover:opacity-80 hover:underline transition ${className}`}
      aria-label={`Reference ${number}`}
    >
      [{number}]
    </a>
  );
}
