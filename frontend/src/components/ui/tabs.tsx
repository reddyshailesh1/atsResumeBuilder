import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<any>, { activeValue: value, onValueChange });
      })}
    </div>
  );
}

export function TabsList({
  children,
  className,
  activeValue,
  onValueChange,
}: {
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
  onValueChange?: (val: string) => void;
}) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500',
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<any>, { activeValue, onValueChange });
      })}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  activeValue,
  onValueChange,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
  onValueChange?: (val: string) => void;
}) {
  const isActive = activeValue === value;
  return (
    <button
      type="button"
      onClick={() => onValueChange?.(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer',
        isActive
          ? 'bg-white text-slate-900 shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  activeValue,
  className,
}: {
  value: string;
  children: React.ReactNode;
  activeValue?: string;
  className?: string;
}) {
  if (activeValue !== value) return null;
  return <div className={cn('mt-4 focus-visible:outline-none', className)}>{children}</div>;
}
