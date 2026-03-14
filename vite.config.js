import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://server-nexora.onrender.com/api',
        changeOrigin: true,
        // CRITICAL: This allows the proxy to ignore the invalid/weak SSL certificate
        secure: false, 
        // Ensures that the path sent to the backend is correct
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})