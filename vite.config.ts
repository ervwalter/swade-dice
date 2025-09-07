import { defineConfig } from "vite";
// @ts-expect-error - path module import needed for Vite config
import { resolve } from "path";
import react from "@vitejs/plugin-react";

declare const __dirname: string;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.glb", "**/*.hdr"],
  server: {
    cors: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        background: resolve(__dirname, "background.html"),
        popover: resolve(__dirname, "popover.html"),
      },
    },
  },
});
