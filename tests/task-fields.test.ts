import assert from 'node:assert/strict';
import test from 'node:test';
import { safeReturnTo } from '../src/shared/lib/return-to.ts';
import { taskChanges } from '../src/tasks/lib/task-fields.ts';
import type { Task } from '../src/tasks/lib/types.ts';

const task: Task = {
  id: 'task-id',
  title: 'Задача',
  description: 'Описание',
  priority: 'normal',
  status: 'open',
  creator_id: 'author',
  group_id: 'group',
  assignee_id: 'member',
  created_at: '2026-11-02T10:00:00Z',
};

test('PATCH includes explicit clearing without immutable or unchanged fields', () => {
  const changes = taskChanges(task, {
    ...task,
    description: null,
    assignee_id: null,
  });
  assert.deepEqual(changes, { description: null, assignee_id: null });
  assert.deepEqual(taskChanges(task, { ...task, status: 'in_progress' }), {
    status: 'in_progress',
  });
  assert.deepEqual(taskChanges(task, task), {});
});

test('invitation return address survives auth; external redirects and loops are rejected', () => {
  assert.equal(
    safeReturnTo('/invite/valid-token?from=link'),
    '/invite/valid-token?from=link',
  );
  for (const unsafe of [
    null,
    '',
    'https://other.test',
    '//other.test',
    '/\\other.test',
    '/\r\nother',
    '/login?returnTo=/login',
    '/register',
  ]) {
    assert.equal(safeReturnTo(unsafe), '/tasks');
  }
});
