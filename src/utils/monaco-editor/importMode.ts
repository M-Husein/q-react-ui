import type { WorkerConstructor } from './types';

let importPromise: Promise<any> | undefined | null;

export const importMode = () => {
  if (importPromise) return importPromise;

  importPromise = (async () => {
    const monaco = await import("monaco-editor");

    // Inject Monaco CSS (required in npm mode)
    await import("monaco-editor/min/vs/editor/editor.main.css");

    if (!self.MonacoEnvironment) {
      self.MonacoEnvironment = {
        getWorker: (_: any, label: string) => createWorker(label),
      };
    }

    return monaco;
  })();

  return importPromise;
}

/**
 * Worker mapping for npm dynamic import mode (Vite/Webpack).
 */
const createWorker = async (label: string): Promise<Worker> => {
  let WorkerCtor: { default: WorkerConstructor };

  switch (label) {
    case "json":
      WorkerCtor = await import("monaco-editor/esm/vs/language/json/json.worker?worker");
      break;

    case "css":
    case "scss":
    case "less":
      WorkerCtor = await import("monaco-editor/esm/vs/language/css/css.worker?worker");
      break;

    case "html":
    case "handlebars":
    case "razor":
      WorkerCtor = await import("monaco-editor/esm/vs/language/html/html.worker?worker");
      break;

    case "typescript":
    case "javascript":
      WorkerCtor = await import("monaco-editor/esm/vs/language/typescript/ts.worker?worker");
      break;

    default:
      WorkerCtor = await import("monaco-editor/esm/vs/editor/editor.worker?worker");
      break;
  }

  return new WorkerCtor.default();
}
