import { useQuery } from '@tanstack/react-query';
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';

import { QueryWarning } from '@/shared/components/states';
import { Field, FieldLabel } from '@/shared/components/ui/field';
import { Select } from '@/shared/components/ui/input';
import { groupOptions, sessionOptions } from '@/shared/lib/query-options';
import type { TaskFormValues } from '@/tasks/lib/form-schema';

export function TaskAssignmentFields({
  form,
  editing,
}: {
  form: UseFormReturn<TaskFormValues>;
  editing: boolean;
}) {
  const { data: user } = useQuery(sessionOptions);
  const groups = useQuery(groupOptions.list());
  const [groupId, assigneeId] = useWatch({
    control: form.control,
    name: ['group_id', 'assignee_id'],
  });
  const members = useQuery(groupOptions.members(groupId || null));
  const people = groupId ? (members.data ?? []) : user ? [user] : [];
  const unknownGroup =
    groupId &&
    groups.isSuccess &&
    !groups.data.some((group) => group.id === groupId);
  return (
    <div className='grid gap-6 sm:grid-cols-2'>
      <Field>
        <FieldLabel htmlFor='task-group'>Где задача</FieldLabel>
        <Controller
          name='group_id'
          control={form.control}
          render={({ field }) => (
            <Select
              {...field}
              id='task-group'
              disabled={!!editing || groups.isPending || groups.isError}
              onChange={(event) => {
                field.onChange(event);
                form.setValue('assignee_id', '', { shouldDirty: true });
              }}
            >
              <option value=''>Личная задача</option>
              {groups.data?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
              {unknownGroup && (
                <option value={groupId}>Группа недоступна</option>
              )}
            </Select>
          )}
        />
        <p
          className='text-sm leading-[1.7] text-muted-foreground font-normal'
          data-field-hint
        >
          {editing
            ? 'Принадлежность созданной задачи не меняется.'
            : groupId
              ? 'Задачу видят все участники группы.'
              : 'Личную задачу видите только вы.'}
        </p>
        {groups.isPending && (
          <p
            className='text-sm leading-[1.7] text-muted-foreground font-normal'
            data-field-hint
            role='status'
          >
            Загружаем группы…
          </p>
        )}
        {groups.isError && (
          <QueryWarning
            message='Не удалось загрузить группы.'
            retry={() => {
              void groups.refetch();
            }}
          />
        )}
        {unknownGroup && (
          <QueryWarning message='У вас больше нет доступа к этой группе.' />
        )}
      </Field>
      {(editing || !!groupId) && (
        <Field>
          <FieldLabel htmlFor='task-assignee'>Исполнитель</FieldLabel>
          <Controller
            name='assignee_id'
            control={form.control}
            render={({ field }) => (
              <Select
                {...field}
                id='task-assignee'
                disabled={!!groupId && !members.isSuccess}
              >
                <option value=''>Не назначена</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.login}
                    {person.id === user?.id ? ' (я)' : ''}
                  </option>
                ))}
                {assigneeId &&
                  !people.some((person) => person.id === assigneeId) && (
                    <option value={assigneeId}>
                      {members.isPending
                        ? 'Загружаем исполнителя…'
                        : members.isError
                          ? 'Исполнитель недоступен'
                          : 'Бывший участник'}
                    </option>
                  )}
              </Select>
            )}
          />
          <p
            className='text-sm leading-[1.7] text-muted-foreground font-normal'
            data-field-hint
          >
            {groupId
              ? 'Любой из участников группы.'
              : 'Можно назначить только себе.'}
          </p>
          {groupId && members.isPending && (
            <p
              className='text-sm leading-[1.7] text-muted-foreground font-normal'
              data-field-hint
              role='status'
            >
              Загружаем участников…
            </p>
          )}
          {members.isError && (
            <QueryWarning
              message='Участники недоступны.'
              retry={() => {
                void members.refetch();
              }}
            />
          )}
        </Field>
      )}
    </div>
  );
}
