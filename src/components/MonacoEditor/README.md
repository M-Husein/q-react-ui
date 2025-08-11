# MonacoEditor

1. index.tsx  - Option for use monaco source from CDN or Dynamic import
  Usage:
```tsx
import { MonacoEditor } from 'MonacoEditor';
```
2. cdn.tsx    - CDN only
  Usage:
```tsx
import { MonacoEditor } from 'MonacoEditor/cdn';
```
3. import.tsx - Dynamic import only, must install monaco-editor
  Usage:
```tsx
import { MonacoEditor } from 'MonacoEditor/import';
```

## Option 1

Without support Diff editor

```tsx
import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect
} from "react";
import { useMonaco } from "@/hooks//useMonaco";

export interface MonacoEditorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange">{
  value?: string;
  language?: string;
  theme?: string;
  options?: any;
  src?: string; // optional CDN base
  scriptAttrs?: Record<string, string>;
  onChange?: (value: string) => void;
  // Option ✅ no conflict
  // onValueChange?: (value: string) => void;
}

export interface MonacoEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
  getMonaco: () => any;
  getEditor: () => any;
}

export const MonacoEditor = forwardRef<MonacoEditorRef, MonacoEditorProps>(
  (
    {
      value = "",
      language = "javascript",
      theme = "vs-dark",
      options = {},
      src,
      scriptAttrs,
      onChange,
      ...divProps // will contain style, className, id, aria-*, data-*, etc
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<any>(null);
    const monaco = useMonaco(src, scriptAttrs);

    useEffect(() => {
      if (monaco && containerRef.current) {
        editorRef.current = monaco.editor.create(containerRef.current, {
          value,
          language,
          theme,
          automaticLayout: true,
          ...options
        });

        if (onChange) {
          editorRef.current.onDidChangeModelContent(() => {
            onChange(editorRef.current.getValue());
          });
        }

        return () => {
          editorRef.current?.dispose();
        };
      }
    }, [monaco]);

    useImperativeHandle(ref, () => ({
      getValue: () => editorRef.current?.getValue(),
      setValue: (val: string) => {
        const model = editorRef.current?.getModel();
        if(model) monaco?.editor.setModelMarkers(model, "", []);
        
        editorRef.current?.setValue(val);
      },
      getMonaco: () => monaco,
      getEditor: () => editorRef.current
    }));

    return (
      <div
        {...divProps}
        ref={containerRef}
        // style={{ width: "100%", height: "100%" }}
      />
    );
  }
);
```
