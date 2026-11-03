import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  LayoutList,
  LoaderCircle,
  LogOut,
  UsersRound,
} from 'lucide-react';
import { NavLink } from 'react-router';

import type { User } from '@/auth/lib/types';
import { Brand } from '@/shared/components/states';
import { groupDotStyles } from '@/shared/components/style-variants';
import { Button } from '@/shared/components/ui/button';
import { groupOptions } from '@/shared/lib/query-options';
import { cn } from '@/shared/lib/utils';

export function DashboardSidebar({
  user,
  isLoggingOut,
  onLogout,
}: {
  user?: User | null;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  const groups = useQuery(groupOptions.list());

  return (
    <aside className='fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-card p-4 min-[681px]:flex'>
      <div className='border-b px-3 py-4'>
        <Brand />
      </div>
      <nav className='space-y-1 py-6' aria-label='Основная навигация'>
        {[
          { to: '/tasks', label: 'Задачи', icon: LayoutList },
          { to: '/groups', label: 'Группы', icon: UsersRound },
        ].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className='group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold tracking-wide text-muted-foreground transition-colors hover:bg-muted/50 [&.active]:bg-primary/5 [&.active]:text-primary'
          >
            <Icon size={19} />
            {label}
            <ChevronRight
              size={16}
              className='ml-auto opacity-0 group-[.active]:opacity-100'
            />
          </NavLink>
        ))}
      </nav>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <h2 className='mb-3 px-3 text-xs font-bold tracking-widest text-muted-foreground'>
          МОИ ГРУППЫ
        </h2>
        {groups.isPending ? (
          <p className='px-3 text-sm text-muted-foreground' role='status'>
            Загружаем группы…
          </p>
        ) : groups.isError ? (
          <button
            className='min-h-11 px-3 text-left text-sm text-muted-foreground underline'
            onClick={() => {
              void groups.refetch();
            }}
          >
            Не удалось загрузить. Повторить
          </button>
        ) : groups.data.length ? (
          groups.data.map((group, index) => (
            <NavLink
              key={group.id}
              to={`/groups/${group.id}`}
              className='flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted/50 [&.active]:bg-muted [&.active]:text-foreground'
            >
              <span
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  groupDotStyles[index % groupDotStyles.length],
                )}
              />
              <span className='truncate'>{group.name}</span>
            </NavLink>
          ))
        ) : (
          <p className='px-3 text-sm leading-relaxed text-muted-foreground'>
            Создайте группу, чтобы разделить дела с близкими.
          </p>
        )}
      </div>
      <div className='mt-6 flex items-center gap-3 border-t pt-4'>
        <span
          className='grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-sm font-bold'
          aria-hidden='true'
        >
          {user?.login.slice(0, 1).toUpperCase()}
        </span>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold' title={user?.login}>
            {user?.login}
          </p>
          <p className='text-xs text-muted-foreground'>Личный аккаунт</p>
        </div>
        <Button
          variant='ghost'
          className='px-3'
          aria-label='Выйти из аккаунта'
          disabled={isLoggingOut}
          onClick={onLogout}
        >
          {isLoggingOut ? (
            <LoaderCircle className='animate-spin' />
          ) : (
            <LogOut />
          )}
        </Button>
      </div>
    </aside>
  );
}
