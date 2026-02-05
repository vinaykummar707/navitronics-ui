import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path"
// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 3090,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    }
  },
  plugins: [react(), tsConfigPaths()],
});
