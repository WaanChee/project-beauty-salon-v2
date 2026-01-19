import { useEffect, useState, useCallback } from "react";

// Keys used in localStorage for customer authentication state
const CUSTOMER_USER_KEY = "customerUser";
const CUSTOMER_TOKEN_KEY = "customerToken";

/**
 * useCustomerStatus
 * - Centralized, robust customer auth state derived from localStorage
 * - Listens to storage changes and a custom "customerStatusChanged" event
 * - Exposes helpers for refresh and logout to keep usage consistent
 * - Mirrors useAdminStatus pattern for code consistency
 */
export const useCustomerStatus = () => {
  const [customerUser, setCustomerUser] = useState(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkCustomer = useCallback(() => {
    setIsLoading(true);
    try {
      const userJson = localStorage.getItem(CUSTOMER_USER_KEY);
      const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);

      const tokenValid = !!token && token !== "null" && token !== "";
      setHasToken(tokenValid);

      if (userJson) {
        const parsed = JSON.parse(userJson);
        // Consider customer valid if user has any of these identifiers
        const validUser =
          parsed && (parsed.uid || parsed.email || parsed.phone || parsed.name);

        if (validUser) {
          setCustomerUser(parsed);
        } else {
          setCustomerUser(null);
        }
      } else {
        setCustomerUser(null);
      }
    } catch (err) {
      console.error("Error checking customer status:", err);
      setCustomerUser(null);
      setHasToken(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkCustomer();

    // Listen for localStorage changes from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === CUSTOMER_USER_KEY || e.key === CUSTOMER_TOKEN_KEY) {
        checkCustomer();
      }
    };

    // Also listen for custom events from the same tab
    const handleCustomEvent = () => {
      checkCustomer();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("customerStatusChanged", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("customerStatusChanged", handleCustomEvent);
    };
  }, [checkCustomer]);

  const logoutCustomer = useCallback(() => {
    try {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
      localStorage.removeItem(CUSTOMER_USER_KEY);
      setCustomerUser(null);
      setHasToken(false);
      // Notify listeners to refresh their state
      window.dispatchEvent(new CustomEvent("customerStatusChanged"));
    } catch (err) {
      console.error("Error during customer logout:", err);
    }
  }, []);

  const isCustomer =
    !!customerUser &&
    !!(customerUser.uid || customerUser.email || customerUser.phone);
  const isAuthenticated = isCustomer && hasToken;

  return {
    isCustomer,
    isAuthenticated,
    customerUser,
    isLoading,
    refresh: checkCustomer,
    logoutCustomer,
  };
};
