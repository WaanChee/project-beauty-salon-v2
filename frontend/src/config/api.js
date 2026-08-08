// ============================================================================
// API CONFIGURATION
// Centralized backend API URL for all HTTP requests
// ============================================================================

const defaultApiUrl = "http://localhost:3000";
const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

if (!import.meta.env.VITE_API_URL) {
  const message =
    "[VITE_API_URL not set] Using fallback http://localhost:3000. " +
    "In production, this will fail unless VITE_API_URL is configured with your backend URL.";

  if (import.meta.env.PROD) {
    console.error(message);
  } else {
    console.warn(message);
  }
}

// Log the current API URL in development
if (import.meta.env.DEV) {
  console.log("🔗 API URL:", API_URL);
}

export { API_URL };
export default API_URL;
