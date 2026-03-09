'use client';

import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { getErrorMessage } from '@/lib/error-utils';
import type { ProfileOverview, UserLandingPage } from '@/types/auth';

export function useProfileOverview() {
  const data = useQuery(api.users.profileOverview) as ProfileOverview | null | undefined;

  return {
    data: data ?? null,
    isLoading: data === undefined,
    isError: false,
  };
}

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
        toast.success('Settings updated');
        options?.onSuccess?.();
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to update settings'));
        options?.onError?.(error);
      } finally {
        setIsPending(false);
      }
    },
  };
}

export function useUpdateAvatar() {
  const mutateRaw = useMutation(api.users.updateAvatar);
  const [isPending, setIsPending] = useState(false);

  return {
    isPending,
    mutate: async (
      data: { avatarMode: 'provider' | 'custom'; avatarUrl?: string },
      options?: { onSuccess?: () => void; onError?: (error: unknown) => void },
    ) => {
      setIsPending(true);
      try {
        await mutateRaw(data);
        toast.success('Avatar preferences updated');
        options?.onSuccess?.();
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to update avatar settings'));
        options?.onError?.(error);
      } finally {
        setIsPending(false);
      }
    },
  };
}

export function useUpdateProfilePreferences() {
  const mutateRaw = useMutation(api.users.updatePreferences);
  const [isPending, setIsPending] = useState(false);

  return {
    isPending,
    mutate: async (
      data: {
        defaultWorkspaceSlug?: string;
        defaultLandingPage: UserLandingPage;
        emailInvites: boolean;
        productUpdates: boolean;
        publishAlerts: boolean;
        apiUsageAlerts: boolean;
      },
      options?: { onSuccess?: () => void; onError?: (error: unknown) => void },
    ) => {
      setIsPending(true);
      try {
        await mutateRaw(data);
        toast.success('Preferences updated');
        options?.onSuccess?.();
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to update preferences'));
        options?.onError?.(error);
      } finally {
        setIsPending(false);
      }
    },
  };
}

export function useResetProfilePreferences() {
  const mutateRaw = useMutation(api.users.resetPreferences);
  const [isPending, setIsPending] = useState(false);

  return {
    isPending,
    mutate: async (
      _data: undefined,
      options?: { onSuccess?: () => void; onError?: (error: unknown) => void },
    ) => {
      setIsPending(true);
      try {
        await mutateRaw({});
        toast.success('Preferences reset to defaults');
        options?.onSuccess?.();
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to reset preferences'));
        options?.onError?.(error);
      } finally {
        setIsPending(false);
      }
    },
  };
}
