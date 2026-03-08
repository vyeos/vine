'use client';

import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { useConvexAuth } from 'convex/react';
import { useMemo, useState } from 'react';
import { api } from '@/convex/_generated/api';

export function useAuth() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.users.viewer);

  const isLoading = authLoading || (isAuthenticated && viewer === undefined);

  return useMemo(
    () => ({
      data: viewer ?? null,
      isLoading,
      isError: false,
    }),
    [isLoading, viewer],
  );
}

export function useLogout() {
  const { signOut } = useAuthActions();
  const [isPending, setIsPending] = useState(false);

  return {
    isPending,
    mutate: async (
      _args: undefined,
      options?: { onSuccess?: () => void; onError?: (error: unknown) => void },
    ) => {
      setIsPending(true);
      try {
        await signOut();
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.(error);
      } finally {
        setIsPending(false);
      }
    },
  };
}
