import { z } from 'zod';

export const checklistTitleSchema = z.object({
  title: z.string().regex(/\S/, 'Введите название.'),
});

export const checklistFormSchema = checklistTitleSchema.extend({
  group_id: z.string(),
});

export type ChecklistTitleValues = z.infer<typeof checklistTitleSchema>;
export type ChecklistFormValues = z.infer<typeof checklistFormSchema>;
