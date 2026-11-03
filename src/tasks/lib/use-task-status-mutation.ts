import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { errorMessage } from '@/shared/lib/http-client';
import { refreshTaskAfterError, refreshTasks } from '@/tasks/lib/cache';
import { taskApi } from '@/tasks/lib/tasks';
import type { TaskStatus } from '@/tasks/lib/types';

export function useTaskStatusMutation(id: string) {
  return useMutation({
    mutationFn: (status: TaskStatus) =>
      taskApi.update({ id, changes: { status } }),
    onSuccess: async (result) => {
      await refreshTasks(result);
      toast.success(
        result.status === 'completed' ? 'Задача выполнена' : 'Статус изменён',
      );
    },
    onError: async (error) => {
      await refreshTaskAfterError(error, id);
      toast.error(errorMessage(error));
    },
  });
}
