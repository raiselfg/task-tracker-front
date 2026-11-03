import type { User } from '../../auth/lib/types.ts';
import { apiFetch } from '../../shared/lib/http-client.ts';
import type { Group, Invitation, InvitationPreview } from './types.ts';

export const groupApi = {
  list: (signal?: AbortSignal) => apiFetch<Group[]>('/groups', { signal }),
  detail: (id: string, signal?: AbortSignal) =>
    apiFetch<Group>(`/groups/${id}`, { signal }),
  members: (id: string, signal?: AbortSignal) =>
    apiFetch<User[]>(`/groups/${id}/members`, { signal }),
  create: (name: string) =>
    apiFetch<Group>('/groups', { method: 'POST', body: { name } }),
  remove: (id: string) => apiFetch<void>(`/groups/${id}`, { method: 'DELETE' }),
  leave: (id: string) =>
    apiFetch<void>(`/groups/${id}/leave`, { method: 'POST' }),
  removeMember: ({ groupId, userId }: { groupId: string; userId: string }) =>
    apiFetch<void>(`/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    }),
  createInvitation: (id: string) =>
    apiFetch<Invitation>(`/groups/${id}/invitation`, { method: 'POST' }),
  revokeInvitation: (id: string) =>
    apiFetch<void>(`/groups/${id}/invitation`, { method: 'DELETE' }),
  invitation: (token: string, signal?: AbortSignal) =>
    apiFetch<InvitationPreview>(`/invitations/${encodeURIComponent(token)}`, {
      signal,
    }),
  acceptInvitation: (token: string) =>
    apiFetch<Group>(`/invitations/${encodeURIComponent(token)}/accept`, {
      method: 'POST',
    }),
};
