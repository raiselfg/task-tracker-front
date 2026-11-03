import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { User } from '../../auth/lib/types.ts';
import { abortPrivateRequests, apiFetch, httpStatus } from './http-client.ts';

const sessionKey = ['session'] as const;

function clearPrivateCache() {
  abortPrivateRequests();
  void queryClient.cancelQueries({
    predicate: (query) => query.queryKey[0] !== 'session',
  });
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== 'session',
  });
  queryClient.getMutationCache().clear();
}

export function setSession(user: User | null) {
  void queryClient.cancelQueries({ queryKey: sessionKey });
  clearPrivateCache();
  queryClient.setQueryData(sessionKey, user);
}

function handleUnauthorized(error: unknown) {
  if (httpStatus(error) === 401) {
    const wasSignedIn = !!queryClient.getQueryData(sessionKey);
    setSession(null);
    if (wasSignedIn) toast.info('Сессия завершена. Войдите снова.');
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleUnauthorized }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (!mutation.meta?.public) handleUnauthorized(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: true,
      retry: (attempt, error) =>
        attempt < 1 &&
        (httpStatus(error) === undefined || (httpStatus(error) ?? 0) >= 500),
    },
    // Never queue a write while offline: the user must explicitly retry it.
    mutations: { retry: false, networkMode: 'always' },
  },
});

export const sessionQuery = {
  queryKey: sessionKey,
  queryFn: async ({ signal }: { signal: AbortSignal }) => {
    try {
      return await apiFetch<User>('/auth/me', { signal });
    } catch (error) {
      if (httpStatus(error) === 401) {
        if (queryClient.getQueryData(sessionKey))
          toast.info('Сессия завершена. Войдите снова.');
        clearPrivateCache();
        return null;
      }
      throw error;
    }
  },
};
