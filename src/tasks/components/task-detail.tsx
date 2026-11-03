import { CircleCheck, LockKeyhole, Pencil } from 'lucide-react';
import { Link } from 'react-router';

import { PageHeader } from '@/shared/components/page-header';
import { BackLink } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { TaskActions } from '@/tasks/components/task-actions';
import {
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/tasks/components/task-badges';
import { TaskMetadata } from '@/tasks/components/task-metadata';
import type { Task } from '@/tasks/lib/types';

export function TaskDetail({
  task,
  redirectedFromEdit,
}: {
  task: Task;
  redirectedFromEdit: boolean;
}) {
  const completed = task.status === 'completed';
  return (
    <div className='max-w-215 my-0 mx-auto'>
      <BackLink to={task.group_id ? `/groups/${task.group_id}` : '/tasks'}>
        {task.group_id ? 'К группе' : 'К задачам'}
      </BackLink>
      <PageHeader
        eyebrow={
          <> {completed ? 'ЕЩЁ ОДНО ДЕЛО ПОЗАДИ' : 'ОДНО ДЕЛО ЗА ДРУГИМ'} </>
        }
        title={task.title}
        action={
          <>
            {!completed && (
              <Button variant='outline' asChild>
                <Link
                  className='mt-[27px] max-[680px]:mt-0'
                  to={`/tasks/${task.id}/edit`}
                >
                  <Pencil />
                  Редактировать
                </Link>
              </Button>
            )}{' '}
          </>
        }
      />
      {completed && (
        <div
          className='flex items-center gap-[13px] bg-muted text-muted-foreground p-[19px] rounded-[13px] mb-5.5 max-[680px]:p-4 max-[680px]:gap-2.5'
          role='status'
        >
          <CircleCheck
            className='shrink-0 last:ml-auto max-[680px]:last:hidden'
            size={22}
          />
          <div>
            <strong className='text-sm font-semibold'>Задача выполнена</strong>
            <p className='text-xs leading-[1.7] text-muted-foreground mt-1 max-[680px]:text-xs'>
              {redirectedFromEdit ? 'Эту задачу уже выполнили. ' : ''}Доступен
              только просмотр. Изменить, удалить или открыть её заново нельзя.
            </p>
          </div>
          <LockKeyhole
            className='shrink-0 last:ml-auto max-[680px]:last:hidden'
            size={18}
          />
        </div>
      )}
      <Card>
        <div className='flex items-center gap-4.5 pb-6.5 max-[680px]:gap-3.5'>
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
        </div>
        <div>
          <h2 className='text-xs text-muted-foreground font-normal mb-3'>
            Описание
          </h2>
          <p
            className={cn(
              task.description ? '' : 'text-muted-foreground',
              'text-sm leading-[1.9] whitespace-pre-wrap wrap-anywhere max-[680px]:text-sm',
            )}
          >
            {task.description ?? 'Без описания'}
          </p>
        </div>
        <TaskMetadata task={task} />
        {!completed && <TaskActions task={task} />}
      </Card>
    </div>
  );
}
