'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAcceptInvite } from '@/hooks/useMember';
import { INVITE_TOKEN_KEY } from '@/lib/invitations';
import { getWorkspacePath } from '@/lib/utils';

export function InviteAcceptanceBootstrap() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useAuth();
  const { isPending, mutate } = useAcceptInvite();
  const attemptedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === '/accept-invite' || isLoading || !user?.email || isPending) {
      return;
    }

    let token: string | null = null;

    try {
      token = sessionStorage.getItem(INVITE_TOKEN_KEY);
    } catch {
      return;
    }

    if (!token || attemptedTokenRef.current === token) {
      return;
    }

    attemptedTokenRef.current = token;
    mutate(token, {
      onSuccess: (result) => {
        try {
          sessionStorage.removeItem(INVITE_TOKEN_KEY);
        } catch {
          // Ignore sessionStorage failures.
        }

        router.replace(getWorkspacePath(result.workspaceSlug));
      },
    });
  }, [isLoading, isPending, mutate, pathname, router, user?.email]);

  return null;
}
