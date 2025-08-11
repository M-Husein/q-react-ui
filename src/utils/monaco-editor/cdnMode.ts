import type { ScriptSrc, ScriptAttributes, MonacoInstance } from './types';

let cdnPromise: Promise<MonacoInstance> | undefined | null;

export const cdnMode = (
  src: ScriptSrc,
  scriptAttrs?: ScriptAttributes
): Promise<MonacoInstance> => {
  if (cdnPromise) return cdnPromise;

  let urls = Array.isArray(src) ? src : [src];

  const tryLoad = (index: number): Promise<MonacoInstance> => {
    if (!urls[index]) {
      return Promise.reject(new Error("No more CDN URLs to try"));
    }

    if (index >= urls.length) {
      return Promise.reject(new Error("All Monaco CDN URLs failed"));
    }

    let loaderUrl = urls[index].endsWith("loader.js")
      ? urls[index]
      : `${urls[index].replace(/\/$/, "")}/loader.js`;

    return new Promise((resolve, reject) => {
      if ((window as any).monaco) {
        resolve((window as any).monaco);
        return;
      }

      let existingScript = document.querySelector(`script[src="${loaderUrl}"]`) as HTMLScriptElement | null;

      const onMonacoReady = (monaco?: MonacoInstance) => {
        let tries = 0;
        let maxTries = 100;
        const check = () => {
          let monacoSrc = (window as any).monaco || monaco;
          if (monacoSrc) {
            resolve(monacoSrc);
          } else if (navigator.onLine && tries < maxTries) {
            tries++;
            setTimeout(check, 50);
          } else {
            // reject(new Error("Monaco did not become available"));
            reject(new Error(`Failed load Monaco ${navigator.onLine ? 'within timeout' : 'cause no connection'}`));
          }
        };
        check();
      };

      if (existingScript) {
        if (existingScript.hasAttribute("data-loaded")) {
          onMonacoReady();
        } else {
          existingScript.addEventListener("load", () => {
            existingScript.setAttribute("data-loaded", "");
            onMonacoReady();
          });
          existingScript.addEventListener("error", () => {
            tryLoad(index + 1).then(resolve).catch(reject);
          });
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

        (window as any).require(["vs/editor/editor.main"], onMonacoReady);

        script.setAttribute("data-loaded", "");
      };

      script.onerror = () => {
        script.remove();
        tryLoad(index + 1).then(resolve).catch(reject);
      };

      document.body.appendChild(script);
    });
  };

  cdnPromise = tryLoad(0);

  return cdnPromise;
}
