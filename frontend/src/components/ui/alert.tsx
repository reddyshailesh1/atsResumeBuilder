import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
}

export function Alert({ variant = 'info', title, children, className, ...props }: AlertProps) {
  const styles = {
    info: {
      box: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: <Info className="h-5 w-5 text-sky-600 shrink-0" />,
    },
    success: {
      box: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />,
    },
    warning: {
      box: 'bg-amber-50 border-amber-200 text-amber-950',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
    },
    danger: {
      box: 'bg-rose-50 border-rose-200 text-rose-950',
      icon: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
    },
  };

  const current = styles[variant];

  return (
    <div
      role="alert"
      className={cn('flex gap-3 rounded-lg border p-4 text-sm', current.box, className)}
      {...props}
    >
      {current.icon}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1">{title}</h5>}
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
