'use client';

import type { ProjectMedia } from '@/lib/projects';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

type ProjectMediaStripProps = {
  mediaItems: ProjectMedia[];
  title: string;
};

export default function ProjectMediaStrip({
  mediaItems,
  title,
}: ProjectMediaStripProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const photoItems = useMemo(
    () => mediaItems.filter((item) => item.type === 'photo'),
    [mediaItems]
  );
  const activePhoto =
    activePhotoIndex === null ? null : photoItems[activePhotoIndex];

  const closeLightbox = useCallback(() => setActivePhotoIndex(null), []);
  const showPreviousPhoto = useCallback(() => {
    setActivePhotoIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return (currentIndex - 1 + photoItems.length) % photoItems.length;
    });
  }, [photoItems.length]);
  const showNextPhoto = useCallback(() => {
    setActivePhotoIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return (currentIndex + 1) % photoItems.length;
    });
  }, [photoItems.length]);

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
        className='no-scrollbar -mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12'
      >
        <div className='flex w-max gap-4 pb-3'>
          {mediaItems.map((item) => {
            const photoIndex = photoItems.findIndex(
              (photo) => photo.src === item.src
            );

            return (
              <figure
                key={item.src}
                className='w-[78vw] max-w-[34rem] shrink-0 sm:w-[28rem]'
              >
                <div className='relative aspect-[4/3] w-full overflow-hidden bg-black/5'>
                  {item.type === 'video' ? (
                    <video
                      src={item.src}
                      controls
                      className='h-full w-full object-cover'
                    />
                  ) : item.type === 'link' ? (
                    <a
                      href={item.src}
                      className='flex h-full w-full items-center justify-center bg-white/40 p-6 text-center text-base leading-6 text-[#24211d] underline decoration-[#7f242a] underline-offset-4'
                      target='_blank'
                      rel='noreferrer'
                    >
                      {item.description || item.src}
                    </a>
                  ) : (
                    <button
                      type='button'
                      aria-label='Open image'
                      onClick={() => setActivePhotoIndex(photoIndex)}
                      className='relative block h-full w-full cursor-pointer'
                    >
                      <Image
                        src={item.src}
                        alt={item.description || title}
                        fill
                        sizes='(min-width: 1024px) 544px, 78vw'
                        className='object-cover'
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

          {photoItems.length > 1 && (
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
            {activePhoto.description && (
              <figcaption className='max-w-3xl text-center text-sm leading-6 text-white/85'>
                {activePhoto.description}
              </figcaption>
            )}
          </figure>

          {photoItems.length > 1 && (
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
