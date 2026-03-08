'use client';

import { useParams } from 'next/navigation';

export function useWorkspaceSlug(): string | undefined {
  const params = useParams<{ workspaceSlug: string }>();
  return params.workspaceSlug;
}
