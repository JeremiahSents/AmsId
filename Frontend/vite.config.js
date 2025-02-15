/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tsconfigPaths()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  server: {
    // Only include development server config
    port: process.env.PORT || 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    },
    open: true // This will open the browser automatically
  },

  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    assetsDir: 'assets',
  }
}))