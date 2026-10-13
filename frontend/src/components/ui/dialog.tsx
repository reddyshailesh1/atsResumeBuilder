import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl';
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}: DialogProps) {
  // Lock background body scroll when dialog is active
  React.useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      {/* Dialog box with bounded height and dedicated internal scroller */}
      <div
        className={cn(
          'relative w-full max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden',
          widthClasses[maxWidth]
        )}
      >
        {/* Pinned Modal Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-200 shrink-0 bg-white">
          <div className="pr-8">
            {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
            {description && <p className="mt-1 text-xs text-slate-500 leading-relaxed">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
            title="Exit / Close (Esc)"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Scrollable Modal Content ("roller" container) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
