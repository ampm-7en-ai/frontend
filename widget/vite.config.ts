
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'ChatWidget',
      fileName: 'chatbox-widget',
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    minify: false, // Disable minification to avoid Terser issues for now
    sourcemap: false
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
