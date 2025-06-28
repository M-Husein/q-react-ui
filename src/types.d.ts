import 'react';

declare module 'react' {
  interface CSSProperties {
    // Allows any CSS variable (e.g., `--ml`)
    [key: `--${string}`]: string | number;
  }
}
