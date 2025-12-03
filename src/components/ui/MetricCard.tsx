import React from 'react';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function MetricCard({
  title,
  children,
  className,
  noPadding = false,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-md border bg-white shadow-sm',
        'border-gray-200',
        'dark:bg-hmi-dark-bg-card dark:border-hmi-dark-bg-border',
        'transition-colors duration-200',
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-center gap-1.5 border-b border-gray-100 dark:border-hmi-dark-bg-border px-4 py-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-hmi-dark-accent-primary uppercase tracking-wider">
            {title}
          </h3>
          <div className="h-2 w-2 rounded-full bg-hmi-status-ok"></div>
        </div>
      )}
      <div className={!noPadding ? 'p-4' : ''}>{children}</div>
    </div>
  );
}
