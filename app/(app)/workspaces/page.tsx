import { redirect } from 'next/navigation';
import { isAuthenticatedNextjs } from '@convex-dev/auth/nextjs/server';
import { WorkspacesPage } from '@/components/pages/workspaces-page';

export const dynamic = 'force-dynamic';

export default async function WorkspacesRoutePage() {
  if (!(await isAuthenticatedNextjs())) {
    redirect('/sign-in');
  }

  return <WorkspacesPage />;
}
