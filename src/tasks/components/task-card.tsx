import { ArrowUpRight, UserRound, UsersRound } from 'lucide-react';
import { Link } from 'react-router';

import type { User } from '@/auth/lib/types';
import type { Group } from '@/groups/lib/types';
import { cn } from '@/shared/lib/utils';
import { CompleteTaskButton } from '@/tasks/components/complete-task-button';
import {
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/tasks/components/task-badges';
import { personName } from '@/tasks/lib/task-fields';
import type { Task } from '@/tasks/lib/types';

export function TaskCard({
  task,
  groups,
  people,
  unknownName,
}: {
  task: Task;
  groups: Group[];
  people: User[];
  unknownName?: string;
}) {
  const group = groups.find((item) => item.id === task.group_id);
  return (
    <article
      className={cn(
        'flex items-start gap-1 rounded-xl border bg-card p-3 transition-shadow hover:shadow-sm sm:p-4',
        task.status === 'completed' &&
          'bg-muted/40 [&_h3]:text-muted-foreground [&_h3]:line-through',
      )}
    >
      <CompleteTaskButton task={task} />
      <Link
        className='flex-1 min-w-0 pt-[7px] pr-[3px] pb-[3px] pl-[3px]'
        to={`/tasks/${task.id}`}
      >
        <div className='flex justify-between items-start gap-[15px] max-[860px]:gap-[7px] max-[680px]:flex-wrap max-[680px]:gap-2'>
          <h3 className='text-sm font-semibold leading-relaxed wrap-anywhere sm:text-base'>
            {task.title}
          </h3>
          <TaskPriorityBadge priority={task.priority} />
        </div>
        {task.description && (
          <p className='line-clamp-1 overflow-hidden text-muted-foreground text-sm mt-1 leading-[1.7] max-[680px]:line-clamp-2 max-[680px]:text-xs'>
            {task.description}
          </p>
        )}
        <div className='flex items-center gap-3 flex-wrap mt-3.5 text-xs text-muted-foreground max-[680px]:gap-[9px] max-[680px]:mt-3 max-[680px]:text-xs'>
          <TaskStatusBadge status={task.status} />
          <span className='w-[1px] h-[9px] bg-muted inline-flex items-center gap-[5px] max-w-full wrap-anywhere' />
          <span className='inline-flex items-center gap-[5px] max-w-full wrap-anywhere'>
            {task.group_id ? <UsersRound size={14} /> : <UserRound size={14} />}
            {task.group_id ? (group?.name ?? 'Группа') : 'Личная'}
          </span>
          <span className='ml-auto max-[860px]:ml-0 max-[680px]:ml-0 inline-flex items-center gap-[5px] max-w-full wrap-anywhere'>
            <UserRound size={14} />
            {personName(task.assignee_id, people, unknownName)}
          </span>
        </div>
      </Link>
      <Link
        to={`/tasks/${task.id}`}
        className='grid place-items-center w-11 min-h-11 -mt-1 text-muted-foreground rounded-lg hover:text-primary max-[680px]:w-11'
        aria-label={`Открыть задачу «${task.title}»`}
      >
        <ArrowUpRight size={18} />
      </Link>
    </article>
  );
}
