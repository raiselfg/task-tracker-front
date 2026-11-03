import { useQuery } from '@tanstack/react-query';
import { Crown, UsersRound } from 'lucide-react';

import { GroupDangerZone } from '@/groups/components/group-danger-zone';
import { GroupMembers } from '@/groups/components/group-members';
import { InvitationPanel } from '@/groups/components/invitation-panel';
import type { Group } from '@/groups/lib/types';
import { PageHeader } from '@/shared/components/page-header';
import { BackLink } from '@/shared/components/states';
import { sessionOptions } from '@/shared/lib/query-options';
import { TaskList } from '@/tasks/components/task-list';

export function GroupDetail({ group }: { group: Group }) {
  const { data: user } = useQuery(sessionOptions);
  const owner = group.owner_id === user?.id;
  return (
    <>
      <BackLink to='/groups'>К группам</BackLink>
      <PageHeader
        eyebrow='ОБЩИЕ ПЛАНЫ'
        title={group.name}
        description={
          <>
            <span className='inline-flex items-center gap-[7px]'>
              {owner ? <Crown size={15} /> : <UsersRound size={15} />}
              {owner ? 'Вы — владелец группы' : 'Вы — участник группы'}
            </span>
          </>
        }
      />
      <TaskList groupId={group.id} />
      <div className='mt-[35px] grid grid-cols-[1.15fr_1fr] gap-6 items-start max-[860px]:grid-cols-1 max-[680px]:gap-[19px] max-[680px]:mt-6.5'>
        <GroupMembers group={group} currentUserId={user?.id} />
        {owner ? (
          <InvitationPanel groupId={group.id} />
        ) : (
          <section className='bg-card border border-border rounded-xl p-[29px] [&_p+p]:mt-[15px]'>
            <UsersRound
              className='text-muted-foreground mb-5.5'
              size={28}
              strokeWidth={1.5}
            />
            <h2 className='text-lg font-medium mb-3 tracking-[-0.3px]'>
              Вы в своём кругу
            </h2>
            <p className='text-muted-foreground text-sm leading-[1.9]'>
              Создавайте и редактируйте общие задачи, выбирайте исполнителей и
              отмечайте выполненное.
            </p>
            <p className='text-muted-foreground text-sm leading-[1.9]'>
              Приглашать новых участников и управлять составом группы может
              владелец.
            </p>
          </section>
        )}
      </div>
      <GroupDangerZone group={group} owner={owner} />
    </>
  );
}
