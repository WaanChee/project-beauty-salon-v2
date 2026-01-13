import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "use-local-storage";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import AdminPage from "../pages/AdminPage";

export default function ProfilePage() {
  const [adminUser, setAdminUser] = useLocalStorage("adminUser", null);
  const navigate = useNavigate();

  // Check for adminUser immediately upon component mount and whenever adminUser changes
  // Redirect to login if no admin user
  useEffect(() => {
    if (!adminUser) {
      navigate("/login");
    }
  }, [adminUser, navigate]);

  const handleLogout = async () => {
    try {
      // Sign out from Firebase first
      await signOut(auth);

      // Clear localStorage
      localStorage.removeItem("adminUser");

      // Clear state
      setAdminUser(null);

      console.log("✅ Admin logout successful");

      // Navigate to login
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force clear even if Firebase signOut fails
      localStorage.removeItem("adminUser");
      setAdminUser(null);
      navigate("/login");
    }
  };

  // Don't render anything if no admin user (during redirect)
  if (!adminUser) {
    return null;
  }

  return (
    <Container fluid>
      <AdminPage handleLogout={handleLogout} />
    </Container>
  );
}
