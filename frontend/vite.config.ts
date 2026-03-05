import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 1234,
    proxy: {
      "/graphql": {
        target: "http://localhost:2345",
        changeOrigin: true,
      },
      "/upload": {
        target: "http://localhost:2345",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
