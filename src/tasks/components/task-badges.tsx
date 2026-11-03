import { Badge } from '@/shared/components/ui/badge';
import { priorityLabels, statusLabels } from '@/tasks/lib/task-fields';
import type { TaskPriority, TaskStatus } from '@/tasks/lib/types';

const priorityVariants = {
  low: 'blue',
  normal: 'default',
  high: 'red',
} as const;
const statusVariants = {
  open: 'blue',
  in_progress: 'amber',
  completed: 'green',
} as const;
export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant={priorityVariants[priority]}>
      {priorityLabels[priority]}
    </Badge>
  );
}
export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>;
}
