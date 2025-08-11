# useTextareaEditor

## Option 1

```ts
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
 * A React Hook to enable advanced text editing in a textarea with undo/redo,
 * custom indentation, and multi-line selection handling.
 *
 * Features:
 * 1. Tab key inserts a tab character ('\t') at cursor or indents selected lines.
 * 2. Shift+Tab unindents selected lines by removing leading tab characters or a block of spaces
 * equivalent to the visual tab size.
 * 3. Undo/Redo functionality (Ctrl/Cmd+Z, Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z).
 * 4. Visual tab size is controlled purely by CSS `tab-size` property on the textarea.
 *
 * @param {string} initialValue The initial content of the textarea.
 * @param {number} [visualTabSize=4] The visual width of a tab (e.g., 2 or 4 spaces).
 * Used for unindenting blocks of spaces.
 * @param {number} [historyDebounceDelay=300] Delay in ms before saving a snapshot for normal typing.
 * @returns {TextareaEditorHookResult} An object containing ref, value, onChange, undo, redo, canUndo, canRedo.
 */
export const useTextareaEditor = (
  initialValue: string = '',
  visualTabSize: number = 4,
  historyDebounceDelay: number = 300
): TextareaEditorHookResult => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const TAB_CHAR = '\t';

  // State for the textarea's current value
  const [value, setValue] = useState<string>(initialValue);

  // State for history: stack of values and current pointer
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyPointer, setHistoryPointer] = useState<number>(0);

  // Debounced function to save snapshots for normal typing
  // Using useCallback to memoize the debounced function itself
  const saveSnapshotDebounced = useCallback(
    debounce((newValue: string) => {
      setHistory((prevHistory) => {
        // If pointer is not at the end, clear future history
        const newHistory = prevHistory.slice(0, historyPointer + 1);
        if (newHistory[newHistory.length - 1] !== newValue) { // Avoid saving duplicate consecutive states
          newHistory.push(newValue);
        }
        return newHistory;
      });
      setHistoryPointer((prevPointer) => prevPointer + 1);
    }, historyDebounceDelay),
    [historyPointer, historyDebounceDelay] // Recreate if historyPointer or delay changes
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
    saveSnapshotDebounced.cancel(); // Clear any pending debounced snapshots to avoid conflicts
  }, [historyPointer, saveSnapshotDebounced]);


  // --- Undo/Redo Functions ---
  const undo = useCallback(() => {
    if (historyPointer > 0) {
      const newPointer = historyPointer - 1;
      setHistoryPointer(newPointer);
      // Use non-null assertion as historyPointer is guaranteed to be within bounds
      setValue(history[newPointer]!);
    }
  }, [history, historyPointer]);

  const redo = useCallback(() => {
    if (historyPointer < history.length - 1) {
      const newPointer = historyPointer + 1;
      setHistoryPointer(newPointer);
      // Use non-null assertion as historyPointer is guaranteed to be within bounds
      setValue(history[newPointer]!);
    }
  }, [history, historyPointer]);

  // --- Main onChange handler for the textarea (for normal typing) ---
  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    saveSnapshotDebounced(newValue); // Save snapshot after a delay
  }, [saveSnapshotDebounced]);

  // --- Keydown handler for Tab/Shift+Tab ---
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();

        const { selectionStart, selectionEnd, value: currentValue } = textarea; // Use currentValue from DOM directly

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
        let newSelectionEnd: number = selectionEnd;
        let newTextValue: string = currentValue; // Correct variable declaration
        let indentationChange: number = 0;

        if (event.shiftKey) {
          // --- Shift+Tab (Unindent) ---
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
          // --- Tab (Indent) ---
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
            // Fix: Changed 'endSelection' to 'selectionEnd'
            newTextValue = currentValue.substring(0, selectionStart) + TAB_CHAR + currentValue.substring(selectionEnd);
            newSelectionStart = newSelectionEnd = selectionStart + TAB_CHAR.length;
          }
        }

        // Update the textarea's value (DOM) and selection
        textarea.value = newTextValue;
        textarea.selectionStart = newSelectionStart;
        textarea.selectionEnd = newSelectionEnd;

        // Immediately update React state and save snapshot
        setValue(newTextValue);
        saveSnapshotImmediately(newTextValue);
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);

    // Clean up event listener
    return () => {
      textarea.removeEventListener('keydown', handleKeyDown);
      saveSnapshotDebounced.cancel(); // Ensure any pending debounced calls are cancelled on unmount
    };
  }, [visualTabSize, saveSnapshotDebounced, saveSnapshotImmediately]); // Re-run effect if these dependencies change

  // --- Keyboard Shortcuts for Undo/Redo (Ctrl/Cmd+Z, Ctrl/Cmd+Y, Ctrl/Cmd+Shift+Z) ---
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.includes('Mac');
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (isCtrlOrCmd) {
        if (event.key === 'z' || event.key === 'Z') {
          event.preventDefault();
          if (event.shiftKey) { // Ctrl/Cmd + Shift + Z for Redo
            redo();
          } else { // Ctrl/Cmd + Z for Undo
            undo();
          }
        } else if (event.key === 'y' || event.key === 'Y') { // Ctrl/Cmd + Y for Redo
          event.preventDefault();
          redo();
        }
      }
    };

    // Attach to document to catch global shortcuts
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [undo, redo]); // Re-run if undo/redo functions change (due to useCallback)


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
```

