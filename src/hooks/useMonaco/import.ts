import { useEffect, useState } from "react";
import type { useMonacoResult, MonacoInstance } from "@/utils/monaco-editor/types";
import { importMode } from "@/utils/monaco-editor/importMode";

export const useMonaco = (): useMonacoResult => {
  const [monaco, setMonaco] = useState<MonacoInstance | undefined | null>();
  const [error, setError] = useState<Error | undefined | null>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setMonaco(null);
    setError(null);

    importMode()
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
  }, []);

  return { monaco, error, isLoading };
}
