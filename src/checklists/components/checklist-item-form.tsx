import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LoaderCircle, Plus, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  refreshChecklistAfterError,
  refreshChecklists,
} from '@/checklists/lib/cache';
import { checklistApi } from '@/checklists/lib/checklists';
import {
  checklistTitleSchema,
  type ChecklistTitleValues,
} from '@/checklists/lib/form-schema';
import type { ChecklistItem } from '@/checklists/lib/types';
import { FormError } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';

export function ChecklistItemForm({
  checklistId,
  item,
  onCancel,
}: {
  checklistId: string;
  item?: ChecklistItem;
  onCancel?: () => void;
}) {
  const form = useForm<ChecklistTitleValues>({
    resolver: zodResolver(checklistTitleSchema),
    defaultValues: { title: item?.title ?? '' },
  });
  const inputId = `checklist-item-${item?.id ?? 'new'}`;
  const mutation = useMutation({
    mutationFn: ({ title }: ChecklistTitleValues) =>
      item
        ? checklistApi.updateItem(checklistId, item.id, { title })
        : checklistApi.addItem(checklistId, title),
    onSuccess: async () => {
      await refreshChecklists(checklistId);
      if (item) onCancel?.();
      else form.reset({ title: '' });
    },
    onError: (error) => refreshChecklistAfterError(error, checklistId),
  });
  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      data-dirty={form.formState.isDirty}
      noValidate
    >
      <fieldset
        disabled={mutation.isPending}
        className='flex flex-wrap items-end gap-2'
      >
        <Field className='min-w-36 flex-1'>
          <FieldLabel
            htmlFor={inputId}
            className={item ? 'sr-only' : undefined}
          >
            {item ? 'Название пункта' : 'Добавить пункт'}
          </FieldLabel>
          <Input
            id={inputId}
            {...form.register('title')}
            required
            autoFocus={!!item}
            aria-invalid={!!form.formState.errors.title}
            aria-describedby={
              form.formState.errors.title ? `${inputId}-error` : undefined
            }
          />
          <FieldError
            id={`${inputId}-error`}
            message={form.formState.errors.title?.message}
          />
        </Field>
        <Button type='submit'>
          {mutation.isPending ? (
            <LoaderCircle className='animate-spin' />
          ) : item ? (
            <Save />
          ) : (
            <Plus />
          )}
          {item ? 'Сохранить' : 'Добавить'}
        </Button>
        {item && (
          <Button type='button' variant='outline' onClick={onCancel}>
            Отмена
          </Button>
        )}
      </fieldset>
      <FormError id={`${inputId}-request-error`} error={mutation.error} />
    </form>
  );
}
