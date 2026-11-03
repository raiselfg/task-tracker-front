import { Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { ChecklistList } from '@/checklists/components/checklist-list';
import { PageHeader } from '@/shared/components/page-header';
import { Button } from '@/shared/components/ui/button';

export function ChecklistsPage() {
  const [search] = useSearchParams();
  const scope = search.get('scope');
  const group =
    scope && !['all', 'personal'].includes(scope)
      ? `?group=${encodeURIComponent(scope)}`
      : '';
  return (
    <>
      <PageHeader
        title='Чеклисты'
        action={
          <Button asChild className='max-[680px]:w-full'>
            <Link to={`/checklists/new${group}`}>
              <Plus />
              Новый чеклист
            </Link>
          </Button>
        }
      />
      <ChecklistList />
    </>
  );
}
