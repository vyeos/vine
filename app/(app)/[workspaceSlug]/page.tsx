import { redirect } from 'next/navigation';
import { getWorkspacePath } from '@/lib/utils';

export default async function WorkspaceIndexRedirect({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  redirect(getWorkspacePath(workspaceSlug, 'dashboard'));
}
