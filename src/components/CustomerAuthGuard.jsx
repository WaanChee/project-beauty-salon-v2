import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function CustomerAuthGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) return;

    // Use direct localStorage.getItem() instead of hook
    const customerToken = localStorage.getItem("customerToken");
    const isValidToken =
      customerToken && customerToken !== "" && customerToken !== "null";

    console.log("🔵 CustomerAuthGuard Check:", {
      hasToken: isValidToken,
      currentPath: location.pathname,
      timestamp: new Date().toISOString(),
    });

    if (!isValidToken) {
      console.log("❌ No valid token found, redirecting to auth page...");
      setHasRedirected(true);
      setIsChecking(false);
      navigate("/customer/auth", { replace: true });
    } else {
      console.log("✅ Token found, access granted");
      setIsChecking(false);
    }
  }, [navigate, location.pathname, hasRedirected]);

  // Show nothing while checking (prevents flash of content)
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
