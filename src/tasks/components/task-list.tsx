import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';

import type { User } from '@/auth/lib/types';
import {
  EmptyState,
  ErrorState,
  Loading,
  QueryWarning,
} from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import {
  groupOptions,
  sessionOptions,
  taskOptions,
} from '@/shared/lib/query-options';
import { TaskCard } from '@/tasks/components/task-card';
import { TaskFilters } from '@/tasks/components/task-filters';
import { TaskStats } from '@/tasks/components/task-stats';
import { refreshTasks } from '@/tasks/lib/cache';
import { statusLabels } from '@/tasks/lib/task-fields';
import type { TaskStatus } from '@/tasks/lib/types';
import { useTaskPeople } from '@/tasks/lib/use-task-people';

export function TaskList({ groupId }: { groupId?: string }) {
  const [search, setSearch] = useSearchParams();
  const groups = useQuery(groupOptions.list());
  const session = useQuery(sessionOptions);
  const peopleQuery = useTaskPeople(groups.data);
  const scope = groupId ?? search.get('scope') ?? 'all';
  const rawStatus = search.get('status') ?? '';
  const status = Object.hasOwn(statusLabels, rawStatus)
    ? (rawStatus as TaskStatus)
    : undefined;
  const assignee = search.get('assignee') ?? '';
  const selectedGroupId =
    scope === 'all' || scope === 'personal' ? undefined : scope;
  const tasks = useQuery(
    taskOptions.list({
      group_id: selectedGroupId,
      status,
      assignee_id: assignee && assignee !== 'unassigned' ? assignee : undefined,
    }),
  );
  const people = useMemo(() => {
    const result = new Map<string, User>();
    if (session.data) result.set(session.data.id, session.data);
    for (const person of peopleQuery.data) result.set(person.id, person);
    return [...result.values()];
  }, [peopleQuery.data, session.data]);
  const availablePeople = selectedGroupId
    ? (peopleQuery.members[
        groups.data?.findIndex((group) => group.id === selectedGroupId) ?? -1
      ] ?? [])
    : scope === 'personal'
      ? session.data
        ? [session.data]
        : []
      : people;
  const displayed = (tasks.data ?? []).filter(
    (task) =>
      (scope !== 'personal' || task.group_id === null) &&
      (assignee !== 'unassigned' || task.assignee_id === null),
  );
  const activeFilters = !!status || !!assignee;
  function change(key: string, value: string) {
    setSearch((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key === 'scope') next.delete('assignee');
      return next;
    });
  }
  const createUrl = `/tasks/new${selectedGroupId ? `?group=${encodeURIComponent(selectedGroupId)}` : ''}`;
  return (
    <>
      {!groupId && <TaskStats scope={scope} listHasError={tasks.isError} />}
      <section className='tasks-section' aria-label='Список задач'>
        <TaskFilters
          groupId={groupId}
          scope={scope}
          selectedGroupId={selectedGroupId}
          status={status}
          assignee={assignee}
          groups={groups.data ?? []}
          groupsUnavailable={groups.isPending || groups.isError}
          availablePeople={availablePeople}
          currentUserId={session.data?.id}
          isFetching={tasks.isFetching}
          createUrl={createUrl}
          change={change}
          onReset={() =>
            setSearch((previous) => {
              const next = new URLSearchParams(previous);
              next.delete('status');
              next.delete('assignee');
              return next;
            })
          }
          onRefresh={() => {
            void refreshTasks();
            void groups.refetch();
            peopleQuery.refetch();
          }}
        />
        {groups.isError && (
          <QueryWarning
            message='Не удалось загрузить группы.'
            retry={() => {
              void groups.refetch();
            }}
          />
        )}
        {peopleQuery.isError && (
          <QueryWarning
            message='Не удалось загрузить часть участников.'
            retry={() => peopleQuery.retry()}
          />
        )}
        <div className='flex items-center justify-between text-muted-foreground text-xs pt-5 pr-0 pb-3 pl-0'>
          <span>
            {tasks.isPending
              ? 'Загружаем задачи'
              : tasks.isError
                ? 'Список недоступен'
                : `Задач: ${displayed.length}`}
          </span>
          <span>Сначала новые</span>
        </div>
        {tasks.isPending ? (
          <Loading label='Загружаем ваши задачи…' />
        ) : tasks.isError ? (
          <ErrorState
            error={tasks.error}
            retry={() => {
              void tasks.refetch();
            }}
          />
        ) : !displayed.length ? (
          <EmptyState
            title={activeFilters ? 'Задачи не найдены' : 'Нет задач'}
            description={
              activeFilters ? 'Измените или сбросьте фильтры.' : undefined
            }
            action={
              !activeFilters && (
                <Button variant='outline' asChild>
                  <Link to={createUrl}>
                    <Plus />
                    Создать задачу
                  </Link>
                </Button>
              )
            }
          />
        ) : (
          <div className='grid gap-2.5'>
            {displayed.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                groups={groups.data ?? []}
                people={people}
                unknownName={
                  peopleQuery.isPending
                    ? 'Загружаем…'
                    : peopleQuery.isError
                      ? 'Имя недоступно'
                      : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
