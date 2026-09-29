'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent, PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useLocale } from './LocaleProvider';
import { formatLocaleNumber, getDirection } from '@/lib/i18n';

export type TriptychFrame = {
  // Where the frame sits within the free space of its column (0 = start,
  // 1 = end) and how large it is within the range its layout allows (0 =
  // smallest, 1 = largest). Chosen per request on the server so every visit
  // lays the collage out a little differently.
  x: number;
  y: number;
  size: number;
  aspect: '4/5' | '1/1' | '5/4';
};

export type TriptychPanel = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  image: {
    src: string;
    alt: string;
    caption: string;
    href: string;
  };
  frame: TriptychFrame;
  // Where the column's text block sits; the frame takes the space it
  // leaves free. Shuffled per request so no two columns match.
  textPosition: 'top' | 'middle' | 'bottom';
  textIndent: boolean;
};

type Point = { x: number; y: number };
type Band = { top: number; bottom: number };
type Rect = { left: number; top: number; right: number; bottom: number };
type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
  // The open stretches of the column, above and below its text block.
  bands: Band[];
  // The column's heading and text block, which no frame may cover.
  blocks: Rect[];
};

// Clearance kept between a frame and the column's text or edges.
const BAND_GAP = 16;

const TEXT_POSITION_CLASS: Record<TriptychPanel['textPosition'], string> = {
  top: 'mt-[clamp(1.25rem,5%,2.5rem)]',
  middle: 'my-auto',
  bottom: 'mt-auto',
};

// Darkens the backdrop photo behind wherever the text sits.
const BACKDROP_SHADE_CLASS: Record<TriptychPanel['textPosition'], string> = {
  top: 'bg-linear-to-b from-black/75 via-black/25 to-black/35',
  middle: 'bg-black/45',
  bottom: 'bg-linear-to-t from-black/75 via-black/25 to-black/35',
};

type DragState = {
  index: number;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  start: Point;
  moved: boolean;
};

// Where the visitor has dragged each frame, in percentages of the whole
// collage, keyed to the layout it was dragged in so switching between the
// stacked (mobile) and side-by-side (desktop) layouts starts clean.
type DraggedPositions = {
  layoutKey: string;
  byIndex: Record<number, Point>;
};

// Height over width for each frame shape.
const ASPECT_RATIO: Record<TriptychFrame['aspect'], number> = {
  '4/5': 1.25,
  '1/1': 1,
  '5/4': 0.8,
};

// The thread is pinned this far below each frame's top edge.
const PIN_OFFSET = 14;
// Room kept under each frame for its caption.
const CAPTION_SPACE = 24;

/**
 * The default placement of one frame, in pixels of the collage: in the
 * larger open stretch of its column — above or below the text, wherever the
 * text happens to sit — and sized well within it, so frames can sit high,
 * low or in between. Stacked columns are full width, so their frames take a
 * larger share of the stretch's height.
 */
function placeFrame(column: Box, frame: TriptychFrame, isStacked: boolean) {
  const ratio = ASPECT_RATIO[frame.aspect];
  const band = column.bands.reduce(
    (largest, current) =>
      current.bottom - current.top > largest.bottom - largest.top
        ? current
        : largest,
    column.bands[0] ?? { top: column.top, bottom: column.top + column.height }
  );
  const bandTop = band.top;
  const bandBottom = band.bottom;
  const maxHeight = Math.max(
    40,
    (bandBottom - bandTop) * (isStacked ? 0.85 : 0.72) - CAPTION_SPACE
  );
  const width = Math.min(
    column.width * (isStacked ? 0.36 + frame.size * 0.1 : 0.3 + frame.size * 0.1),
    maxHeight / ratio
  );
  const height = width * ratio + CAPTION_SPACE;
  const innerLeft = column.left + column.width * 0.06;
  const innerWidth = column.width * 0.88;

  return {
    width,
    x: innerLeft + frame.x * Math.max(0, innerWidth - width),
    y: bandTop + frame.y * Math.max(0, bandBottom - bandTop - height),
  };
}

function intersects(a: Rect, b: Rect) {
  return (
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );
}

/**
 * A column's hover effect: its photo as a backdrop, shaded behind wherever
 * its text sits, or the dusty-rose wash when another column is showing.
 */
function ColumnEffect({
  panel,
  isActive,
  isDimmed,
  sizes,
}: {
  panel: TriptychPanel;
  isActive: boolean;
  isDimmed: boolean;
  sizes: string;
}) {
  return (
    <>
      <div
        aria-hidden='true'
        className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ease-out ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Image
          src={panel.image.src}
          alt=''
          fill
          sizes={sizes}
          className={`object-cover transition-transform duration-[1.2s] ease-out ${
            isActive ? 'scale-100' : 'scale-105'
          }`}
        />
        <span
          className={`absolute inset-0 ${BACKDROP_SHADE_CLASS[panel.textPosition]}`}
        />
      </div>
      <span
        aria-hidden='true'
        className={`pointer-events-none absolute inset-0 bg-[#d67878]/45 mix-blend-multiply transition-opacity duration-500 ${
          isDimmed ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}

function CropMarks({ className }: { className: string }) {
  const corners = [
    'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
  ];

  return (
    <>
      {corners.map((corner) => (
        <svg
          key={corner}
          aria-hidden='true'
          viewBox='0 0 10 10'
          className={`pointer-events-none absolute h-3.5 w-3.5 ${corner} ${className}`}
        >
          <path d='M5 0V10M0 5H10' stroke='currentColor' strokeWidth='1' />
        </svg>
      ))}
    </>
  );
}

/**
 * Repository, Re-reading and Library as three columns of one collage. Each
 * column carries a project image pinned to a red thread that runs through
 * all three — the platform's many voices, connected. Frames can be dragged
 * anywhere across the collage and the thread follows. Hovering a column
 * lifts its image out of the frame and into the whole column as a
 * backdrop, leaving the frame an empty outline, while the other columns
 * fall back under Bast's dusty-rose wash.
 *
 * On wide screens the three columns sit side by side and fill whatever
 * height their parent gives them; on narrow ones they stack into three
 * full-width sections of the scrolling page.
 */
export default function HomeTriptych({ panels }: { panels: TriptychPanel[] }) {
  const { lang } = useLocale();
  const isRtl = getDirection(lang) === 'rtl';

  const containerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const eyebrowRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  const [size, setSize] = useState({ width: 0, height: 0 });
  // Where the collage sits in the viewport, for the full-page strips.
  const [viewport, setViewport] = useState({ left: 0, width: 0 });
  const [columns, setColumns] = useState<Box[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const measure = () => {
      const rect = container.getBoundingClientRect();

      setSize({ width: rect.width, height: rect.height });
      setViewport({
        left: rect.left,
        width: document.documentElement.clientWidth,
      });
      setColumns(
        columnRefs.current.map((column, index) => {
          const box = column?.getBoundingClientRect();

          if (!box) {
            return {
              left: 0,
              top: 0,
              width: 0,
              height: 0,
              bands: [],
              blocks: [],
            };
          }

          const top = box.top - rect.top;
          const eyebrow = eyebrowRefs.current[index]?.getBoundingClientRect();
          const text = textRefs.current[index]?.getBoundingClientRect();
          const openTop = (eyebrow ? eyebrow.bottom - rect.top : top) + BAND_GAP;
          const openBottom = top + box.height - BAND_GAP;
          const bands = text
            ? [
                { top: openTop, bottom: text.top - rect.top - BAND_GAP },
                { top: text.bottom - rect.top + BAND_GAP, bottom: openBottom },
              ]
            : [{ top: openTop, bottom: openBottom }];
          const blocks = [eyebrow, text]
            .filter((block): block is DOMRect => Boolean(block))
            .map((block) => ({
              left: block.left - rect.left,
              top: block.top - rect.top,
              right: block.right - rect.left,
              bottom: block.bottom - rect.top,
            }));

          return {
            left: box.left - rect.left,
            top,
            width: box.width,
            height: box.height,
            bands,
            blocks,
          };
        })
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    // The text blocks settle once the web fonts arrive.
    document.fonts?.ready.then(measure);

    return () => observer.disconnect();
  }, []);

  // Stacked columns share a left edge; side-by-side ones don't.
  const isStacked =
    columns.length > 1 && Math.abs(columns[0].left - columns[1].left) < 1;
  const layoutKey = `${isStacked ? 'stacked' : 'row'}-${isRtl ? 'rtl' : 'ltr'}`;
  const [dragged, setDragged] = useState<DraggedPositions>({
    layoutKey,
    byIndex: {},
  });
  const draggedByIndex = dragged.layoutKey === layoutKey ? dragged.byIndex : {};
  const isMeasured = size.width > 0 && columns.length === panels.length;
  const hasPageStrips = isMeasured && !isStacked;

  // A column's full-page strip, in viewport pixels: the column's own width,
  // except that the leftmost and rightmost columns (which flip under RTL)
  // run on out to the screen's edges.
  const stripFor = (index: number) => {
    const column = columns[index];
    const lefts = columns.map((each) => each.left);
    const rights = columns.map((each) => each.left + each.width);
    const isLeftmost = column.left <= Math.min(...lefts);
    const isRightmost = column.left + column.width >= Math.max(...rights);

    return {
      left: isLeftmost ? 0 : viewport.left + column.left,
      right: isRightmost
        ? viewport.width
        : viewport.left + column.left + column.width,
    };
  };

  // Whether a frame at this spot (percentages of the collage) would cover
  // any column's heading or text.
  const coversText = (
    position: Point,
    w: number,
    aspect: TriptychFrame['aspect']
  ) => {
    const width = (w / 100) * size.width;
    const left = (position.x / 100) * size.width;
    const top = (position.y / 100) * size.height;
    const frameRect = {
      left,
      top,
      right: left + width,
      bottom: top + width * ASPECT_RATIO[aspect] + CAPTION_SPACE,
    };

    return columns.some((column) =>
      column.blocks.some((block) => intersects(frameRect, block))
    );
  };

  // Tell the page which full-page strip is showing, so the pieces laid over
  // it — the intro line, the logo, the "+" and the language label — can
  // turn white where the photo is behind them (see globals.css).
  const activeStrip =
    hasPageStrips && active !== null ? stripFor(active) : undefined;
  const stripLeft = activeStrip?.left;
  const stripRight = activeStrip?.right;

  useEffect(() => {
    const root = document.documentElement;

    if (stripLeft === undefined || stripRight === undefined) {
      delete root.dataset.homeStrip;
      return;
    }

    const edges = [
      stripLeft <= 0 ? 'left' : '',
      stripRight >= viewport.width ? 'right' : '',
    ].filter(Boolean);

    root.dataset.homeStrip = edges.join(' ') || 'inner';
    root.style.setProperty('--home-strip-left', `${stripLeft - viewport.left}px`);
    root.style.setProperty('--home-strip-right', `${stripRight - viewport.left}px`);

    return () => {
      delete root.dataset.homeStrip;
    };
  }, [stripLeft, stripRight, viewport.left, viewport.width]);

  // Frame positions and widths as percentages of the collage.
  const frames = panels.map((panel, index) => {
    const column = columns[index];

    if (!column || !isMeasured) {
      return { x: 0, y: 0, w: 0 };
    }

    const placed = placeFrame(column, panel.frame, isStacked);
    const w = (placed.width / size.width) * 100;
    const draggedTo = draggedByIndex[index];

    // A dragged spot only holds while it stays clear of every column's
    // text — a resize can reflow text under it — otherwise the frame goes
    // back to its own placement.
    return {
      ...(draggedTo &&
      (index === draggingIndex || !coversText(draggedTo, w, panel.frame.aspect))
        ? draggedTo
        : {
            x: (placed.x / size.width) * 100,
            y: (placed.y / size.height) * 100,
          }),
      w,
    };
  });

  const pins = frames.map((frame) => ({
    x: ((frame.x + frame.w / 2) / 100) * size.width,
    y: (frame.y / 100) * size.height + PIN_OFFSET,
  }));

  const columnAt = (clientX: number, clientY: number) => {
    const container = containerRef.current;

    if (!container) {
      return null;
    }

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const index = columns.findIndex(
      (column) =>
        x >= column.left &&
        x <= column.left + column.width &&
        y >= column.top &&
        y <= column.top + column.height
    );

    return index === -1 ? null : index;
  };

  const handleContainerPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') {
      setActive(columnAt(event.clientX, event.clientY));
    }
  };

  // Without a cursor there is no hover, so on touch a tap on a column that
  // isn't showing yet reveals it first; a second tap follows the link.
  const lastPointerTypeRef = useRef('mouse');
  const handleColumnClick = (
    event: MouseEvent<HTMLAnchorElement>,
    index: number
  ) => {
    if (lastPointerTypeRef.current !== 'mouse' && active !== index) {
      event.preventDefault();
      setActive(index);
    }
  };

  // Stacked on a phone, the column scrolled to the middle of the screen is
  // the one that shows, so the collage comes alive as the page scrolls.
  useEffect(() => {
    if (!isStacked) {
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      const index = columnRefs.current.findIndex((column) => {
        const box = column?.getBoundingClientRect();
        return box ? box.top <= middle && box.bottom >= middle : false;
      });

      setActive(index === -1 ? null : index);
    };
    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [isStacked]);

  const handlePointerDown = (
    event: PointerEvent<HTMLAnchorElement>,
    index: number
  ) => {
    // A drag that ended outside the frame never fires its click, so a stale
    // flag would otherwise swallow the next genuine click.
    suppressClickRef.current = false;

    if (event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      index,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      start: { x: frames[index].x, y: frames[index].y },
      moved: false,
    };
    setDraggingIndex(index);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId || !size.width) {
      return;
    }

    const deltaX =
      ((event.clientX - dragState.startClientX) / size.width) * 100;
    const deltaY =
      ((event.clientY - dragState.startClientY) / size.height) * 100;

    if (Math.abs(deltaX) > 0.4 || Math.abs(deltaY) > 0.4) {
      dragState.moved = true;
    }

    // Keep most of every frame inside the collage so none can be lost off
    // an edge of a page that no longer scrolls.
    const { w } = frames[dragState.index];
    const x = Math.min(100 - w * 0.4, Math.max(-w * 0.6, dragState.start.x + deltaX));
    const y = Math.min(88, Math.max(-2, dragState.start.y + deltaY));

    setDragged((current) => ({
      layoutKey,
      byIndex: {
        ...(current.layoutKey === layoutKey ? current.byIndex : {}),
        [dragState.index]: { x, y },
      },
    }));
  };

  const endDrag = (event: PointerEvent<HTMLAnchorElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    setDraggingIndex(null);
    event.currentTarget.releasePointerCapture(event.pointerId);
    suppressClickRef.current = dragState.moved;

    // Frames can't be set down over text: dropped there, one glides back to
    // where it was picked up.
    const frame = frames[dragState.index];
    const aspect = panels[dragState.index].frame.aspect;

    if (coversText(frame, frame.w, aspect)) {
      setDragged((current) => ({
        layoutKey,
        byIndex: {
          ...(current.layoutKey === layoutKey ? current.byIndex : {}),
          [dragState.index]: dragState.start,
        },
      }));
    }
  };

  const handleFrameClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
    }
  };

  const threadPath = pins
    .map((pin, index) => `${index === 0 ? 'M' : 'L'} ${pin.x} ${pin.y}`)
    .join(' ');
  const lastPin = pins[pins.length - 1];
  // A second strand straight from the first frame to the last, closing the
  // three into a triangle. Only side by side: stacked, it would run
  // straight through the column text.
  const slackPath =
    pins.length > 2 && !isStacked
      ? `M ${pins[0].x} ${pins[0].y} L ${lastPin.x} ${lastPin.y}`
      : '';

  return (
    <div
      ref={containerRef}
      onPointerMove={handleContainerPointerMove}
      onPointerDownCapture={(event) => {
        lastPointerTypeRef.current = event.pointerType;
      }}
      onPointerLeave={(event) => {
        // Touch fires a leave after every tap; only a cursor leaving
        // should clear the column.
        if (event.pointerType === 'mouse' && !isStacked) {
          setActive(null);
        }
      }}
      className='relative grid lg:min-h-0 lg:flex-1 lg:grid-cols-3'
    >
      {panels.map((panel, index) => {
        const isActive = active === index;
        const isDimmed = active !== null && !isActive;

        return (
          <div
            key={panel.key}
            ref={(node) => {
              columnRefs.current[index] = node;
            }}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
            className={`relative flex min-h-[30rem] flex-col overflow-hidden border-[#d9d2c7] p-4 sm:min-h-[34rem] sm:p-6 lg:min-h-0 lg:p-7 ${
              // Only the dividers between columns — no outer lines.
              index < panels.length - 1 ? 'border-b lg:border-e lg:border-b-0' : ''
            }`}
          >
            {/* Stacked, each column carries its own effect. Side by side,
                the effect runs the full height of the page instead (see the
                strips below). */}
            {!hasPageStrips && (
              <ColumnEffect
                panel={panel}
                isActive={isActive}
                isDimmed={isDimmed}
                sizes='100vw'
              />
            )}

            {/* The whole column is a target, not just its title. Kept out
                of the tab order since the title link already covers it. */}
            <Link
              href={panel.href}
              onClick={(event) => handleColumnClick(event, index)}
              tabIndex={-1}
              aria-hidden='true'
              className='absolute inset-0'
            />

            <p
              ref={(node) => {
                eyebrowRefs.current[index] = node;
              }}
              className={`relative flex items-center gap-3 text-[0.7rem] font-extrabold tracking-wide uppercase transition-colors duration-500 sm:text-xs ${
                isActive ? 'text-white' : 'text-[#7f242a]'
              }`}
            >
              <span className='tabular-nums'>
                {formatLocaleNumber(index + 1, lang).padStart(
                  2,
                  formatLocaleNumber(0, lang)
                )}
              </span>
              <svg
                aria-hidden='true'
                viewBox='0 0 10 10'
                className='h-2.5 w-2.5 shrink-0'
              >
                <path d='M5 0V10M0 5H10' stroke='currentColor' strokeWidth='1' />
              </svg>
              {panel.eyebrow}
            </p>

            <div
              ref={(node) => {
                textRefs.current[index] = node;
              }}
              className={`relative flex max-w-md flex-col gap-2 sm:gap-2.5 lg:gap-3 ${
                TEXT_POSITION_CLASS[panel.textPosition]
              } ${panel.textIndent ? 'lg:ms-[10%]' : ''}`}
            >
              <h2
                className={`text-xl leading-tight font-semibold transition-colors duration-500 sm:text-3xl lg:text-[clamp(1.6rem,2.4vw,2.6rem)] ${
                  isActive ? 'text-white' : 'text-black'
                }`}
              >
                <Link
                  href={panel.href}
                  onClick={(event) => handleColumnClick(event, index)}
                  className='focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current'
                >
                  {panel.title}
                </Link>
              </h2>
              <p
                className={`text-sm leading-6 transition-colors duration-500 lg:text-base lg:[@media(max-height:680px)]:hidden ${
                  isActive ? 'text-white/85' : 'text-[#777066]'
                }`}
              >
                {panel.description}
              </p>
              <span
                aria-hidden='true'
                className={`inline-flex w-fit items-center gap-2 text-xs font-medium transition-colors duration-500 sm:text-sm lg:text-[1.05rem] ${
                  isActive ? 'text-white' : 'text-[#7f242a]'
                }`}
              >
                {panel.linkLabel}
                <span
                  className={`transition-transform duration-500 ${
                    isActive ? (isRtl ? '-translate-x-1' : 'translate-x-1') : ''
                  }`}
                >
                  {isRtl ? '←' : '→'}
                </span>
              </span>
            </div>
          </div>
        );
      })}

      {/* Side by side, each column's effect is a strip running the full
          height of the page and, for the outer columns, out to the screen
          edge. Fixed and behind everything, so the header and intro sit on
          top of it. */}
      {hasPageStrips &&
        panels.map((panel, index) => {
          const { left, right } = stripFor(index);

          return (
            <div
              key={`strip-${panel.key}`}
              aria-hidden='true'
              className='pointer-events-none fixed inset-y-0 -z-10'
              style={{ left, width: right - left }}
            >
              <ColumnEffect
                panel={panel}
                isActive={active === index}
                isDimmed={active !== null && active !== index}
                sizes='40vw'
              />
            </div>
          );
        })}

      {isMeasured && (
        <>
          <svg
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible'
            viewBox={`0 0 ${size.width} ${size.height}`}
          >
            <g
              fill='none'
              stroke='#7f242a'
              strokeWidth='0.3'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d={threadPath} />
              {slackPath && <path d={slackPath} />}
            </g>
            {pins.map((pin, index) => (
              <circle
                key={panels[index].key}
                cx={pin.x}
                cy={pin.y}
                r='4'
                fill='#7f242a'
                stroke='rgb(248,248,246)'
                strokeWidth='1.5'
              />
            ))}
          </svg>

          {panels.map((panel, index) => {
            const frame = frames[index];
            const isActive = active === index;
            const isDimmed = active !== null && !isActive;
            const isDragging = draggingIndex === index;

            return (
              <Link
                key={panel.key}
                href={panel.image.href}
                aria-label={panel.image.caption}
                draggable={false}
                onPointerDown={(event) => handlePointerDown(event, index)}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClick={handleFrameClick}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className={`group absolute block touch-pan-y select-none lg:touch-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7f242a] ${
                  isDragging
                    ? 'z-30 cursor-grabbing'
                    : 'z-10 cursor-grab motion-safe:transition-[transform,left,top] motion-safe:duration-500'
                }`}
                style={{
                  left: `${frame.x}%`,
                  top: `${frame.y}%`,
                  width: `${frame.w}%`,
                  transform: isDragging ? 'scale(1.03)' : undefined,
                }}
              >
                {/* While its column shows the photo, the frame empties to a
                    bare outline, the backdrop showing through it. */}
                <span
                  className={`relative block w-full border transition-colors duration-500 ${
                    isActive ? 'border-white/80' : 'border-transparent'
                  }`}
                  style={{ aspectRatio: panel.frame.aspect }}
                >
                  <span
                    className={`absolute inset-0 overflow-hidden bg-[#e9e3d6] transition-opacity duration-500 ${
                      isActive ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    <Image
                      src={panel.image.src}
                      alt={panel.image.alt}
                      fill
                      sizes='(min-width: 1024px) 20vw, 40vw'
                      className='object-cover'
                      draggable={false}
                    />
                    <span className='absolute inset-0 bg-[#d67878]/55 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0' />
                    <span
                      aria-hidden='true'
                      className='absolute inset-0 opacity-25 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0'
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.45) 1px, transparent 0)',
                        backgroundSize: '4px 4px',
                      }}
                    />
                    <span
                      className={`absolute inset-0 bg-[#d67878]/45 mix-blend-multiply transition-opacity duration-500 ${
                        isDimmed ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </span>
                  <CropMarks
                    className={`transition-opacity duration-500 ${
                      isActive ? 'text-white opacity-90' : 'text-[#7f242a] opacity-0'
                    }`}
                  />
                </span>
                <span
                  className={`mt-2 line-clamp-1 text-[0.65rem] font-semibold tracking-wide transition-colors duration-500 sm:text-[0.7rem] ${
                    isActive ? 'text-white' : 'text-[#7f242a]'
                  }`}
                >
                  {panel.image.caption}
                </span>
              </Link>
            );
          })}
        </>
      )}
    </div>
  );
}
