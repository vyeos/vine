'use client';

import { useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { getErrorMessage } from '@/lib/error-utils';
import { useMutationState } from '@/hooks/useMutationState';
import type { Author, CreateAuthorData } from '@/types/author';

export function useWorkspaceAuthors(workspaceSlug: string) {
  const data = useQuery(
    api.authors.list,
    workspaceSlug ? { workspaceSlug } : 'skip',
  ) as Author[] | undefined;

  return {
    data: data ?? [],
    isLoading: !!workspaceSlug && data === undefined,
    isError: false,
  };
}

export function useCreateAuthor(workspaceSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; data: CreateAuthorData },
    Author
  >(api.authors.create);

  return {
    ...mutation,
    mutateAsync: async (data: CreateAuthorData) => {
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, data });
        toast.success('Author created');
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to create author'));
        throw error;
      }
    },
    mutate: (
      data: CreateAuthorData,
      options?: { onSuccess?: (author: Author) => void; onError?: (error: unknown) => void },
    ) => {
      void mutation
        .mutateAsync({ workspaceSlug, data })
        .then((result) => {
          toast.success('Author created');
          options?.onSuccess?.(result);
        })
        .catch((error) => {
          toast.error(getErrorMessage(error, 'Failed to create author'));
          options?.onError?.(error);
        });
    },
  };
}

export function useUpdateAuthor(workspaceSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; authorId: string; data: Partial<CreateAuthorData> },
    Author
  >(api.authors.update);

  return {
    ...mutation,
    mutateAsync: async ({
      authorId,
      data,
    }: {
      authorId: string;
      data: Partial<CreateAuthorData>;
    }) => {
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, authorId, data });
        toast.success('Author updated');
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to update author'));
        throw error;
      }
    },
    mutate: (
      payload: { authorId: string; data: Partial<CreateAuthorData> },
      options?: { onSuccess?: (author: Author) => void; onError?: (error: unknown) => void },
    ) => {
      void mutation
        .mutateAsync({ workspaceSlug, authorId: payload.authorId, data: payload.data })
        .then((result) => {
          toast.success('Author updated');
          options?.onSuccess?.(result);
        })
        .catch((error) => {
          toast.error(getErrorMessage(error, 'Failed to update author'));
          options?.onError?.(error);
        });
    },
  };
}

export function useDeleteAuthor(workspaceSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; authorId: string },
    { success: boolean }
  >(api.authors.remove);

  return {
    ...mutation,
    mutateAsync: async (authorId: string) => {
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, authorId });
        toast.success('Author deleted');
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to delete author'));
        throw error;
      }
    },
  };
}
