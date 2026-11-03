import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { GroupDetail } from '@/groups/components/group-detail';
import { BackLink, ErrorState, Loading } from '@/shared/components/states';
import { groupOptions } from '@/shared/lib/query-options';

export function GroupPage() {
  const { id = '' } = useParams();
  const group = useQuery(groupOptions.detail(id));
  if (group.isPending) return <Loading label='Открываем группу…' />;
  if (group.isError)
    return (
      <>
        <BackLink to='/groups'>К группам</BackLink>
        <ErrorState
          title='Группа недоступна'
          error={group.error}
          retry={() => {
            void group.refetch();
          }}
        />
      </>
    );
  return <GroupDetail key={id} group={group.data} />;
}
