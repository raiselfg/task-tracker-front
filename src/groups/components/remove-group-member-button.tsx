import { useMutation } from '@tanstack/react-query';
import { UserMinus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { User } from '@/auth/lib/types';
import { refreshGroupAfterError, refreshMembership } from '@/groups/lib/cache';
import { groupApi } from '@/groups/lib/groups';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { Button } from '@/shared/components/ui/button';

export function RemoveGroupMemberButton({
  groupId,
  member,
}: {
  groupId: string;
  member: User;
}) {
  const [open, setOpen] = useState(false);
  const remove = useMutation({
    mutationFn: () => groupApi.removeMember({ groupId, userId: member.id }),
    onSuccess: async () => {
      await refreshMembership();
      toast.success('Участник исключён');
    },
    onError: (error) => refreshGroupAfterError(error, groupId),
  });

  return (
    <>
      <Button
        variant='ghost'
        className='px-3 text-destructive'
        aria-label={`Исключить ${member.login}`}
        disabled={remove.isPending}
        onClick={() => setOpen(true)}
      >
        <UserMinus />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title='Исключить участника?'
        description={
          <>
            Участник {member.login} потеряет доступ к группе. Его задачи
            останутся, назначения на незавершённые задачи снимутся. Выполненные
            задачи сохранятся без изменений.
          </>
        }
        confirmLabel='Исключить'
        onConfirm={() => remove.mutateAsync()}
      />
    </>
  );
}
