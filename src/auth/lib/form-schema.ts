import { z } from 'zod';

export const credentialsSchema = z.object({
  login: z
    .string()
    .min(3, 'Логин должен содержать от 3 до 32 символов.')
    .max(32, 'Логин должен содержать от 3 до 32 символов.'),
  password: z
    .string()
    .min(6, 'Пароль должен содержать от 6 до 128 символов.')
    .max(128, 'Пароль должен содержать от 6 до 128 символов.'),
});

export type CredentialsValues = z.infer<typeof credentialsSchema>;
