import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router';

import { PageHeader } from '@/shared/components/page-header';
import { BackLink, ErrorState, Loading } from '@/shared/components/states';
import { taskOptions } from '@/shared/lib/query-options';
import { TaskDetail } from '@/tasks/components/task-detail';
import { TaskForm } from '@/tasks/components/task-form';

export function NewTaskPage() {
  const [search] = useSearchParams();
  const group = search.get('group') ?? '';
  return (
    <div className='max-w-215 my-0 mx-auto'>
      <BackLink to={group ? `/groups/${group}` : '/tasks'}>
        {group ? 'К группе' : 'К задачам'}
      </BackLink>
      <PageHeader
        eyebrow='МАЛЕНЬКИЙ ШАГ К БОЛЬШЕМУ'
        title='Новая задача'
        description='Освободите голову. Запишите то, что важно.'
      />
      <TaskForm initialGroupId={group} />
    </div>
  );
}

export function TaskPage({ edit = false }: { edit?: boolean }) {
  const { id = '' } = useParams();
  const task = useQuery(taskOptions.detail(id));
  if (task.isPending) return <Loading label='Открываем задачу…' />;
  if (task.isError)
    return (
      <>
        <BackLink to='/tasks'>К задачам</BackLink>
        <ErrorState
          error={task.error}
          retry={() => {
            void task.refetch();
          }}
          title='Задача недоступна'
        />
      </>
    );
  if (edit && task.data.status !== 'completed')
    return (
      <div className='max-w-215 my-0 mx-auto'>
        <BackLink to={`/tasks/${id}`}>К задаче</BackLink>
        <PageHeader
          eyebrow='ДЕТАЛИ ИМЕЮТ ЗНАЧЕНИЕ'
          title='Редактирование'
          description='Автор и принадлежность задачи сохранятся.'
        />
        <TaskForm key={id} task={task.data} />
      </div>
    );
  return <TaskDetail task={task.data} redirectedFromEdit={edit} />;
}
