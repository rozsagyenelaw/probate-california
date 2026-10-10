import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// The SSR build (src/entry-server.jsx) is only used at build time by scripts/prerender.mjs.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  ssr: {
    // bundle these so the build-time renderer does not depend on their Node entry points
    noExternal: ['react-helmet-async', 'lucide-react'],
  },
  build: isSsrBuild ? {} : {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor-ui': ['lucide-react', 'react-helmet-async'],
        }
      }
    }
  }
}))
