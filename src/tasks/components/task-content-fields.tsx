import { type UseFormReturn, useFormState } from 'react-hook-form';

import {} from '@/shared/components/states';
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field';
import { Input, Textarea } from '@/shared/components/ui/input';
import type { TaskFormValues } from '@/tasks/lib/form-schema';

export function TaskContentFields({
  form,
}: {
  form: UseFormReturn<TaskFormValues>;
}) {
  const { errors } = useFormState({
    control: form.control,
    name: 'title',
    exact: true,
  });
  return (
    <>
      <Field>
        <FieldLabel htmlFor='task-title'>
          Название <span className='text-muted-foreground'>*</span>
        </FieldLabel>
        <Input
          id='task-title'
          {...form.register('title')}
          required
          autoFocus
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'task-title-error' : undefined}
        />
        <FieldError id='task-title-error' message={errors.title?.message} />
      </Field>
      <Field>
        <FieldLabel htmlFor='task-description'>
          Описание{' '}
          <span className='text-muted-foreground text-xs font-normal ml-[5px]'>
            необязательно
          </span>
        </FieldLabel>
        <Textarea
          id='task-description'
          {...form.register('description')}
          rows={4}
        />
      </Field>
    </>
  );
}
