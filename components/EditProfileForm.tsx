'use client';

import { useMemo, useRef } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useEditProfile } from '@/hooks/userProfile';
import type { User } from '@/types/auth';

interface EditProfileFormProps {
  user: User;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function EditProfileForm({ user, onCancel, onSuccess }: EditProfileFormProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, 'Please enter your name').optional(),
      }),
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<{ name?: string }>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name },
    mode: 'onChange',
  });

  const editProfileMutation = useEditProfile();
  const hasChanges = (watch('name') || '').trim() !== user.name;

  const focusFirstError = () => {
    setTimeout(() => {
      if (errors.name && nameInputRef.current) {
        nameInputRef.current.focus();
        nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Edit Account</CardTitle>
        <CardDescription>Update your display name. Email stays managed by Google.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(
            ({ name }) => {
              editProfileMutation.mutate(
                { name },
                {
                  onSuccess: () => onSuccess?.(),
                },
              );
            },
            () => focusFirstError(),
          )}
          className='space-y-4'
        >
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              type='text'
              placeholder='Enter your name'
              {...register('name')}
              ref={(element) => {
                register('name').ref(element);
                nameInputRef.current = element;
              }}
              className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.name?.message && (
              <p className='animate-in fade-in-50 slide-in-from-top-1 text-sm font-medium text-destructive'>
                {errors.name.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' value={user.email} disabled />
          </div>

          <div className='flex gap-2 pt-4'>
            <Button type='submit' disabled={editProfileMutation.isPending || !hasChanges} className='flex-1'>
              {editProfileMutation.isPending ? (
                <>
                  <Spinner className='mr-2' />
                  Updating...
                </>
              ) : (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  Save Changes
                </>
              )}
            </Button>
            <Button type='button' variant='outline' onClick={onCancel} disabled={editProfileMutation.isPending} className='flex-1'>
              <X className='mr-2 h-4 w-4' />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
