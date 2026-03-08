import type { Metadata } from 'next';
import MemberManager from '@/components/Member/MemberManager';

export const metadata: Metadata = {
  title: 'Members',
};

export default function MembersPage() {
  return <MemberManager />;
}
