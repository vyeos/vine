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
import { getWorkspacePath } from '@/lib/utils';

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

    const basePath = getWorkspacePath(activeWorkspaceSlug, 'dashboard');
    const commonRoutes = [
      basePath,
      getWorkspacePath(activeWorkspaceSlug, 'editor'),
      getWorkspacePath(activeWorkspaceSlug, 'posts'),
      getWorkspacePath(activeWorkspaceSlug, 'authors'),
      getWorkspacePath(activeWorkspaceSlug, 'categories'),
      getWorkspacePath(activeWorkspaceSlug, 'tags'),
      getWorkspacePath(activeWorkspaceSlug, 'keys'),
    ];

    commonRoutes.forEach((route) => {
      void router.prefetch(route);
    });
  }, [activeWorkspaceSlug, router]);

  return null;
}
