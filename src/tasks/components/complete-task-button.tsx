import { Check, Circle, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { Button } from '@/shared/components/ui/button';
import type { Task } from '@/tasks/lib/types';
import { useTaskStatusMutation } from '@/tasks/lib/use-task-status-mutation';

export function CompleteTaskButton({ task }: { task: Task }) {
  const [confirm, setConfirm] = useState(false);
  const complete = useTaskStatusMutation(task.id);

  if (task.status === 'completed')
    return (
      <span
        className='m-2.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700'
        aria-label='Выполнена'
      >
        <Check size={17} />
      </span>
    );

  return (
    <>
      <Button
        variant='ghost'
        className='shrink-0 px-3 text-muted-foreground'
        aria-label={`Выполнить задачу «${task.title}»`}
        disabled={complete.isPending}
        onClick={() => setConfirm(true)}
      >
        {complete.isPending ? (
          <LoaderCircle className='animate-spin' />
        ) : (
          <Circle />
        )}
      </Button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title='Выполнить задачу?'
        description={
          <>
            «{task.title}» будет доступна только для просмотра. Редактировать,
            удалить или открыть её заново не получится.
          </>
        }
        confirmLabel='Выполнить'
        onConfirm={() => complete.mutateAsync('completed')}
      />
    </>
  );
}
