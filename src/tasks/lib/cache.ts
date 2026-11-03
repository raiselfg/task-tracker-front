import { taskQueries, groupQueries } from '../../shared/lib/query-options.ts';
import { httpStatus } from '../../shared/lib/http-client.ts';
import { queryClient } from '../../shared/lib/query-client.ts';
import type { Task } from './types.ts';

export async function refreshTasks(task?: Task) {
  if (task) queryClient.setQueryData(taskQueries.detail(task.id), task);
  await queryClient.invalidateQueries({ queryKey: taskQueries.all });
}

export async function refreshTaskAfterError(error: unknown, id: string) {
  if ([403, 404, 409, 422].includes(httpStatus(error) ?? -1)) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: taskQueries.detail(id) }),
      queryClient.invalidateQueries({ queryKey: taskQueries.all }),
      queryClient.invalidateQueries({ queryKey: ['members'] }),
      queryClient.invalidateQueries({ queryKey: groupQueries.all }),
    ]);
  }
}
