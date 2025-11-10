import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
    preserveSymlinks: false,
    conditions: ["browser", "module", "import", "default"],
  },
  optimizeDeps: {
    include: [
      "react", 
      "react-dom", 
      "react/jsx-runtime",
      "@tanstack/react-query",
      "next-themes",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-tooltip/dist/index",
    ],
    esbuildOptions: {
      conditions: ["browser", "module", "import"],
      mainFields: ["browser", "module", "main"],
    },
  },
  cacheDir: ".vite-temp",
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
}));
