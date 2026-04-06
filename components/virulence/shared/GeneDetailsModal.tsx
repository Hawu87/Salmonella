'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface GeneDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geneName: string;
  functionalAnnotation?: string;
  knownVirulenceRole?: string;
  locusTag?: string;
  chromosomeLocation?: string;
  triggerElement?: HTMLElement | null;
}

export default function GeneDetailsModal({
  isOpen,
  onClose,
  geneName,
  functionalAnnotation,
  knownVirulenceRole,
  locusTag,
  chromosomeLocation,
  triggerElement,
}: GeneDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen || !mounted) return;
    const modal = modalRef.current;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && modal) {
        const focusable = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, mounted, onClose]);

  useEffect(() => {
    if (!isOpen && triggerElement) triggerElement.focus();
  }, [isOpen, triggerElement]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gene-modal-title"
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-[600px] max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 id="gene-modal-title" className="text-lg sm:text-xl font-semibold text-gray-900">
            Gene Details: {geneName}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="ml-4 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="space-y-4">
            {locusTag && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Locus Tag</h3>
                <p className="text-sm text-gray-900">{locusTag}</p>
              </div>
            )}
            {chromosomeLocation && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Chromosome Location</h3>
                <p className="text-sm text-gray-900">{chromosomeLocation}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Functional Annotation</h3>
              {functionalAnnotation
                ? <p className="text-sm text-gray-900">{functionalAnnotation}</p>
                : <p className="text-sm text-gray-500 italic">Not available</p>
              }
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Known Virulence Role</h3>
              {knownVirulenceRole
                ? <p className="text-sm text-gray-900 whitespace-pre-wrap">{knownVirulenceRole}</p>
                : <p className="text-sm text-gray-500 italic">Not available</p>
              }
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
