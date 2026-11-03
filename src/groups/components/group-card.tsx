import { ArrowUpRight, UsersRound } from 'lucide-react';
import { Link } from 'react-router';

import type { Group } from '@/groups/lib/types';
import { groupIconStyles } from '@/shared/components/style-variants';
import { cn } from '@/shared/lib/utils';

export function GroupCard({
  group,
  index,
  currentUserId,
}: {
  group: Group;
  index: number;
  currentUserId?: string;
}) {
  return (
    <Link
      className='p-[23px] transition-[border-color,box-shadow] duration-200 hover:border-border hover:shadow-sm max-[680px]:p-[21px] bg-card border border-border rounded-xl'
      to={`/groups/${group.id}`}
    >
      <div className='flex justify-between items-start text-muted-foreground'>
        <span
          className={cn(
            'w-[53px] h-[53px] grid place-items-center rounded-xl',
            groupIconStyles[index % 4],
          )}
        >
          <UsersRound size={25} strokeWidth={1.6} />
        </span>
        <ArrowUpRight size={19} />
      </div>
      <h2 className='font-medium text-lg mt-6.5 wrap-anywhere max-[680px]:mt-4'>
        {group.name}
      </h2>
      <div className='text-xs text-muted-foreground flex flex-wrap justify-between gap-2.5 mt-[21px] max-[680px]:mt-[15px]'>
        <span>
          {group.owner_id === currentUserId ? 'Владелец' : 'Участник'}
        </span>
        <span>
          с{' '}
          {new Date(group.created_at).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      </div>
    </Link>
  );
}
