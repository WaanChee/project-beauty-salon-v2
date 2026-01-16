import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import AdminPage from "../pages/AdminPage";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  // Check for admin authentication
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check both token and user data
        const adminToken = localStorage.getItem("adminToken");
        const adminUserData = localStorage.getItem("adminUser");

        console.log("🔍 AuthGuard checking:", {
          hasToken: !!adminToken,
          hasUser: !!adminUserData,
        });

        if (adminToken && adminUserData) {
          const user = JSON.parse(adminUserData);
          setAdminUser(user);
          setIsChecking(false);
          console.log("✅ Admin authenticated:", user.email);
        } else {
          console.log("❌ No admin auth found, redirecting to login");
          setIsChecking(false);
          navigate("/login/admin");
        }
      } catch (error) {
        console.error("Error checking admin auth:", error);
        setIsChecking(false);
        navigate("/login/admin");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Sign out from Firebase first
      await signOut(auth);

      // Clear localStorage - both token and user
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      // Clear state
      setAdminUser(null);

      // Dispatch custom event to notify other components of admin status change
      window.dispatchEvent(new CustomEvent("adminStatusChanged"));

      console.log("✅ Admin logout successful");

      // Navigate to login
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force clear even if Firebase signOut fails
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      setAdminUser(null);
      window.dispatchEvent(new CustomEvent("adminStatusChanged"));
      navigate("/login");
    }
  };

  // Show nothing while checking authentication
  if (isChecking || !adminUser) {
    return null;
  }

  return (
    <Container fluid>
      <AdminPage handleLogout={handleLogout} />
    </Container>
  );
}
