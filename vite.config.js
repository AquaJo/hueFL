import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [cssInjectedByJsPlugin(), vue()],
  build: {
    rollupOptions: {
      input: {
        settings: path.resolve(__dirname, 'src/settings/src/main.js'), // passe den Pfad zur Hauptdatei in 'src/settings' an
      },
      output: {
        entryFileNames: 'bundle.js', // Kein Hash im Dateinamen für JS-Dateien
        chunkFileNames: '[name].js', // Kein Hash im Dateinamen für Chunks
        assetFileNames: '[name].[ext]', // Kein Hash im Dateinamen für andere Assets
      },
    },
    outDir: 'src/settings/dist',
  },
});
