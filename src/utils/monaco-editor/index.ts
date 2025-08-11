import type { MonacoInstance, ScriptAttributes } from './types';
import { cdnMode } from './cdnMode';
import { importMode } from './importMode';

let monacoPromise: Promise<MonacoInstance> | undefined | null;

export const loader = (
  src?: string | string[],
  scriptAttrs?: ScriptAttributes
): Promise<MonacoInstance> => {
  if(monacoPromise) return monacoPromise;

  // SSR / non-browser environment safeguard
  // if (typeof window === 'undefined' || typeof document === 'undefined') {
  //   return Promise.reject(
  //     new Error('Monaco loader cannot run in a non-browser environment')
  //   );
  // }

  monacoPromise = src ? 
    cdnMode(src, scriptAttrs) // CDN mode
    : 
    importMode(); // Dynamic import mode (npm)

  return monacoPromise;
}
