import { useEffect, useState } from "react";
import type { useMonacoResult, MonacoInstance, ScriptAttributes } from "@/utils/monaco-editor/types";
import { loader } from "@/utils/monaco-editor";

export const useMonaco = (
  src?: string | string[],
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

    loader(src, scriptAttrs)
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
