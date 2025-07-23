
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'ChatWidget',
      fileName: 'chatbox-widget',
      formats: ['iife'] // Immediately Invoked Function Expression for script tag
    },
    rollupOptions: {
      external: [], // Don't externalize anything - bundle everything
      output: {
        globals: {},
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'chatbox-widget.css';
          }
          return assetInfo.name;
        }
      }
    },
    cssCodeSplit: false, // Include CSS in the main bundle
    sourcemap: false, // Disable sourcemap for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
