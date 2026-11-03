import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import {
  abortPrivateRequests,
  apiFetch,
  authFetch,
  errorMessage,
  httpStatus,
} from '../src/shared/lib/http-client.ts';

Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
afterEach(() => {
  mock.restoreAll();
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: true,
  });
  abortPrivateRequests();
});

test('204 is not decoded and every request uses cookie and no-store', async () => {
  const fetch = mock.method(globalThis, 'fetch', async (url: unknown) =>
    String(url).endsWith('/auth/csrf')
      ? Response.json({ csrf_token: 'test-csrf-token' })
      : new Response(null, { status: 204 }),
  );
  assert.equal(
    await apiFetch('/tasks/id', {
      baseURL: 'https://api.example.test/api/v1/',
      method: 'DELETE',
    }),
    undefined,
  );
  const [url, options] = fetch.mock.calls.find(
    (call) => !String(call.arguments[0]).endsWith('/auth/csrf'),
  )!.arguments as [string, RequestInit];
  assert.equal(url, 'https://api.example.test/api/v1/tasks/id');
  assert.equal(options.credentials, 'include');
  assert.equal(options.cache, 'no-store');
});

test('offline write fails immediately instead of queuing or sending a request', async () => {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: false,
  });
  const fetch = mock.method(globalThis, 'fetch');
  await assert.rejects(
    apiFetch('/tasks', { method: 'POST', body: { title: 'Задача' } }),
    (error: unknown) => errorMessage(error).includes('Проверьте соединение'),
  );
  assert.equal(fetch.mock.callCount(), 0);
});

test('completed task conflicts preserve HTTP status and show a Russian explanation', async () => {
  mock.method(globalThis, 'fetch', async (url: unknown) =>
    String(url).endsWith('/auth/csrf')
      ? Response.json({ csrf_token: 'test-csrf-token' })
      : Response.json(
          { detail: 'Completed tasks are read-only' },
          { status: 409 },
        ),
  );
  await assert.rejects(
    apiFetch('/tasks/id', { method: 'PATCH', body: { title: 'Изменено' } }),
    (error: unknown) =>
      httpStatus(error) === 409 &&
      errorMessage(error).includes('только просмотр'),
  );
});

test('session reset aborts requests belonging to the previous account', async () => {
  let signal: AbortSignal | null | undefined;
  mock.method(
    globalThis,
    'fetch',
    async (_url: unknown, options?: RequestInit) => {
      signal = options?.signal;
      return Response.json({ id: 'test' });
    },
  );
  await apiFetch('/tasks');
  assert.equal(signal?.aborted, false);
  abortPrivateRequests();
  assert.equal(signal?.aborted, true);
});

test('public authentication is not tied to requests of an expired session', async () => {
  let signal: AbortSignal | null | undefined;
  mock.method(
    globalThis,
    'fetch',
    async (_url: unknown, options?: RequestInit) => {
      signal = options?.signal;
      return Response.json(
        String(_url).endsWith('/auth/csrf')
          ? { csrf_token: 'test-csrf-token' }
          : { id: 'new-user' },
      );
    },
  );
  await authFetch('/auth/login', {
    method: 'POST',
    body: { login: 'new-login', password: 'secret' },
  });
  abortPrivateRequests();
  assert.notEqual(signal?.aborted, true);
});

test('parallel writes share one CSRF bootstrap and send the token in a header', async () => {
  let bootstrap = 0;
  const headers: string[] = [];
  mock.method(
    globalThis,
    'fetch',
    async (url: unknown, options?: RequestInit) => {
      if (String(url).endsWith('/auth/csrf')) {
        bootstrap++;
        assert.equal(options?.credentials, 'include');
        assert.equal(options?.cache, 'no-store');
        return Response.json({ csrf_token: 'test-csrf-token' });
      }
      headers.push(new Headers(options?.headers).get('X-CSRF-Token') ?? '');
      return new Response(null, { status: 204 });
    },
  );
  await Promise.all([
    apiFetch('/tasks/first', { method: 'DELETE' }),
    apiFetch('/tasks/second', { method: 'DELETE' }),
  ]);
  assert.equal(bootstrap, 1);
  assert.deepEqual(headers, ['test-csrf-token', 'test-csrf-token']);
});

test('session reset discards the CSRF token before a new write', async () => {
  let bootstrap = 0;
  const headers: string[] = [];
  mock.method(
    globalThis,
    'fetch',
    async (url: unknown, options?: RequestInit) => {
      if (String(url).endsWith('/auth/csrf')) {
        return Response.json({ csrf_token: `test-csrf-${++bootstrap}` });
      }
      headers.push(new Headers(options?.headers).get('X-CSRF-Token') ?? '');
      return new Response(null, { status: 204 });
    },
  );
  await authFetch('/auth/login', { method: 'POST' });
  abortPrivateRequests();
  await apiFetch('/auth/logout', { method: 'POST' });
  assert.deepEqual(headers, ['test-csrf-1', 'test-csrf-2']);
});

test('CSRF rejection is never replayed and the next explicit attempt bootstraps again', async () => {
  let bootstrap = 0;
  let writes = 0;
  mock.method(globalThis, 'fetch', async (url: unknown) => {
    if (String(url).endsWith('/auth/csrf')) {
      bootstrap++;
      return Response.json({ csrf_token: 'test-csrf-token' });
    }
    writes++;
    return Response.json({ detail: 'CSRF validation failed' }, { status: 403 });
  });
  await assert.rejects(apiFetch('/tasks', { method: 'POST' }));
  assert.equal(writes, 1);
  assert.equal(bootstrap, 1);
  await assert.rejects(apiFetch('/tasks', { method: 'POST' }));
  assert.equal(writes, 2);
  assert.equal(bootstrap, 2);
});
