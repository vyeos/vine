'use client';

import { Tiptap } from '@/components/editor/Tiptap';
import { useEditorContext } from '@/components/editor/editor-context';
import type { ProseMirrorJSON } from '@/components/editor/persistence';

type TiptapSurfaceProps = {
  initialContent?: ProseMirrorJSON | null;
  initialMarkdownImport?: string;
};

export function TiptapSurface({
  initialContent,
  initialMarkdownImport,
}: TiptapSurfaceProps) {
  const { editorRef } = useEditorContext();

  return (
    <Tiptap
      ref={editorRef}
      initialContent={initialContent}
      initialMarkdownImport={initialMarkdownImport}
    />
  );
}
