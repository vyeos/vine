'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { DashboardHeatmapPayload } from '@/types/dashboard';

export function useDashboardHeatmap(workspaceSlug?: string) {
  const data = useQuery(
    api.dashboard.heatmap,
    workspaceSlug ? { workspaceSlug } : 'skip',
  ) as DashboardHeatmapPayload | null | undefined;

  return {
    data: data ?? undefined,
    isLoading: !!workspaceSlug && data === undefined,
  };
}
