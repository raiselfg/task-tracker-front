import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import type { User } from '../../auth/lib/types.ts';
import type { Group } from '../../groups/lib/types.ts';
import { groupOptions } from '../../shared/lib/query-options.ts';

function combinePeople(results: UseQueryResult<User[]>[]) {
  const people = new Map<string, User>();
  for (const query of results)
    for (const person of query.data ?? []) people.set(person.id, person);
  return {
    data: [...people.values()],
    members: results.map((query) => query.data),
    isPending: results.some((query) => query.isPending),
    isError: results.some((query) => query.isError),
    refetch: () =>
      results.forEach((query) => {
        void query.refetch();
      }),
    retry: () =>
      results.forEach((query) => {
        if (query.isError) void query.refetch();
      }),
  };
}

export function useTaskPeople(groups: Group[] = []) {
  return useQueries({
    queries: groups.map((group) => groupOptions.members(group.id)),
    combine: combinePeople,
  });
}
