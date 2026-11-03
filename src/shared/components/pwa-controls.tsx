import { Download, RefreshCw, Share, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useOnline } from '@/shared/hooks/use-online';

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaControls() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [instructions, setInstructions] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [installed, setInstalled] = useState(
    () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && navigator.standalone === true),
  );
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration)
        window.addEventListener('focus', () => {
          if (navigator.onLine)
            void registration.update().catch(() => undefined);
        });
    },
    onRegisterError() {
      toast.error(
        'Не удалось подготовить работу без сети. Перезагрузите приложение при доступном соединении.',
      );
    },
  });
  useEffect(() => {
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const appInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', appInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', appInstalled);
    };
  }, []);
  async function install() {
    if (!prompt) {
      setInstructions(true);
      return;
    }
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  }
  return (
    <>
      {!installed && (
        <button
          className='relative flex w-fit mt-2 mr-[25px] mb-4.5 ml-auto items-center gap-[7px] text-xs text-muted-foreground min-h-11 p-2 rounded-[9px] max-[680px]:mt-0 max-[680px]:mr-5 max-[680px]:mb-[calc(69px_+_env(safe-area-inset-bottom))] max-[680px]:ml-auto'
          data-install-button
          onClick={() => {
            void install().catch(() => setInstructions(true));
          }}
        >
          <Download size={16} />
          <span>Установить приложение</span>
        </button>
      )}
      {needRefresh && (
        <aside
          className='fixed bottom-6 left-1/2 -translate-x-1/2 z-45 max-w-150 w-[calc(100%_-_32px)] bg-card border border-border rounded-[15px] p-[15px] shadow-sm flex items-center gap-[13px] max-[680px]:bottom-[calc(69px_+_env(safe-area-inset-bottom))] max-[680px]:gap-2 max-[680px]:p-3 max-[680px]:flex-wrap'
          role='status'
        >
          <RefreshCw
            className='text-muted-foreground shrink-0 max-[680px]:hidden'
            size={20}
          />
          <div className='flex-1'>
            <strong className='text-sm font-semibold max-[680px]:text-xs'>
              Доступна новая версия
            </strong>
          </div>
          <Button
            className='max-[680px]:min-h-10 max-[680px]:text-xs max-[680px]:p-[9px]'
            onClick={() => {
              if (document.querySelector('form[data-dirty="true"]'))
                setConfirmUpdate(true);
              else void updateServiceWorker(true);
            }}
          >
            Обновить
          </Button>
        </aside>
      )}
      <Dialog open={instructions} onOpenChange={setInstructions}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Установка приложения</DialogTitle>
          <ol className='mt-5.5 mr-0 mb-0 ml-0 p-0 list-none grid gap-5 text-sm leading-[1.8] text-muted-foreground'>
            <li className='flex gap-3'>
              <Download className='shrink-0 mt-[3px]' size={19} />
              <span>
                Компьютер: «Установить приложение» в меню браузера.
              </span>
            </li>
            <li className='flex gap-3'>
              <Share className='shrink-0 mt-[3px]' size={19} />
              <span>
                iPhone/iPad: Safari → «Поделиться» → «На экран Домой».
                Android: меню браузера → «Установить приложение».
              </span>
            </li>
          </ol>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmUpdate} onOpenChange={setConfirmUpdate}>
        <DialogContent>
          <DialogTitle>Обновить приложение?</DialogTitle>
          <DialogDescription>
            Обновление удалит несохранённые изменения формы.
          </DialogDescription>
          <div className='flex justify-end gap-2 mt-[25px] flex-wrap'>
            <Button variant='outline' onClick={() => setConfirmUpdate(false)}>
              Вернуться к форме
            </Button>
            <Button
              onClick={() => {
                void updateServiceWorker(true);
              }}
            >
              Обновить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function OfflineScreen() {
  const online = useOnline();
  if (online) return null;
  return (
    <div
      className='flex fixed inset-0 z-100 p-7.5 items-center justify-center flex-col text-center bg-muted'
      role='status'
      aria-live='polite'
    >
      <span className='w-18.5 h-18.5 grid place-items-center rounded-[22px] bg-muted text-muted-foreground mb-[5px]'>
        <WifiOff size={32} />
      </span>
      <h1 className='text-[29px] font-medium tracking-[-0.7px]'>
        Нет соединения
      </h1>
      <span className='flex items-center gap-2 mt-[35px] text-muted-foreground text-xs'>
        <span className='w-1.5 h-1.5 rounded-full bg-muted animate-pulse' />
        Ожидаем подключения
      </span>
    </div>
  );
}
