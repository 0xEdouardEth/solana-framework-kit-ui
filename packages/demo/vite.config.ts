import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Vite ignores node_modules by default — un-ignore the workspace symlink
      ignored: ["!**/node_modules/solana-framework-kit-ui/**"],
    },
  },
  optimizeDeps: {
    // Don't pre-bundle the workspace package so Vite always reads dist/ directly
    exclude: ["solana-framework-kit-ui"],
  },
});
