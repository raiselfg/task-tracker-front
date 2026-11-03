import { useQuery } from '@tanstack/react-query';
import { Check, UsersRound } from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router';

import { AuthForm } from '@/auth/components/auth-form';
import { Brand, ErrorState, Loading } from '@/shared/components/states';
import { Card } from '@/shared/components/ui/card';
import { sessionOptions } from '@/shared/lib/query-options';
import { safeReturnTo } from '@/shared/lib/return-to';

export function AuthPage({ register = false }: { register?: boolean }) {
  const session = useQuery(sessionOptions);
  const [params] = useSearchParams();
  const returnTo = safeReturnTo(params.get('returnTo'));

  if (session.isPending) return <Loading label='Проверяем сессию…' />;
  if (session.isError)
    return (
      <ErrorState
        error={session.error}
        retry={() => {
          void session.refetch();
        }}
      />
    );
  if (session.data) return <Navigate to={returnTo} replace />;

  return (
    <main className='flex min-h-dvh flex-col items-center justify-center gap-8 bg-muted/30 px-5 py-10'>
      <Brand />
      <Card className='w-full max-w-md'>
        <h1 className='text-2xl font-black tracking-tight'>
          {register ? 'Создать аккаунт' : 'Вход в Рядом'}
        </h1>
        <p className='mt-2 mb-6 text-sm leading-relaxed text-muted-foreground'>
          {register
            ? 'Личные задачи и общие планы в одном месте.'
            : 'Войдите, чтобы вернуться к своим делам.'}
        </p>
        {params.has('registered') && !register && (
          <div
            className='mb-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800'
            role='status'
          >
            <Check size={18} className='shrink-0' />
            Аккаунт создан. Теперь войдите.
          </div>
        )}
        {returnTo.startsWith('/invite/') && (
          <p className='mb-5 flex items-start gap-2 rounded-lg bg-muted p-3 text-sm'>
            <UsersRound size={18} className='shrink-0' />
            После входа вы вернётесь к приглашению.
          </p>
        )}
        <AuthForm register={register} returnTo={returnTo} />
        <p className='mt-6 text-center text-sm text-muted-foreground'>
          {register ? 'Уже есть аккаунт?' : 'Пока нет аккаунта?'}{' '}
          <Link
            className='font-medium text-foreground underline underline-offset-4'
            to={`/${register ? 'login' : 'register'}?returnTo=${encodeURIComponent(returnTo)}`}
          >
            {register ? 'Войти' : 'Зарегистрироваться'}
          </Link>
        </p>
      </Card>
      <p className='text-center text-xs leading-relaxed text-muted-foreground'>
        Личные задачи — только для вас.
        <br />
        Общие — для участников группы.
      </p>
    </main>
  );
}
