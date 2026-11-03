import { useMutation, useQuery } from '@tanstack/react-query';
import { LayoutList, LogOut, UsersRound } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { authApi } from '@/auth/lib/auth';
import { DashboardSidebar } from '@/shared/components/dashboard-sidebar';
import { Brand } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { errorMessage, httpStatus } from '@/shared/lib/http-client';
import { setSession } from '@/shared/lib/query-client';
import { sessionOptions } from '@/shared/lib/query-options';

export function Layout() {
  const { data: user } = useQuery(sessionOptions);
  const navigate = useNavigate();
  const logout = useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch (error) {
        if (httpStatus(error) !== 401) throw error;
      }
    },
    onSuccess: () => {
      setSession(null);
      navigate('/login', { replace: true });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div className='min-h-dvh'>
      <a
        className='fixed -top-24 left-4 z-50 rounded-lg bg-card p-3 focus:top-2'
        href='#main-content'
      >
        Перейти к содержимому
      </a>
      <DashboardSidebar
        user={user}
        isLoggingOut={logout.isPending}
        onLogout={() => logout.mutate()}
      />
      <div className='flex min-h-dvh min-w-0 flex-col pb-[calc(52px+env(safe-area-inset-bottom))] min-[681px]:ml-64 min-[681px]:pb-0'>
        <header className='flex items-center justify-between gap-4 border-b px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 min-[681px]:hidden'>
          <Brand />
          <Button
            variant='ghost'
            className='min-w-0 max-w-1/2'
            aria-label='Выйти из аккаунта'
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOut />
            <span className='truncate'>{user?.login}</span>
          </Button>
        </header>
        <main
          id='main-content'
          tabIndex={-1}
          className='mx-auto w-full max-w-7xl flex-1 px-5 py-6 outline-none sm:px-8 lg:px-10'
        >
          <Outlet />
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}

function MobileNavigation() {
  return (
    <nav
      className='fixed inset-x-0 bottom-0 z-30 flex border-t bg-card min-[681px]:hidden'
      aria-label='Основная навигация на телефоне'
    >
      {[
        { to: '/tasks', label: 'Задачи', icon: LayoutList },
        { to: '/groups', label: 'Группы', icon: UsersRound },
      ].map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className='flex min-h-[calc(52px+env(safe-area-inset-bottom))] flex-1 flex-col items-center justify-center gap-0.5 pb-[env(safe-area-inset-bottom)] text-[11px] font-medium text-muted-foreground [&.active]:bg-primary/5 [&.active]:text-primary'
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
