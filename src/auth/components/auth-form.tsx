import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';

import { authApi } from '@/auth/lib/auth';
import {
  credentialsSchema,
  type CredentialsValues,
} from '@/auth/lib/form-schema';
import { FormError } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import { setSession } from '@/shared/lib/query-client';

export function AuthForm({
  register,
  returnTo,
}: {
  register: boolean;
  returnTo: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const previousLogin =
    typeof location.state?.login === 'string' ? location.state.login : '';
  const form = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { login: previousLogin, password: '' },
  });
  const mutation = useMutation({
    mutationFn: register ? authApi.register : authApi.login,
    meta: { public: true },
    onSuccess: (user) => {
      if (register) {
        navigate(
          `/login?returnTo=${encodeURIComponent(returnTo)}&registered=1`,
          { replace: true, state: { login: user.login } },
        );
      } else {
        setSession(user);
        navigate(returnTo, { replace: true });
      }
    },
  });
  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      data-dirty={form.formState.isDirty}
      noValidate
      aria-describedby={mutation.error ? 'form-error' : undefined}
    >
      <fieldset
        disabled={mutation.isPending}
        className='flex flex-col max-[680px]:gap-5.5 gap-[21px]'
      >
        <Field>
          <FieldLabel htmlFor='login'>Логин</FieldLabel>
          <Input
            id='login'
            {...form.register('login')}
            minLength={3}
            maxLength={32}
            required
            autoComplete='username'
            autoCapitalize='none'
            spellCheck={false}
            aria-invalid={!!form.formState.errors.login}
            aria-describedby={
              form.formState.errors.login
                ? 'login-hint login-error'
                : 'login-hint'
            }
            placeholder='Ваш логин'
            autoFocus
          />
          <p
            id='login-hint'
            className='text-muted-foreground font-normal text-sm'
            data-field-hint
          >
            От 3 до 32 символов
          </p>
          <FieldError
            id='login-error'
            message={form.formState.errors.login?.message}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='password'>Пароль</FieldLabel>
          <div className='relative'>
            <Input
              id='password'
              {...form.register('password')}
              type={showPassword ? 'text' : 'password'}
              minLength={6}
              maxLength={128}
              required
              autoComplete={register ? 'new-password' : 'current-password'}
              placeholder='Не менее 6 символов'
              className='pr-12'
              aria-invalid={!!form.formState.errors.password}
              aria-describedby={
                form.formState.errors.password
                  ? 'password-hint password-error'
                  : 'password-hint'
              }
            />
            <button
              type='button'
              className='absolute right-[3px] top-0.5 w-11 h-11 grid place-items-center text-muted-foreground rounded-lg'
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          <p
            id='password-hint'
            className='text-muted-foreground font-normal text-sm'
            data-field-hint
          >
            От 6 до 128 символов
          </p>
          <FieldError
            id='password-error'
            message={form.formState.errors.password?.message}
          />
        </Field>
        <FormError error={mutation.error} />
        <Button className='w-full mt-1' type='submit'>
          {mutation.isPending ? (
            <LoaderCircle className='animate-spin' />
          ) : null}
          {register ? 'Создать аккаунт' : 'Войти'}
          {!mutation.isPending && <ArrowRight />}
        </Button>
      </fieldset>
    </form>
  );
}
