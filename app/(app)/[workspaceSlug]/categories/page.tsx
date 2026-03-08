import type { Metadata } from 'next';
import CategoriesManager from '@/components/Category/CategoryManager';

export const metadata: Metadata = {
  title: 'Categories',
};

export default function CategoriesPage() {
  return <CategoriesManager />;
}
