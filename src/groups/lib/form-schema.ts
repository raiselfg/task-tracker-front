import { z } from 'zod';

export const groupFormSchema = z.object({
  name: z.string().regex(/\S/, 'Название не может состоять из пробелов.'),
});

export type GroupFormValues = z.infer<typeof groupFormSchema>;
