import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL;

  return {
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Proxy /api -> Supabase Edge Functions so admin session cookies are
    // FIRST-PARTY (same-origin) — avoids third-party cookie blocking & CORS.
    // The HttpOnly session cookie's domain is rewritten to this dev host.
    proxy: supabaseUrl
      ? {
          "/api": {
            target: `${supabaseUrl}/functions/v1`,
            changeOrigin: true,
            secure: true,
            rewrite: (p) => p.replace(/^\/api/, ""),
            cookieDomainRewrite: "",
          },
        }
      : undefined,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  };
});
