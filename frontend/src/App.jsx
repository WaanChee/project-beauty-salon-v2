import { Container, Nav, Navbar, Button } from "react-bootstrap";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import AddBooking from "./pages/AddBooking";
import AdminAddBooking from "./pages/AdminAddBooking";
import AuthPage from "./pages/AuthPage";
import AuthGuard from "./components/AuthGuard";
import LoginSelector from "./pages/LoginSelector";
import CustomerAuthPage from "./pages/CustomerAuthPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerAuthGuard from "./components/CustomerAuthGuard";
import useLocalStorage from "use-local-storage";
import { signOut } from "firebase/auth";
import { auth } from "./config/firebase";
import { useDispatch } from "react-redux";
import { resetCustomerState } from "./features/customers/customerSlice";

function Layout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Normalize any plain-string localStorage entries so useLocalStorage can parse
  const normalizeStoredValue = (key, fallback) => {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (err) {
      try {
        const normalized = JSON.stringify(raw);
        localStorage.setItem(key, normalized);
        return JSON.parse(normalized);
      } catch (normalizeErr) {
        console.warn(`⚠️ Clearing corrupt ${key} value`, normalizeErr);
        localStorage.removeItem(key);
        return fallback;
      }
    }
  };

  const [customerToken, setCustomerToken] = useLocalStorage(
    "customerToken",
    normalizeStoredValue("customerToken", ""),
  );
  const [customerUser, setCustomerUser] = useLocalStorage(
    "customerUser",
    normalizeStoredValue("customerUser", null),
  );
  const [adminUser, setAdminUser] = useLocalStorage(
    "adminUser",
    normalizeStoredValue("adminUser", null),
  );
  const [adminToken, setAdminToken] = useLocalStorage(
    "adminToken",
    normalizeStoredValue("adminToken", ""),
  );

  // Handle customer logout
  const handleCustomerLogout = async () => {
    try {
      console.log("🚪 Logging out from navbar...");

      // Clear Redux customer state first
      dispatch(resetCustomerState());

      // Sign out from Firebase
      await signOut(auth);

      // Clear localStorage directly
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerUser");

      // Clear state
      setCustomerToken("");
      setCustomerUser(null);

      console.log("✅ Navbar logout successful");

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("❌ Navbar logout error:", error);
      // Force clear even if Firebase signOut fails
      dispatch(resetCustomerState());
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerUser");
      setCustomerToken("");
      setCustomerUser(null);
      navigate("/login");
    }
  };

  return (
    <>
      <Navbar bg="light" variant="light" expand="lg" className="app-navbar">
        <Container fluid="xl">
          <Navbar.Brand href="/" style={{ fontWeight: "bold" }}>
            Nova Grace!
          </Navbar.Brand>

          {/* Hamburger for mobile */}
          <Navbar.Toggle aria-controls="main-nav" />

          {/* Right-side login button - always visible, not in collapse */}
          <div className="d-flex align-items-center order-lg-2 ms-auto ms-lg-0">
            {/* IF admin is logged in, show logout */}
            {adminUser && typeof adminUser === "object" ? (
              <>
                <span className="navbar-text me-2">
                  👨‍💼 {adminUser?.username || "Admin"}
                </span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => {
                    setAdminUser(null);
                    setAdminToken("");
                    navigate("/login");
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
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
                  <Button as={Link} to="/login" variant="dark" size="sm">
                    Login
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Collapsible nav */}
          <Navbar.Collapse id="main-nav" className="order-lg-1">
            <Nav className="me-auto">
              {/* BOOK A SALON - Routes based on who's logged in */}
              {adminUser ? (
                <Nav.Link as={Link} to="/admin/addBooking">
                  Book a salon
                </Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/addBooking">
                  Book a salon
                </Nav.Link>
              )}

              {/* SHOW "Manage Bookings" if admin is logged in */}
              {adminUser && (
                <Nav.Link as={Link} to="/adminPage">
                  Manage Bookings
                </Nav.Link>
              )}

              {/* SHOW "My Bookings" if customer is logged in */}
              {customerToken && (
                <Nav.Link as={Link} to="/customer/dashboard">
                  My Bookings
                </Nav.Link>
              )}
            </Nav>
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
          <Route path="admin/addBooking" element={<AdminAddBooking />} />
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
