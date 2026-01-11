import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "use-local-storage";

export default function CustomerAuthGuard({ children }) {
  const [customerToken] = useLocalStorage("customerToken", "");
  const navigate = useNavigate();

  useEffect(() => {
    if (!customerToken) {
      navigate("/customer/auth");
    }
  }, [customerToken, navigate]);

  // Only render children if authenticated
  if (!customerToken) {
    return null;
  }

  return <>{children}</>;
}
