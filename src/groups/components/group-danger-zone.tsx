import { useMutation } from '@tanstack/react-query';
import { LogOut, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { refreshGroupAfterError, refreshMembership } from '@/groups/lib/cache';
import { groupApi } from '@/groups/lib/groups';
import type { Group } from '@/groups/lib/types';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { Button } from '@/shared/components/ui/button';

export function GroupDangerZone({
  group,
  owner,
}: {
  group: Group;
  owner: boolean;
}) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<'delete' | 'leave' | null>(null);
  const action = useMutation({
    mutationFn: async () => {
      if (confirm === 'delete') return groupApi.remove(group.id);
      if (confirm === 'leave') return groupApi.leave(group.id);
    },
    onSuccess: async () => {
      navigate('/groups', { replace: true });
      await refreshMembership();
      toast.success(
        confirm === 'delete' ? 'Группа удалена' : 'Вы вышли из группы',
      );
    },
    onError: (error) => refreshGroupAfterError(error, group.id),
  });
  return (
    <>
      <section className='mt-8 pt-[23px] pr-0 pb-0 pl-0 border-t border-t-border flex items-center justify-between gap-[25px] max-[680px]:flex-wrap max-[680px]:gap-[17px] max-[680px]:mt-6.5'>
        <div>
          <h2 className='text-sm font-medium text-muted-foreground'>
            {owner ? 'Удаление группы' : 'Выход из группы'}
          </h2>
          <p className='text-xs text-muted-foreground mt-[7px] leading-[1.8]'>
            {owner
              ? 'Группа, её задачи и чеклисты будут удалены навсегда.'
              : 'Ваши задачи останутся в группе, назначения на незавершённые задачи снимутся.'}
          </p>
        </div>
        <Button
          variant='outline'
          className='text-destructive whitespace-nowrap'
          onClick={() => setConfirm(owner ? 'delete' : 'leave')}
        >
          {owner ? <Trash2 /> : <LogOut />}
          {owner ? 'Удалить группу' : 'Выйти из группы'}
        </Button>
      </section>
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={
          confirm === 'delete' ? 'Удалить группу навсегда?' : 'Выйти из группы?'
        }
        description={
          confirm === 'delete' ? (
            <>
              «{group.name}», все её задачи, чеклисты с пунктами, членства
              и приглашение будут окончательно удалены. Учётные записи
              пользователей сохранятся. Это действие нельзя отменить.
            </>
          ) : (
            <>
              Вы потеряете доступ к группе «{group.name}». Ваши задачи останутся
              в группе, назначения на незавершённые задачи снимутся. Выполненные
              задачи сохранятся без изменений.
            </>
          )
        }
        confirmLabel={confirm === 'delete' ? 'Удалить навсегда' : 'Выйти'}
        onConfirm={() => action.mutateAsync()}
      />
    </>
  );
}
