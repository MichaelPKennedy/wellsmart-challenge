import React from 'react';
import { cn } from '@/lib/utils/cn';

export type MetricCardStatus = 'ok' | 'error';

interface MetricCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  status?: MetricCardStatus;
}

export function MetricCard({
  title,
  children,
  className,
  noPadding = false,
  status = 'ok',
}: MetricCardProps) {
  const dotColor = status === 'error' ? 'bg-red-500' : 'bg-hmi-status-ok';

  return (
    <div
      className={cn(
        'relative hmi-card shadow-sm',
        className
      )}
    >
      {/* Warning icon - only show when error */}
      {status === 'error' && (
        <div className="absolute top-2 right-2 z-10 flex items-center justify-center w-6 h-6">
          <div className="w-full h-full relative">
            {/* Red triangle with exclamation mark */}
            <svg viewBox="0 0 24 24" className="w-full h-full text-red-500 fill-red-500">
              <path d="M12 2L2 20h20L12 2z" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        </div>
      )}

      {title && (
        <div className="flex items-center justify-center gap-1.5 border-b border-gray-100 dark:border-hmi-dark-bg-border px-4 py-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-hmi-dark-accent-primary uppercase tracking-wider">
            {title}
          </h3>
          <div className={cn('h-2 w-2 rounded-full transition-colors', dotColor)}></div>
        </div>
      )}
      <div className={!noPadding ? 'p-4' : ''}>{children}</div>
    </div>
  );
}
