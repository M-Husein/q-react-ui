import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import type { MonacoEditorRef, MonacoEditorProps } from "@/utils/monaco-editor/types";
import { useMonaco } from "@/hooks/useMonaco/import";

export const Editor = forwardRef<MonacoEditorRef, MonacoEditorProps>(
  (
    {
      value,
      defaultValue,
      originalValue, // To Diff editor
      language, // default "plaintext",
      theme, // default "vs"
      readOnly,
      options,
      loader,
      onChange,
      ...rest
    },
    ref
  ) => {
    const { monaco, isLoading } = useMonaco();
    const containerRef = useRef<HTMLDivElement>(null);
    const lastValueRef = useRef<string | undefined>(value ?? defaultValue ?? "");
    const [editorInstance, setEditorInstance] = useState<any>(null);

    const isControlled = value != null;

    // Keep lastValueRef in sync when controlled
    useEffect(() => {
      if (isControlled) {
        lastValueRef.current = value ?? "";
      }
    }, [value, isControlled]);

    useEffect(() => {
      if (!monaco || !containerRef.current) return;

      let dispose: (() => void) | undefined;

      const initialValue = isControlled ? value! : defaultValue ?? "";

      if (originalValue == null) {
        // Single Editor
        const editor = monaco.editor.create(containerRef.current, {
          automaticLayout: true,
          ...options,
          value: initialValue,
          language,
          theme,
          readOnly,
        });

        setEditorInstance(editor);

        if (onChange) {
          editor.onDidChangeModelContent(() => {
            const newValue = editor.getValue();
            if (newValue !== lastValueRef.current) {
              lastValueRef.current = newValue;
              onChange(newValue);
            }
          });
        }
      } 
      else {
        // Diff Editor
        const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
          automaticLayout: true,
          ...options,
          theme,
          readOnly,
        });

        const originalModel = monaco.editor.createModel(originalValue, language);
        const modifiedModel = monaco.editor.createModel(initialValue, language);

        diffEditor.setModel({
          original: originalModel,
          modified: modifiedModel,
        });

        if (onChange) {
          modifiedModel.onDidChangeContent(() => {
            const newValue = modifiedModel.getValue();
            if (newValue !== lastValueRef.current) {
              lastValueRef.current = newValue;
              onChange(newValue);
            }
          });
        }
      }

      /**
       * When `dispose()` the editor, Monaco’s created models and workers might still linger in memory unless explicitly disposed.
       * If want memory cleanup (important for hot reload in dev):
       */
      dispose = () => {
        if (editorInstance) {
          const model = editorInstance.getModel();
          if (model) {
            if ("modified" in model) {
              model.original.dispose();
              model.modified.dispose();
            } else {
              model.dispose();
            }
          }
          editorInstance.dispose();
          setEditorInstance(null);
        }
      };

      return () => dispose?.();
    }, [monaco]);

    useImperativeHandle(
      ref,
      () => ({
        monaco: monaco!,
        editor: editorInstance
      }),
      [monaco, editorInstance]
    );

    // Theme change: Dynamically change theme only if provided
    useEffect(() => {
      if (monaco && theme) {
        monaco.editor.setTheme(theme);
      }
    }, [theme, monaco]);

    // Dynamically update readOnly option
    useEffect(() => {
      if (editorInstance) {
        editorInstance.updateOptions({ readOnly });
      }
    }, [readOnly, editorInstance]);

    // Update options dynamically
    useEffect(() => {
      if (editorInstance && options) {
        editorInstance.updateOptions(options);
      }
    }, [options, editorInstance]);

    // Value + language updates (supports both diff + single editors)
    useEffect(() => {
      if (!monaco || !editorInstance) return;

      const model = editorInstance.getModel();

      if (!isControlled) {
        // Uncontrolled: only sync language
        if (language) {
          if ("modified" in model) {
            monaco.editor.setModelLanguage(model.original, language);
            monaco.editor.setModelLanguage(model.modified, language);
          } else {
            monaco.editor.setModelLanguage(model, language);
          }
        }
        return;
      }

      if (model) {
        if ("modified" in model) {
          // Diff editor
          if (value !== undefined && value !== model.modified.getValue()) {
            model.modified.setValue(value);
          }

          if (language) {
            monaco.editor.setModelLanguage(model.original, language);
            monaco.editor.setModelLanguage(model.modified, language);
          }
        } 
        else {
          // Single editor
          if (value !== undefined && value !== model.getValue()) {
            model.setValue(value);
          }

          if (language) {
            monaco.editor.setModelLanguage(model, language);
          }
        }
      }
    }, [value, language, monaco, isControlled, editorInstance]);

    return (
      <>
        {isLoading && (loader ?? "Loading")}
        
        <div 
          {...rest}
          ref={containerRef}
          aria-readonly={readOnly}
        />
      </>
    );
  }
);
