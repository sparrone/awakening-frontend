import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  // Environment-specific base path
  base: mode === 'production' ? '/awakening/' : '/',
  
  // Development server configuration
  server: {
    // Proxy configuration for development only
    // In production, we'll use full URLs from environment variables
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:8080', // Spring Boot backend
        changeOrigin: true,
        secure: false,
      },
    } : undefined,
  },
  
  // Environment variable configuration
  envDir: '.', // Look for .env files in the root directory
}));
