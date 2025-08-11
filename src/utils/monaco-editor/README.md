# Monaco editor

## Default Language Support in Monaco
According to the @monaco-editor/react package, the supported languages are grouped into two categories:

1. Languages with Rich IntelliSense & Validation:
  - TypeScript
  - JavaScript
  - CSS
  - LESS
  - SCSS
  - JSON
  - HTML
2. Languages with Basic Syntax Coloring Only:
  - XML
  - PHP
  - C#
  - C++
  - Razor
  - Markdown
  - Java
  - Visual Basic (VB)
  - CoffeeScript
  - Handlebars
  - Batch (Windows shell scripts)
  - Pug (formerly Jade)
  - F#
  - Lua
  - PowerShell
  - Python
  - Ruby
  - SASS
  - R
  - Objective-C

---

## How to View the Complete List via API
If you'd like to retrieve the current set of registered languages programmatically, you can use the official API:

```ts
const languages = monaco.languages.getLanguages();
console.log(languages.map(lang => lang.id));
```

This returns an array of language identifiers that are currently supported.

---

auto-detection utility for Monaco Editor that uses highlight.js’s built-in auto-detect to guess the language, then updates Monaco’s model accordingly.

```ts
import * as monaco from "monaco-editor";
import hljs from "highlight.js/lib/common";

/**
 * Map highlight.js language IDs to Monaco language IDs
 */
const hljsToMonacoMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  html: "html",
  xml: "html",
  css: "css",
  scss: "scss",
  less: "less",
  json: "json",
  markdown: "markdown",
  bash: "shell",
  shell: "shell",
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  php: "php",
  ruby: "ruby",
  go: "go",
  rust: "rust",
  sql: "sql",
  yaml: "yaml",
  // add more mappings if you need
};

/**
 * Detect language from code using highlight.js and set Monaco model language.
 * @param editor Monaco editor instance
 * @param code Optional — if not provided, it takes current editor value
 */
export function autoDetectAndSetLanguage(editor: monaco.editor.IStandaloneCodeEditor, code?: string) {
  const text = code ?? editor.getValue();
  
  const result = hljs.highlightAuto(text);
  const hljsLang = result.language || "plaintext";
  
  const monacoLang = hljsToMonacoMap[hljsLang] || "plaintext";
  
  const model = editor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, monacoLang);
  }

  return monacoLang;
}
```

### How to use it in your MonacoEditor component

```ts
import { autoDetectAndSetLanguage } from "./monacoAutoLang";

// After creating editor
const editor = monaco.editor.create(container, {
  value: "body { color: red; }",
  language: "plaintext", // start plain
});

autoDetectAndSetLanguage(editor); // detects CSS and sets automatically
```

can also re-run it whenever the user changes the content:

```ts
editor.onDidChangeModelContent(() => {
  autoDetectAndSetLanguage(editor);
});
```

✅ Why this works well:
- highlight.js can guess the language without you specifying it.
- The mapping ensures Monaco uses the correct language IDs.
- Runs in the browser, no server needed.

---

Lighter version that only loads Highlight.js languages that Monaco actually supports, so you avoid pulling in unnecessary parsers.

We'll use highlight.js/lib/core instead of highlight.js/lib/common and register only the languages you care about.

`monacoAutoLangLite.ts`

```ts
import * as monaco from "monaco-editor";
import hljs from "highlight.js/lib/core";

// Import only needed Highlight.js languages
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import scss from "highlight.js/lib/languages/scss";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import bash from "highlight.js/lib/languages/bash";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import yaml from "highlight.js/lib/languages/yaml";

// Register only these
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("scss", scss);
hljs.registerLanguage("json", json);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("python", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c", cpp);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("php", php);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("yaml", yaml);

/**
 * Map highlight.js language IDs to Monaco language IDs
 */
const hljsToMonacoMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  html: "html",
  xml: "html",
  css: "css",
  scss: "scss",
  less: "less",
  json: "json",
  markdown: "markdown",
  bash: "shell",
  shell: "shell",
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  php: "php",
  ruby: "ruby",
  go: "go",
  rust: "rust",
  sql: "sql",
  yaml: "yaml",
};

export function autoDetectAndSetLanguage(
  editor: monaco.editor.IStandaloneCodeEditor,
  code?: string
) {
  const text = code ?? editor.getValue();

  const result = hljs.highlightAuto(text);
  const hljsLang = result.language || "plaintext";

  const monacoLang = hljsToMonacoMap[hljsLang] || "plaintext";

  const model = editor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, monacoLang);
  }

  return monacoLang;
}
```

### Example usage in your MonacoEditor component

```ts
import { autoDetectAndSetLanguage } from "./monacoAutoLangLite";

const editor = monaco.editor.create(container, {
  value: "console.log('Hello');",
  language: "plaintext",
});

autoDetectAndSetLanguage(editor);

editor.onDidChangeModelContent(() => {
  autoDetectAndSetLanguage(editor);
});
```

✅ Advantages of this version
- Loads only the Highlight.js languages that Monaco can actually use.
- Reduces bundle size significantly (vs. highlight.js/lib/common).
- Still works with both Monaco CDN and dynamic import setups.

---

Tree-shakable version of the Monaco auto language detector.
This version will only include the languages you explicitly import, so any unused ones will be excluded by your bundler (Vite, Webpack, etc.).

`monacoAutoLang.ts` (tree-shakable)

```ts
import * as monaco from "monaco-editor";
import hljs from "highlight.js/lib/core";

/**
 * Register only the Highlight.js languages you need.
 * Each one is a separate import, so tree-shaking can remove unused ones.
 */
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";

// Register them manually
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("markdown", markdown);

/**
 * Map Highlight.js IDs to Monaco IDs
 */
const hljsToMonacoMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  html: "html",
  xml: "html",
  css: "css",
  json: "json",
  markdown: "markdown",
};

export function autoDetectAndSetLanguage(
  editor: monaco.editor.IStandaloneCodeEditor,
  code?: string
) {
  const text = code ?? editor.getValue();

  const result = hljs.highlightAuto(text);
  const hljsLang = result.language || "plaintext";

  const monacoLang = hljsToMonacoMap[hljsLang] || "plaintext";

  const model = editor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, monacoLang);
  }

  return monacoLang;
}
```

### How it’s tree-shakable
- We don’t import `highlight.js/lib/common` (which pulls in dozens of languages).
- Each language is manually imported from `highlight.js/lib/languages/...` so your bundler can remove unused ones.
- You can remove any `import` line for a language you don’t want to support.
- Works perfectly with CDN or dynamic-import Monaco.

### Example usage

```ts
import { autoDetectAndSetLanguage } from "./monacoAutoLang";

const editor = monaco.editor.create(container, {
  value: "console.log('Hello World');",
  language: "plaintext",
});

autoDetectAndSetLanguage(editor); // Detect once at load

// Detect again whenever content changes
editor.onDidChangeModelContent(() => {
  autoDetectAndSetLanguage(editor);
});
```

---

Lazy-loading language detection version.

This one is even more optimized because it only loads the Highlight.js language module the first time it’s actually needed.

That way, if your Monaco editor session only ever sees CSS, you don’t end up loading JavaScript, JSON, Markdown, etc.

`monacoAutoLangLazy.ts`

```ts
import * as monaco from "monaco-editor";
import hljs from "highlight.js/lib/core";

// Map Highlight.js language IDs to Monaco IDs
const hljsToMonacoMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  html: "html",
  xml: "html",
  css: "css",
  json: "json",
  markdown: "markdown",
};

// Keep track of loaded Highlight.js languages
const loadedLanguages = new Set<string>();

/**
 * Dynamically import and register an HLJS language if not already loaded.
 */
async function ensureHljsLanguage(name: string) {
  if (loadedLanguages.has(name)) return;

  const module = await import(`highlight.js/lib/languages/${name}`);
  hljs.registerLanguage(name, module.default);
  loadedLanguages.add(name);
}

/**
 * Auto-detect and set Monaco language, loading HLJS languages on demand.
 */
export async function autoDetectAndSetLanguage(
  editor: monaco.editor.IStandaloneCodeEditor,
  code?: string
) {
  const text = code ?? editor.getValue();

  // Load a minimal set of languages first so detection can happen
  // If needed, you can pre-load a few common ones here:
  await Promise.all([
    ensureHljsLanguage("javascript"),
    ensureHljsLanguage("css"),
    ensureHljsLanguage("html"),
  ]);

  const result = hljs.highlightAuto(text);
  const hljsLang = result.language || "plaintext";

  // Load the detected language if not already loaded
  if (!loadedLanguages.has(hljsLang)) {
    try {
      await ensureHljsLanguage(hljsLang);
    } catch {
      // Ignore errors for unsupported HLJS languages
    }
  }

  const monacoLang = hljsToMonacoMap[hljsLang] || "plaintext";
  const model = editor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, monacoLang);
  }

  return monacoLang;
}
```

### Why this is more efficient
- Initial bundle size is small → you’re not importing all Highlight.js languages up front.
- Languages load only when detected → if the user never types Markdown, that language never loads.
- CDN-friendly → dynamic imports from `highlight.js/lib/languages/...` work with bundlers and can be cached separately.

### Usage example

```ts
import { autoDetectAndSetLanguage } from "./monacoAutoLangLazy";

const editor = monaco.editor.create(container, {
  value: "console.log('Hello World');",
  language: "plaintext",
});

autoDetectAndSetLanguage(editor);

editor.onDidChangeModelContent(() => {
  autoDetectAndSetLanguage(editor);
});
```

---

Hybrid version that preloads the most common languages for instant detection, but still lazy-loads the rest so bundle size stays lean.

`monacoAutoLangHybrid.ts`

```ts
import * as monaco from "monaco-editor";
import hljs from "highlight.js/lib/core";

// Map Highlight.js language IDs to Monaco IDs
const hljsToMonacoMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  html: "html",
  xml: "html",
  css: "css",
  scss: "css",
  less: "css",
  json: "json",
  markdown: "markdown",
  plaintext: "plaintext",
};

// Keep track of loaded Highlight.js languages
const loadedLanguages = new Set<string>();

/**
 * Dynamically import and register an HLJS language if not already loaded.
 */
async function ensureHljsLanguage(name: string) {
  if (loadedLanguages.has(name)) return;

  try {
    const module = await import(
      /* @vite-ignore */
      `highlight.js/lib/languages/${name}`
    );
    hljs.registerLanguage(name, module.default);
    loadedLanguages.add(name);
  } catch {
    // Ignore if language not found in highlight.js
  }
}

/**
 * Preload the most common languages for instant detection
 */
async function preloadCommonLanguages() {
  const commonLangs = ["javascript", "typescript", "html", "css", "json", "markdown"];
  await Promise.all(commonLangs.map((lang) => ensureHljsLanguage(lang)));
}

// Call preload right away so detection is instant for common languages
preloadCommonLanguages();

/**
 * Auto-detect and set Monaco language, loading HLJS languages on demand.
 */
export async function autoDetectAndSetLanguage(
  editor: monaco.editor.IStandaloneCodeEditor,
  code?: string
) {
  const text = code ?? editor.getValue();
  const result = hljs.highlightAuto(text);
  const hljsLang = result.language || "plaintext";

  // Lazy-load language if not already loaded
  if (!loadedLanguages.has(hljsLang)) {
    await ensureHljsLanguage(hljsLang);
  }

  const monacoLang = hljsToMonacoMap[hljsLang] || "plaintext";
  const model = editor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, monacoLang);
  }

  return monacoLang;
}
```

### How it works
1. Preloads the top 6 languages right away → instant detection for ~90% of common use cases.
2. Lazy-loads any other language only when it’s actually detected by `highlight.js`.
3. Keeps the initial bundle small but avoids a delay when switching between common languages.

### Usage

```ts
import { autoDetectAndSetLanguage } from "./monacoAutoLangHybrid";

const editor = monaco.editor.create(container, {
  value: "console.log('Hello World');",
  language: "plaintext",
});

autoDetectAndSetLanguage(editor);

editor.onDidChangeModelContent(() => {
  autoDetectAndSetLanguage(editor);
});
```

---

CDN-based Monaco auto-language detector so you don’t bundle `highlight.js` or Monaco workers into your app.

Everything loads on demand from a CDN (jsDelivr in this example).

`monacoAutoLangCdn.js`

```js
// Load Highlight.js from CDN only once
let hljsPromise;

function loadHljsFromCdn() {
  if (hljsPromise) return hljsPromise;
  hljsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/core.min.js";
    script.onload = () => resolve(window.hljs);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return hljsPromise;
}

// Load a Highlight.js language from CDN
function loadHljsLanguage(lang) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/languages/${lang}.min.js`;
    script.onload = resolve;
    script.onerror = resolve; // fail silently if not found
    document.head.appendChild(script);
  });
}

// Map HLJS language IDs to Monaco IDs
const hljsToMonacoMap = {
  javascript: "javascript",
  typescript: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  html: "html",
  xml: "html",
  css: "css",
  scss: "css",
  less: "css",
  json: "json",
  markdown: "markdown",
  plaintext: "plaintext",
};

/**
 * Auto-detect and set Monaco language using HLJS from CDN
 */
export async function autoDetectAndSetLanguage(editor, code) {
  const hljs = await loadHljsFromCdn();
  const text = code ?? editor.getValue();
  const result = hljs.highlightAuto(text);

  const lang = result.language || "plaintext";
  if (!hljs.listLanguages().includes(lang)) {
    await loadHljsLanguage(lang);
  }

  const monacoLang = hljsToMonacoMap[lang] || "plaintext";
  const model = editor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, monacoLang);
  }

  return monacoLang;
}
```

### How it works
1. No npm install needed — Highlight.js core and languages come from jsDelivr.
2. Loads Highlight.js core once on first call.
3. Loads languages on demand the first time they’re detected.
4. Maps Highlight.js language IDs → Monaco language IDs.

### Usage Example

```html
<div id="container" style="height:400px;"></div>
<script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js"></script>
<script type="module">
  import { autoDetectAndSetLanguage } from './monacoAutoLangCdn.js';

  require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" } });
  require(["vs/editor/editor.main"], () => {
    const editor = monaco.editor.create(document.getElementById("container"), {
      value: "console.log('Hello from CDN');",
      language: "plaintext"
    });

    autoDetectAndSetLanguage(editor);

    editor.onDidChangeModelContent(() => {
      autoDetectAndSetLanguage(editor);
    });
  });
</script>
```

**This approach:**
- Keeps your bundle size tiny (nothing from highlight.js or Monaco in your build).
- Still detects languages automatically.
- Can run entirely without npm — pure browser/CDN setup.

---

