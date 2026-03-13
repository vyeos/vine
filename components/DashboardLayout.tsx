'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Image from 'next/image';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { WorkspaceNavigationWarmup } from '@/components/WorkspaceNavigationWarmup';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import { EditorLayout } from '@/components/EditorLayout';
import { getWorkspacePath } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  posts: 'Posts',
  authors: 'Authors',
  categories: 'Categories',
  tags: 'Tags',
  media: 'Media',
  members: 'Members',
  keys: 'API Keys',
  settings: 'Settings',
};

const APP_SIDEBAR_COOKIE_NAME = 'app_sidebar_state_v2';

function getPageTitle(pathname: string, workspaceSlug: string): string {
  const basePath = getWorkspacePath(workspaceSlug);
  if (pathname === basePath) return 'Dashboard';

  const prefix = `${basePath}/`;
  if (!pathname.startsWith(prefix)) return '';
  const segment = pathname.slice(prefix.length).split('/')[0];
  return pageTitles[segment] ?? '';
}

function StandardDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams<{ workspaceSlug: string }>();
  const pathname = usePathname();
  const workspaceSlug = params.workspaceSlug;
  const { data: workspace, isLoading } = useWorkspaceVerification(workspaceSlug);
  const pageTitle = getPageTitle(pathname, workspaceSlug);

  useEffect(() => {
    if (!isLoading && !workspace) {
      router.replace('/workspaces');
    }
  }, [isLoading, router, workspace]);

  if (isLoading || !workspace) {
    return (
      <div className='flex h-screen w-screen flex-col items-center justify-center gap-4'>
        <Image
          src='/vine.png'
          alt='Vine'
          width={40}
          height={40}
          className='animate-pulse object-contain'
        />
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Spinner className='size-4' />
          <span className='text-sm'>Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider storageKey={APP_SIDEBAR_COOKIE_NAME}>
      <AppSidebar />
      <SidebarInset className='flex h-screen flex-col overflow-hidden'>
        <header className='flex h-16 shrink-0 items-center gap-2'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger />
            {pageTitle && (
              <>
                <Separator orientation='vertical' className='h-5' />
                <span className='text-sm font-medium text-foreground'>{pageTitle}</span>
              </>
            )}
          </div>
        </header>
        <main className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 pt-0'>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ workspaceSlug: string }>();
  const workspaceSlug = params.workspaceSlug;
  const isEditorRoute = pathname.startsWith(
    getWorkspacePath(workspaceSlug, 'editor'),
  );

  if (isEditorRoute) {
    return (
      <>
        <WorkspaceNavigationWarmup workspaceSlug={workspaceSlug} />
        <EditorLayout>{children}</EditorLayout>
      </>
    );
  }

  return (
    <>
      <WorkspaceNavigationWarmup workspaceSlug={workspaceSlug} />
      <StandardDashboardLayout>{children}</StandardDashboardLayout>
    </>
  );
}
