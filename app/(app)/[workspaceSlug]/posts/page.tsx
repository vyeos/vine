import type { Metadata } from 'next';
import PostsManager from '@/components/Post/PostsManager';

export const metadata: Metadata = {
  title: 'Posts',
};

export default function PostsPage() {
  return <PostsManager />;
}
