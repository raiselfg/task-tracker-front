import { useQuery } from '@tanstack/react-query';
import { Crown, ShieldCheck, UsersRound } from 'lucide-react';

import { RemoveGroupMemberButton } from '@/groups/components/remove-group-member-button';
import type { Group } from '@/groups/lib/types';
import { EmptyState, ErrorState, Loading } from '@/shared/components/states';
import { Card } from '@/shared/components/ui/card';
import { groupOptions } from '@/shared/lib/query-options';

export function GroupMembers({
  group,
  currentUserId,
}: {
  group: Group;
  currentUserId?: string;
}) {
  const members = useQuery(groupOptions.members(group.id));
  const owner = group.owner_id === currentUserId;
  return (
    <Card>
      <div className='flex justify-between items-center gap-[15px] w-full [&+[data-filter-row]]:mt-[1px] max-[680px]:[&>a]:text-xs max-[680px]:[&>a]:px-3'>
        <h2 className='text-base font-medium tracking-[-0.3px] max-[680px]:text-base'>
          Участники{' '}
          <span className='inline-block text-xs text-muted-foreground bg-muted rounded-md py-[3px] px-1.5 ml-1.5'>
            {members.data?.length ?? '—'}
          </span>
        </h2>
        <UsersRound size={20} className='text-muted-foreground' />
      </div>
      {members.isPending ? (
        <Loading label='Загружаем участников…' />
      ) : members.isError ? (
        <ErrorState
          error={members.error}
          retry={() => {
            void members.refetch();
          }}
        />
      ) : !members.data.length ? (
        <EmptyState
          title='Участники не найдены'
          description='Обновите страницу, чтобы проверить состав группы.'
        />
      ) : (
        <ul className='mt-4 mr-0 mb-0 ml-0 p-0 list-none'>
          {members.data.map((member) => (
            <li
              className='flex items-center gap-3 border-b border-b-border py-4 px-0 last:border-b-0'
              key={member.id}
            >
              <span
                className='w-[37px] h-[37px] shrink-0 grid place-items-center rounded-full bg-muted text-muted-foreground text-sm font-semibold'
                data-avatar
              >
                {member.login.slice(0, 1).toUpperCase()}
              </span>
              <div className='flex-1 min-w-0'>
                <strong className='block text-sm font-medium wrap-anywhere'>
                  {member.login}
                  {member.id === currentUserId && (
                    <span className='font-normal text-muted-foreground text-xs'>
                      (вы)
                    </span>
                  )}
                </strong>
                <span className='block mt-[3px] text-xs text-muted-foreground'>
                  {member.id === group.owner_id ? 'Владелец' : 'Участник'}
                </span>
              </div>
              {member.id === group.owner_id ? (
                <Crown
                  size={17}
                  className='text-muted-foreground'
                  aria-label='Владелец'
                />
              ) : (
                owner && (
                  <RemoveGroupMemberButton groupId={group.id} member={member} />
                )
              )}
            </li>
          ))}
        </ul>
      )}
      <p
        className='text-sm leading-[1.7] text-muted-foreground font-normal flex gap-1.5 mt-[17px] pt-[17px] border-t border-t-border'
        data-field-hint
      >
        <ShieldCheck className='shrink-0' size={15} />
        Каждый участник может работать с общими задачами.
      </p>
    </Card>
  );
}
