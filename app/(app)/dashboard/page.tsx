import { redirect } from 'next/navigation';

export default function LegacyDashboardIndexPage() {
  redirect('/workspaces');
}
