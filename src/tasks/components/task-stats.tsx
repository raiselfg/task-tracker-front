import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { Card } from '@/shared/components/ui/card';
import { taskOptions } from '@/shared/lib/query-options';

export function TaskStats({
  scope,
  listHasError,
}: {
  scope: string;
  listHasError: boolean;
}) {
  const tasks = useQuery(taskOptions.list());
  const counts = useMemo(() => {
    const result = { total: 0, open: 0, in_progress: 0, completed: 0 };
    for (const task of tasks.data ?? []) {
      if (
        scope === 'personal'
          ? task.group_id !== null
          : scope !== 'all' && task.group_id !== scope
      )
        continue;
      result.total++;
      result[task.status]++;
    }
    return result;
  }, [tasks.data, scope]);

  return (
    <>
      <div
        className='mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4'
        aria-label='Обзор задач'
        aria-busy={tasks.isFetching}
      >
        {[
          { label: 'Всего задач', value: counts.total },
          { label: 'Открыто', value: counts.open },
          { label: 'В работе', value: counts.in_progress },
          { label: 'Выполнено', value: counts.completed },
        ].map(({ label, value }) => (
          <Card key={label} className='space-y-2 p-4 sm:p-5'>
            <p className='text-xs font-medium text-muted-foreground'>{label}</p>
            <p className='text-3xl font-black tracking-tight'>
              {tasks.isPending || tasks.isError ? '—' : value}
            </p>
          </Card>
        ))}
      </div>
      {tasks.isError && !listHasError && (
        <p className='mb-4 text-sm text-destructive' role='alert'>
          Не удалось загрузить обзор задач.{' '}
          <button
            className='min-h-11 underline'
            onClick={() => {
              void tasks.refetch();
            }}
          >
            Повторить
          </button>
        </p>
      )}
    </>
  );
}
