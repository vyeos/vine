import { redirect } from 'next/navigation';
import { AcceptInviteClient } from './client';

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect('/sign-in');
  }

  return <AcceptInviteClient token={token} />;
}
