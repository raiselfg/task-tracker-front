import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/utils';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='card'
      className={cn(
        'rounded-xl border border-border bg-card p-5 sm:p-6',
        className,
      )}
      {...props}
    />
  );
}
