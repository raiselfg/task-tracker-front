import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import {
  queryClient,
  sessionQuery,
  setSession,
} from '../src/shared/lib/query-client.ts';

Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
afterEach(() => {
  mock.restoreAll();
  queryClient.clear();
});

test('initial 401 finishes session loading and clears private data without cancelling itself', async () => {
  queryClient.setQueryData(['tasks', {}], [{ id: 'private-task' }]);
  queryClient.setQueryData(['invitation', 'private-token'], {
    name: 'Private group',
  });
  mock.method(globalThis, 'fetch', async () =>
    Response.json({ detail: 'Authentication required' }, { status: 401 }),
  );
  assert.equal(await queryClient.fetchQuery(sessionQuery), null);
  assert.equal(queryClient.getQueryState(['session'])?.status, 'success');
  assert.equal(queryClient.getQueryState(['session'])?.fetchStatus, 'idle');
  assert.equal(queryClient.getQueryData(['tasks', {}]), undefined);
  assert.equal(
    queryClient.getQueryData(['invitation', 'private-token']),
    undefined,
  );
});

test('logout/account change removes all previous private queries', () => {
  queryClient.setQueryData(
    ['tasks', { group_id: 'old-group' }],
    [{ id: 'old-task' }],
  );
  queryClient.setQueryData(['members', 'old-group'], [{ login: 'old-user' }]);
  setSession({
    id: 'new-user',
    login: 'new-login',
    created_at: '2026-11-02T10:00:00Z',
  });
  assert.deepEqual(
    queryClient
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey),
    [['session']],
  );
  assert.equal(
    queryClient.getQueryData<{ id: string }>(['session'])?.id,
    'new-user',
  );
  setSession(null);
  assert.equal(queryClient.getQueryData(['session']), null);
});
