'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_WORKSPACE_ROUTE } from '@/lib/navigation';
import { getLastWorkspaceSlugs, getWorkspacePath } from '@/lib/utils';

export function AuthenticatedWorkspaceRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    const { current: lastUsedWorkspaceSlug } = getLastWorkspaceSlugs();

    if (!lastUsedWorkspaceSlug) {
      return;
    }

    const destination = getWorkspacePath(lastUsedWorkspaceSlug, DEFAULT_WORKSPACE_ROUTE);

    if (pathname !== destination) {
      router.replace(destination);
    }
  }, [isLoading, pathname, router, user]);

  return null;
}
