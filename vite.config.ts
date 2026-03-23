import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    optimizeDeps: {
      exclude: ['@thatopen/components', '@thatopen/components-front', '@thatopen/fragments']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // 3D/BIM vendor (~5MB) — only loaded on BIM tab
            if (id.includes('node_modules/three/') || id.includes('node_modules/web-ifc/')) {
              return 'vendor-3d';
            }
            // Charts vendor — loaded on Dashboard + Reports
            if (id.includes('node_modules/recharts/')) {
              return 'vendor-charts';
            }
            // Map vendor — loaded on Dashboard + Project map views
            if (id.includes('node_modules/leaflet/') || id.includes('node_modules/react-leaflet/')) {
              return 'vendor-map';
            }
            // Document generation vendor — loaded on export
            if (id.includes('node_modules/docx/') || id.includes('node_modules/jspdf') || id.includes('node_modules/file-saver/')) {
              return 'vendor-docs';
            }
            // Icons — shared across all pages
            if (id.includes('node_modules/lucide-react/')) {
              return 'vendor-icons';
            }
            // React core — cached long-term
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router')) {
              return 'vendor-react';
            }
            // Data layer
            if (id.includes('node_modules/@supabase/') || id.includes('node_modules/@tanstack/')) {
              return 'vendor-data';
            }
          }
        }
      }
    },
    worker: {
      format: 'es'
    }
  };
});
