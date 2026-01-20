// ============================================================================
// API CONFIGURATION
// Centralized backend API URL for all HTTP requests
// ============================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Log the current API URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL);
}

export { API_URL };
export default API_URL;
