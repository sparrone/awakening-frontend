/**
 * Environment Configuration Utility
 * 
 * This file provides a centralized way to access environment variables with:
 * - Type safety
 * - Validation 
 * - Fallback values
 * - Clear error messages
 */

interface EnvironmentConfig {
  // Environment Information
  environment: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
  
  // Debug Settings
  debugMode: boolean;
  enableDebugLogging: boolean;
  
  // Dev Environment Features
  showDevBanner: boolean;
}

/**
 * Converts string environment variable to boolean
 * Vite environment variables are always strings, so we need to convert
 */
function getBooleanEnvVar(value: string | undefined, defaultValue: boolean = false): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Validates that required environment variables are present
 */
function validateEnvironmentConfig(): void {
  const requiredVars = ['VITE_ENVIRONMENT'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName as keyof ImportMetaEnv]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Creates and validates the environment configuration
 */
function createEnvironmentConfig(): EnvironmentConfig {
  // Validate required variables first
  validateEnvironmentConfig();
  
  const environment = import.meta.env.VITE_ENVIRONMENT as 'development' | 'production' | 'test';
  
  return {
    // Environment Information
    environment,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    
    // Debug Settings
    debugMode: getBooleanEnvVar(import.meta.env.VITE_DEBUG_MODE, false),
    enableDebugLogging: getBooleanEnvVar(import.meta.env.VITE_ENABLE_DEBUG_LOGGING, false),
    
    // Dev Environment Features
    showDevBanner: getBooleanEnvVar(import.meta.env.VITE_DEV_BANNER, false),
  };
}

// Export the singleton configuration
export const env = createEnvironmentConfig();

// Helper function for logging (respects debug settings)
export function debugLog(message: string, ...args: any[]): void {
  if (env.enableDebugLogging) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}