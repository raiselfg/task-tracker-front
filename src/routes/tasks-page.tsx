import { Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { PageHeader } from '@/shared/components/page-header';
import { Button } from '@/shared/components/ui/button';
import { TaskList } from '@/tasks/components/task-list';

export function TasksPage() {
  const [search] = useSearchParams();
  const scope = search.get('scope');
  const group =
    scope && !['all', 'personal'].includes(scope)
      ? `?group=${encodeURIComponent(scope)}`
      : '';
  return (
    <>
      <PageHeader
        eyebrow='ЛИЧНОЕ И ОБЩЕЕ'
        title='Ваши задачи'
        description='Для себя, для семьи, для всего важного.'
        action={
          <>
            <Button asChild className='shadow-sm max-[680px]:w-full'>
              <Link to={`/tasks/new${group}`}>
                <Plus />
                Новая задача
              </Link>
            </Button>{' '}
          </>
        }
      />
      <TaskList />
    </>
  );
}
