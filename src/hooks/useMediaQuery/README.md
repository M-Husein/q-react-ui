# useMediaQuery

## Single query
```ts
export const useMediaQuery = (
  query: string,
  onChange?: (matches: boolean) => void
): boolean => {
  const [matches, setMatches] = useState<boolean>(
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
      onChange?.(event.matches);
    };

    // Call callback once with initial value
    onChange?.(mediaQueryList.matches);

    mediaQueryList.addEventListener("change", listener);
    
    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query, onChange]);

  return matches;
}
```

## Multi-query (array), inline in useEffect dependency
```ts
import { useEffect, useState } from "react";

/**
 * React hook to track multiple CSS media queries.
 *
 * @param queries - Array of valid CSS media query strings.
 * @param onChange - Optional callback fired whenever the active queries change.
 * @returns {boolean[]} An array of booleans corresponding to each query.
 *
 * @example
 * ```tsx
 * const [isMobile, isTablet, isDesktop] = useMediaQuery(
 *   [
 *     "(max-width: 640px)",
 *     "(min-width: 641px) and (max-width: 1024px)",
 *     "(min-width: 1025px)"
 *   ],
 *   (matches) => console.log("Active queries:", matches)
 * );
 *
 * return (
 *   <div>
 *     {isMobile && "📱 Mobile"}
 *     {isTablet && "💻 Tablet"}
 *     {isDesktop && "🖥 Desktop"}
 *   </div>
 * );
 * ```
 */
export const useMediaQuery = (
  queries: string[],
  onChange?: (matches: boolean[]) => void
): boolean[] => {
  const getMatches = (): boolean[] => {
    if (typeof window === "undefined") return queries.map(() => false);
    return queries.map((q) => window.matchMedia(q).matches);
  };

  const [matches, setMatches] = useState<boolean[]>(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryLists = queries.map((q) => window.matchMedia(q));

    const update = () => {
      const newMatches = mediaQueryLists.map((mql) => mql.matches);
      setMatches(newMatches);
      onChange?.(newMatches);
    };

    update(); // initial sync
    mediaQueryLists.forEach((mql) => mql.addEventListener("change", update));

    return () => {
      mediaQueryLists.forEach((mql) =>
        mql.removeEventListener("change", update)
      );
    };
  }, [queries, onChange]);

  return matches;
}
```

## Multi-query (array), compute a stable key with useMemo
```ts
import { useEffect, useState, useRef, useMemo } from "react";

/**
 * React hook for subscribing to one or more CSS media queries.
 *
 * @param queries - An array of media query strings.
 * @param onChange - Optional callback invoked whenever the match states change.
 * @returns An array of booleans, same length/order as `queries`, representing which queries currently match.
 */
export const useMediaQuery = (
  queries: string[],
  onChange?: (matches: boolean[]) => void
): boolean[] => {
  // 🔑 Memoize queries inside the hook so users don’t need to
  const stableQueries = useMemo(() => [...queries], [JSON.stringify(queries)]);

  const getMatches = (): boolean[] =>
    typeof window !== "undefined"
      ? stableQueries.map((q) => window.matchMedia(q).matches)
      : stableQueries.map(() => false);

  const [matches, setMatches] = useState<boolean[]>(getMatches);

  // stable ref for onChange
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqls = stableQueries.map((q) => window.matchMedia(q));

    const handler = () => {
      const newMatches = mqls.map((mql) => mql.matches);

      setMatches((prev) => {
        const changed = prev.some((v, i) => v !== newMatches[i]);
        if (changed) {
          onChangeRef.current?.(newMatches);
          return newMatches;
        }
        return prev;
      });
    };

    mqls.forEach((mql) => mql.addEventListener("change", handler));

    return () => {
      mqls.forEach((mql) => mql.removeEventListener("change", handler));
    };
  }, [stableQueries]);

  return matches;
}
```

## Multi-query (custom label map)
```ts
import { useEffect, useState } from "react";

/**
 * React hook to track CSS media queries with semantic labels.
 *
 * @param queries - An object mapping semantic labels to valid CSS media queries.
 * @param onChange - Optional callback fired whenever the active label changes.
 * @returns {string | null} The active label, or null if none match.
 *
 * @example
 * ```tsx
 * const active = useMediaQueries(
 *   {
 *     mobile: "(max-width: 640px)",
 *     tablet: "(min-width: 641px) and (max-width: 1024px)",
 *     desktop: "(min-width: 1025px)"
 *   },
 *   (label) => console.log("Active:", label)
 * );
 *
 * return <div>{active === "desktop" ? "Desktop view" : "Not desktop"}</div>;
 * ```
 */
export const useMediaQueries = <
  T extends Record<string, string>
>(
  queries: T,
  onChange?: (activeLabel: keyof T | null) => void
): keyof T | null => {
  const getActiveLabel = (): keyof T | null => {
    if (typeof window === "undefined") return null;
    return (
      (Object.keys(queries) as (keyof T)[]).find((label) =>
        window.matchMedia(queries[label]).matches
      ) ?? null
    );
  };

  const [activeLabel, setActiveLabel] = useState<keyof T | null>(getActiveLabel);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryLists = (Object.keys(queries) as (keyof T)[]).map((label) =>
      window.matchMedia(queries[label])
    );

    const update = () => {
      const match =
        (Object.keys(queries) as (keyof T)[]).find((label) =>
          window.matchMedia(queries[label]).matches
        ) ?? null;
      setActiveLabel(match);
      onChange?.(match);
    };

    update(); // initial check
    mediaQueryLists.forEach((mql) => mql.addEventListener("change", update));

    return () => {
      mediaQueryLists.forEach((mql) =>
        mql.removeEventListener("change", update)
      );
    };
  }, [queries, onChange]);

  return activeLabel;
}
```
