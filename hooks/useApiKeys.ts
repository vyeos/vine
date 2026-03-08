'use client';

import { useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useMutationState } from '@/hooks/useMutationState';
import { getErrorMessage } from '@/lib/error-utils';
import type {
  CreateWorkspaceApiKeyPayload,
  CreateWorkspaceApiKeyResponse,
  WorkspaceApiKey,
} from '@/types/api-key';

export function useWorkspaceApiKeys(workspaceSlug: string | undefined) {
  const data = useQuery(api.apiKeys.list, workspaceSlug ? { workspaceSlug } : 'skip') as
    | WorkspaceApiKey[]
    | undefined;

  return {
    data: data ?? [],
    isLoading: !!workspaceSlug && data === undefined,
    isError: false,
  };
}

export function useCreateWorkspaceApiKey(workspaceSlug: string | undefined) {
  const mutation = useMutationState<
    { workspaceSlug: string; data: CreateWorkspaceApiKeyPayload },
    CreateWorkspaceApiKeyResponse
  >(api.apiKeys.create);

  return {
    ...mutation,
    mutateAsync: async (data: CreateWorkspaceApiKeyPayload) => {
      if (!workspaceSlug) {
        throw new Error('Workspace slug is required');
      }
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, data });
        toast.success('API key created');
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to create API key'));
        throw error;
      }
    },
  };
}

export function useDeleteWorkspaceApiKey(workspaceSlug: string | undefined) {
  const mutation = useMutationState<
    { workspaceSlug: string; apiKeyId: string },
    { success: boolean }
  >(api.apiKeys.remove);

  return {
    ...mutation,
    mutateAsync: async (apiKeyId: string) => {
      if (!workspaceSlug) {
        throw new Error('Workspace slug is required');
      }
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, apiKeyId: apiKeyId as never });
        toast.success('API key deleted');
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to delete API key'));
        throw error;
      }
    },
  };
}
