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

type PostMutationOptions<TResult> = {
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  postSlug?: string;
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
  ) as Post | null | undefined;

  return {
    data: data ?? null,
    isLoading: !!workspaceSlug && !!postSlug && data === undefined,
    isError: false,
  };
}

export function useCreatePost(workspaceSlug: string) {
  const mutation = useMutationState<{ workspaceSlug: string; data: ConvexPostPayload }, Post>(
    api.posts.create,
  );

  const createPost = async (
    data: CreatePostData,
    options?: PostMutationOptions<Post>,
  ) => {
    try {
      const result = await mutation.mutateAsync({
        workspaceSlug,
        data: {
          ...data,
          publishedAt: data.publishedAt?.getTime(),
        },
      });

      if (options?.showSuccessToast !== false) {
        toast.success(options?.successMessage ?? 'Post created successfully');
      }

      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      if (options?.showErrorToast !== false) {
        toast.error(
          getErrorMessage(error, options?.errorMessage ?? 'Failed to create post'),
        );
      }

      options?.onError?.(error);
      throw error;
    }
  };

  return {
    ...mutation,
    mutate: (data: CreatePostData, options?: PostMutationOptions<Post>) => {
      void createPost(data, options);
    },
    mutateAsync: createPost,
  };
}

export function useUpdatePost(workspaceSlug: string, postSlug: string) {
  const mutation = useMutationState<
    { workspaceSlug: string; postSlug: string; data: ConvexPostUpdatePayload },
    Post
  >(api.posts.update);

  const updatePost = async (
    data: UpdatePostData,
    options?: PostMutationOptions<Post>,
  ) => {
    const resolvedPostSlug = options?.postSlug ?? postSlug;
    if (!resolvedPostSlug) {
      throw new Error('Post slug is required to update a post');
    }

    try {
      const result = await mutation.mutateAsync({
        workspaceSlug,
        postSlug: resolvedPostSlug,
        data: {
          ...data,
          publishedAt: data.publishedAt?.getTime(),
        },
      });

      if (options?.showSuccessToast !== false) {
        toast.success(options?.successMessage ?? 'Post updated successfully');
      }

      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      if (options?.showErrorToast !== false) {
        toast.error(
          getErrorMessage(error, options?.errorMessage ?? 'Failed to update post'),
        );
      }

      options?.onError?.(error);
      throw error;
    }
  };

  return {
    ...mutation,
    mutate: (data: UpdatePostData, options?: PostMutationOptions<Post>) => {
      void updatePost(data, options);
    },
    mutateAsync: updatePost,
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
