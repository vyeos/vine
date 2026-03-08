'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { PostMetadata } from '@/types/editor';
import { loadMetadata, saveMetadata } from '@/components/editor/persistence';
import type { TiptapHandle } from '@/components/editor/Tiptap';
import { EditorProvider } from '@/components/editor/editor-context';
import { EditorSidebar } from '@/components/EditorSidebar';
import { getCookie } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const EDITOR_SIDEBAR_COOKIE_NAME = 'editor_sidebar_state';

const getInitialMetadata = (): PostMetadata => ({
  title: '',
  slug: '',
  authorId: undefined,
  publishedAt: new Date(),
  excerpt: '',
  categorySlug: undefined,
  tagSlugs: [],
  visible: true,
  status: 'draft',
});

export function EditorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams<{ workspaceSlug: string; postSlug?: string }>();
  const workspaceSlug = params.workspaceSlug;
  const postSlug = params.postSlug;

  const { data: workspace, isLoading } = useWorkspaceVerification(workspaceSlug);
  const initialMetadataRef = useRef<PostMetadata>(getInitialMetadata());

  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof document === 'undefined') {
      return true;
    }

    const saved = getCookie(EDITOR_SIDEBAR_COOKIE_NAME);
    if (saved === 'false') return false;
    if (saved === 'true') return true;
    return true;
  });
  const [metadata, setMetadata] = useState<PostMetadata>(() => getInitialMetadata());
  const [originalMetadata, setOriginalMetadata] = useState<PostMetadata | null>(null);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const editorRef = useRef<TiptapHandle>(null);
  const shouldSkipBlockerRef = useRef<boolean>(false);
  const saveRef = useRef<(() => void) | null>(null);
  const hasUnsavedChangesRef = useRef<(() => boolean) | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingLeaveAction, setPendingLeaveAction] = useState<(() => void) | null>(null);

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveRef.current?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGoBack = useCallback(() => {
    const hasChanges = hasUnsavedChangesRef.current?.() ?? false;
    if (hasChanges && !shouldSkipBlockerRef.current) {
      setShowLeaveDialog(true);
      setPendingLeaveAction(() => () => {
        shouldSkipBlockerRef.current = true;
        router.back();
      });
      return;
    }
    router.back();
  }, [router]);

  useEffect(() => {
    setOriginalMetadata(null);
    setOriginalContent(null);
  }, [workspaceSlug, postSlug]);

  useEffect(() => {
    if (postSlug || originalMetadata !== null) {
      return;
    }
    setOriginalMetadata(initialMetadataRef.current);
  }, [originalMetadata, postSlug]);

  useEffect(() => {
    if (!workspaceSlug || postSlug) return;

    const savedMetadata = loadMetadata(workspaceSlug);
    if (savedMetadata) {
      setMetadata({
        ...getInitialMetadata(),
        ...savedMetadata,
        publishedAt: savedMetadata.publishedAt
          ? new Date(savedMetadata.publishedAt as string)
          : new Date(),
      });
    }
  }, [workspaceSlug, postSlug]);

  useEffect(() => {
    if (!workspaceSlug || postSlug) return;

    if (
      metadata.title ||
      metadata.excerpt ||
      metadata.categorySlug ||
      metadata.authorId ||
      metadata.tagSlugs?.length
    ) {
      saveMetadata(metadata, workspaceSlug);
    }
  }, [metadata, workspaceSlug, postSlug]);

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setMetadata((prev) => ({
      ...prev,
      title,
      slug,
    }));
  };

  useEffect(() => {
    if (!isLoading && !workspace) {
      router.replace('/workspaces');
    }
  }, [isLoading, router, workspace]);

  if (isLoading || !workspaceSlug || !workspace) {
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Spinner className='size-5' />
        </div>
      </div>
    );
  }

  return (
    <EditorProvider
      value={{
        isExpanded,
        setIsExpanded,
        metadata,
        setMetadata,
        onTitleChange,
        editorRef,
        workspaceSlug,
        postSlug,
        isEditing: !!postSlug,
        originalMetadata,
        setOriginalMetadata,
        originalContent,
        setOriginalContent,
        shouldSkipBlockerRef,
        saveRef,
        hasUnsavedChangesRef,
      }}
    >
      <SidebarProvider
        storageKey={EDITOR_SIDEBAR_COOKIE_NAME}
        open={isExpanded}
        onOpenChange={setIsExpanded}
        style={{ '--sidebar-width': '32rem' } as React.CSSProperties}
      >
        <SidebarInset className='flex h-screen flex-col overflow-hidden'>
          <header className='flex h-12 shrink-0 items-center gap-2'>
            <div className='flex w-full items-center justify-between px-4'>
              <Button variant='ghost' size='icon' onClick={handleGoBack} className='mr-2'>
                <X className='size-4' />
                <span className='sr-only'>Back</span>
              </Button>
              <SidebarTrigger />
            </div>
          </header>
          <main className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 pt-0'>
            <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
          </main>
        </SidebarInset>

        <Sidebar side='right' variant='floating' collapsible='offcanvas'>
          <EditorSidebar />
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>

      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => {
              setShowLeaveDialog(false);
              setPendingLeaveAction(null);
            }}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={() => {
              setShowLeaveDialog(false);
              pendingLeaveAction?.();
              setPendingLeaveAction(null);
            }}>
              Leave Without Saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EditorProvider>
  );
}
