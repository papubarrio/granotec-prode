import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../backend/public/dist",
    emptyOutDir: true,
  },
  server: {
    // Dev only — proxies /api to the local backend
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
