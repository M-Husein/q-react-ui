import { useState, useRef, useEffect, useCallback } from "react";
import { throttle } from "q-js-utils/throttle";

export interface UseResizableOptions {
  initialHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  onResizeStart?: (initialHeight: number, event: MouseEvent | TouchEvent) => void;
  onResizeEnd?: (newHeight: number) => void;
}

const getClientY = (e: MouseEvent | TouchEvent) => {
  return (e as TouchEvent).touches?.[0]?.clientY ?? (e as MouseEvent).clientY;
}

export const useResizable = ({
  initialHeight = 300,
  minHeight = 100,
  maxHeight = 600,
  wrapperRef,
  onResizeStart,
  onResizeEnd,
}: UseResizableOptions) => {
  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    // const handleMove = (e: MouseEvent | TouchEvent) => {
    //   if (!isResizingRef.current) return;

    //   let clientY = getClientY(e);
      
    //   // Use functional updates to prevent stale state issues
    //   setHeight(() => { // currentHeight
    //     let newHeight = startHeightRef.current + (clientY - startYRef.current);
    //     return Math.max(minHeight, Math.min(maxHeight, newHeight));
    //   });
    // }

    // Throttled to ~60fps
    const throttledMove = throttle((e: MouseEvent | TouchEvent) => {
      if (!isResizingRef.current) return;

      let clientY = getClientY(e);
      
      // Use functional updates to prevent stale state issues
      setHeight(() => { // currentHeight
        let newHeight = startHeightRef.current + (clientY - startYRef.current);
        return Math.max(minHeight, Math.min(maxHeight, newHeight));
      });
    }, 16);

    const handleUp = () => {
      setIsResizing(false);
      isResizingRef.current = false;
      document.body.style.userSelect = "";

      if (onResizeEnd && wrapperRef.current) {
        onResizeEnd(wrapperRef.current.offsetHeight);
      }
    };

    const controller = new AbortController();
    const signal = controller.signal;

    document.addEventListener("mousemove", throttledMove, { signal });
    document.addEventListener("mouseup", handleUp, { signal });

    document.addEventListener("touchmove", throttledMove, { signal });
    document.addEventListener("touchend", handleUp, { signal });

    return () => controller.abort();

    // return () => {
    //   document.removeEventListener("mousemove", throttledMove);
    //   document.removeEventListener("mouseup", handleUp);
    // };
  }, [minHeight, maxHeight, onResizeEnd, wrapperRef]); // Re-run effect if bounds change to update `setHeight` closure

  const handleStart = useCallback((e: MouseEvent | TouchEvent) => {
    if (!wrapperRef.current) return;

    onResizeStart?.(wrapperRef.current.offsetHeight, e);

    setIsResizing(true);
    isResizingRef.current = true;
    
    startYRef.current = getClientY(e);
    startHeightRef.current = wrapperRef.current.offsetHeight ?? initialHeight;
    document.body.style.userSelect = "none";
  }, [initialHeight, wrapperRef, onResizeStart]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHeight(currentHeight => Math.max(minHeight, currentHeight - 10));
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHeight(currentHeight => Math.min(maxHeight, currentHeight + 10));
    }
  }, [minHeight, maxHeight]);

  return { height, isResizing, handleStart, handleKeyDown };
}
