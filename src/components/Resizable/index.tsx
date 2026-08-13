import { useRef } from "react";
import { type UseResizableOptions, useResizable } from "@/hooks/useResizable";

// Omit wrapperRef from the options to keep it as an internal concern.
type OmittedResizableOptions = Omit<UseResizableOptions, 'wrapperRef'>;

export interface ResizableProps extends React.HTMLAttributes<HTMLDivElement>, OmittedResizableOptions {
  children: React.ReactNode;
  style?: React.CSSProperties;
  renderResizer?: (
    resizerProps: React.HTMLAttributes<HTMLElement>,
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
  onResizeStart,
  onResizeEnd,
  ...etc
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const { height, isResizing, handleStart, handleKeyDown } = useResizable({
    initialHeight,
    minHeight,
    maxHeight,
    wrapperRef,
    onResizeStart,
    onResizeEnd,
  });

  const handleReactEventStart = (e: React.MouseEvent | React.TouchEvent) => {
    // This wrapper function extracts the native event from React's synthetic event.
    // It's the key to resolving the TypeScript error.
    handleStart(e.nativeEvent);
  };

  // const preventDefault = (e: React.MouseEvent | React.TouchEvent) => e.preventDefault();

  const resizerProps: React.HTMLAttributes<HTMLElement> = {
    className: "resizer",
    tabIndex: 0,
    role: "separator",
    "aria-label": "Resize container height",
    "aria-orientation": "vertical",
    "aria-valuemin": minHeight,
    "aria-valuemax": maxHeight,
    "aria-valuenow": height,
    "aria-grabbed": isResizing,
    onMouseDown: handleReactEventStart,
    onTouchStart: handleReactEventStart,
    onKeyDown: handleKeyDown,
    // Optional
    // onContextMenu: e => e.preventDefault(),
    // onAuxClick: preventDefault,
  };

  return (
    <div
      {...etc}
      ref={wrapperRef}
      style={{
        ...style,
        height,
        maxHeight,
        minHeight,
        // overflow: 'auto', // Important for content that might exceed the height
      }}
    >
      {children}

      {/* Resize handle */}
      {renderResizer ?
        renderResizer(resizerProps, isResizing)
        :
        <div
          {...resizerProps}
          style={{
            height: 5,
            cursor: 'ns-resize',
            touchAction: 'pan-y',
            background: isResizing ? '#777' : '#ddd',
          }}
        />
      }
    </div>
  );
}
