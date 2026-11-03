import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { CreateGroupDialog } from '@/groups/components/create-group-dialog';
import { GroupCard } from '@/groups/components/group-card';
import { PageHeader } from '@/shared/components/page-header';
import { EmptyState, ErrorState, Loading } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { DialogTrigger } from '@/shared/components/ui/dialog';
import { groupOptions, sessionOptions } from '@/shared/lib/query-options';

export function GroupsPage() {
  const groups = useQuery(groupOptions.list());
  const { data: user } = useQuery(sessionOptions);
  return (
    <CreateGroupDialog>
      <PageHeader
        title='Группы'
        action={
          <>
            <DialogTrigger asChild>
              <Button>
                <Plus />
                Создать группу
              </Button>
            </DialogTrigger>{' '}
          </>
        }
      />
      {groups.isPending ? (
        <Loading label='Загружаем группы…' />
      ) : groups.isError ? (
        <ErrorState
          error={groups.error}
          retry={() => {
            void groups.refetch();
          }}
        />
      ) : !groups.data.length ? (
        <EmptyState
          title='Нет групп'
          action={
            <DialogTrigger asChild>
              <Button variant='outline'>
                <Plus />
                Создать группу
              </Button>
            </DialogTrigger>
          }
        />
      ) : (
        <div className='grid grid-cols-3 gap-4.5 max-[1200px]:grid-cols-2 max-[680px]:grid-cols-1 max-[680px]:gap-3'>
          {groups.data.map((group, index) => (
            <GroupCard
              key={group.id}
              group={group}
              index={index}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </CreateGroupDialog>
  );
}
