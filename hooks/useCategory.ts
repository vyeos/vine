'use client';

import { useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { getErrorMessage } from '@/lib/error-utils';
import { useMutationState } from '@/hooks/useMutationState';
import type { Category, CreateCategoryData } from '@/types/category';

export function useUserCategories(workspaceSlug: string) {
  const data = useQuery(
    api.categories.list,
    workspaceSlug ? { workspaceSlug } : 'skip',
  ) as Category[] | undefined;

  return {
    data: data ?? [],
    isLoading: !!workspaceSlug && data === undefined,
    isError: false,
  };
}

export function useCreateCategory(workspaceSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; data: CreateCategoryData },
    Category
  >(api.categories.create);

  return {
    ...mutation,
    mutateAsync: async (data: CreateCategoryData) => {
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, data });
        toast.success('Category created');
        return result;
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !error.message.toLowerCase().includes('already exists')
        ) {
          toast.error(getErrorMessage(error, 'Failed to create category'));
        }
        throw error;
      }
    },
  };
}

export function useUpdateCategory(workspaceSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; categorySlug: string; data: Partial<CreateCategoryData> },
    Category
  >(api.categories.update);

  return {
    ...mutation,
    mutateAsync: async ({
      categorySlug,
      data,
    }: {
      categorySlug: string;
      data: Partial<CreateCategoryData>;
    }) => {
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, categorySlug, data });
        toast.success('Category updated');
        return result;
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !error.message.toLowerCase().includes('already exists')
        ) {
          toast.error(getErrorMessage(error, 'Failed to update category'));
        }
        throw error;
      }
    },
  };
}

export function useDeleteCategory(workspaceSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; categorySlug: string },
    { success: boolean }
  >(api.categories.remove);

  return {
    ...mutation,
    mutateAsync: async (categorySlug: string) => {
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, categorySlug });
        toast.success('Category deleted');
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to delete category'));
        throw error;
      }
    },
  };
}
