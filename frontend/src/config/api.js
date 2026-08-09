// ============================================================================
// API CONFIGURATION
// Centralized backend API URL for all HTTP requests
// ============================================================================

const defaultApiUrl = "http://localhost:3000";
const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const normalizedApiUrl = rawApiUrl ? rawApiUrl.replace(/\/+$/g, "") : null;
const API_URL = normalizedApiUrl || defaultApiUrl;

if (!normalizedApiUrl) {
  const message =
    "[VITE_API_URL not set] Using fallback http://localhost:3000. " +
    "In production, this will fail unless VITE_API_URL is configured with your backend URL. " +
    "DO NOT set it to your Vercel frontend URL.";

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
