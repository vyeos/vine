'use client';

import { useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useMutationState } from '@/hooks/useMutationState';
import { getErrorMessage } from '@/lib/error-utils';
import type { Media } from '@/types/media';

export function useMedia(workspaceSlug: string) {
  const data = useQuery(api.media.list, workspaceSlug ? { workspaceSlug } : 'skip') as
    | Media[]
    | undefined;

  return {
    data: data ?? [],
    isLoading: !!workspaceSlug && data === undefined,
    isError: false,
  };
}

export function useDeleteMedia(workspaceSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; mediaId: string },
    { success: boolean }
  >(api.media.remove);

  return {
    ...mutation,
    mutateAsync: async (mediaId: string) => {
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, mediaId: mediaId as never });
        toast.success('Media deleted successfully');
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to delete media'));
        throw error;
      }
    },
    mutate: (mediaId: string, options?: { onSuccess?: () => void; onError?: (error: unknown) => void }) => {
      void mutation
        .mutateAsync({ workspaceSlug, mediaId: mediaId as never })
        .then(() => {
          toast.success('Media deleted successfully');
          options?.onSuccess?.();
        })
        .catch((error) => {
          toast.error(getErrorMessage(error, 'Failed to delete media'));
          options?.onError?.(error);
        });
    },
  };
}
