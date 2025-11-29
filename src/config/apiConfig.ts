/**
 * Central API Configuration
 * Provides environment-aware API base URLs
 */

/**
 * Get the API base URL from environment or default to localhost
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
}

/**
 * Check if backend APIs are available
 * Returns false in production without explicit API URL configured
 */
export function areBackendAPIsAvailable(): boolean {
  // If VITE_API_BASE_URL is set, backend is available
  if (import.meta.env.VITE_API_BASE_URL) {
    return true;
  }
  // In development, assume localhost backend is available
  return import.meta.env.MODE === 'development';
}
