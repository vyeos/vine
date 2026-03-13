import { redirect } from 'next/navigation';
import {
  getViewerDefaultWorkspaceDestination,
  getViewerWorkspaceLandingDestination,
} from '@/lib/server-navigation';

export const dynamic = 'force-dynamic';

export default async function WorkspaceIndexRedirect({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  redirect(
    (await getViewerDefaultWorkspaceDestination()) ??
      (await getViewerWorkspaceLandingDestination(workspaceSlug)),
  );
}
