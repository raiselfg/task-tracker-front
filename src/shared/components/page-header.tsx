import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className='mb-6 flex flex-wrap items-start justify-between gap-4 border-b bg-background py-4'>
      <div className='min-w-0 flex-1 basis-64'>
        <h1 className='text-3xl font-black tracking-tight wrap-anywhere sm:text-4xl'>
          {title}
        </h1>
        {description && (
          <div className='mt-2 text-sm leading-relaxed text-muted-foreground'>
            {description}
          </div>
        )}
      </div>
      {action}
    </header>
  );
}
