import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/utils';

export function Field({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='field'
      className={cn('grid min-w-0 gap-2', className)}
      {...props}
    />
  );
}
export function FieldLabel({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      data-slot='field-label'
      className={cn('text-sm font-medium', className)}
      {...props}
    />
  );
}
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className='text-xs text-destructive' role='alert'>
      {message}
    </p>
  );
}
