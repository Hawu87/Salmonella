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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen || !mounted) return;

    const modal = modalRef.current;
    const closeButton = closeButtonRef.current;
    if (!modal) return;

    // Focus the close button when modal opens
    closeButton?.focus();

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, mounted, onClose]);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Return focus to trigger element on close
  useEffect(() => {
    if (!isOpen && triggerElement) {
      triggerElement.focus();
    }
  }, [isOpen, triggerElement]);

  if (!isOpen || !mounted) return null;

  const hasContent = functionalAnnotation || knownVirulenceRole || locusTag || chromosomeLocation;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gene-modal-title"
    >
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[600px] max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="gene-modal-title" className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Gene Details: {geneName}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="ml-4 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="space-y-4">
            {/* Locus Tag */}
            {locusTag ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Locus Tag
                </h3>
                <p className="text-sm text-gray-900 dark:text-gray-100">{locusTag}</p>
              </div>
            ) : null}

            {/* Chromosome Location */}
            {chromosomeLocation ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Chromosome Location
                </h3>
                <p className="text-sm text-gray-900 dark:text-gray-100">{chromosomeLocation}</p>
              </div>
            ) : null}

            {/* Functional Annotation */}
            {functionalAnnotation ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Functional Annotation
                </h3>
                <p className="text-sm text-gray-900 dark:text-gray-100">{functionalAnnotation}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Functional Annotation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Not available</p>
              </div>
            )}

            {/* Known Virulence Role */}
            {knownVirulenceRole ? (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Known Virulence Role
                </h3>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {knownVirulenceRole}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Known Virulence Role
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
