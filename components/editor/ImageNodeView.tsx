import { NodeViewWrapper } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { thumbHashToDataURL } from 'thumbhash';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { useMedia } from '@/hooks/useMedia';
import type { NodeViewProps } from '@tiptap/react';
import { ImageIcon } from 'lucide-react';

export function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const src = node.attrs.src;
  const alt = (node.attrs.alt as string) || '';
  const mediaId = node.attrs['data-media-id'];
  const workspaceSlug = useWorkspaceSlug();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [placeholderUrl, setPlaceholderUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const { data: mediaItems = [] } = useMedia(workspaceSlug || '');

  useEffect(() => {
    if (!mediaId || !mediaItems.length) return;

    const media = mediaItems.find((m) => m.id === mediaId);
    if (!media) return;

    if (media.aspectRatio) {
      setAspectRatio(media.aspectRatio);
    }

    if (media.thumbhashBase64 && !imageLoaded) {
      try {
        const thumbhashBytes = Uint8Array.from(
          atob(media.thumbhashBase64),
          (c) => c.charCodeAt(0),
        );
        const dataUrl = thumbHashToDataURL(thumbhashBytes);
        setPlaceholderUrl(dataUrl);
      } catch {
        setPlaceholderUrl(null);
      }
    }
  }, [mediaId, mediaItems, imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleAltChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateAttributes({ alt: e.target.value });
    },
    [updateAttributes],
  );

  const containerStyle = aspectRatio
    ? { aspectRatio: aspectRatio.toString() }
    : undefined;

  return (
    <NodeViewWrapper className='tiptap-image-wrapper'>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg ring-offset-background transition-shadow',
          selected && 'ring-2 ring-primary ring-offset-2',
        )}
        style={containerStyle}
      >
        {placeholderUrl && !imageLoaded && (
          <img
            src={placeholderUrl}
            alt=''
            className='absolute inset-0 w-full h-full object-cover'
            aria-hidden='true'
          />
        )}
        <img
          src={src}
          alt={alt}
          className={cn(
            'tiptap-image w-full h-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={handleImageLoad}
        />
      </div>
      {selected && (
        <div className='mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground'>
          <ImageIcon className='h-3 w-3 shrink-0' />
          <input
            type='text'
            value={alt}
            onChange={handleAltChange}
            placeholder='Add alt text for accessibility...'
            className='flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60'
          />
        </div>
      )}
    </NodeViewWrapper>
  );
}
