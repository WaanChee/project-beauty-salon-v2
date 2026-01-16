import { useEffect, useState } from "react";

/**
 * Custom hook to check if admin is logged in
 * Uses direct localStorage access and listens for changes
 */
export const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // Initial check
    const checkAdmin = () => {
      try {
        const adminUserData = localStorage.getItem("adminUser");
        if (adminUserData) {
          const admin = JSON.parse(adminUserData);
          setAdminUser(admin);
          setIsAdmin(!!admin && !!admin.uid);
        } else {
          setAdminUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setAdminUser(null);
        setIsAdmin(false);
      }
    };

    checkAdmin();

    // Listen for localStorage changes from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === "adminUser") {
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
  }, []);

  return { isAdmin, adminUser };
};
