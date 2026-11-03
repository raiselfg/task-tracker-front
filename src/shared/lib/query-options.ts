import { queryOptions } from '@tanstack/react-query';
import { checklistApi } from '../../checklists/lib/checklists.ts';
import { groupApi } from '../../groups/lib/groups.ts';
import { taskApi } from '../../tasks/lib/tasks.ts';
import type { TaskFilters } from '../../tasks/lib/types.ts';
import { sessionQuery } from './query-client.ts';

export const taskQueries = {
  all: ['tasks'] as const,
  list: (filters: TaskFilters = {}) => ['tasks', filters] as const,
  detail: (id: string) => ['task', id] as const,
};
export const groupQueries = {
  all: ['groups'] as const,
  detail: (id: string) => ['group', id] as const,
  members: (id: string) => ['members', id] as const,
  invitation: (token: string) => ['invitation', token] as const,
};

export const sessionOptions = queryOptions(sessionQuery);
export const checklistQueries = {
  all: ['checklists'] as const,
  detail: (id: string) => ['checklist', id] as const,
};
export const checklistOptions = {
  list: (filters: { group_id?: string } = {}) =>
    queryOptions({
      queryKey: [...checklistQueries.all, filters],
      queryFn: ({ signal }) => checklistApi.list(filters, signal),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: checklistQueries.detail(id),
      queryFn: ({ signal }) => checklistApi.detail(id, signal),
    }),
};
export const taskOptions = {
  list: (filters: TaskFilters = {}) =>
    queryOptions({
      queryKey: taskQueries.list(filters),
      queryFn: ({ signal }) => taskApi.list(filters, signal),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: taskQueries.detail(id),
      queryFn: ({ signal }) => taskApi.detail(id, signal),
    }),
};
export const groupOptions = {
  list: () =>
    queryOptions({
      queryKey: groupQueries.all,
      queryFn: ({ signal }) => groupApi.list(signal),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: groupQueries.detail(id),
      queryFn: ({ signal }) => groupApi.detail(id, signal),
    }),
  members: (id: string | null) =>
    queryOptions({
      queryKey: groupQueries.members(id ?? ''),
      queryFn: ({ signal }) => groupApi.members(id!, signal),
      enabled: !!id,
    }),
  invitation: (token: string) =>
    queryOptions({
      queryKey: groupQueries.invitation(token),
      queryFn: ({ signal }) => groupApi.invitation(token, signal),
    }),
};
