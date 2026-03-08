'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ErrorFallback } from '@/components/ErrorFallback';
import { Tiptap } from '@/components/editor/Tiptap';
import { usePost } from '@/hooks/usePost';
import { clearContent, clearMetadata } from '@/components/editor/persistence';
import { Spinner } from '@/components/ui/spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { useEditorContext } from '@/components/editor/editor-context';
import type { PostMetadata } from '@/types/editor';
import { getWorkspacePath } from '@/lib/utils';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ workspaceSlug: string; postSlug: string }>();
  const workspaceSlug = params.workspaceSlug;
  const postSlug = params.postSlug;
  const {
    metadata,
    setMetadata,
    editorRef,
    setOriginalMetadata,
    setOriginalContent,
    originalMetadata,
    originalContent,
    shouldSkipBlockerRef,
  } = useEditorContext();

  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const { data: post, isLoading: isLoadingPost } = usePost(workspaceSlug || '', postSlug || '');

  useEffect(() => {
    if (workspaceSlug) {
      clearContent(workspaceSlug);
      clearMetadata(workspaceSlug);
    }
    shouldSkipBlockerRef.current = false;
  }, [workspaceSlug, shouldSkipBlockerRef]);

  useEffect(() => {
    if (!post) {
      return;
    }

    const postMetadata: PostMetadata = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      authorId: post.author?.id,
      categorySlug: post.category?.slug,
      tagSlugs: post.tags.map((tag) => tag.slug),
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      visible: post.visible,
      status: post.status,
    };
    const serializedContent = post.contentJson ? JSON.stringify(post.contentJson) : null;

    setMetadata(postMetadata);
    setOriginalMetadata(postMetadata);
    setOriginalContent(serializedContent);
  }, [post, setMetadata, setOriginalMetadata, setOriginalContent]);

  const hasUnsavedChanges = useCallback(() => {
    if (!originalMetadata || !metadata) return false;

    const editor = editorRef.current?.editor;
    if (!editor) return false;

    const currentContent = JSON.stringify(editor.getJSON());
    const contentChanged = currentContent !== originalContent;

    const metadataChanged =
      metadata.title !== originalMetadata.title ||
      metadata.slug !== originalMetadata.slug ||
      metadata.excerpt !== originalMetadata.excerpt ||
      metadata.authorId !== originalMetadata.authorId ||
      metadata.categorySlug !== originalMetadata.categorySlug ||
      JSON.stringify(metadata.tagSlugs) !== JSON.stringify(originalMetadata.tagSlugs) ||
      metadata.visible !== originalMetadata.visible ||
      metadata.status !== originalMetadata.status ||
      metadata.publishedAt?.getTime() !== originalMetadata.publishedAt?.getTime();

    return contentChanged || metadataChanged;
  }, [editorRef, metadata, originalContent, originalMetadata]);

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

  if (isLoadingPost) {
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
          <Tiptap
            ref={editorRef}
            workspaceSlug={workspaceSlug}
            initialContent={post.contentJson || null}
            disablePersistence
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
            <Button variant='outline' onClick={() => {
              setShowWarningDialog(false);
              setPendingNavigation(null);
            }}>
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
