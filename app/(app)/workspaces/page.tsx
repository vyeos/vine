import { redirect } from 'next/navigation';
import { isAuthenticatedNextjs } from '@convex-dev/auth/nextjs/server';
import { WorkspacesPage } from '@/components/pages/workspaces-page';
import { getViewerAppDestination, getViewerNavigationPreferences } from '@/lib/server-navigation';

export const dynamic = 'force-dynamic';

export default async function WorkspacesRoutePage() {
  if (!(await isAuthenticatedNextjs())) {
    redirect('/sign-in');
  }

  const preferences = await getViewerNavigationPreferences();

  if (preferences && preferences.memberships.length > 0) {
    redirect((await getViewerAppDestination()) ?? '/');
  }

  return <WorkspacesPage />;
}
