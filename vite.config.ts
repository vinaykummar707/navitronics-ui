import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router/") ||
              id.includes("/react-router-dom/")
            ) {
              return "react-vendor";
            }
            if (id.includes("/@supabase/")) {
              return "supabase-vendor";
            }
            if (id.includes("/@tanstack/")) {
              return "tanstack-vendor";
            }
            if (
              id.includes("/@subframe/") ||
              id.includes("/@radix-ui/") ||
              id.includes("/@headlessui/")
            ) {
              return "ui-vendor";
            }
            if (id.includes("/jszip/") || id.includes("/file-saver/")) {
              return "export-vendor";
            }
          }
        },
      },
    },
  },
  server: {
    port: 9092,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  plugins: [react(), tsConfigPaths()],
});
