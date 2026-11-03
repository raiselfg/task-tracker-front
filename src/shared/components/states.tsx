import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCheck,
  Inbox,
  LoaderCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Button } from '@/shared/components/ui/button';
import { errorMessage, validationErrors } from '@/shared/lib/http-client';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to='/tasks'
      className='inline-flex items-center gap-2.5 w-fit text-2xl font-black tracking-tight text-foreground'
      data-brand
      aria-label='Рядом — к задачам'
    >
      <span
        className='grid place-items-center w-9.5 h-9.5 bg-primary text-white rounded-xl'
        data-brand-icon
      >
        <Check size={25} strokeWidth={2.8} />
      </span>
      {!compact && (
        <span>
          рядом<span className='text-primary'>.</span>
        </span>
      )}
    </Link>
  );
}

export function Loading({ label = 'Загружаем…' }: { label?: string }) {
  return (
    <div
      className='min-h-60 py-[45px] px-5 flex items-center justify-center flex-col gap-3.5 text-center [&_h1]:text-[27px] [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-medium [&_h2]:tracking-[-0.3px]'
      role='status'
    >
      <LoaderCircle className='animate-spin text-primary' size={26} />
      <p className='text-muted-foreground text-sm leading-[1.8] max-w-85'>
        {label}
      </p>
    </div>
  );
}

export function ErrorState({
  error,
  retry,
  title,
}: {
  error: unknown;
  retry?: () => void;
  title?: string;
}) {
  return (
    <div
      className='min-h-60 py-[45px] px-5 flex items-center justify-center flex-col gap-3.5 text-center [&_h1]:text-[27px] [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-medium [&_h2]:tracking-[-0.3px]'
      role='alert'
    >
      <span className='w-18.5 h-18.5 grid place-items-center rounded-[22px] mb-[5px] bg-muted text-muted-foreground'>
        <AlertCircle size={27} />
      </span>
      <h2>{title ?? 'Не получилось загрузить'}</h2>
      <p className='text-muted-foreground text-sm leading-[1.8] max-w-85'>
        {errorMessage(error)}
      </p>
      {retry && (
        <Button variant='outline' onClick={retry}>
          Попробовать снова
        </Button>
      )}
    </div>
  );
}

export function FormError({
  error,
  id = 'form-error',
}: {
  error: unknown;
  id?: string;
}) {
  if (!error) return null;
  return (
    <div
      id={id}
      className='flex gap-[9px] items-start py-3 px-3.5 bg-muted border border-border rounded-[10px] text-sm leading-[1.6] text-muted-foreground my-3.5 mx-0'
      role='alert'
    >
      <AlertCircle className='shrink-0 mt-0.5' size={17} />
      <div>
        {errorMessage(error)}
        {Object.entries(validationErrors(error)).map(([field, message]) => (
          <p className='mt-[5px]' key={field}>
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  completed = false,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  completed?: boolean;
}) {
  const Icon = completed ? CheckCheck : Inbox;
  return (
    <div className='py-[45px] px-5 flex items-center justify-center flex-col gap-3.5 text-center [&_h1]:text-[27px] [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-medium [&_h2]:tracking-[-0.3px] min-h-[325px] border border-dashed border-border rounded-2xl mt-0.5 [&_button]:mt-1.5 [&_a]:mt-1.5'>
      <span className='w-18.5 h-18.5 grid place-items-center rounded-[22px] bg-muted text-muted-foreground mb-[5px]'>
        <Icon size={30} strokeWidth={1.5} />
      </span>
      <h2>{title}</h2>
      <p className='text-muted-foreground text-sm leading-[1.8] max-w-85'>
        {description}
      </p>
      {action}
    </div>
  );
}

export function BackLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link
      className='inline-flex gap-[7px] items-center min-h-11 text-muted-foreground text-xs mb-4 hover:text-primary max-[680px]:mb-3'
      to={to}
    >
      <ArrowRight size={16} className='rotate-180' />
      {children}
    </Link>
  );
}

export function QueryWarning({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className='py-2 text-sm leading-relaxed text-destructive' role='alert'>
      {message}{' '}
      {retry && (
        <button
          type='button'
          className='min-h-11 underline underline-offset-4'
          onClick={retry}
        >
          Повторить
        </button>
      )}
    </div>
  );
}
