import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()], // Removed tailwindcss()
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    allowedHosts: [
      'localhost',
      'ams-frontend-container-app.lemonplant-94fe58ad.eastus.azurecontainerapps.io', // Add your Azure Container Apps host here
    ],
    host: '0.0.0.0',
    port: 3000,        // This sets your dev server to run on port 3000
    open: true,         // This will automatically open your browser when the server starts
    watch:{
      usePolling: true // This is needed for WSL2 users
    },
    strictPort:true,
  }
})
