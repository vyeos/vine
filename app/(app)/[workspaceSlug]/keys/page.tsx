import type { Metadata } from 'next';
import ApiKeysManager from '@/components/ApiKeys/ApiKeysManager';

export const metadata: Metadata = {
  title: 'API Keys',
};

export default function ApiKeysPage() {
  return <ApiKeysManager />;
}
