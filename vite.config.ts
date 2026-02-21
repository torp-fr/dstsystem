import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Build-time Safety Checks
 * These ensure production builds are properly configured
 */
function validateProductionEnv() {
  if (process.env.NODE_ENV === 'production' || process.env.VITE_APP_ENV === 'production') {
    // Verify Supabase configuration
    if (!process.env.VITE_SUPABASE_URL) {
      throw new Error(
        '[BUILD] ❌ Missing VITE_SUPABASE_URL\n' +
        'Required for production builds.\n' +
        'Set in: .env, .env.production, or environment variables.\n' +
        'Get from: Supabase Dashboard → Settings → API'
      );
    }

    if (!process.env.VITE_SUPABASE_ANON_KEY) {
      throw new Error(
        '[BUILD] ❌ Missing VITE_SUPABASE_ANON_KEY\n' +
        'Required for production builds.\n' +
        'Set in: .env, .env.production, or environment variables.\n' +
        'Get from: Supabase Dashboard → Settings → API → anon key'
      );
    }

    console.log('[BUILD] ✅ Production environment validated');
    console.log('[BUILD] ✅ Supabase URL: ' + process.env.VITE_SUPABASE_URL);
    console.log('[BUILD] ✅ Supabase key: ' + (process.env.VITE_SUPABASE_ANON_KEY?.slice(0, 20) + '...'));
  }
}

// Run validation before building
validateProductionEnv();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Production optimizations
    sourcemap: false, // Disable source maps in production for security
    minify: 'esbuild', // Use esbuild for faster minification
    chunkSizeWarningLimit: 1200, // Warn if chunks exceed 1200KB

    // Rollup options for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor bundles
          'supabase': ['@supabase/supabase-js'],
          'react-query': ['@tanstack/react-query'],
          'ui-core': ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-tabs'],
        },
      },
    },

    // Target modern browsers
    target: 'ES2020',

    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: 'esbuild',
  },
}));
