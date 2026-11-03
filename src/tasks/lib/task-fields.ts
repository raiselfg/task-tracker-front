import type { Task, TaskUpdate } from './types.ts';

export const statusLabels = {
  open: 'Открыта',
  in_progress: 'В работе',
  completed: 'Выполнена',
} as const;
export const priorityLabels = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Высокий',
} as const;

export function taskChanges(
  task: Task,
  values: Pick<
    Task,
    'title' | 'description' | 'priority' | 'status' | 'assignee_id'
  >,
): TaskUpdate {
  const changes: TaskUpdate = {};
  if (values.title !== task.title) changes.title = values.title;
  if (values.description !== task.description)
    changes.description = values.description;
  if (values.priority !== task.priority) changes.priority = values.priority;
  if (values.status !== task.status) changes.status = values.status;
  if (values.assignee_id !== task.assignee_id)
    changes.assignee_id = values.assignee_id;
  return changes;
}

export function personName(
  id: string | null,
  people: { id: string; login: string }[],
  fallback = 'Бывший участник',
) {
  if (id === null) return 'Не назначена';
  return people.find((person) => person.id === id)?.login ?? fallback;
}
