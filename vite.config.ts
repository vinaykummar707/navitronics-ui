import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0, // Prevent inlining of images
    rollupOptions: {
      output: {
        assetFileNames: 'assets/BackGr', // Organize assets in the dist folder
      },
    },
  },
  server: {
    port: 3090,
  },
  plugins: [react(), tsConfigPaths()],
});
