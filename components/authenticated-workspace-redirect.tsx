'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUserWorkspaces } from '@/hooks/useWorkspace';
import { DEFAULT_WORKSPACE_ROUTE } from '@/lib/navigation';
import {
  deleteCookie,
  getLastWorkspaceSlugs,
  getWorkspacePath,
  LAST_WORKSPACE_COOKIE,
} from '@/lib/utils';

export function AuthenticatedWorkspaceRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useAuth();
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useUserWorkspaces();

  useEffect(() => {
    if (isLoading || isLoadingWorkspaces || !user) {
      return;
    }

    const { current: lastUsedWorkspaceSlug } = getLastWorkspaceSlugs();
    const fallbackWorkspaceSlug = workspaces[0]?.slug;
    const validLastUsedWorkspaceSlug = workspaces.find(
      (workspace) => workspace.slug === lastUsedWorkspaceSlug,
    )?.slug;

    if (lastUsedWorkspaceSlug && !validLastUsedWorkspaceSlug) {
      deleteCookie(LAST_WORKSPACE_COOKIE);
    }

    const destination = validLastUsedWorkspaceSlug
      ? getWorkspacePath(validLastUsedWorkspaceSlug, DEFAULT_WORKSPACE_ROUTE)
      : fallbackWorkspaceSlug
        ? getWorkspacePath(fallbackWorkspaceSlug, DEFAULT_WORKSPACE_ROUTE)
        : '/workspaces';

    if (pathname !== destination) {
      router.replace(destination);
    }
  }, [isLoading, isLoadingWorkspaces, pathname, router, user, workspaces]);

  return null;
}
