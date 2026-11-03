import { groupQueries } from '../../shared/lib/query-options.ts';
import { httpStatus } from '../../shared/lib/http-client.ts';
import { queryClient } from '../../shared/lib/query-client.ts';

export async function refreshMembership() {
  // Leaving/removing members also changes task availability and assignments.
  await queryClient.cancelQueries({
    predicate: (query) => query.queryKey[0] !== 'session',
  });
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== 'session' && !query.isActive(),
  });
  await queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] !== 'session',
  });
}

export async function refreshGroupAfterError(error: unknown, id: string) {
  if ([403, 404, 409].includes(httpStatus(error) ?? -1)) {
    await queryClient.invalidateQueries({ queryKey: groupQueries.detail(id) });
    await queryClient.invalidateQueries({ queryKey: groupQueries.members(id) });
  }
}
