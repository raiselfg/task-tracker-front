import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router';

import { ChecklistDetail } from '@/checklists/components/checklist-detail';
import { ChecklistForm } from '@/checklists/components/checklist-form';
import { PageHeader } from '@/shared/components/page-header';
import { BackLink, ErrorState, Loading } from '@/shared/components/states';
import { checklistOptions } from '@/shared/lib/query-options';

export function NewChecklistPage() {
  const [search] = useSearchParams();
  return (
    <div className='mx-auto max-w-215'>
      <BackLink to='/checklists'>К чеклистам</BackLink>
      <PageHeader title='Новый чеклист' />
      <ChecklistForm initialGroupId={search.get('group') ?? ''} />
    </div>
  );
}

export function ChecklistPage({ edit = false }: { edit?: boolean }) {
  const { id = '' } = useParams();
  const checklist = useQuery(checklistOptions.detail(id));
  if (checklist.isPending) return <Loading label='Загружаем чеклист…' />;
  if (checklist.isError)
    return (
      <>
        <BackLink to='/checklists'>К чеклистам</BackLink>
        <ErrorState
          title='Чеклист недоступен'
          error={checklist.error}
          retry={() => {
            void checklist.refetch();
          }}
        />
      </>
    );
  if (edit)
    return (
      <div className='mx-auto max-w-215'>
        <BackLink to={`/checklists/${id}`}>К чеклисту</BackLink>
        <PageHeader title='Переименовать чеклист' />
        <ChecklistForm key={id} checklist={checklist.data} />
      </div>
    );
  return <ChecklistDetail key={id} checklist={checklist.data} />;
}
