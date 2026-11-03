import { useQuery } from '@tanstack/react-query';
import { UsersRound } from 'lucide-react';
import { Link } from 'react-router';

import { QueryWarning } from '@/shared/components/states';
import { groupOptions, sessionOptions } from '@/shared/lib/query-options';
import { personName } from '@/tasks/lib/task-fields';
import type { Task } from '@/tasks/lib/types';

export function TaskMetadata({ task }: { task: Task }) {
  const { data: user } = useQuery(sessionOptions);
  const groups = useQuery(groupOptions.list());
  const members = useQuery(groupOptions.members(task.group_id));
  const people = [...(user ? [user] : []), ...(members.data ?? [])];
  const unknownName =
    task.group_id && members.isPending
      ? 'Загружаем…'
      : members.isError
        ? 'Имя недоступно'
        : undefined;
  const group = groups.data?.find((item) => item.id === task.group_id);
  return (
    <>
      <dl className='mt-7.5 mr-0 mb-0 ml-0 pt-[25px] border-t border-t-border grid grid-cols-2 gap-[25px] [&_dd_a]:inline-flex [&_dd_a]:items-center [&_dd_a]:gap-1.5 [&_dd_a]:text-muted-foreground max-[680px]:gap-y-[23px] max-[680px]:gap-x-[15px]'>
        <div>
          <dt className='text-muted-foreground text-xs mb-[7px]'>
            Принадлежность
          </dt>
          <dd className='text-sm wrap-anywhere'>
            {task.group_id ? (
              <Link to={`/groups/${task.group_id}`}>
                <UsersRound size={16} />
                {group?.name ?? 'Группа'}
              </Link>
            ) : (
              'Личная задача'
            )}
          </dd>
        </div>
        <div>
          <dt className='text-muted-foreground text-xs mb-[7px]'>
            Исполнитель
          </dt>
          <dd className='text-sm wrap-anywhere'>
            {personName(task.assignee_id, people, unknownName)}
          </dd>
        </div>
        <div>
          <dt className='text-muted-foreground text-xs mb-[7px]'>Автор</dt>
          <dd className='text-sm wrap-anywhere'>
            {personName(task.creator_id, people, unknownName)}
          </dd>
        </div>
        <div>
          <dt className='text-muted-foreground text-xs mb-[7px]'>Создана</dt>
          <dd className='text-sm wrap-anywhere'>
            {new Date(task.created_at).toLocaleString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </dd>
        </div>
      </dl>
      {members.isError && (
        <QueryWarning
          message='Не удалось загрузить участников.'
          retry={() => {
            void members.refetch();
          }}
        />
      )}
      {groups.isError && (
        <QueryWarning
          message='Не удалось загрузить название группы.'
          retry={() => {
            void groups.refetch();
          }}
        />
      )}
    </>
  );
}
