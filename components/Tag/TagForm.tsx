'use client';

import type { Tag, CreateTagData } from '@/types/tag';
import { useEffect, useMemo, useState } from 'react';
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
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { slugify } from '@/lib/slug';

interface TagFormProps {
  initialData: Tag | null;
  onSave: (data: CreateTagData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function TagForm({
  initialData,
  onSave,
  onCancel,
  isSubmitting,
}: TagFormProps) {
  const isEditing = !!initialData;
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEditing);

  const formSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, 'Name is required')
          .max(30, 'Name must be at most 30 characters'),
        slug: z
          .string()
          .min(1, 'Slug is required')
          .max(50, 'Slug must be at most 50 characters')
          .regex(
            /^[a-z0-9-]+$/,
            'Slug can only contain lowercase letters, numbers, and hyphens',
          ),
      }),
    [],
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    setValue,
  } = useForm<CreateTagData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
    },
  });

  const focusFirstError = () => {
    setTimeout(() => {
      const nameInput = document.getElementById('name') as HTMLInputElement | null;
      const slugInput = document.getElementById('slug') as HTMLInputElement | null;

      if (errors.name && nameInput) {
        nameInput.focus();
        nameInput.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      } else if (errors.slug && slugInput) {
        slugInput.focus();
        slugInput.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  };

  const nameValue = useWatch({ control, name: 'name' });
  const slugValue = useWatch({ control, name: 'slug' });
  const slugField = register('slug', {
    onChange: () => {
      setIsSlugManuallyEdited(true);
    },
  });

  useEffect(() => {
    if (isEditing || !nameValue || isSlugManuallyEdited) {
      return;
    }

    const nextSlug = slugify(nameValue);
    if (nextSlug) {
      setValue('slug', nextSlug, { shouldValidate: true, shouldDirty: true });
    }
  }, [isEditing, isSlugManuallyEdited, nameValue, setValue]);

  const isValid = isEditing
    ? isDirty
    : nameValue &&
      nameValue.trim().length > 0 &&
      slugValue &&
      slugValue.trim().length > 0;

  const onSubmit = handleSubmit(
    async (data) => {
      if (!data.name || !data.name.trim() || !data.slug || !data.slug.trim()) {
        focusFirstError();
        return;
      }
      try {
        await onSave(data);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'Tag slug already exists in this workspace';

        if (message.toLowerCase().includes('already exists')) {
          setError('slug', {
            type: 'server',
            message,
          });
          setTimeout(() => {
            const slugInput = document.getElementById('slug') as HTMLInputElement | null;
            slugInput?.focus();
            slugInput?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }, 100);
          return;
        }
        throw error;
      }
    },
    () => {
      focusFirstError();
    },
  );

  return (
    <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Tag' : 'Create New Tag'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update the details for this tag.'
            : 'Add a new tag to your workspace.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              {...register('name')}
              placeholder="Tag name (e.g., 'JavaScript')"
              required
              className={
                errors.name
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {errors.name?.message && (
              <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                {errors.name.message}
              </p>
            )}
            <p className='text-xs text-muted-foreground'>Max 30 characters.</p>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='slug'>Slug</Label>
            <Input
              id='slug'
              {...slugField}
              placeholder="URL-friendly slug (e.g., 'javascript')"
              required
              className={
                errors.slug
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {errors.slug?.message && (
              <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                {errors.slug.message}
              </p>
            )}
            <p className='text-xs text-muted-foreground'>
              Lowercase letters, numbers, and hyphens only. Max 50 characters.
            </p>
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              variant='ghost'
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Saving...' : 'Save Tag'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
