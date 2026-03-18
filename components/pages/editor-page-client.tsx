'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useEditorContext } from '@/components/editor/editor-context';
import { Spinner } from '@/components/ui/spinner';
import { useEditorDraft } from '@/hooks/useEditorPersistence';
import type { PostMetadata } from '@/types/editor';

const NEW_POST_DRAFT_KEY = '__new__';

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

export function EditorPageClient() {
  const {
    workspaceSlug,
    hasUnsavedChangesRef,
    shouldSkipBlockerRef,
    setMetadata,
    setOriginalMetadata,
    setOriginalContent,
  } = useEditorContext();
  const [markdownImport] = useState<string | undefined>(() => {
    if (typeof window === 'undefined' || !workspaceSlug) {
      return undefined;
    }

    const storageKey = `vine-markdown-import-${workspaceSlug}`;
    const raw = sessionStorage.getItem(storageKey) || undefined;
    if (raw) {
      sessionStorage.removeItem(storageKey);
    }
    return raw;
  });
  const { data: draft, isLoading: isDraftLoading } = useEditorDraft(
    workspaceSlug,
    NEW_POST_DRAFT_KEY,
  );
  const hasHydratedDraftRef = useRef(false);

  useEffect(() => {
    if (isDraftLoading || hasHydratedDraftRef.current) {
      return;
    }

    hasHydratedDraftRef.current = true;

    if (!draft) {
      return;
    }

    const draftMetadata: PostMetadata = {
      title: draft.metadata.title,
      slug: draft.metadata.slug,
      excerpt: draft.metadata.excerpt,
      thumbnailMediaId: draft.metadata.thumbnailMediaId ?? null,
      authorId: draft.metadata.authorId,
      categorySlug: draft.metadata.categorySlug,
      tagSlugs: draft.metadata.tagSlugs,
      publishedAt: draft.metadata.publishedAt
        ? new Date(draft.metadata.publishedAt)
        : new Date(),
      status: draft.metadata.status,
    };

    setMetadata(draftMetadata);
    setOriginalMetadata(draftMetadata);
    setOriginalContent(
      draft.contentJson ? JSON.stringify(draft.contentJson) : null,
    );
  }, [
    draft,
    isDraftLoading,
    setMetadata,
    setOriginalContent,
    setOriginalMetadata,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldSkipBlockerRef.current && hasUnsavedChangesRef.current?.()) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChangesRef, shouldSkipBlockerRef]);

  if (isDraftLoading) {
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className='flex h-full w-full flex-col'>
        <DynamicTiptapSurface
          initialContent={draft?.contentJson ?? null}
          initialMarkdownImport={markdownImport}
        />
      </div>
    </ErrorBoundary>
  );
}
