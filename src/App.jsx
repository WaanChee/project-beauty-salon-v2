import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import Home from "./pages/Home";
import AddBooking from "./pages/AddBooking";
import AuthPage from "./pages/AuthPage";
import AuthGuard from "./components/AuthGuard";

function Layout() {
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
            </Nav>

            {/* Right-side area: login button */}
            <div className="d-flex">
              <Button
                as={Link}
                to="/login"
                variant="dark"
                style={{ fontSize: "15px", minWidth: "80px" }}
              >
                Login
              </Button>
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
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="addBooking" element={<AddBooking />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="adminPage" element={<AuthGuard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
