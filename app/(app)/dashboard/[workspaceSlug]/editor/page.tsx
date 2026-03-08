'use client';

import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { Tiptap } from '@/components/editor/Tiptap';
import { useEditorContext } from '@/components/editor/editor-context';

export default function EditorPage() {
  const { workspaceSlug, editorRef } = useEditorContext();
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

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className='flex h-full w-full flex-col'>
        <Tiptap
          ref={editorRef}
          workspaceSlug={workspaceSlug}
          initialMarkdownImport={markdownImport}
        />
      </div>
    </ErrorBoundary>
  );
}
