import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJs(),
    dts({
      include: ["src"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      rollupTypes: true,
      tsconfigPath: "./tsconfig.json",
    }),
  ],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SolanaFrameworkKitUI",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@solana/addresses",
        "@solana/client",
        "@solana/react-hooks",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "ReactJSXRuntime",
        },
      },
    },
    sourcemap: true,
    minify: true,
  },
});
