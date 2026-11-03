import { ListFilter, Plus, RotateCw } from 'lucide-react';
import { Link } from 'react-router';

import type { User } from '@/auth/lib/types';
import type { Group } from '@/groups/lib/types';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import { statusLabels } from '@/tasks/lib/task-fields';
import type { TaskStatus } from '@/tasks/lib/types';

interface TaskFiltersProps {
  groupId?: string;
  scope: string;
  selectedGroupId?: string;
  status?: TaskStatus;
  assignee: string;
  groups: Group[];
  groupsUnavailable: boolean;
  availablePeople: User[];
  currentUserId?: string;
  isFetching: boolean;
  createUrl: string;
  change: (key: string, value: string) => void;
  onReset: () => void;
  onRefresh: () => void;
}

export function TaskFilters({
  groupId,
  scope,
  selectedGroupId,
  status,
  assignee,
  groups,
  groupsUnavailable,
  availablePeople,
  currentUserId,
  isFetching,
  createUrl,
  change,
  onReset,
  onRefresh,
}: TaskFiltersProps) {
  return (
    <div className='flex flex-col gap-4 border-b pb-4'>
      {groupId ? (
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-lg font-bold'>Задачи группы</h2>
          <Button asChild>
            <Link to={createUrl}>
              <Plus />
              Новая задача
            </Link>
          </Button>
        </div>
      ) : (
        <div className='flex flex-wrap items-center gap-3'>
          <div
            className='inline-flex rounded-lg bg-muted p-1'
            aria-label='Принадлежность задач'
          >
            {[
              { value: 'all', label: 'Все' },
              { value: 'personal', label: 'Личные' },
            ].map(({ value, label }) => (
              <button
                key={value}
                className={cn(
                  'min-h-10 rounded-md px-4 text-sm font-medium text-muted-foreground',
                  scope === value && 'bg-card text-foreground shadow-xs',
                )}
                aria-pressed={scope === value}
                onClick={() => change('scope', value === 'all' ? '' : value)}
              >
                {label}
              </button>
            ))}
          </div>
          <Select
            aria-label='Группа для фильтра задач'
            className='w-full sm:w-56'
            value={selectedGroupId ?? ''}
            disabled={groupsUnavailable}
            onChange={(event) => change('scope', event.target.value)}
          >
            <option value=''>Выбрать группу</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
        <ListFilter
          size={17}
          className='hidden text-muted-foreground sm:block'
          aria-hidden='true'
        />
        <Select
          aria-label='Статус'
          className='min-w-0 flex-1 basis-32 px-2.5 pr-6 text-[13px] sm:max-w-48 sm:text-sm'
          value={status ?? ''}
          onChange={(event) => change('status', event.target.value)}
        >
          <option value=''>Все статусы</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          aria-label='Исполнитель'
          className='min-w-0 flex-1 basis-32 px-2.5 pr-6 text-[13px] sm:max-w-56 sm:text-sm'
          value={assignee}
          onChange={(event) => change('assignee', event.target.value)}
        >
          <option value=''>Все исполнители</option>
          <option value='unassigned'>Не назначена</option>
          {availablePeople.map((person) => (
            <option key={person.id} value={person.id}>
              {person.login}
              {person.id === currentUserId ? ' (я)' : ''}
            </option>
          ))}
          {assignee &&
            assignee !== 'unassigned' &&
            !availablePeople.some((person) => person.id === assignee) && (
              <option value={assignee}>Недоступный участник</option>
            )}
        </Select>
        {(status || assignee) && (
          <Button variant='ghost' onClick={onReset}>
            Сбросить
          </Button>
        )}
        <Button
          variant='ghost'
          aria-label='Обновить список задач'
          className='ml-auto px-3'
          disabled={isFetching}
          onClick={onRefresh}
        >
          <RotateCw className={isFetching ? 'animate-spin' : ''} />
        </Button>
      </div>
    </div>
  );
}
