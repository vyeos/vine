'use client';

import { useMutation, useQuery } from 'convex/react';
import { useConvexAuth } from 'convex/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import type {
  CreateWorkspaceData,
  UpdateWorkspaceData,
  UserWorkspace,
  VerifiedWorkspace,
} from '@/types/workspace';
import { getErrorMessage } from '@/lib/error-utils';

function useMutationState<TArgs, TResult>(mutationRef: Parameters<typeof useMutation>[0]) {
  const mutateRaw = useMutation(mutationRef as never);
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (args: TArgs): Promise<TResult> => {
    setIsPending(true);
    try {
      return (await mutateRaw(args as never)) as TResult;
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, mutateAsync };
}

export function useWorkspaceVerification(workspaceSlug?: string) {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const data = useQuery(
    api.workspaces.verifyForViewer,
    workspaceSlug ? { workspaceSlug } : 'skip',
  ) as VerifiedWorkspace | null | undefined;

  return {
    data: data ?? null,
    isLoading: authLoading || (!!workspaceSlug && isAuthenticated && data === undefined),
    error: null,
  };
}

export function useUserWorkspaces() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const data = useQuery(api.workspaces.listForViewer) as UserWorkspace[] | undefined;

  return useMemo(
    () => ({
      data: data ?? [],
      isLoading: authLoading || (isAuthenticated && data === undefined),
      isError: false,
    }),
    [authLoading, data, isAuthenticated],
  );
}

export function useCreateWorkspace() {
  const mutation = useMutationState<
    { name: string; slug: string },
    { id: string; slug: string }
  >(api.workspaces.create);

  return {
    ...mutation,
    mutateAsync: async (data: CreateWorkspaceData) => {
      try {
        const response = await mutation.mutateAsync({
          name: data.workspaceName,
          slug: data.workspaceSlug,
        });
        toast.success('Workspace created');
        return response;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to create workspace'));
        throw error;
      }
    },
  };
}

export function useUpdateWorkspace() {
  const mutation = useMutationState<
    { workspaceSlug: string; name: string },
    { success: boolean }
  >(api.workspaces.update);

  return {
    ...mutation,
    mutateAsync: async ({ workspaceSlug, data }: { workspaceSlug: string; data: UpdateWorkspaceData }) => {
      try {
        const response = await mutation.mutateAsync({
          workspaceSlug,
          name: data.name,
        });
        toast.success('Workspace updated');
        return response;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to update workspace'));
        throw error;
      }
    },
  };
}

export function useDeleteWorkspace() {
  const mutation = useMutationState<{ workspaceSlug: string }, { success: boolean }>(
    api.workspaces.remove,
  );

  return {
    ...mutation,
    mutateAsync: async (workspaceSlug: string) => {
      try {
        const response = await mutation.mutateAsync({ workspaceSlug });
        toast.success('Workspace deleted');
        return response;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to delete workspace'));
        throw error;
      }
    },
  };
}

export function useCheckSlugAvailability(slug: string | null) {
  const data = useQuery(
    api.workspaces.checkSlugAvailability,
    slug ? { slug } : 'skip',
  ) as { available: boolean } | undefined;

  return {
    data,
    isLoading: !!slug && data === undefined,
  };
}
