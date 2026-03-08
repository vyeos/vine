'use client';

import { useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useMutationState } from '@/hooks/useMutationState';
import { getErrorMessage } from '@/lib/error-utils';
import type { CreatePostData, Post, UpdatePostData } from '@/types/post';

type ConvexPostPayload = Omit<CreatePostData, 'publishedAt'> & {
  publishedAt?: number;
};

type ConvexPostUpdatePayload = Omit<UpdatePostData, 'publishedAt'> & {
  publishedAt?: number;
};

export function useWorkspacePosts(workspaceSlug: string) {
  const data = useQuery(api.posts.list, workspaceSlug ? { workspaceSlug } : 'skip') as
    | Post[]
    | undefined;

  return {
    data: data ?? [],
    isLoading: !!workspaceSlug && data === undefined,
    isError: false,
  };
}

export function usePost(workspaceSlug: string, postSlug: string) {
  const data = useQuery(
    api.posts.get,
    workspaceSlug && postSlug ? { workspaceSlug, postSlug } : 'skip',
  ) as Post | undefined;

  return {
    data,
    isLoading: !!workspaceSlug && !!postSlug && data === undefined,
    isError: false,
  };
}

export function useCreatePost(workspaceSlug: string) {
  const mutation = useMutationState<{ workspaceSlug: string; data: ConvexPostPayload }, Post>(
    api.posts.create,
  );

  return {
    ...mutation,
    mutateAsync: async (data: CreatePostData) => {
      try {
        const result = await mutation.mutateAsync({
          workspaceSlug,
          data: {
            ...data,
            publishedAt: data.publishedAt?.getTime(),
          },
        });
        toast.success('Post created successfully');
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to create post'));
        throw error;
      }
    },
  };
}

export function useUpdatePost(workspaceSlug: string, postSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; postSlug: string; data: ConvexPostUpdatePayload },
    Post
  >(api.posts.update);

  return {
    ...mutation,
    mutateAsync: async (data: UpdatePostData) => {
      try {
        const result = await mutation.mutateAsync({
          workspaceSlug,
          postSlug,
          data: {
            ...data,
            publishedAt: data.publishedAt?.getTime(),
          },
        });
        toast.success('Post updated successfully');
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to update post'));
        throw error;
      }
    },
  };
}

export function useDeletePost(workspaceSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; postSlug: string },
    { success: boolean }
  >(api.posts.remove);

  return {
    ...mutation,
    mutateAsync: async (postSlug: string) => {
      try {
        const result = await mutation.mutateAsync({ workspaceSlug, postSlug });
        toast.success('Post deleted successfully');
        return result;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to delete post'));
        throw error;
      }
    },
  };
}
