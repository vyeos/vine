import type { Metadata } from 'next';
import TagsManager from '@/components/Tag/TagManager';

export const metadata: Metadata = {
  title: 'Tags',
};

export default function TagsPage() {
  return <TagsManager />;
}
