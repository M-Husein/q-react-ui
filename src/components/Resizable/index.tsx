import { useState, useRef, useEffect } from "react";

export interface ResizableProps {
  minHeight?: number;
  maxHeight?: number;
  initialHeight?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  renderResizer?: (
    onMouseDown: (e: React.MouseEvent) => void,
    isResizing: boolean,
  ) => React.ReactNode;
}

export const Resizable: React.FC<ResizableProps> = ({
  minHeight = 100,
  maxHeight = 600,
  initialHeight = 300,
  children,
  style,
  renderResizer,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);
  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      let newHeight = startHeightRef.current + (e.clientY - startYRef.current);

      if (newHeight < minHeight) newHeight = minHeight;
      if (newHeight > maxHeight) newHeight = maxHeight;

      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      isResizingRef.current = false;
      document.body.style.userSelect = "";
    };

    const controller = new AbortController();
		const signal = controller.signal;

    document.addEventListener("mousemove", handleMouseMove, { signal });
    document.addEventListener("mouseup", handleMouseUp, { signal });

    return () => {
      controller.abort();
      // document.removeEventListener("mousemove", handleMouseMove);
      // document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minHeight, maxHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    isResizingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = wrapperRef.current?.offsetHeight ?? initialHeight;
    document.body.style.userSelect = "none"; // prevent text selection while resizing
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        ...style,
        height,
        maxHeight,
        minHeight,
        // position: 'relative',
      }}
    >
      {children}

      {/* Resize handle */}
      {renderResizer ? 
        renderResizer(handleMouseDown, isResizing)
        :
        <div
          onMouseDown={handleMouseDown}
          style={{
            height: 5,
            cursor: 'ns-resize',
            background: '#f0f0f0',
          }}
        />
      }
    </div>
  );
};
