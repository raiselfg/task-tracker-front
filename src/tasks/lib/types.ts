export type TaskStatus = 'open' | 'in_progress' | 'completed';

export type TaskPriority = 'low' | 'normal' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  creator_id: string;
  group_id: string | null;
  assignee_id: string | null;
  created_at: string;
}

export interface TaskCreate {
  title: string;
  description: string | null;
  priority: TaskPriority;
  group_id: string | null;
  assignee_id: string | null;
}

export type TaskUpdate = Partial<
  Pick<Task, 'title' | 'description' | 'priority' | 'status' | 'assignee_id'>
>;

export interface TaskFilters {
  group_id?: string;
  status?: TaskStatus;
  assignee_id?: string;
}
