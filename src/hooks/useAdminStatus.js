import { useEffect, useState, useCallback } from "react";

// Keys used in localStorage for admin authentication state
const ADMIN_USER_KEY = "adminUser";
const ADMIN_TOKEN_KEY = "adminToken";

/**
 * useAdminStatus
 * - Centralized, robust admin auth state derived from localStorage
 * - Listens to storage changes and a custom "adminStatusChanged" event
 * - Exposes helpers for refresh and logout to keep usage consistent
 */
export const useAdminStatus = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdmin = useCallback(() => {
    setIsLoading(true);
    try {
      const userJson = localStorage.getItem(ADMIN_USER_KEY);
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);

      const tokenValid = !!token && token !== "null" && token !== "";
      setHasToken(tokenValid);

      if (userJson) {
        const parsed = JSON.parse(userJson);
        // Consider admin valid if user has any of these identifiers
        const validUser =
          parsed &&
          (parsed.uid || parsed.email || parsed.username || parsed.name);

        if (validUser) {
          setAdminUser(parsed);
        } else {
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
    } catch (err) {
      console.error("Error checking admin status:", err);
      setAdminUser(null);
      setHasToken(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkAdmin();

    // Listen for localStorage changes from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === ADMIN_USER_KEY || e.key === ADMIN_TOKEN_KEY) {
        checkAdmin();
      }
    };

    // Also listen for custom events from the same tab
    const handleCustomEvent = () => {
      checkAdmin();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("adminStatusChanged", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("adminStatusChanged", handleCustomEvent);
    };
  }, [checkAdmin]);

  const logoutAdmin = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      setAdminUser(null);
      setHasToken(false);
      // Notify listeners to refresh their state
      window.dispatchEvent(new CustomEvent("adminStatusChanged"));
    } catch (err) {
      console.error("Error during admin logout:", err);
    }
  }, []);

  const isAdmin =
    !!adminUser && !!(adminUser.uid || adminUser.email || adminUser.username);
  const isAuthenticated = isAdmin && hasToken;

  return {
    isAdmin,
    isAuthenticated,
    adminUser,
    isLoading,
    refresh: checkAdmin,
    logoutAdmin,
  };
};
