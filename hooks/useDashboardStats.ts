'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { DashboardStatsPayload } from '@/types/dashboard';

export function useDashboardStats(workspaceSlug?: string) {
  const data = useQuery(
    api.dashboard.stats,
    workspaceSlug ? { workspaceSlug } : 'skip',
  ) as DashboardStatsPayload | null | undefined;

  return {
    data: data ?? undefined,
    isLoading: !!workspaceSlug && data === undefined,
  };
}
