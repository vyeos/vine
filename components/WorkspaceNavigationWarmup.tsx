'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import { useWorkspacePosts } from '@/hooks/usePost';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardHeatmap } from '@/hooks/useDashboardHeatmap';
import { useWorkspaceAuthors } from '@/hooks/useAuthor';
import { useUserCategories } from '@/hooks/useCategory';
import { useWorkspaceTags } from '@/hooks/useTag';
import { useWorkspaceApiKeys } from '@/hooks/useApiKeys';

export function WorkspaceNavigationWarmup({
  workspaceSlug,
}: {
  workspaceSlug?: string;
}) {
  const router = useRouter();
  const { data: workspace } = useWorkspaceVerification(workspaceSlug);
  const activeWorkspaceSlug = workspace?.slug ?? '';

  useWorkspacePosts(activeWorkspaceSlug);
  useDashboardStats(activeWorkspaceSlug);
  useDashboardHeatmap(activeWorkspaceSlug);
  useWorkspaceAuthors(activeWorkspaceSlug);
  useUserCategories(activeWorkspaceSlug);
  useWorkspaceTags(activeWorkspaceSlug);
  useWorkspaceApiKeys(activeWorkspaceSlug || undefined);

  useEffect(() => {
    if (!activeWorkspaceSlug) return;

    const basePath = `/dashboard/${activeWorkspaceSlug}`;
    const commonRoutes = [
      basePath,
      `${basePath}/posts`,
      `${basePath}/authors`,
      `${basePath}/categories`,
      `${basePath}/tags`,
      `${basePath}/keys`,
      `${basePath}/editor`,
    ];

    commonRoutes.forEach((route) => {
      void router.prefetch(route);
    });
  }, [activeWorkspaceSlug, router]);

  return null;
}
