import { defineConfig, loadEnv } from "vite"; // Import loadEnv
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // Load env vars

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL, // Use env var here
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
