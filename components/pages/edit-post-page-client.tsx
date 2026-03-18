'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useEditorContext } from '@/components/editor/editor-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useEditorDraft } from '@/hooks/useEditorPersistence';
import { usePost } from '@/hooks/usePost';
import { getWorkspacePath } from '@/lib/utils';
import type { PostMetadata } from '@/types/editor';
import { AlertCircle } from 'lucide-react';

const DynamicTiptapSurface = dynamic(
  () =>
    import('@/components/editor/TiptapSurface').then(
      (mod) => mod.TiptapSurface,
    ),
  {
    ssr: false,
    loading: () => (
      <div className='flex h-full items-center justify-center'>
        <div className='flex flex-col items-center gap-3 text-muted-foreground'>
          <Spinner className='h-8 w-8' />
          <p className='text-sm'>Loading editor...</p>
        </div>
      </div>
    ),
  },
);

export function EditPostPageClient() {
  const router = useRouter();
  const params = useParams<{ workspaceSlug: string; postSlug: string }>();
  const workspaceSlug = params.workspaceSlug;
  const postSlug = params.postSlug;
  const {
    setMetadata,
    setOriginalMetadata,
    setOriginalContent,
    hasUnsavedChangesRef,
    shouldSkipBlockerRef,
  } = useEditorContext();

  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(
    null,
  );
  const hasHydratedSourceRef = useRef(false);

  const { data: post, isLoading: isLoadingPost } = usePost(
    workspaceSlug || '',
    postSlug || '',
  );
  const { data: draft, isLoading: isLoadingDraft } = useEditorDraft(
    workspaceSlug || '',
    postSlug || '',
  );

  useEffect(() => {
    shouldSkipBlockerRef.current = false;
  }, [shouldSkipBlockerRef]);

  useEffect(() => {
    if (isLoadingPost || isLoadingDraft || hasHydratedSourceRef.current) {
      return;
    }

    const source = draft
      ? {
          title: draft.metadata.title,
          slug: draft.metadata.slug,
          excerpt: draft.metadata.excerpt,
          thumbnailMediaId: draft.metadata.thumbnailMediaId ?? null,
          author: draft.metadata.authorId ? { id: draft.metadata.authorId } : null,
          category: draft.metadata.categorySlug
            ? { slug: draft.metadata.categorySlug }
            : null,
          tags: draft.metadata.tagSlugs.map((tag) => ({ slug: tag })),
          publishedAt: draft.metadata.publishedAt
            ? new Date(draft.metadata.publishedAt).toISOString()
            : null,
          status: draft.metadata.status,
          contentJson: draft.contentJson,
        }
      : post
        ? {
            ...post,
            thumbnailMediaId: post.thumbnail?.id ?? null,
          }
        : null;

    if (!source) {
      return;
    }

    hasHydratedSourceRef.current = true;

    const postMetadata: PostMetadata = {
      title: source.title,
      slug: source.slug,
      excerpt: source.excerpt,
      thumbnailMediaId: source.thumbnailMediaId ?? null,
      authorId: source.author?.id,
      categorySlug: source.category?.slug,
      tagSlugs: source.tags.map((tag) => tag.slug),
      publishedAt: source.publishedAt ? new Date(source.publishedAt) : new Date(),
      status: source.status,
    };
    const serializedContent = source.contentJson
      ? JSON.stringify(source.contentJson)
      : null;

    setMetadata(postMetadata);
    setOriginalMetadata(postMetadata);
    setOriginalContent(serializedContent);
  }, [
    draft,
    isLoadingDraft,
    isLoadingPost,
    post,
    setMetadata,
    setOriginalContent,
    setOriginalMetadata,
  ]);

  const hasUnsavedChanges = useCallback(
    () => hasUnsavedChangesRef.current?.() ?? false,
    [hasUnsavedChangesRef],
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldSkipBlockerRef.current && hasUnsavedChanges()) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, shouldSkipBlockerRef]);

  const handleGoBack = useCallback(() => {
    if (hasUnsavedChanges()) {
      setShowWarningDialog(true);
      setPendingNavigation(() => () => {
        router.push(getWorkspacePath(workspaceSlug, 'posts'));
        setShowWarningDialog(false);
        setPendingNavigation(null);
      });
      return;
    }

    router.push(getWorkspacePath(workspaceSlug, 'posts'));
  }, [hasUnsavedChanges, router, workspaceSlug]);

  if (isLoadingPost || isLoadingDraft) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Spinner className='h-8 w-8' />
          <p className='text-sm text-muted-foreground'>Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className='flex h-full items-center justify-center p-6'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-destructive' />
              Post Not Found
            </CardTitle>
            <CardDescription>
              The requested post could not be loaded from this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoBack} className='w-full'>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className='flex h-full w-full flex-col'>
          <DynamicTiptapSurface
            initialContent={draft?.contentJson ?? post.contentJson ?? null}
          />
        </div>
      </ErrorBoundary>

      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowWarningDialog(false);
                setPendingNavigation(null);
              }}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={() => pendingNavigation?.()}>
              Leave Without Saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
