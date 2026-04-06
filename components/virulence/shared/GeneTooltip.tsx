'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface GeneTooltipProps {
  geneName: string;
  functionalAnnotation?: string;
  knownVirulenceRole?: string;
  locusTag?: string;
  chromosomeLocation?: string;
  children: ReactNode;
  tooltipId: string;
}

export default function GeneTooltip({
  geneName,
  functionalAnnotation,
  knownVirulenceRole,
  locusTag,
  chromosomeLocation,
  children,
  tooltipId,
}: GeneTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!containerRef.current || !tooltipRef.current || !mounted) return;

    const rect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    if (tooltipRect.width === 0 && tooltipRect.height === 0) {
      setTimeout(updatePosition, 10);
      return;
    }

    let top = rect.top - tooltipRect.height - 8;
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

    const padding = 8;
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }

    if (top < padding) {
      top = rect.bottom + 8;
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = Math.max(padding, window.innerHeight - tooltipRect.height - padding);
      }
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible && mounted) {
      const timeoutId = setTimeout(() => updatePosition(), 0);
      const rafId = requestAnimationFrame(() => updatePosition());

      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        clearTimeout(timeoutId);
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isVisible, mounted]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false);
      containerRef.current?.blur();
    }
  };

  const hasContent = functionalAnnotation || knownVirulenceRole || locusTag || chromosomeLocation;
  const tooltipContent = (
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fontSize: '12px',
        lineHeight: '1.5',
        padding: '8px 12px',
        borderRadius: '4px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        maxWidth: '300px',
        wordWrap: 'break-word',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: hasContent ? '4px' : '0' }}>
        Gene: {geneName}
      </div>
      {locusTag && <div style={{ marginTop: '4px' }}>Locus tag: {locusTag}</div>}
      {chromosomeLocation && <div style={{ marginTop: '4px' }}>Chromosome location: {chromosomeLocation}</div>}
      {functionalAnnotation && <div style={{ marginTop: '4px' }}>Functional annotation: {functionalAnnotation}</div>}
      {knownVirulenceRole && <div style={{ marginTop: '4px' }}>Known virulence role: {knownVirulenceRole}</div>}
      {!hasContent && (
        <div style={{ marginTop: '4px', fontStyle: 'italic', opacity: 0.9 }}>
          No description provided in dataset.
        </div>
      )}
    </div>
  );

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onKeyDown={handleKeyDown}
        className="relative inline-block"
        style={{ position: 'relative' }}
      >
        {children}
      </div>
      {isVisible && mounted && createPortal(tooltipContent, document.body)}
    </>
  );
}
