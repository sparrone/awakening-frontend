/// <reference types="vite/client" />

/**
 * Environment Variables Type Definitions
 * 
 * This file defines the types for environment variables used throughout the application.
 * Vite automatically loads variables prefixed with VITE_ from .env files.
 */

interface ImportMetaEnv {
  // Backend API Configuration
  readonly VITE_API_BASE_URL: string;
  
  // Environment Identifier
  readonly VITE_ENVIRONMENT: 'development' | 'production' | 'test';
  
  // Debug Settings
  readonly VITE_DEBUG_MODE: string; // 'true' or 'false' as string
  readonly VITE_ENABLE_DEBUG_LOGGING: string; // 'true' or 'false' as string
  
  // Dev Environment Features
  readonly VITE_DEV_BANNER?: string; // Optional - shows "DEV ENVIRONMENT" banner
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}