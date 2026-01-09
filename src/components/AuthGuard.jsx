import { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "use-local-storage";
import AdminSideBar from "./AdminSideBar";
import AdminPage from "../pages/AdminPage";

export default function ProfilePage() {
  const [authToken, setAuthToken] = useLocalStorage("authToken", "");
  const navigate = useNavigate();

  // Check for authToken immediately upon component mount and whenever authToken changes
  // Redirect to login if no token
  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }
  }, [authToken, navigate]);

  const handleLogout = () => {
    setAuthToken(""); // Clear the token
    navigate("/login"); // Redirect to login
  };

  return (
    <Container fluid>
      <Row>
        <AdminSideBar handleLogout={handleLogout} />
        <AdminPage />
      </Row>
    </Container>
  );
}
