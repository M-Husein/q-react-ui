import { useRef, useEffect, useState, useCallback } from 'react';
import { debounceAdvanced as debounce } from 'q-js-utils/debounceAdvanced';

interface UseTextareaEditorOptions {
  initialValue?: string;
  // For enabling/disabling Tab key handling
  tab?: boolean; // old name enableTabIndentation
  tabSize?: number; // old name visualTabSize
  historyDelay?: number; // old name historyDebounceDelay
  autoSize?: boolean | { min?: number; max?: number }; // old option { minHeight?: number; maxHeight?: number }
}

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
    tabSize = 4,
    historyDelay = 300,
    autoSize,
    tab,
  }: UseTextareaEditorOptions = {}
): TextareaEditorHookResult => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const measurementRef = useRef<HTMLDivElement | null>(null); // Ref for the hidden measurement element
  const TAB_CHAR = '\t';

  // State for the textarea's current value
  const [value, setValue] = useState<string>(initialValue);

  // State for history: stack of values and current pointer
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyPointer, setHistoryPointer] = useState<number>(0);

  // Auto-resize logic
  const adjustTextareaHeight = useCallback(() => {
    if(!autoSize) return;

    const textarea = textareaRef.current;
    const measurementDiv = measurementRef.current;

    if(!textarea || !measurementDiv) return;

    // 1. Copy computed styles from textarea to measurement div
    const computedStyle = window.getComputedStyle(textarea);
    const divStyle = measurementDiv.style;

    [
      'boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'fontFamily', 'fontSize', 'lineHeight', 'letterSpacing', 'textTransform', 'wordBreak',
      'whiteSpace', 'tabSize', 'overflowWrap', 'wordWrap' // Include wordWrap for older browsers
    ].forEach(prop => {
      // @ts-ignore - Index signature for CSSStyleDeclaration is not always perfect
      divStyle[prop] = computedStyle[prop];
    });

    // Specific styles for measurement:
    divStyle.position = 'absolute'; // Don't affect layout
    divStyle.visibility = 'hidden'; // Make it invisible
    divStyle.pointerEvents = 'none'; // Not interactive
    divStyle.top = '0';
    divStyle.left = '0';
    divStyle.height = 'auto'; // Allow it to calculate height freely
    divStyle.minHeight = '0';
    divStyle.maxHeight = 'none';
    divStyle.overflow = 'hidden'; // Hide internal scrollbar
    divStyle.whiteSpace = 'pre-wrap'; // Preserve whitespace and wrap
    divStyle.wordBreak = 'break-word'; // Break long words

    // Set the width of the measurement div to match the textarea's clientWidth
    // This is crucial for correct word wrapping and height calculation.
    divStyle.width = textarea.clientWidth + "px";

    // divStyle.cssText = 'width:' + textarea.clientWidth + 'px;position:absolute;visibility:hidden;pointer-events:none;top:0;left:0;height:auto;min-height:0;max-height:none;overflow:hidden;white-space:pre-wrap;word-break:break-word';

    // Set the content of the measurement div
    // Ensure height for a trailing empty line
    let contentToMeasure = textarea.value;
    if(contentToMeasure.length === 0){
      contentToMeasure = '\u00A0'; // Non-breaking space for empty textarea
    } 
    else if(contentToMeasure.endsWith('\n')){
      contentToMeasure += '\u00A0'; // Ensure height for a trailing empty line
    }
    measurementDiv.textContent = contentToMeasure;

    // 2. Calculate new height
    let newHeight = measurementDiv.scrollHeight;

    // 3. Apply min/max height constraints if autoSize is an object
    if(typeof autoSize === 'object'){
      const { min: minHeight, max: maxHeight } = autoSize;
      if(minHeight != null){
        newHeight = Math.max(newHeight, minHeight);
      }
      if(maxHeight != null){
        newHeight = Math.min(newHeight, maxHeight);
      }
    }

    // 4. Apply the calculated height to the visible textarea
    textarea.style.height = newHeight + "px";
  }, [autoSize]);

  // Effect to manage the hidden measurement element and ResizeObserver
  useEffect(() => {
    const textarea = textareaRef.current;

    if(!autoSize){
      // If autoSize is disabled, ensure no fixed height is applied by the hook
      if(textarea){
        textarea.style.height = ''; // Reset height
      }
      // Remove measurement div if it exists and autoSize is off
      if(measurementRef.current && document.body.contains(measurementRef.current)){
        document.body.removeChild(measurementRef.current);
        measurementRef.current = null;
      }
      return;
    }

    // Create measurement div if it doesn't exist
    if(!measurementRef.current){
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

    // Adjust height on initial mount/value change
    adjustTextareaHeight();

    // ResizeObserver Setup (The requested change)
    let resizeObserver: ResizeObserver | null | undefined;
    if(textarea && typeof ResizeObserver !== 'undefined'){
      // The observer will call adjustTextareaHeight whenever the textarea's size changes.
      // This covers changes due to window resizing, container resizing, or other layout shifts.
      resizeObserver = new ResizeObserver(() => adjustTextareaHeight());
      resizeObserver.observe(textarea);
    }

    return () => {
      // Clean up the ResizeObserver
      if(resizeObserver){
        resizeObserver.disconnect();
      }
      
      // Clean up the measurement div when the component unmounts
      if(measurementRef.current && document.body.contains(measurementRef.current)){
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
        if(newHistory[newHistory.length - 1] !== newValue){
          newHistory.push(newValue);
        }
        return newHistory;
      });
      setHistoryPointer((prevPointer) => prevPointer + 1);
    }, historyDelay),
    [historyPointer, historyDelay]
  );

  // Function to save a snapshot immediately (e.g., after indent/unindent)
  const saveSnapshotImmediately = useCallback((newValue: string) => {
    setHistory((prevHistory) => {
      const newHistory = prevHistory.slice(0, historyPointer + 1);
      if(newHistory[newHistory.length - 1] !== newValue){
        newHistory.push(newValue);
      }
      return newHistory;
    });
    setHistoryPointer((prevPointer) => prevPointer + 1);
    saveSnapshotDebounced.cancel();
  }, [historyPointer, saveSnapshotDebounced]);

  // Utility to ensure focus
  const focusTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    // Check if the textarea element exists and is not currently focused
    if(textarea && document.activeElement !== textarea){
      textarea.focus();
    }
  }, []);

  // Undo/Redo Functions
  const undo = useCallback(() => {
    if(historyPointer > 0){
      const newPointer = historyPointer - 1;
      setHistoryPointer(newPointer);
      setValue(history[newPointer]!);
      
      // 1. Ensure focus
      focusTextarea();

      // 2. Adjust height after undo/redo, with a slight delay for DOM update
      setTimeout(adjustTextareaHeight, 0);
    }
  }, [history, historyPointer, adjustTextareaHeight, focusTextarea]);

  const redo = useCallback(() => {
    if(historyPointer < history.length - 1){
      const newPointer = historyPointer + 1;
      setHistoryPointer(newPointer);
      setValue(history[newPointer]!);

      // 1. Ensure focus
      focusTextarea();

      // 2. Adjust height after undo/redo, with a slight delay for DOM update
      setTimeout(adjustTextareaHeight, 0);
    }
  }, [history, historyPointer, adjustTextareaHeight, focusTextarea]);

  // Main onChange handler for the textarea (for normal typing)
  const handleChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = evt.target.value;
    setValue(newValue);
    saveSnapshotDebounced(newValue);
    adjustTextareaHeight(); // Explicitly call height adjustment here
  }, [saveSnapshotDebounced, adjustTextareaHeight]);

  // Keydown handler for Tab/Shift+Tab
  useEffect(() => {
    const textarea = textareaRef.current;
    if(!textarea) return;

    const handleKeyDown = (evt: KeyboardEvent) => {
      // Only handle Tab key if `tab` is true
      if(tab && evt.key === 'Tab'){
        evt.preventDefault();

        const { selectionStart, selectionEnd, value: currentValue } = textarea;
        const lines = currentValue.split('\n');

        let currentLineStart = 0;
        let startLineIndex = 0;
        let endLineIndex = 0;

        for(let i = 0; i < lines.length; i++){
          const lineLength = lines[i]!.length + 1;
          if(selectionStart >= currentLineStart && selectionStart < currentLineStart + lineLength){
            startLineIndex = i;
          }
          if(selectionEnd >= currentLineStart && selectionEnd < currentLineStart + lineLength){
            endLineIndex = i;
          }
          currentLineStart += lineLength;
        }

        if(selectionEnd === currentLineStart - 1 && endLineIndex > startLineIndex){
          endLineIndex--;
        }

        const selectedLines = lines.slice(startLineIndex, endLineIndex + 1);
        const isMultiLineSelection = startLineIndex !== endLineIndex || (selectionStart !== selectionEnd && selectedLines.length > 0);

        let newSelectionStart: number = selectionStart;
        let newSelectionEnd: number = selectionEnd; // Fix: Removed duplicate 'number ='
        let newTextValue: string = currentValue;
        let indentationChange: number = 0;

        if(evt.shiftKey){
          const unindentedLines = selectedLines.map(line => {
            if(line.startsWith(TAB_CHAR)){
              indentationChange -= TAB_CHAR.length;
              return line.substring(TAB_CHAR.length);
            }
            else{
              let removedSpaces = 0;
              for(let i = 0; i < tabSize && i < line.length; i++){
                if(line[i] === ' '){
                  removedSpaces++;
                }else{
                  break;
                }
              }
              if(removedSpaces > 0){
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
        } 
        else {
          if(isMultiLineSelection || selectionStart !== selectionEnd){
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
          } 
          else {
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
  }, [tabSize, tab, saveSnapshotDebounced, saveSnapshotImmediately, adjustTextareaHeight]);

  // Keyboard Shortcuts for Undo/Redo (Ctrl/Cmd+Z, Ctrl/Cmd+Y, Ctrl/Cmd+Shift+Z)
  useEffect(() => {
    // Determine if the OS is Mac for Cmd key
    const isMac = typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');

    const handleGlobalKeyDown = (evt: KeyboardEvent) => {
      const isCtrlOrCmd = isMac ? evt.metaKey : evt.ctrlKey;

      if(isCtrlOrCmd){
        if(evt.key === 'z' || evt.key === 'Z'){
          evt.preventDefault();
          evt.shiftKey ? redo() : undo();
        } 
        else if(evt.key === 'y' || evt.key === 'Y'){
          evt.preventDefault();
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
