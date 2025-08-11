import { useRef, useEffect, useState, useCallback } from 'react';

// Define a type for the debounced function that includes a cancel method
interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

// Helper for debouncing function calls
const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): DebouncedFunction<T> => {
  let timeout: ReturnType<typeof setTimeout>;
  const debounced: DebouncedFunction<T> = ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  }) as DebouncedFunction<T>; // Cast to include cancel method

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
};

// Options interface for the useTextareaEditor hook
interface UseTextareaEditorOptions {
  initialValue?: string;
  visualTabSize?: number;
  historyDebounceDelay?: number;
  autoSize?: boolean | { minHeight?: number; maxHeight?: number };
  enableTabIndentation?: boolean; // New option for enabling/disabling Tab key handling
}

// Result interface for the useTextareaEditor hook
interface TextareaEditorHookResult {
  ref: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * A React Hook to enable advanced text editing in a textarea with auto-resize, undo/redo,
 * custom indentation, and multi-line selection handling.
 *
 * Features:
 * 1. Robust auto-resizes textarea height to fit content using a hidden measurement element,
 * with optional min/max height constraints.
 * 2. Tab key inserts a tab character ('\t') at cursor or indents selected lines.
 * 3. Shift+Tab unindents selected lines by removing leading tab characters or a block of spaces
 * equivalent to the visual tab size.
 * 4. Undo/Redo functionality (Ctrl/Cmd+Z, Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z).
 * 5. Visual tab size is controlled purely by CSS `tab-size` property on the textarea.
 *
 * @param {UseTextareaEditorOptions} options Configuration options for the editor.
 * @returns {TextareaEditorHookResult} An object containing ref, value, onChange, undo, redo, canUndo, canRedo.
 */
export const useTextareaEditor = (
  {
    initialValue = '',
    visualTabSize = 4,
    historyDebounceDelay = 300,
    autoSize = false,
    enableTabIndentation, // Changed default to false = false,
  }: UseTextareaEditorOptions = {}
): TextareaEditorHookResult => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measurementRef = useRef<HTMLDivElement | null>(null); // Ref for the hidden measurement element
  const TAB_CHAR = '\t';

  // State for the textarea's current value
  const [value, setValue] = useState<string>(initialValue);

  // State for history: stack of values and current pointer
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyPointer, setHistoryPointer] = useState<number>(0);

  // --- Auto-resize logic ---
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    const measurementDiv = measurementRef.current;

    if (!textarea || !measurementDiv || !autoSize) return;

    // 1. Copy computed styles from textarea to measurement div
    const computedStyle = window.getComputedStyle(textarea);
    const relevantStyles = [
      'boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'fontFamily', 'fontSize', 'lineHeight', 'letterSpacing', 'textTransform', 'wordBreak',
      'whiteSpace', 'tabSize', 'overflowWrap', 'wordWrap' // Include wordWrap for older browsers
    ];

    relevantStyles.forEach(prop => {
      // @ts-ignore - Index signature for CSSStyleDeclaration is not always perfect
      measurementDiv.style[prop] = computedStyle[prop];
    });

    // Specific styles for measurement:
    measurementDiv.style.position = 'absolute'; // Don't affect layout
    measurementDiv.style.visibility = 'hidden'; // Make it invisible
    measurementDiv.style.pointerEvents = 'none'; // Not interactive
    measurementDiv.style.top = '0';
    measurementDiv.style.left = '0';
    measurementDiv.style.height = 'auto'; // Allow it to calculate height freely
    measurementDiv.style.minHeight = '0';
    measurementDiv.style.maxHeight = 'none';
    measurementDiv.style.overflow = 'hidden'; // Hide internal scrollbar
    measurementDiv.style.whiteSpace = 'pre-wrap'; // Preserve whitespace and wrap
    measurementDiv.style.wordBreak = 'break-word'; // Break long words

    // Set the width of the measurement div to match the textarea's clientWidth
    // This is crucial for correct word wrapping and height calculation.
    measurementDiv.style.width = `${textarea.clientWidth}px`;

    // Set the content of the measurement div
    // Ensure height for a trailing empty line
    let contentToMeasure = textarea.value;
    if (contentToMeasure.length === 0) {
        contentToMeasure = '\u00A0'; // Non-breaking space for empty textarea
    } else if (contentToMeasure.endsWith('\n')) {
        contentToMeasure += '\u00A0'; // Ensure height for a trailing empty line
    }
    measurementDiv.textContent = contentToMeasure;


    // 2. Calculate new height
    let newHeight = measurementDiv.scrollHeight;

    // 3. Apply min/max height constraints if autoSize is an object
    if (typeof autoSize === 'object') {
      const { minHeight, maxHeight } = autoSize;
      if (minHeight !== undefined) {
        newHeight = Math.max(newHeight, minHeight);
      }
      if (maxHeight !== undefined) {
        newHeight = Math.min(newHeight, maxHeight);
      }
    }

    // 4. Apply the calculated height to the visible textarea
    textarea.style.height = `${newHeight}px`;
  }, [autoSize]);

  // --- Effect to manage the hidden measurement element ---
  useEffect(() => {
    if (!autoSize) {
      // If autoSize is disabled, ensure no fixed height is applied by the hook
      if (textareaRef.current) {
        textareaRef.current.style.height = ''; // Reset height
      }
      // Remove measurement div if it exists and autoSize is off
      if (measurementRef.current && document.body.contains(measurementRef.current)) {
        document.body.removeChild(measurementRef.current);
        measurementRef.current = null;
      }
      return;
    }

    // Create measurement div if it doesn't exist
    if (!measurementRef.current) {
      const div = document.createElement('div');
      div.setAttribute('aria-hidden', 'true'); // Hide from screen readers
      div.style.position = 'absolute';
      div.style.visibility = 'hidden';
      div.style.pointerEvents = 'none';
      div.style.top = '0';
      div.style.left = '0';
      document.body.appendChild(div);
      measurementRef.current = div;
    }

    // Adjust height on initial mount, value change, or window resize
    adjustTextareaHeight();

    const handleResize = () => {
      adjustTextareaHeight();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Clean up the measurement div when the component unmounts
      if (measurementRef.current && document.body.contains(measurementRef.current)) {
        document.body.removeChild(measurementRef.current);
        measurementRef.current = null;
      }
    };
  }, [autoSize, adjustTextareaHeight]);

  // Debounced function to save snapshots for normal typing
  const saveSnapshotDebounced = useCallback(
    debounce((newValue: string) => {
      setHistory((prevHistory) => {
        const newHistory = prevHistory.slice(0, historyPointer + 1);
        if (newHistory[newHistory.length - 1] !== newValue) {
          newHistory.push(newValue);
        }
        return newHistory;
      });
      setHistoryPointer((prevPointer) => prevPointer + 1);
    }, historyDebounceDelay),
    [historyPointer, historyDebounceDelay]
  );

  // Function to save a snapshot immediately (e.g., after indent/unindent)
  const saveSnapshotImmediately = useCallback((newValue: string) => {
    setHistory((prevHistory) => {
      const newHistory = prevHistory.slice(0, historyPointer + 1);
      if (newHistory[newHistory.length - 1] !== newValue) {
        newHistory.push(newValue);
      }
      return newHistory;
    });
    setHistoryPointer((prevPointer) => prevPointer + 1);
    saveSnapshotDebounced.cancel();
  }, [historyPointer, saveSnapshotDebounced]);


  // --- Undo/Redo Functions ---
  const undo = useCallback(() => {
    if (historyPointer > 0) {
      const newPointer = historyPointer - 1;
      setHistoryPointer(newPointer);
      setValue(history[newPointer]!);
      // Adjust height after undo/redo, with a slight delay for DOM update
      setTimeout(adjustTextareaHeight, 0);
    }
  }, [history, historyPointer, adjustTextareaHeight]);

  const redo = useCallback(() => {
    if (historyPointer < history.length - 1) {
      const newPointer = historyPointer + 1;
      setHistoryPointer(newPointer);
      setValue(history[newPointer]!);
      // Adjust height after undo/redo, with a slight delay for DOM update
      setTimeout(adjustTextareaHeight, 0);
    }
  }, [history, historyPointer, adjustTextareaHeight]);

  // --- Main onChange handler for the textarea (for normal typing) ---
  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    saveSnapshotDebounced(newValue);
    adjustTextareaHeight(); // Explicitly call height adjustment here
  }, [saveSnapshotDebounced, adjustTextareaHeight]);

  // --- Keydown handler for Tab/Shift+Tab ---
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle Tab key if enableTabIndentation is true
      if (enableTabIndentation && event.key === 'Tab') {
        event.preventDefault();

        const { selectionStart, selectionEnd, value: currentValue } = textarea;

        const lines = currentValue.split('\n');
        let currentLineStart = 0;
        let startLineIndex = 0;
        let endLineIndex = 0;

        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i]!.length + 1;
          if (selectionStart >= currentLineStart && selectionStart < currentLineStart + lineLength) {
            startLineIndex = i;
          }
          if (selectionEnd >= currentLineStart && selectionEnd < currentLineStart + lineLength) {
            endLineIndex = i;
          }
          currentLineStart += lineLength;
        }

        if (selectionEnd === currentLineStart - 1 && endLineIndex > startLineIndex) {
            endLineIndex--;
        }

        const selectedLines = lines.slice(startLineIndex, endLineIndex + 1);
        const isMultiLineSelection = startLineIndex !== endLineIndex || (selectionStart !== selectionEnd && selectedLines.length > 0);


        let newSelectionStart: number = selectionStart;
        let newSelectionEnd: number = selectionEnd; // Fix: Removed duplicate 'number ='
        let newTextValue: string = currentValue;
        let indentationChange: number = 0;

        if (event.shiftKey) {
          const unindentedLines = selectedLines.map(line => {
            if (line.startsWith(TAB_CHAR)) {
              indentationChange -= TAB_CHAR.length;
              return line.substring(TAB_CHAR.length);
            } else {
              let removedSpaces = 0;
              for (let i = 0; i < visualTabSize && i < line.length; i++) {
                  if (line[i] === ' ') {
                      removedSpaces++;
                  } else {
                      break;
                  }
              }
              if (removedSpaces > 0) {
                  indentationChange -= removedSpaces;
                  return line.substring(removedSpaces);
              }
            }
            return line;
          });

          const beforeLines = lines.slice(0, startLineIndex).join('\n');
          const afterLines = lines.slice(endLineIndex + 1).join('\n');
          newTextValue = [beforeLines, unindentedLines.join('\n'), afterLines]
            .filter(Boolean)
            .join('\n');

          newSelectionStart = Math.max(0, selectionStart + indentationChange);
          newSelectionEnd = Math.max(0, selectionEnd + indentationChange);

        } else {
          if (isMultiLineSelection || selectionStart !== selectionEnd) {
            const indentedLines = selectedLines.map(line => {
              indentationChange += TAB_CHAR.length;
              return TAB_CHAR + line;
            });

            const beforeLines = lines.slice(0, startLineIndex).join('\n');
            const afterLines = lines.slice(endLineIndex + 1).join('\n');
            newTextValue = [beforeLines, indentedLines.join('\n'), afterLines]
              .filter(Boolean)
              .join('\n');

            newSelectionStart = selectionStart + TAB_CHAR.length;
            newSelectionEnd = selectionEnd + (TAB_CHAR.length * selectedLines.length);
            
          } else {
            newTextValue = currentValue.substring(0, selectionStart) + TAB_CHAR + currentValue.substring(selectionEnd);
            newSelectionStart = newSelectionEnd = selectionStart + TAB_CHAR.length;
          }
        }

        textarea.value = newTextValue;
        textarea.selectionStart = newSelectionStart;
        textarea.selectionEnd = newSelectionEnd;

        setValue(newTextValue);
        saveSnapshotImmediately(newTextValue);
        adjustTextareaHeight(); // Explicitly call height adjustment here
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);

    return () => {
      textarea.removeEventListener('keydown', handleKeyDown);
      saveSnapshotDebounced.cancel();
    };
  }, [visualTabSize, saveSnapshotDebounced, saveSnapshotImmediately, adjustTextareaHeight, enableTabIndentation]);

  // --- Keyboard Shortcuts for Undo/Redo (Ctrl/Cmd+Z, Ctrl/Cmd+Y, Ctrl/Cmd+Shift+Z) ---
  useEffect(() => {
    // Determine if the OS is Mac for Cmd key
    const isMac = typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (isCtrlOrCmd) {
        if (event.key === 'z' || event.key === 'Z') {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (event.key === 'y' || event.key === 'Y') {
          event.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [undo, redo]);


  return {
    ref: textareaRef,
    value,
    onChange: handleChange,
    undo,
    redo,
    canUndo: historyPointer > 0,
    canRedo: historyPointer < history.length - 1,
  };
}
