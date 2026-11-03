import assert from 'node:assert/strict';
import test from 'node:test';
import { credentialsSchema } from '../src/auth/lib/form-schema.ts';
import { groupFormSchema } from '../src/groups/lib/form-schema.ts';
import { taskFormSchema } from '../src/tasks/lib/form-schema.ts';
import {
  checklistFormSchema,
  checklistTitleSchema,
} from '../src/checklists/lib/form-schema.ts';

test('checklist and item forms require a nonblank title and preserve the chosen group', () => {
  for (const title of ['', ' \n\t']) {
    assert.equal(checklistTitleSchema.safeParse({ title }).success, false);
    assert.equal(
      checklistFormSchema.safeParse({ title, group_id: '' }).success,
      false,
    );
  }
  assert.deepEqual(
    checklistFormSchema.parse({ title: 'Магазин', group_id: 'family' }),
    { title: 'Магазин', group_id: 'family' },
  );
});

test('credentials enforce backend lengths without trimming credentials', () => {
  assert.equal(
    credentialsSchema.safeParse({ login: 'ab', password: 'secret' }).success,
    false,
  );
  assert.equal(
    credentialsSchema.safeParse({ login: 'a'.repeat(33), password: 'secret' })
      .success,
    false,
  );
  assert.equal(
    credentialsSchema.safeParse({ login: 'valid', password: '12345' }).success,
    false,
  );
  assert.equal(
    credentialsSchema.safeParse({ login: 'valid', password: 'p'.repeat(129) })
      .success,
    false,
  );
  const values = { login: ' a ', password: ' secret ' };
  assert.deepEqual(credentialsSchema.parse(values), values);
});

test('task form rejects blank titles and terminal status; keeps optional fields empty', () => {
  const values = {
    title: 'Задача',
    description: '',
    priority: 'normal',
    status: 'open',
    group_id: '',
    assignee_id: '',
  };
  assert.deepEqual(taskFormSchema.parse(values), values);
  for (const title of ['', ' ', '\n\t']) {
    assert.equal(taskFormSchema.safeParse({ ...values, title }).success, false);
  }
  assert.equal(
    taskFormSchema.safeParse({ ...values, status: 'completed' }).success,
    false,
  );
  assert.equal(
    taskFormSchema.safeParse({ ...values, priority: 'urgent' }).success,
    false,
  );
});

test('group name matches the backend non-whitespace requirement without normalization', () => {
  assert.equal(groupFormSchema.safeParse({ name: '\t  ' }).success, false);
  assert.deepEqual(groupFormSchema.parse({ name: ' Семья ' }), {
    name: ' Семья ',
  });
});
