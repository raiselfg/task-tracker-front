import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LoaderCircle, Save } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import {
  refreshChecklistAfterError,
  refreshChecklists,
} from '@/checklists/lib/cache';
import { checklistApi } from '@/checklists/lib/checklists';
import {
  checklistFormSchema,
  type ChecklistFormValues,
} from '@/checklists/lib/form-schema';
import type { Checklist } from '@/checklists/lib/types';
import { FormError, QueryWarning } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field';
import { Input, Select } from '@/shared/components/ui/input';
import { groupOptions } from '@/shared/lib/query-options';

export function ChecklistForm({
  checklist,
  initialGroupId = '',
}: {
  checklist?: Checklist;
  initialGroupId?: string;
}) {
  const navigate = useNavigate();
  const groups = useQuery(groupOptions.list());
  const form = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistFormSchema),
    defaultValues: {
      title: checklist?.title ?? '',
      group_id: checklist?.group_id ?? initialGroupId,
    },
  });
  const groupId = useWatch({ control: form.control, name: 'group_id' });
  const unknownGroup =
    groupId &&
    groups.isSuccess &&
    !groups.data.some((group) => group.id === groupId);
  const mutation = useMutation({
    mutationFn: (values: ChecklistFormValues) =>
      checklist
        ? checklistApi.update(checklist.id, values.title)
        : checklistApi.create({
            title: values.title,
            group_id: values.group_id || null,
          }),
    onSuccess: async (result) => {
      await refreshChecklists(result.id);
      toast.success(checklist ? 'Изменения сохранены' : 'Чеклист создан');
      navigate(`/checklists/${result.id}`, { replace: !checklist });
    },
    onError: async (error) => {
      if (checklist) await refreshChecklistAfterError(error, checklist.id);
    },
  });
  return (
    <form
      className='grid gap-5 rounded-xl border bg-card p-5 sm:p-8'
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      data-dirty={form.formState.isDirty}
      noValidate
    >
      <fieldset disabled={mutation.isPending} className='grid gap-5'>
        <Field>
          <FieldLabel htmlFor='checklist-title'>Название</FieldLabel>
          <Input
            id='checklist-title'
            {...form.register('title')}
            required
            autoFocus
            aria-invalid={!!form.formState.errors.title}
            aria-describedby={
              form.formState.errors.title ? 'checklist-title-error' : undefined
            }
          />
          <FieldError
            id='checklist-title-error'
            message={form.formState.errors.title?.message}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='checklist-group'>Где чеклист</FieldLabel>
          <Select
            id='checklist-group'
            {...form.register('group_id')}
            disabled={!!checklist || groups.isPending || groups.isError}
          >
            <option value=''>Личный</option>
            {groups.data?.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
            {unknownGroup && <option value={groupId}>Группа недоступна</option>}
          </Select>
          {groups.isError && (
            <QueryWarning
              message='Не удалось загрузить группы.'
              retry={() => {
                void groups.refetch();
              }}
            />
          )}
          {unknownGroup && <QueryWarning message='Группа недоступна.' />}
        </Field>
        <FormError error={mutation.error} />
        <div className='flex justify-end gap-2 border-t pt-5'>
          <Button
            type='button'
            variant='outline'
            onClick={() =>
              navigate(
                checklist ? `/checklists/${checklist.id}` : '/checklists',
              )
            }
          >
            Отмена
          </Button>
          <Button type='submit' disabled={!!unknownGroup}>
            {mutation.isPending ? (
              <LoaderCircle className='animate-spin' />
            ) : (
              <Save />
            )}
            {checklist ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
