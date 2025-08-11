import { useEffect, useState } from "react";
import type { useMonacoResult, MonacoInstance, ScriptSrc, ScriptAttributes } from "@/utils/monaco-editor/types";
import { cdnMode } from "@/utils/monaco-editor/cdnMode";

export const useMonaco = (
  src: ScriptSrc,
  scriptAttrs?: ScriptAttributes
): useMonacoResult => {
  const [monaco, setMonaco] = useState<MonacoInstance | undefined | null>();
  const [error, setError] = useState<Error | undefined | null>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setMonaco(null);
    setError(null);

    cdnMode(src, scriptAttrs)
      .then((m) => {
        if (!isCancelled) {
          setMonaco(m);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [src, scriptAttrs]);

  return { monaco, error, isLoading };
}

//

// import { useEffect, useState } from "react";
// import { loadMonaco, type MonacoInstance, type ScriptAttributes } from "@/utils/monacoLoader";

// export const useMonaco = (
//   src?: string,
//   scriptAttrs?: ScriptAttributes
// ): MonacoInstance | null => {
//   const [monaco, setMonaco] = useState<MonacoInstance | null>(null);

//   useEffect(() => {
//     let isMounted = true;

//     loadMonaco(src, scriptAttrs).then((m) => {
//       if(isMounted) setMonaco(m);
//     });

//     return () => {
//       isMounted = false;
//     };
//   }, [src, scriptAttrs]);

//   return monaco;
// }
