import type * as monaco from "monaco-editor";

export type MonacoInstance = typeof monaco;

// Import type for worker constructor
export type WorkerConstructor = new (...args: any[]) => Worker;

export type ScriptSrc = string | string[];

/**
 * Attributes allowed for the dynamically loaded Monaco <script> tag.
 * Includes common attributes + allows additional data-* attributes.
 */
export interface ScriptAttributes extends Omit<Partial<HTMLScriptElement>, "src" | "children"> {
  /**
   * Any custom `data-*` attributes.
   */
  [key: `data-${string}`]: string | undefined;
}

// Gives: "javascript" | "typescript" | "json" | ...
// type MonacoLanguage = (typeof monaco.languages.getLanguages extends () => infer R
//   ? R extends Array<infer L>
//     ? L extends { id: infer ID }
//       ? ID extends string
//         ? ID
//         : never
//       : never
//     : never
//   : never);

type MonacoLanguage = monaco.languages.ILanguageExtensionPoint["id"];

type MonacoTheme = 'vs' | 'vs-dark' | 'hc-black' | (string & {});
// Option OR
// type MonacoTheme = 'vs' | 'vs-dark' | 'hc-black' | Parameters<typeof monaco.editor.setTheme>[0];

export interface MonacoEditorRef {
  monaco: MonacoInstance;
  editor: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor | null;
}

export interface MonacoEditorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> {
  value?: string;
  defaultValue?: string; // uncontrolled
  language?: MonacoLanguage; // undefined → Monaco default (plaintext)
  theme?: MonacoTheme; // undefined → Monaco default (vs)
  readOnly?: boolean;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  originalValue?: string;
  loader?: React.ReactNode;
  onChange?: (value: string) => void;
}

export interface MonacoEditorCdnProps extends MonacoEditorProps {
  src: ScriptSrc;
  scriptAttrs?: ScriptAttributes;
}

export interface MonacoEditorCdnImportProps extends MonacoEditorProps {
  src?: ScriptSrc;
  scriptAttrs?: ScriptAttributes;
}

export type useMonacoResult = {
  monaco: MonacoInstance | undefined | null; 
  error: Error | undefined | null; 
  isLoading: boolean
}
