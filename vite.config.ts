<<<<<<< HEAD

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProd = mode === 'production';

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: isProd 
        ? false // Disable HMR completely in production
        : {
            // In development, use specific configuration
            host: "localhost",
            port: 8080,
            overlay: false
          }
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Ensure TypeScript knows about these environment variables
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || "https://euwulgurffyxhazhirqh.supabase.co"),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1d3VsZ3VyZmZ5eGhhemhpcnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4Mjc5ODcsImV4cCI6MjA1OTQwMzk4N30.Nz8VanS1hR1YrOSqen0wFqVeGPGsIEhR3jZt_b0VhVA"),
      // Add this to handle the WebSocket token issue
      '__WS_TOKEN__': JSON.stringify('dummy-token-for-build')
    }
  };
});
=======

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProd = mode === 'production';

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: isProd 
        ? false // Disable HMR completely in production
        : {
            // In development, use specific configuration
            host: "localhost",
            port: 8080,
            overlay: false,
            clientPort: undefined // Changed from null to undefined to match TypeScript type
          }
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Ensure TypeScript knows about these environment variables
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || "https://euwulgurffyxhazhirqh.supabase.co"),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1d3VsZ3VyZmZ5eGhhemhpcnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4Mjc5ODcsImV4cCI6MjA1OTQwMzk4N30.Nz8VanS1hR1YrOSqen0wFqVeGPGsIEhR3jZt_b0VhVA"),
      // Handle WebSocket token issue
      '__WS_TOKEN__': JSON.stringify('dummy-token-for-build')
    }
  };
});
>>>>>>> 4cdcce7c25244790c554bde60d8c924ea1ebf32e
