import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import AdminPage from "../pages/AdminPage";
import { useAdminStatus } from "../hooks/useAdminStatus";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, adminUser, isLoading, logoutAdmin } =
    useAdminStatus();

  // Check for admin authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login/admin", { replace: true });
    }
  }, [navigate, isLoading, isAuthenticated]);

  const handleLogout = async () => {
    try {
      // Sign out from Firebase first
      await signOut(auth);
      // Clear local auth state via hook
      logoutAdmin();

      // Navigate to login
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Ensure local auth is cleared even if Firebase signOut fails
      logoutAdmin();
      navigate("/login");
    }
  };

  // Show nothing while checking authentication
  if (isLoading || !isAuthenticated || !adminUser) {
    return null;
  }

  return (
    <Container fluid>
      <AdminPage handleLogout={handleLogout} />
    </Container>
  );
}
