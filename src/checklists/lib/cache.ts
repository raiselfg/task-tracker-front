import { httpStatus } from '../../shared/lib/http-client.ts';
import { queryClient } from '../../shared/lib/query-client.ts';
import {
  checklistQueries,
  groupQueries,
} from '../../shared/lib/query-options.ts';

export async function refreshChecklists(id?: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: checklistQueries.all }),
    ...(id
      ? [
          queryClient.invalidateQueries({
            queryKey: checklistQueries.detail(id),
          }),
        ]
      : []),
  ]);
}

export async function refreshChecklistAfterError(error: unknown, id: string) {
  if ([403, 404, 409, 422].includes(httpStatus(error) ?? -1)) {
    await Promise.all([
      refreshChecklists(id),
      queryClient.invalidateQueries({ queryKey: groupQueries.all }),
    ]);
  }
}
