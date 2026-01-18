import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCustomerStatus } from "../hooks/useCustomerStatus";

export default function CustomerAuthGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useCustomerStatus();

  useEffect(() => {
    console.log("🔵 CustomerAuthGuard Check:", {
      isAuthenticated,
      isLoading,
      currentPath: location.pathname,
      timestamp: new Date().toISOString(),
    });

    if (!isLoading && !isAuthenticated) {
      console.log("❌ Not authenticated, redirecting to auth page...");
      navigate("/customer/auth", { replace: true });
    }
  }, [navigate, location.pathname, isAuthenticated, isLoading]);

  // Show nothing while checking (prevents flash of content)
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
