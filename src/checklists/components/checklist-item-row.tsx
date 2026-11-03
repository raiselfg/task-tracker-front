import { useMutation } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ChecklistItemForm } from '@/checklists/components/checklist-item-form';
import {
  refreshChecklistAfterError,
  refreshChecklists,
} from '@/checklists/lib/cache';
import { checklistApi } from '@/checklists/lib/checklists';
import type { ChecklistItem } from '@/checklists/lib/types';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { FormError } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const update = useMutation({
    mutationFn: (checked: boolean) =>
      checklistApi.updateItem(item.checklist_id, item.id, { checked }),
    onSuccess: () => refreshChecklists(item.checklist_id),
    onError: (error) => refreshChecklistAfterError(error, item.checklist_id),
  });
  const remove = useMutation({
    mutationFn: () => checklistApi.removeItem(item.checklist_id, item.id),
    onSuccess: () => refreshChecklists(item.checklist_id),
    onError: (error) => refreshChecklistAfterError(error, item.checklist_id),
  });
  return (
    <li className='border-b py-3 last:border-b-0'>
      {editing ? (
        <ChecklistItemForm
          checklistId={item.checklist_id}
          item={item}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className='flex items-center gap-2'>
          <label className='flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3'>
            <input
              type='checkbox'
              className='size-5 shrink-0 accent-primary'
              checked={item.checked}
              disabled={update.isPending || deleting}
              onChange={(event) => update.mutate(event.target.checked)}
            />
            <span
              className={cn(
                'wrap-anywhere text-sm',
                item.checked && 'text-muted-foreground line-through',
              )}
            >
              {item.title}
            </span>
          </label>
          <Button
            variant='ghost'
            className='px-3'
            aria-label={`Переименовать ${item.title}`}
            disabled={update.isPending}
            onClick={() => setEditing(true)}
          >
            <Pencil />
          </Button>
          <Button
            variant='ghost'
            className='px-3 text-destructive'
            aria-label={`Удалить ${item.title}`}
            disabled={update.isPending}
            onClick={() => setDeleting(true)}
          >
            <Trash2 />
          </Button>
        </div>
      )}
      <FormError id={`item-${item.id}-error`} error={update.error} />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title='Удалить пункт?'
        description={<>«{item.title}» будет удалён.</>}
        confirmLabel='Удалить'
        onConfirm={() => remove.mutateAsync()}
      />
    </li>
  );
}
