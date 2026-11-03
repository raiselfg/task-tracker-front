import { useMutation, useQuery } from '@tanstack/react-query';
import { Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { ChecklistItemForm } from '@/checklists/components/checklist-item-form';
import { ChecklistItemRow } from '@/checklists/components/checklist-item-row';
import {
  refreshChecklistAfterError,
  refreshChecklists,
} from '@/checklists/lib/cache';
import { checklistApi } from '@/checklists/lib/checklists';
import type { ChecklistDetail as ChecklistDetailData } from '@/checklists/lib/types';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { PageHeader } from '@/shared/components/page-header';
import { BackLink } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { queryClient } from '@/shared/lib/query-client';
import {
  checklistOptions,
  checklistQueries,
  groupOptions,
} from '@/shared/lib/query-options';

export function ChecklistDetail({
  checklist,
}: {
  checklist: ChecklistDetailData;
}) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const groups = useQuery(groupOptions.list());
  const query = useQuery(checklistOptions.detail(checklist.id));
  const remove = useMutation({
    mutationFn: () => checklistApi.remove(checklist.id),
    onSuccess: async () => {
      navigate('/checklists', { replace: true });
      queryClient.removeQueries({
        queryKey: checklistQueries.detail(checklist.id),
      });
      await refreshChecklists();
      toast.success('Чеклист удалён');
    },
    onError: (error) => refreshChecklistAfterError(error, checklist.id),
  });
  const checked = checklist.items.filter((item) => item.checked).length;
  const scope = checklist.group_id
    ? (groups.data?.find((group) => group.id === checklist.group_id)?.name ??
      'Группа')
    : 'Личный';
  return (
    <div className='mx-auto max-w-215'>
      <BackLink to='/checklists'>К чеклистам</BackLink>
      <PageHeader
        title={checklist.title}
        description={scope}
        action={
          <div className='flex gap-2'>
            <Button variant='outline' asChild>
              <Link to={`/checklists/${checklist.id}/edit`}>
                <Pencil />
                Переименовать
              </Link>
            </Button>
            <Button
              variant='ghost'
              className='px-3 text-destructive'
              aria-label='Удалить чеклист'
              onClick={() => setDeleting(true)}
            >
              <Trash2 />
            </Button>
          </div>
        }
      />
      <Card>
        <div className='mb-4 flex items-center justify-between gap-3'>
          <p className='text-sm text-muted-foreground' role='status'>
            {checked} из {checklist.items.length}
          </p>
          <Button
            variant='ghost'
            className='px-3'
            aria-label='Обновить чеклист'
            disabled={query.isFetching}
            onClick={() => {
              void query.refetch();
            }}
          >
            <RefreshCw
              className={query.isFetching ? 'animate-spin' : undefined}
            />
          </Button>
        </div>
        {checklist.items.length ? (
          <ul className='mb-5 list-none p-0'>
            {checklist.items.map((item) => (
              <ChecklistItemRow key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className='mb-5 text-sm text-muted-foreground'>Нет пунктов</p>
        )}
        <ChecklistItemForm checklistId={checklist.id} />
      </Card>
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title='Удалить чеклист?'
        description={
          <>
            «{checklist.title}» и все его пункты будут удалены без
            восстановления.
          </>
        }
        confirmLabel='Удалить'
        onConfirm={() => remove.mutateAsync()}
      />
    </div>
  );
}
