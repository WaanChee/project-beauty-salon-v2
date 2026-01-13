import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function CustomerAuthGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Use direct localStorage.getItem() instead of hook
    const customerToken = localStorage.getItem("customerToken");

    console.log("🔵 CustomerAuthGuard Check:", {
      hasToken: !!customerToken,
      tokenLength: customerToken?.length || 0,
      currentPath: location.pathname,
      timestamp: new Date().toISOString(),
    });

    if (!customerToken) {
      console.log("❌ No token found, redirecting to auth page...");
      navigate("/customer/auth", { replace: true });
    } else {
      console.log("✅ Token found, access granted");
      setIsChecking(false);
    }
  }, [navigate, location.pathname]);

  // Show nothing while checking (prevents flash of content)
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
