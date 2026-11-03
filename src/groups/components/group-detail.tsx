import { useQuery } from '@tanstack/react-query';
import { Crown, UsersRound } from 'lucide-react';

import { GroupDangerZone } from '@/groups/components/group-danger-zone';
import { GroupMembers } from '@/groups/components/group-members';
import { InvitationPanel } from '@/groups/components/invitation-panel';
import type { Group } from '@/groups/lib/types';
import { PageHeader } from '@/shared/components/page-header';
import { BackLink } from '@/shared/components/states';
import { sessionOptions } from '@/shared/lib/query-options';
import { cn } from '@/shared/lib/utils';
import { TaskList } from '@/tasks/components/task-list';

export function GroupDetail({ group }: { group: Group }) {
  const { data: user } = useQuery(sessionOptions);
  const owner = group.owner_id === user?.id;
  return (
    <>
      <BackLink to='/groups'>К группам</BackLink>
      <PageHeader
        title={group.name}
        description={
          <>
            <span className='inline-flex items-center gap-[7px]'>
              {owner ? <Crown size={15} /> : <UsersRound size={15} />}
              {owner ? 'Владелец' : 'Участник'}
            </span>
          </>
        }
      />
      <TaskList groupId={group.id} />
      <div
        className={cn(
          'mt-[35px] grid gap-6 items-start max-[680px]:gap-[19px] max-[680px]:mt-6.5',
          owner && 'grid-cols-[1.15fr_1fr] max-[860px]:grid-cols-1',
        )}
      >
        <GroupMembers group={group} currentUserId={user?.id} />
        {owner && <InvitationPanel groupId={group.id} />}
      </div>
      <GroupDangerZone group={group} owner={owner} />
    </>
  );
}
