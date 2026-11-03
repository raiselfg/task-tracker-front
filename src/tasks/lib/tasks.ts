import { apiFetch } from '../../shared/lib/http-client.ts';
import type { Task, TaskCreate, TaskFilters, TaskUpdate } from './types.ts';

export const taskApi = {
  list: (filters: TaskFilters, signal?: AbortSignal) =>
    apiFetch<Task[]>('/tasks', { query: filters, signal }),
  detail: (id: string, signal?: AbortSignal) =>
    apiFetch<Task>(`/tasks/${id}`, { signal }),
  create: (body: TaskCreate) =>
    apiFetch<Task>('/tasks', { method: 'POST', body }),
  update: ({ id, changes }: { id: string; changes: TaskUpdate }) =>
    apiFetch<Task>(`/tasks/${id}`, { method: 'PATCH', body: changes }),
  remove: (id: string) => apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' }),
};
