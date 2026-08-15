'use client';

import type { ProjectMedia } from '@/lib/projects';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

type ProjectMediaStripProps = {
  mediaItems: ProjectMedia[];
  title: string;
};

function getVimeoEmbedUrl(src: string): string | null {
  const match = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

export default function ProjectMediaStrip({
  mediaItems,
  title,
}: ProjectMediaStripProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});
  // Photos and videos are both browsable in the lightbox (arrow keys/buttons);
  // only 'link' items stay strip-only.
  const lightboxItems = useMemo(
    () => mediaItems.filter((item) => item.type === 'photo' || item.type === 'video'),
    [mediaItems]
  );
  const activePhoto =
    activePhotoIndex === null ? null : lightboxItems[activePhotoIndex];

  const closeLightbox = useCallback(() => setActivePhotoIndex(null), []);
  const showPreviousPhoto = useCallback(() => {
    setActivePhotoIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return (currentIndex - 1 + lightboxItems.length) % lightboxItems.length;
    });
  }, [lightboxItems.length]);
  const showNextPhoto = useCallback(() => {
    setActivePhotoIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return (currentIndex + 1) % lightboxItems.length;
    });
  }, [lightboxItems.length]);
  const updateImageRatio = useCallback((src: string, width: number, height: number) => {
    if (height === 0) {
      return;
    }

    setImageRatios((currentRatios) => ({
      ...currentRatios,
      [src]: width / height,
    }));
  }, []);

  useEffect(() => {
    if (!activePhoto) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft') {
        showPreviousPhoto();
      }

      if (event.key === 'ArrowRight') {
        showNextPhoto();
      }
    };

    document.body.classList.add('overflow-hidden');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePhoto, closeLightbox, showNextPhoto, showPreviousPhoto]);

  return (
    <>
      <section
        aria-label='Visual Documentation'
        className='no-scrollbar -me-8 overflow-x-auto sm:-me-16 lg:-me-24'
      >
        <div className='flex w-max items-start gap-4 pb-3'>
          {mediaItems.map((item) => {
            const lightboxIndex = lightboxItems.findIndex(
              (lightboxItem) => lightboxItem.src === item.src
            );
            const imageRatio = imageRatios[item.src];
            const mediaWidth = imageRatio
              ? `clamp(12rem, ${Math.min(imageRatio * 24, 34).toFixed(2)}rem, 34rem)`
              : undefined;

            return (
              <figure
                key={item.src}
                className='shrink-0'
                style={mediaWidth ? { width: mediaWidth } : undefined}
              >
                <div className='relative h-72 w-full overflow-hidden bg-black/5 sm:h-80 lg:h-96'>
                  {item.type === 'video' ? (
                    <>
                      {getVimeoEmbedUrl(item.src) ? (
                        <iframe
                          src={getVimeoEmbedUrl(item.src) ?? undefined}
                          title={item.description || title}
                          className='h-full w-full'
                          allow='autoplay; fullscreen; picture-in-picture'
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={item.src}
                          controls
                          className='h-full w-full object-cover'
                        />
                      )}
                      <button
                        type='button'
                        aria-label='Open video in fullscreen'
                        onClick={() => setActivePhotoIndex(lightboxIndex)}
                        className='absolute bottom-2 right-2 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/70 text-lg leading-none text-white hover:bg-black/85'
                      >
                        ⤢
                      </button>
                    </>
                  ) : item.type === 'link' ? (
                    <a
                      href={item.src}
                      className='flex h-full w-full items-center justify-center bg-white/40 p-6 text-center text-sm leading-6 text-[#24211d] underline decoration-[#7f242a] underline-offset-4'
                      target='_blank'
                      rel='noreferrer'
                    >
                      {item.description || item.src}
                    </a>
                  ) : (
                    <button
                      type='button'
                      aria-label='Open image'
                      onClick={() => setActivePhotoIndex(lightboxIndex)}
                      className='relative block h-full w-full cursor-pointer'
                    >
                      <Image
                        src={item.src}
                        alt={item.description || title}
                        fill
                        sizes='(min-width: 1024px) 544px, 78vw'
                        className='object-cover'
                        onLoadingComplete={(image) =>
                          updateImageRatio(
                            item.src,
                            image.naturalWidth,
                            image.naturalHeight
                          )
                        }
                      />
                    </button>
                  )}
                </div>
              </figure>
            );
          })}
        </div>
      </section>

      {activePhoto && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4 py-8'
          role='dialog'
          aria-modal='true'
          aria-label='Image lightbox'
          onClick={closeLightbox}
        >
          <button
            type='button'
            aria-label='Close lightbox'
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
            className='absolute right-4 top-4 z-10 cursor-pointer px-3 py-2 text-3xl leading-none text-white'
          >
            x
          </button>

          {lightboxItems.length > 1 && (
            <button
              type='button'
              aria-label='Previous image'
              onClick={(event) => {
                event.stopPropagation();
                showPreviousPhoto();
              }}
              className='absolute left-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer px-3 py-4 text-4xl leading-none text-white sm:left-6'
            >
              {'<'}
            </button>
          )}

          <figure
            className='flex h-full w-full max-w-6xl flex-col items-center justify-center gap-4'
            onClick={(event) => event.stopPropagation()}
          >
            {activePhoto.type === 'video' ? (
              getVimeoEmbedUrl(activePhoto.src) ? (
                <div className='relative h-[78vh] w-full'>
                  <iframe
                    src={getVimeoEmbedUrl(activePhoto.src) ?? undefined}
                    title={activePhoto.description || title}
                    className='h-full w-full'
                    allow='autoplay; fullscreen; picture-in-picture'
                    allowFullScreen
                  />
                </div>
              ) : (
                // Intentionally not forced to fill the box: sizing the
                // <video> to its own aspect ratio (instead of stretching it
                // with object-contain) keeps the native control bar the
                // width of the actual video instead of the full container,
                // which looks broken for portrait clips.
                <div className='flex h-[78vh] w-full items-center justify-center'>
                  <video
                    src={activePhoto.src}
                    controls
                    autoPlay
                    className='max-h-full max-w-full'
                  />
                </div>
              )
            ) : (
              <div className='relative h-[78vh] w-full'>
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.description || title}
                  fill
                  sizes='100vw'
                  className='object-contain'
                  priority
                />
              </div>
            )}
            {activePhoto.description && (
              <figcaption className='max-w-3xl text-center text-sm leading-6 text-white/85'>
                {activePhoto.description}
              </figcaption>
            )}
          </figure>

          {lightboxItems.length > 1 && (
            <button
              type='button'
              aria-label='Next image'
              onClick={(event) => {
                event.stopPropagation();
                showNextPhoto();
              }}
              className='absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer px-3 py-4 text-4xl leading-none text-white sm:right-6'
            >
              {'>'}
            </button>
          )}
        </div>
      )}
    </>
  );
}
