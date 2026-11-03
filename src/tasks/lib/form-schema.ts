import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z
    .string()
    .regex(/\S/, 'Добавьте название — хотя бы один непробельный символ.'),
  description: z.string(),
  priority: z.enum(['low', 'normal', 'high'], { error: 'Выберите приоритет.' }),
  status: z.enum(['open', 'in_progress'], { error: 'Выберите статус.' }),
  group_id: z.string(),
  assignee_id: z.string(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
