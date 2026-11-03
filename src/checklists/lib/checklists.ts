import { apiFetch } from '../../shared/lib/http-client.ts';
import type {
  Checklist,
  ChecklistCreate,
  ChecklistDetail,
  ChecklistItem,
} from './types.ts';

export const checklistApi = {
  list: (filters: { group_id?: string } = {}, signal?: AbortSignal) =>
    apiFetch<Checklist[]>('/checklists', { query: filters, signal }),
  detail: (id: string, signal?: AbortSignal) =>
    apiFetch<ChecklistDetail>(`/checklists/${id}`, { signal }),
  create: (body: ChecklistCreate) =>
    apiFetch<Checklist>('/checklists', { method: 'POST', body }),
  update: (id: string, title: string) =>
    apiFetch<Checklist>(`/checklists/${id}`, {
      method: 'PATCH',
      body: { title },
    }),
  remove: (id: string) =>
    apiFetch<void>(`/checklists/${id}`, { method: 'DELETE' }),
  addItem: (id: string, title: string) =>
    apiFetch<ChecklistItem>(`/checklists/${id}/items`, {
      method: 'POST',
      body: { title },
    }),
  updateItem: (
    id: string,
    itemId: string,
    body: { title?: string; checked?: boolean },
  ) =>
    apiFetch<ChecklistItem>(`/checklists/${id}/items/${itemId}`, {
      method: 'PATCH',
      body,
    }),
  removeItem: (id: string, itemId: string) =>
    apiFetch<void>(`/checklists/${id}/items/${itemId}`, { method: 'DELETE' }),
};
