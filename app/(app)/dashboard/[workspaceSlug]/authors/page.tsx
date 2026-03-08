import type { Metadata } from 'next';
import AuthorsManager from '@/components/Author/AuthorsManager';

export const metadata: Metadata = {
  title: 'Authors',
};

export default function AuthorsPage() {
  return <AuthorsManager />;
}
