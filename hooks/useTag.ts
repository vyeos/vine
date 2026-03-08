'use client';

import { useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { getErrorMessage } from '@/lib/error-utils';
import { useMutationState } from '@/hooks/useMutationState';
import type { Tag, CreateTagData } from '@/types/tag';

export function useWorkspaceTags(workspaceSlug: string) {
  const data = useQuery(
    api.tags.list,
    workspaceSlug ? { workspaceSlug } : 'skip',
  ) as Tag[] | undefined;

  return {
    data: data ?? [],
    isLoading: !!workspaceSlug && data === undefined,
    isError: false,
  };
}

export function useCreateTag(workspaceSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; data: CreateTagData },
    Tag
  >(api.tags.create);

  return {
    ...mutation,
    mutateAsync: async (data: CreateTagData) => {
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, data });
        toast.success('Tag created');
        return result;
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !error.message.toLowerCase().includes('already exists')
        ) {
          toast.error(getErrorMessage(error, 'Failed to create tag'));
        }
        throw error;
      }
    },
  };
}

export function useUpdateTag(workspaceSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; tagSlug: string; data: Partial<CreateTagData> },
    Tag
  >(api.tags.update);

  return {
    ...mutation,
    mutateAsync: async ({
      tagSlug,
      data,
    }: {
      tagSlug: string;
      data: Partial<CreateTagData>;
    }) => {
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, tagSlug, data });
        toast.success('Tag updated');
        return result;
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !error.message.toLowerCase().includes('already exists')
        ) {
          toast.error(getErrorMessage(error, 'Failed to update tag'));
        }
        throw error;
      }
    },
  };
}

export function useDeleteTag(workspaceSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; tagSlug: string },
    { success: boolean }
  >(api.tags.remove);

  return {
    ...mutation,
    mutateAsync: async (tagSlug: string) => {
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, tagSlug });
        toast.success('Tag deleted');
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to delete tag'));
        throw error;
      }
    },
  };
}
