import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    libInjectCss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // server: {
  //   port: 5178, // Default = 5173
  //   /** @DOCS : https://vitejs.dev/config/server-options.html#server-strictport */
  //   // strictPort: true, // Default = false
  //   host: true,
  // },
  build: {
    // lib: {
    //   entry: resolve(__dirname, 'src/index.ts'),
    //   name: 'QUIReact',
    //   fileName: (format) => `q-react-ui.${format}.js`,
    // },
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'), // Main bundle
        Avatar: resolve(__dirname, 'src/components/Avatar/index.tsx'),
        AvatarGroup: resolve(__dirname, 'src/components/AvatarGroup/index.tsx'),
        Form: resolve(__dirname, 'src/components/Form/index.tsx'),
        Resizable: resolve(__dirname, 'src/components/Resizable/index.tsx'),

        MonacoEditor: resolve(__dirname, 'src/components/MonacoEditor/index.tsx'),
        MonacoEditorCDN: resolve(__dirname, 'src/components/MonacoEditor/cdn.tsx'),
        MonacoEditorImport: resolve(__dirname, 'src/components/MonacoEditor/import.tsx'),

        // Hooks:
        useNetwork: resolve(__dirname, 'src/hooks/useNetwork/index.tsx'),
        // For utilities without CSS
        // 'utils/someUtils': resolve(__dirname, 'src/utils/someUtils.ts'),
      },
      name: 'QReactUI',
      formats: ['es', 'cjs'], // , 'umd'
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    // outDir: 'dist',
    // sourcemap: true, // Keep sourcemaps for easier debugging of production issues
    // 
    minify: 'terser',
    terserOptions: {
      compress: {
        // drop_console: true, // Optional: Remove console.log statements
        drop_debugger: true, // Optional: Remove debugger statements
        arrows: true,       // Converts functions to arrow functions
        comparisons: true,  // Optimizes `typeof` checks, if false will Disables '==' optimization
        conditionals: true, // Flattens nested ternaries
        toplevel: true,     // Minifies top-level functions
      },
      format: {
        comments: false, // Removes comments
      },
    },
    rollupOptions: {
      // FOR EXCLUDING DEPENDENCIES
      external: ['react', 'react-dom', 'q-js-utils'],
      output: {
        // For UMD build
        // globals: {
        //   react: 'React',
        //   'react-dom': 'ReactDOM',
        // },
        // IMPORTANT: Remove the assetFileNames logic that forced a single style.css.
        // libInjectCss handles CSS injection directly into the JS.
        // If you had other assets (images, fonts), you'd define rules for them here.
        // 'assets/[name].[ext]'
        assetFileNames: 'assets/[name]-[hash].[ext]', // For non-CSS assets
      },
    },
    cssCodeSplit: true, // Make sure CSS code splitting is enabled
  },
})
