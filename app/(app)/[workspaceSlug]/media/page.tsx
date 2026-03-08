import type { Metadata } from 'next';
import MediaManager from '@/components/Media/MediaManager';

export const metadata: Metadata = {
  title: 'Media',
};

export default function MediaPage() {
  return <MediaManager />;
}
