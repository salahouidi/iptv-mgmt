import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
          // This will transform your SVG to a React component
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
    ],
    define: {
      // Make env variables available in the app
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'https://iptv-management-api.houidi-salaheddine.workers.dev/api'),
      'import.meta.env.VITE_USE_MOCK_DATA': JSON.stringify(env.VITE_USE_MOCK_DATA || 'false'),
      'import.meta.env.VITE_ENVIRONMENT': JSON.stringify(env.VITE_ENVIRONMENT || 'production'),
      'import.meta.env.VITE_DEBUG': JSON.stringify(env.VITE_DEBUG || 'false'),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      port: 5174,
      host: true
    }
  }
});
