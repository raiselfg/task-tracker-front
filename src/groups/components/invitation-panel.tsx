import { useMutation } from '@tanstack/react-query';
import { Copy, Link2, LoaderCircle, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { groupApi } from '@/groups/lib/groups';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { FormError } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { FieldLabel } from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import { queryClient } from '@/shared/lib/query-client';

export function InvitationPanel({ groupId }: { groupId: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<'create' | 'revoke' | null>(
    null,
  );
  const input = useRef<HTMLInputElement>(null);
  const create = useMutation({
    mutationFn: () => groupApi.createInvitation(groupId),
    onSuccess: async (invitation) => {
      setLink(`${window.location.origin}/invite/${invitation.token}`);
      await queryClient.invalidateQueries({ queryKey: ['invitation'] });
      toast.success('Ссылка-приглашение создана');
    },
  });
  const revoke = useMutation({
    mutationFn: () => groupApi.revokeInvitation(groupId),
    onSuccess: async () => {
      setLink(null);
      await queryClient.invalidateQueries({ queryKey: ['invitation'] });
      toast.success('Приглашение отозвано');
    },
  });
  return (
    <Card className='bg-muted/30 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-muted-foreground'>
      <span className='grid place-items-center w-12 h-12 bg-muted text-muted-foreground rounded-[14px] mb-5'>
        <Link2 size={24} />
      </span>
      <h2 className='text-lg font-medium mb-3 tracking-[-0.3px]'>
        Приглашение
      </h2>
      <p className='mb-4'>
        Ссылка многоразовая, без срока действия.
      </p>
      {link && (
        <div className='flex flex-col gap-2.5 my-[21px] mx-0'>
          <FieldLabel htmlFor='invitation-url'>Ссылка-приглашение</FieldLabel>
          <Input
            className='text-xs'
            ref={input}
            id='invitation-url'
            value={link}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button
            variant='outline'
            className='w-full'
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                toast.success('Ссылка скопирована');
              } catch {
                input.current?.select();
                toast.info('Выделили ссылку — скопируйте её вручную.');
              }
            }}
          >
            <Copy />
            Скопировать ссылку
          </Button>
          <p
            className='text-sm leading-[1.7] text-muted-foreground font-normal'
            data-field-hint
          >
            Скопируйте ссылку до ухода со страницы.
          </p>
        </div>
      )}
      <Button
        variant={link ? 'outline' : 'default'}
        className='w-full'
        onClick={() => {
          create.reset();
          revoke.reset();
          setConfirmation('create');
        }}
        disabled={create.isPending || revoke.isPending}
      >
        {create.isPending ? (
          <LoaderCircle className='animate-spin' />
        ) : (
          <Plus />
        )}
        {link ? 'Создать другую ссылку' : 'Создать ссылку'}
      </Button>
      <button
        className='block min-h-11 mt-[5px] mr-auto -mb-[5px] ml-auto text-muted-foreground underline text-xs'
        disabled={create.isPending || revoke.isPending}
        onClick={() => {
          create.reset();
          revoke.reset();
          setConfirmation('revoke');
        }}
      >
        Отозвать приглашение
      </button>
      <FormError error={create.error ?? revoke.error} />
      <ConfirmDialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
        title={
          confirmation === 'create'
            ? 'Создать новую ссылку?'
            : 'Отозвать приглашение?'
        }
        description={
          confirmation === 'create'
            ? 'Если у группы уже есть приглашение, прежняя ссылка сразу перестанет действовать. Участники группы сохранят доступ.'
            : 'Текущая ссылка перестанет действовать. Участники группы сохранят доступ. Позже вы сможете создать новую ссылку.'
        }
        confirmLabel={confirmation === 'create' ? 'Создать ссылку' : 'Отозвать'}
        onConfirm={() =>
          confirmation === 'create'
            ? create.mutateAsync()
            : revoke.mutateAsync()
        }
      />
    </Card>
  );
}
