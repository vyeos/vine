'use client';

import { useMutation } from 'convex/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { getErrorMessage } from '@/lib/error-utils';

export function useEditProfile() {
  const mutateRaw = useMutation(api.users.updateDisplayName);
  const [isPending, setIsPending] = useState(false);

  return {
    isPending,
    mutate: async (
      data: { name?: string; email?: string },
      options?: { onSuccess?: () => void; onError?: (error: unknown) => void },
    ) => {
      setIsPending(true);
      try {
        await mutateRaw({ name: (data.name ?? '').trim() });
        toast.success('Profile updated');
        options?.onSuccess?.();
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to update profile'));
        options?.onError?.(error);
      } finally {
        setIsPending(false);
      }
    },
  };
}
