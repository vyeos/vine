import { redirect } from 'next/navigation';
import { getViewerAppDestination } from '@/lib/server-navigation';

export const dynamic = 'force-dynamic';

export default async function SettingsRoutePage() {
  redirect((await getViewerAppDestination()) ?? '/');
}
