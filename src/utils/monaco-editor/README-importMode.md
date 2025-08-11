# importMode

## Dev Option

```ts
const createWorker = async (label: string): Promise<Worker> => {
  let WorkerCtor: WorkerConstructor;

  switch(label) {
    case "json":
      WorkerCtor = (await import("monaco-editor/esm/vs/language/json/json.worker?worker")).default;
      break;
    case "css":
    case "scss":
    case "less":
      WorkerCtor = (await import("monaco-editor/esm/vs/language/css/css.worker?worker")).default;
      break;
    case "html":
    case "handlebars":
    case "razor":
      WorkerCtor = (await import("monaco-editor/esm/vs/language/html/html.worker?worker")).default;
      break;
    case "typescript":
    case "javascript":
      WorkerCtor = (await import("monaco-editor/esm/vs/language/typescript/ts.worker?worker")).default;
      break;
    default:
      WorkerCtor = (await import("monaco-editor/esm/vs/editor/editor.worker?worker")).default;
      break;
  }
  // Instantiate the worker class directly
  return new WorkerCtor();
}

/**
 * Dev
 */
// Glob import all language workers
const workerModules = import.meta.glob<
  { default: WorkerConstructor }
>('../../node_modules/monaco-editor/esm/vs/language/**/*.worker.js'); // ?worker, { eager: false }

// console.log('workerModules: ', workerModules);

// You can also include the editor.worker this way separately if needed:
const editorWorkerModule = import.meta.glob<
  { default: WorkerConstructor }
>('../../node_modules/monaco-editor/esm/vs/editor/editor.worker?worker'); // , { eager: false }

const editorWorkerImport = Object.values(editorWorkerModule)[0]; // only one file

// Map language labels to worker filenames (simplified):
const languageToWorkerFile: {[key: string]: string} = {
  json: 'json.worker?worker',
  css: 'css.worker?worker',
  scss: 'css.worker?worker',
  less: 'css.worker?worker',
  html: 'html.worker?worker',
  handlebars: 'html.worker?worker',
  razor: 'html.worker?worker',
  typescript: 'typescript/ts.worker?worker',
  javascript: 'typescript/ts.worker?worker',
};

/**
 * Dev
 */
const createWorker = async (label: string): Promise<Worker> => {
  // let importFn: any = () => import("monaco-editor/esm/vs/editor/editor.worker?worker"); // default fallback
  let importFn = editorWorkerImport; // default fallback

  // Find worker file by label
  const workerFile = languageToWorkerFile[label];
  if (workerFile) {
    // Find the import function from the glob object:
    const key = Object.keys(workerModules).find((k) => k.includes(workerFile));
    if (key) {
      importFn = workerModules[key];
    }
  }

  if (!importFn) {
    throw new Error(`No worker import found for label: ${label}`);
  }

  const WorkerCtor = (await importFn()).default;
  return new WorkerCtor();
};
```
