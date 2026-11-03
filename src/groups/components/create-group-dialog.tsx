import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import {
  groupFormSchema,
  type GroupFormValues,
} from '@/groups/lib/form-schema';
import { groupApi } from '@/groups/lib/groups';
import { FormError } from '@/shared/components/states';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import { queryClient } from '@/shared/lib/query-client';

export function CreateGroupDialog({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: { name: '' },
  });
  const mutation = useMutation({
    mutationFn: ({ name }: GroupFormValues) => groupApi.create(name),
    onSuccess: async (group) => {
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
      setOpen(false);
      form.reset();
      toast.success('Группа создана');
      navigate(`/groups/${group.id}`);
    },
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!mutation.isPending) {
          if (value) {
            mutation.reset();
            form.clearErrors();
          }
          setOpen(value);
        }
      }}
    >
      {children}
      <DialogContent>
        <DialogTitle>Новая группа</DialogTitle>
        <DialogDescription>
          Дайте название вашему общему пространству.
        </DialogDescription>
        <form
          className='mt-5'
          data-dirty={form.formState.isDirty}
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          noValidate
        >
          <Field>
            <FieldLabel htmlFor='group-name'>Название группы</FieldLabel>
            <Input
              id='group-name'
              required
              {...form.register('name')}
              disabled={mutation.isPending}
              aria-invalid={!!form.formState.errors.name}
              aria-describedby={
                form.formState.errors.name ? 'group-name-error' : undefined
              }
              placeholder='Например, Семья'
            />
            <FieldError
              id='group-name-error'
              message={form.formState.errors.name?.message}
            />
          </Field>
          <FormError error={mutation.error} />
          <div className='flex justify-end gap-2 mt-[25px] flex-wrap'>
            <Button
              variant='outline'
              disabled={mutation.isPending}
              type='button'
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending && <LoaderCircle className='animate-spin' />}
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
