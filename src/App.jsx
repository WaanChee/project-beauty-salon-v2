import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import Home from "./pages/Home";
import AddBooking from "./pages/AddBooking";
import AuthPage from "./pages/AuthPage";
import AuthGuard from "./components/AuthGuard";
import LoginSelector from "./pages/LoginSelector";
import CustomerAuthPage from "./pages/CustomerAuthPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerAuthGuard from "./components/CustomerAuthGuard";
import useLocalStorage from "use-local-storage";
import { signOut } from "firebase/auth";

function Layout() {
  const [customerToken, setCustomerToken] = useLocalStorage(
    "customerToken",
    ""
  );
  const [customerUser, setCustomerUser] = useLocalStorage("customerUser", null);

  // Handle customer logout
  const handleCustomerLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear localStorage directly
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerUser");

      // Clear state
      setCustomerToken("");
      setCustomerUser(null);

      console.log("✅ Logged out successfully");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force clear even if Firebase signOut fails
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerUser");
      setCustomerToken("");
      setCustomerUser(null);
    }
  };

  return (
    <>
      <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand href="/" style={{ fontWeight: "bold" }}>
            Nova Grace!
          </Navbar.Brand>

          {/* Hamburger for mobile */}
          <Navbar.Toggle aria-controls="main-nav" />

          {/* Collapsible nav - use me-auto to push next element to the right */}
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/addBooking">
                Book a salon
              </Nav.Link>
              {/* add more left-side links here if needed */}

              {/* SHOW "My Bookings" if customer is logged in */}
              {customerToken && (
                <Nav.Link as={Link} to="/customer/dashboard">
                  My Bookings
                </Nav.Link>
              )}
            </Nav>

            {/* Right-side area: login button */}
            <div className="d-flex gap-2">
              {/* IF customer is logged in, show their name and logout */}
              {customerToken ? (
                <>
                  <span className="navbar-text me-2">
                    👋 {customerUser?.name}
                  </span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleCustomerLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  as={Link}
                  to="/login"
                  variant="dark"
                  size="sm"
                  style={{ fontSize: "16px", minWidth: "75px" }}
                >
                  Login
                </Button>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Login selector - choose customer or admin */}
        <Route path="login" element={<LoginSelector />} />

        {/* Admin auth page */}
        <Route path="login/admin" element={<AuthPage />} />

        {/* Customer auth page */}
        <Route path="customer/auth" element={<CustomerAuthPage />} />

        {/* Main layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="addBooking" element={<AddBooking />} />
          <Route path="adminPage" element={<AuthGuard />} />

          {/* Customer dashboard - PROTECTED */}
          <Route
            path="customer/dashboard"
            element={
              <CustomerAuthGuard>
                <CustomerDashboard />
              </CustomerAuthGuard>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
