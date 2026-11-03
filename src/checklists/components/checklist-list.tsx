import { useQuery } from '@tanstack/react-query';
import { ListChecks, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import {
  EmptyState,
  ErrorState,
  Loading,
  QueryWarning,
} from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/input';
import { checklistOptions, groupOptions } from '@/shared/lib/query-options';

export function ChecklistList() {
  const [search, setSearch] = useSearchParams();
  const scope = search.get('scope') ?? 'all';
  const groups = useQuery(groupOptions.list());
  const groupId = scope === 'all' || scope === 'personal' ? undefined : scope;
  const checklists = useQuery(checklistOptions.list({ group_id: groupId }));
  const displayed = (checklists.data ?? []).filter(
    (checklist) => scope !== 'personal' || checklist.group_id === null,
  );
  return (
    <>
      <div className='mb-5 flex items-center gap-3'>
        <Select
          className='max-w-sm'
          aria-label='Принадлежность чеклистов'
          value={scope}
          onChange={(event) => {
            const value = event.target.value;
            setSearch(value === 'all' ? {} : { scope: value });
          }}
        >
          <option value='all'>Все</option>
          <option value='personal'>Личные</option>
          {groups.data?.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
          {groupId && !groups.data?.some((group) => group.id === groupId) && (
            <option value={groupId}>Группа недоступна</option>
          )}
        </Select>
        <Button
          variant='outline'
          className='px-3'
          aria-label='Обновить чеклисты'
          disabled={checklists.isFetching}
          onClick={() => {
            void checklists.refetch();
            void groups.refetch();
          }}
        >
          <RefreshCw
            className={checklists.isFetching ? 'animate-spin' : undefined}
          />
        </Button>
      </div>
      {groups.isError && (
        <QueryWarning
          message='Не удалось загрузить группы.'
          retry={() => {
            void groups.refetch();
          }}
        />
      )}
      {checklists.isPending ? (
        <Loading label='Загружаем чеклисты…' />
      ) : checklists.isError ? (
        <ErrorState
          error={checklists.error}
          retry={() => {
            void checklists.refetch();
          }}
        />
      ) : !displayed.length ? (
        <EmptyState title='Нет чеклистов' />
      ) : (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {displayed.map((checklist) => (
            <Link
              className='rounded-xl border bg-card p-5 hover:bg-muted/30'
              key={checklist.id}
              to={`/checklists/${checklist.id}`}
            >
              <ListChecks size={22} className='mb-4 text-muted-foreground' />
              <h2 className='wrap-anywhere font-semibold'>{checklist.title}</h2>
              <p className='mt-2 text-xs text-muted-foreground'>
                {checklist.group_id
                  ? (groups.data?.find(
                      (group) => group.id === checklist.group_id,
                    )?.name ?? 'Группа')
                  : 'Личный'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
