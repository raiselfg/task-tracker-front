import { type UseFormReturn, useFormState } from 'react-hook-form';

import {} from '@/shared/components/states';
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field';
import { Select } from '@/shared/components/ui/input';
import type { TaskFormValues } from '@/tasks/lib/form-schema';
import { priorityLabels } from '@/tasks/lib/task-fields';

export function TaskWorkflowFields({
  form,
  editing,
}: {
  form: UseFormReturn<TaskFormValues>;
  editing: boolean;
}) {
  const { errors } = useFormState({
    control: form.control,
    name: ['priority', 'status'],
    exact: true,
  });
  return (
    <div className='grid gap-6 sm:grid-cols-2'>
      <Field>
        <FieldLabel htmlFor='task-priority'>Приоритет</FieldLabel>
        <Select
          id='task-priority'
          {...form.register('priority')}
          aria-invalid={!!errors.priority}
          aria-describedby={errors.priority ? 'task-priority-error' : undefined}
        >
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </Select>
        <FieldError
          id='task-priority-error'
          message={errors.priority?.message}
        />
      </Field>
      {editing && (
        <Field>
          <FieldLabel htmlFor='task-status'>Статус</FieldLabel>
          <Select
            id='task-status'
            {...form.register('status')}
            aria-invalid={!!errors.status}
            aria-describedby={errors.status ? 'task-status-error' : undefined}
          >
            <option value='open'>Открыта</option>
            <option value='in_progress'>В работе</option>
          </Select>
          <FieldError id='task-status-error' message={errors.status?.message} />
        </Field>
      )}
    </div>
  );
}
