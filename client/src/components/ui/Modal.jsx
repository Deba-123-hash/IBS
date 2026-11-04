import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg'
}) => {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;

      // Focus first focusable element or modal container
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        dialogRef.current?.focus();
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose?.();
        } else if (e.key === 'Tab') {
          // Trap focus inside modal
          if (!dialogRef.current) return;
          const focusables = dialogRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusables || focusables.length === 0) return;

          const firstElem = focusables[0];
          const lastElem = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === firstElem) {
            e.preventDefault();
            lastElem.focus();
          } else if (!e.shiftKey && document.activeElement === lastElem) {
            e.preventDefault();
            firstElem.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        className={`w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto focus:outline-none`}
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            {title && (
              <h3 id={titleId} className="text-base font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p id={subtitleId} className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export const Dialog = Modal;
export default Modal;
