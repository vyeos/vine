'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { WorkspaceNavigationWarmup } from '@/components/WorkspaceNavigationWarmup';
import { Spinner } from '@/components/ui/spinner';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import { EditorLayout } from '@/components/EditorLayout';

function StandardDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams<{ workspaceSlug: string }>();
  const workspaceSlug = params.workspaceSlug;
  const { data: workspace, isLoading } = useWorkspaceVerification(workspaceSlug);

  useEffect(() => {
    if (!isLoading && !workspace) {
      router.replace('/workspaces');
    }
  }, [isLoading, router, workspace]);

  if (isLoading || !workspace) {
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Spinner className='size-5' />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='flex h-screen flex-col overflow-hidden'>
        <header className='flex h-16 shrink-0 items-center gap-2'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger />
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
  const isEditorRoute = pathname.includes(`/dashboard/${workspaceSlug}/editor`);

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
