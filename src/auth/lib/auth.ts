import { apiFetch, authFetch } from '../../shared/lib/http-client.ts';
import type { Credentials, User } from './types.ts';

export const authApi = {
  register: (body: Credentials) =>
    authFetch<User>('/auth/register', { method: 'POST', body }),
  login: (body: Credentials) =>
    authFetch<User>('/auth/login', { method: 'POST', body }),
  logout: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
};
