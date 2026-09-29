'use client';

import type { MouseEvent, PointerEvent, ReactNode } from 'react';
import { useRef } from 'react';

type DragState = {
  pointerId: number;
  startClientX: number;
  startScrollLeft: number;
  moved: boolean;
};

// Past this many pixels a press counts as a drag rather than a click.
const DRAG_THRESHOLD = 5;

/**
 * A horizontally scrolling row that can also be dragged sideways with a
 * mouse, not only swiped on a touch screen or trackpad. Touch and pen keep
 * the browser's native scrolling; a drag never counts as a click on the
 * tile underneath.
 */
export default function DragScroll({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    // A drag that ended outside a tile never fires its click, so a stale
    // flag would otherwise swallow the next genuine click.
    suppressClickRef.current = false;

    if (event.pointerType !== 'mouse' || event.button !== 0 || !container) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startScrollLeft: container.scrollLeft,
      moved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    const container = containerRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId || !container) {
      return;
    }

    const deltaX = event.clientX - dragState.startClientX;

    if (!dragState.moved) {
      if (Math.abs(deltaX) < DRAG_THRESHOLD) {
        return;
      }

      dragState.moved = true;
      container.setPointerCapture(event.pointerId);
      // Mandatory snapping would fight every scrollLeft update mid-drag.
      container.style.scrollSnapType = 'none';
      container.style.cursor = 'grabbing';
    }

    container.scrollLeft = dragState.startScrollLeft - deltaX;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    const container = containerRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId || !container) {
      return;
    }

    dragStateRef.current = null;

    if (dragState.moved) {
      suppressClickRef.current = true;
      container.releasePointerCapture(event.pointerId);
      container.style.scrollSnapType = '';
      container.style.cursor = '';
    }
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={handleClickCapture}
      // Stop the browser's own link/image drag from hijacking the gesture.
      onDragStart={(event) => event.preventDefault()}
      className={`cursor-grab ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
