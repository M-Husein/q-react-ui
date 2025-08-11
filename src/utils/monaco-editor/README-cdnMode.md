# cdnMode

## Option 1

Only single src url.

```ts
import type { ScriptAttributes, MonacoInstance } from './types';

let cdnPromise: Promise<MonacoInstance> | undefined | null;

export const cdnMode = (
  src: string, 
  scriptAttrs?: ScriptAttributes
): Promise<MonacoInstance> => {
  if (cdnPromise) return cdnPromise;

  cdnPromise = new Promise((resolve, reject) => {
    if ((window as any).monaco) {
      resolve((window as any).monaco);
      return;
    }

    let loaderUrl = src.endsWith("loader.js") ? src : `${src.replace(/\/$/, "")}/loader.js`;

    // Check if script with this src already exists
    let existingScript = document.querySelector(`script[src="${loaderUrl}"]`) as HTMLScriptElement | null;

    const onMonacoReady = (monaco?: MonacoInstance) => {
      let tries = 0;
      const maxTries = 100; // 5 seconds max (100 * 50ms)

      const check = () => {
        const monacoSrc = (window as any).monaco || monaco;
        if (monacoSrc) {
          resolve(monacoSrc);
        } else if (navigator.onLine && tries < maxTries) {
          tries++;
          setTimeout(check, 50);
        } else {
          reject(new Error(`Failed load Monaco ${navigator.onLine ? 'within timeout' : 'cause no connection'}`));
        }
      };
      check();
    };

    if (existingScript) {
      if (existingScript.hasAttribute('data-loaded')) {
        onMonacoReady();
      } else {
        existingScript.addEventListener('load', () => {
          existingScript.setAttribute('data-loaded', '1');
          onMonacoReady();
        });
        existingScript.addEventListener('error', reject);
      }
      return;
    }

    let script = document.createElement("script");
    // script.async = true;
    script.src = loaderUrl;

    if (scriptAttrs) {
      Object.entries(scriptAttrs).forEach(([k, v]) => script.setAttribute(k, v));
    }

    script.onload = () => {
      (window as any).require.config({ 
        paths: { 
          vs: loaderUrl.replace(/\/loader\.js$/, "") 
        } 
      });

      (window as any).require(["vs/editor/editor.main"], (monaco: MonacoInstance) => {
        onMonacoReady(monaco);
      });

      /**
       * Optional
       */
      // const vsBase = loaderUrl.replace(/\/loader\.js$/, ""); // src.replace(/\/vs\/loader\.js$/, "/vs");

      // (window as any).require.config({ paths: { vs: vsBase } });

      // console.log("require exists?", (window as any).require);

      // (window as any).MonacoEnvironment = {
      //   getWorkerUrl: (_moduleId: string, label: string) => {
      //     switch (label) {
      //       case "json":
      //         return `${vsBase}/language/json/json.worker.js`;
      //       case "css":
      //         return `${vsBase}/language/css/css.worker.js`;
      //       case "html":
      //         return `${vsBase}/language/html/html.worker.js`;
      //       case "typescript":
      //       case "javascript":
      //         return `${vsBase}/language/typescript/ts.worker.js`;
      //       default:
      //         return `${vsBase}/editor/editor.worker.js`;
      //     }
      //   },
      //   getWorker: (_moduleId: string, label: string) => {
      //     const url = (() => {
      //       switch (label) {
      //         case "json":
      //           return `${vsBase}/language/json/json.worker.js`;
      //         case "css":
      //           return `${vsBase}/language/css/css.worker.js`;
      //         case "html":
      //           return `${vsBase}/language/html/html.worker.js`;
      //         case "typescript":
      //         case "javascript":
      //           return `${vsBase}/language/typescript/ts.worker.js`;
      //         default:
      //           return `${vsBase}/editor/editor.worker.js`;
      //       }
      //     })();

      //     return new Worker(url);
      //   }
      // };

      // (window as any).require(["vs/editor/editor.main"], (monaco: MonacoInstance) => {
      //   // resolve(monaco || (window as any).monaco);
      //   onMonacoReady(monaco);
      // });

      script.setAttribute('data-loaded', '1');
    };

    script.onerror = (err) => {
      script.remove();
      cdnPromise = null;  // reset to allow retry
      reject(err);
    };

    document.body.appendChild(script);
  });

  return cdnPromise;
}

/**
 * Optional
 */
// const workerBlobUrlCache = new Map<string, string>();

// const createWorkerLoader = (workerScriptUrl: string): string => {
//   if (workerBlobUrlCache.has(workerScriptUrl)) {
//     return workerBlobUrlCache.get(workerScriptUrl)!;
//   }
//   const code = `self.onmessage = function(){}; importScripts("${workerScriptUrl}");`;
//   const blobUrl = URL.createObjectURL(new Blob([code], { type: "application/javascript" }));
//   workerBlobUrlCache.set(workerScriptUrl, blobUrl);
//   return blobUrl;
// }
```

