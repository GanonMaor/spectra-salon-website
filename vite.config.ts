import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
});
