import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/utils';

const fieldClass =
  'w-full min-h-12 rounded-xl border border-input bg-card px-3.5 py-3 text-base text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:opacity-50 aria-invalid:border-destructive';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input data-slot='input' className={cn(fieldClass, className)} {...props} />
  );
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(fieldClass, 'min-h-28 resize-y', className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: ComponentProps<'select'>) {
  return (
    <select
      className={cn(fieldClass, 'cursor-pointer pr-8', className)}
      {...props}
    >
      {children}
    </select>
  );
}
