import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Check,
  Link2Off,
  LoaderCircle,
  UsersRound,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { refreshMembership } from '@/groups/lib/cache';
import { groupApi } from '@/groups/lib/groups';
import { FormError, Loading } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import { httpStatus } from '@/shared/lib/http-client';
import { groupOptions } from '@/shared/lib/query-options';
import { cn } from '@/shared/lib/utils';

export function InvitePage() {
  const { token = '' } = useParams();
  const invitation = useQuery(groupOptions.invitation(token));
  const navigate = useNavigate();
  const accept = useMutation({
    mutationFn: () => groupApi.acceptInvitation(token),
    onSuccess: async (group) => {
      await refreshMembership();
      toast.success('Вы в группе');
      navigate(`/groups/${group.id}`, { replace: true });
    },
  });
  if (invitation.isPending) return <Loading label='Проверяем приглашение…' />;
  const invalid =
    httpStatus(invitation.error) === 404 || httpStatus(accept.error) === 404;
  return (
    <div className='grid place-items-center min-h-[65dvh] py-5 px-0 max-[680px]:min-h-[60dvh] max-[680px]:pt-0'>
      <section className='bg-card border border-border rounded-xl pt-[45px] pr-10.5 pb-7.5 pl-10.5 w-full max-w-120 text-center [&>p:not([data-field-hint])]:text-sm [&>p:not([data-field-hint])]:text-muted-foreground [&>p:not([data-field-hint])]:leading-[1.9] max-[680px]:pt-8 max-[680px]:pr-[23px] max-[680px]:pb-[23px] max-[680px]:pl-[23px]'>
        <span
          className={cn(
            `grid place-items-center w-[85px] h-[85px] mt-0 mr-auto mb-[27px] ml-auto bg-muted rounded-[28px] text-muted-foreground [&.invalid]:text-muted-foreground [&.invalid]:bg-muted ${invalid ? 'invalid' : ''}`,
          )}
        >
          {invalid ? (
            <Link2Off size={34} strokeWidth={1.5} />
          ) : (
            <UsersRound size={34} strokeWidth={1.5} />
          )}
        </span>
        <span className='block text-muted-foreground text-xs font-semibold tracking-[1.7px] mb-[13px] max-[680px]:text-[9px] max-[680px]:tracking-[1.6px] max-[680px]:mb-2.5'>
          {invalid ? 'ССЫЛКА НЕ ДЕЙСТВУЕТ' : 'ВАС ПРИГЛАСИЛИ'}
        </span>
        <h1 className='text-[27px] font-medium tracking-[-0.5px] mb-[17px] wrap-anywhere max-[680px]:text-[24px]'>
          {invalid
            ? 'Приглашение недоступно'
            : (invitation.data?.name ?? 'Не удалось открыть приглашение')}
        </h1>
        {invalid ? (
          <p>
            Ссылку отозвали или заменили, либо группа была удалена. Попросите
            владельца прислать новое приглашение.
          </p>
        ) : invitation.isError ? (
          <>
            <FormError error={invitation.error} />
            <Button
              variant='outline'
              onClick={() => {
                void invitation.refetch();
              }}
            >
              Попробовать снова
            </Button>
          </>
        ) : (
          <>
            <p>
              Присоединитесь к группе, чтобы вместе
              <br className='max-[680px]:hidden' /> создавать, распределять и
              выполнять задачи.
            </p>
            <div className='grid gap-[13px] text-left text-xs text-muted-foreground my-7 mx-0'>
              <span className='flex items-center gap-2.5'>
                <Check size={17} />
                Общие задачи в одном месте
              </span>
              <span className='flex items-center gap-2.5'>
                <Check size={17} />
                Каждый может помочь с любым делом
              </span>
            </div>
            <FormError error={accept.error} />
            <Button
              className='w-full'
              disabled={accept.isPending}
              onClick={() => accept.mutate()}
            >
              {accept.isPending ? (
                <LoaderCircle className='animate-spin' />
              ) : (
                <UsersRound />
              )}
              Вступить
              <ArrowRight />
            </Button>
            <p
              className='text-sm leading-[1.7] text-muted-foreground font-normal mt-3'
              data-field-hint
            >
              Вы вступите только после нажатия кнопки.
            </p>
          </>
        )}
        <Button variant='ghost' className='mt-4' asChild>
          <Link to='/tasks'>К моим задачам</Link>
        </Button>
      </section>
    </div>
  );
}
