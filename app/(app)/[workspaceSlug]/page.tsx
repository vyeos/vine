import { redirect } from 'next/navigation';
import { DEFAULT_WORKSPACE_ROUTE } from '@/lib/navigation';
import { getWorkspacePath } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function WorkspaceIndexRedirect({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  redirect(getWorkspacePath(workspaceSlug, DEFAULT_WORKSPACE_ROUTE));
}
