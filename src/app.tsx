import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router';
import { Toaster } from 'sonner';

import { AuthPage } from '@/routes/auth-page';
import { GroupPage } from '@/routes/group-page';
import { GroupsPage } from '@/routes/groups-page';
import { InvitePage } from '@/routes/invite-page';
import { NewTaskPage, TaskPage } from '@/routes/task-page';
import { TasksPage } from '@/routes/tasks-page';
import { Layout } from '@/shared/components/layout';
import { OfflineScreen, PwaControls } from '@/shared/components/pwa-controls';
import { ErrorState, Loading } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { useOnline } from '@/shared/hooks/use-online';
import { sessionOptions } from '@/shared/lib/query-options';

function ProtectedRoute() {
  const session = useQuery(sessionOptions);
  const location = useLocation();
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
  if (!session.data)
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  return <Outlet />;
}

function RouteEffects() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${location.pathname.startsWith('/groups') ? 'Группы' : location.pathname.startsWith('/invite') ? 'Приглашение' : location.pathname.startsWith('/login') ? 'Вход' : location.pathname.startsWith('/register') ? 'Регистрация' : 'Задачи'} — Рядом`;
  }, [location.pathname]);
  return null;
}

function AppContent() {
  const online = useOnline();
  return (
    <>
      <div inert={!online}>
        <RouteEffects />
        <Routes>
          <Route path='/login' element={<AuthPage key='login' />} />
          <Route
            path='/register'
            element={<AuthPage key='register' register />}
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to='/tasks' replace />} />
              <Route path='tasks' element={<TasksPage />} />
              <Route path='tasks/new' element={<NewTaskPage />} />
              <Route path='tasks/:id' element={<TaskPage />} />
              <Route path='tasks/:id/edit' element={<TaskPage edit />} />
              <Route path='groups' element={<GroupsPage />} />
              <Route path='groups/:id' element={<GroupPage />} />
              <Route path='invite/:token' element={<InvitePage />} />
              <Route
                path='*'
                element={
                  <div className='min-h-60 py-[45px] px-5 flex items-center justify-center flex-col gap-3.5 text-center [&_h1]:text-[27px] [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-medium [&_h2]:tracking-[-0.3px]'>
                    <h1>Страница не найдена</h1>
                    <Button asChild>
                      <Link to='/tasks'>К задачам</Link>
                    </Button>
                  </div>
                }
              />
            </Route>
          </Route>
        </Routes>
        <PwaControls />
      </div>
      <OfflineScreen />
      <Toaster
        position='top-center'
        richColors
        closeButton
        toastOptions={{ className: '[font-family:inherit]' }}
      />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
