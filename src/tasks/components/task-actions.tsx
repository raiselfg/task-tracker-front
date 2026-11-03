import { useMutation } from '@tanstack/react-query';
import { Check, Clock3, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { FormError } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { queryClient } from '@/shared/lib/query-client';
import { taskQueries } from '@/shared/lib/query-options';
import { refreshTaskAfterError, refreshTasks } from '@/tasks/lib/cache';
import { taskApi } from '@/tasks/lib/tasks';
import type { Task } from '@/tasks/lib/types';
import { useTaskStatusMutation } from '@/tasks/lib/use-task-status-mutation';

export function TaskActions({ task }: { task: Task }) {
  const navigate = useNavigate();
  const [action, setAction] = useState<'complete' | 'delete' | null>(null);
  const completed = task.status === 'completed';
  const update = useTaskStatusMutation(task.id);
  const remove = useMutation({
    mutationFn: () => taskApi.remove(task.id),
    onSuccess: async () => {
      navigate(task.group_id ? `/groups/${task.group_id}` : '/tasks');
      queryClient.removeQueries({ queryKey: taskQueries.detail(task.id) });
      await refreshTasks();
      toast.success('Задача удалена');
    },
    onError: async (error) => {
      await refreshTaskAfterError(error, task.id);
    },
  });
  return (
    <>
      {!completed && (
        <>
          <FormError error={update.error} />
          <div className='flex flex-wrap gap-[9px] mt-7.5 pt-[25px] border-t border-t-border max-[680px]:[&>a]:flex-1 max-[680px]:[&>a]:text-xs'>
            <Button
              className='max-[680px]:flex-1 max-[680px]:text-xs'
              onClick={() => setAction('complete')}
              disabled={update.isPending}
            >
              <Check />
              Выполнить
            </Button>
            <Button
              className='max-[680px]:flex-1 max-[680px]:text-xs'
              variant='outline'
              disabled={update.isPending}
              onClick={() =>
                update.mutate(task.status === 'open' ? 'in_progress' : 'open')
              }
            >
              <Clock3 />
              {task.status === 'open' ? 'Взять в работу' : 'Вернуть в открытые'}
            </Button>
            <Button
              variant='ghost'
              className='ml-auto text-muted-foreground max-[680px]:ml-0 max-[680px]:flex-1 max-[680px]:text-xs'
              onClick={() => setAction('delete')}
            >
              <Trash2 />
              Удалить
            </Button>
          </div>
        </>
      )}
      <ConfirmDialog
        open={action !== null && !completed}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        title={action === 'delete' ? 'Удалить задачу?' : 'Выполнить задачу?'}
        description={
          action === 'delete' ? (
            <>«{task.title}» будет удалена без возможности восстановления.</>
          ) : (
            <>
              После выполнения задачу можно будет только просматривать.
              Редактирование, удаление и повторное открытие недоступны.
            </>
          )
        }
        confirmLabel={action === 'delete' ? 'Удалить' : 'Выполнить'}
        onConfirm={() =>
          action === 'delete'
            ? remove.mutateAsync()
            : update.mutateAsync('completed')
        }
      />
    </>
  );
}
