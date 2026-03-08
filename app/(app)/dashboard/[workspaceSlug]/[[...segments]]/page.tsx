import { redirect } from 'next/navigation';
import { getWorkspacePath } from '@/lib/utils';

export default async function LegacyWorkspaceDashboardRedirect({
  params,
}: {
  params: Promise<{ workspaceSlug: string; segments?: string[] }>;
}) {
  const { workspaceSlug, segments = [] } = await params;
  const subpath = segments.join('/');
  redirect(
    subpath
      ? getWorkspacePath(workspaceSlug, subpath)
      : getWorkspacePath(workspaceSlug, 'dashboard'),
  );
}
