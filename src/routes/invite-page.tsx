import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
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
        <h1 className='text-[27px] font-medium tracking-[-0.5px] mb-[17px] wrap-anywhere max-[680px]:text-[24px]'>
          {invalid
            ? 'Приглашение недоступно'
            : (invitation.data?.name ?? 'Не удалось открыть приглашение')}
        </h1>
        {invalid ? (
          <p>
            Попросите владельца группы прислать новую ссылку.
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
          </>
        )}
        <Button variant='ghost' className='mt-4' asChild>
          <Link to='/tasks'>К моим задачам</Link>
        </Button>
      </section>
    </div>
  );
}
