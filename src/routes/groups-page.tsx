import { useQuery } from '@tanstack/react-query';
import { Plus, UsersRound } from 'lucide-react';

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
        eyebrow='СВОЙ КРУГ'
        title='Ваши группы'
        description='Семья, близкие и дела, которые вас объединяют.'
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
      <div className='flex items-center gap-5.5 rounded-xl bg-muted p-[29px] mt-1 mr-0 mb-7.5 ml-0 max-[680px]:p-5 max-[680px]:gap-[15px] max-[680px]:items-start'>
        <div className='w-17 h-17 bg-muted rounded-[20px] grid place-items-center text-muted-foreground shrink-0 max-[680px]:w-[45px] max-[680px]:h-[45px] max-[680px]:rounded-[15px]'>
          <UsersRound className='max-[680px]:w-6' size={30} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className='text-lg font-medium tracking-[-0.3px] max-[680px]:text-sm'>
            Одно пространство для общих дел
          </h2>
          <p className='text-sm leading-[1.9] mt-2 text-muted-foreground max-[680px]:text-xs max-[680px]:leading-[1.8]'>
            Создайте группу и пригласите близких по ссылке.
            <br className='max-[680px]:hidden' /> Каждый участник сможет
            добавлять и выполнять задачи.
          </p>
        </div>
      </div>
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
          title='Вместе начинается здесь'
          description='Создайте первую группу и разделите дела с теми, кто рядом.'
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
