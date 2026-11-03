import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LoaderCircle, Save } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { FormError } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { groupOptions } from '@/shared/lib/query-options';
import { TaskAssignmentFields } from '@/tasks/components/task-assignment-fields';
import { TaskContentFields } from '@/tasks/components/task-content-fields';
import { TaskWorkflowFields } from '@/tasks/components/task-workflow-fields';
import { refreshTaskAfterError, refreshTasks } from '@/tasks/lib/cache';
import { taskFormSchema, type TaskFormValues } from '@/tasks/lib/form-schema';
import { taskChanges } from '@/tasks/lib/task-fields';
import { taskApi } from '@/tasks/lib/tasks';
import type { Task } from '@/tasks/lib/types';

export function TaskForm({
  task,
  initialGroupId = '',
}: {
  task?: Task;
  initialGroupId?: string;
}) {
  const navigate = useNavigate();
  const groups = useQuery(groupOptions.list());
  // Keep a snapshot: a background refresh must not turn untouched fields into PATCH changes.
  const [original] = useState(task);
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'normal',
      status: task?.status === 'in_progress' ? 'in_progress' : 'open',
      group_id: task?.group_id ?? initialGroupId,
      assignee_id: task?.assignee_id ?? '',
    },
  });
  const groupId = useWatch({ control: form.control, name: 'group_id' });
  const mutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const values = {
        title: data.title,
        description: data.description === '' ? null : data.description,
        priority: data.priority,
        status: data.status,
        assignee_id: data.assignee_id || null,
      };
      if (original) {
        const changes = taskChanges(original, values);
        if (!Object.keys(changes).length) return original;
        return taskApi.update({ id: original.id, changes });
      }
      return taskApi.create({
        title: values.title,
        description: values.description,
        priority: values.priority,
        group_id: data.group_id || null,
        assignee_id: values.assignee_id,
      });
    },
    onSuccess: async (result) => {
      await refreshTasks(result);
      toast.success(original ? 'Изменения сохранены' : 'Задача создана');
      navigate(`/tasks/${result.id}`, { replace: !original });
    },
    onError: async (error) => {
      if (original) await refreshTaskAfterError(error, original.id);
    },
  });
  const unknownGroup =
    groupId &&
    groups.isSuccess &&
    !groups.data.some((group) => group.id === groupId);
  return (
    <form
      className='p-8 max-[680px]:py-5.5 max-[680px]:px-4.5 bg-card border border-border rounded-xl'
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      data-dirty={form.formState.isDirty}
      noValidate
      aria-describedby={mutation.error ? 'form-error' : undefined}
    >
      <fieldset
        disabled={mutation.isPending}
        className='flex flex-col gap-6 max-[680px]:gap-5.5'
      >
        <TaskContentFields form={form} />
        <TaskAssignmentFields form={form} editing={!!original} />
        <TaskWorkflowFields form={form} editing={!!original} />
        <FormError error={mutation.error} />
        <div className='flex justify-end items-center gap-2.5 border-t border-t-border pt-[23px] mt-[5px] max-[680px]:flex-wrap max-[680px]:[&>a]:flex-1'>
          <Button
            className='max-[680px]:flex-2'
            variant='outline'
            type='button'
            onClick={() =>
              navigate(
                original
                  ? `/tasks/${original.id}`
                  : groupId
                    ? `/groups/${groupId}`
                    : '/tasks',
              )
            }
          >
            Отмена
          </Button>
          <Button
            className='max-[680px]:flex-2'
            type='submit'
            disabled={!!unknownGroup}
          >
            {mutation.isPending ? (
              <LoaderCircle className='animate-spin' />
            ) : (
              <Save />
            )}
            {original ? 'Сохранить изменения' : 'Создать задачу'}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
