import {
  Container,
  Col,
  Image,
  Row,
  Button,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import useLocalStorage from "use-local-storage";
import { useNavigate } from "react-router-dom";
import pic2 from "../assets/images/beauty-salon-login-page-bg.png";

export default function CustomerAuthPage() {
  const navigate = useNavigate();

  // ============================================================================
  // API URL - Update this to match your backend
  // ============================================================================
  const API_URL =
    "https://bdf8b629-3ab0-47ff-9325-50227345e965-00-1zki6gacehg14.pike.replit.dev";

  // ============================================================================
  // STATE
  // ============================================================================
  const [customerToken, setCustomerToken] = useLocalStorage(
    "customerToken",
    ""
  );
  const [customerUser, setCustomerUser] = useLocalStorage("customerUser", null);

  // Modal state: null, "Login", or "SignUp"
  const [modalShow, setModalShow] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
  });

  // Loading and messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ============================================================================
  // REDIRECT IF ALREADY LOGGED IN
  // ============================================================================
  useEffect(() => {
    if (customerToken) {
      navigate("/customer/dashboard");
    }
  }, [customerToken, navigate]);

  // ============================================================================
  // CLEAR MESSAGES AFTER 5 SECONDS
  // ============================================================================
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // ============================================================================
  // HANDLE INPUT CHANGES
  // ============================================================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ============================================================================
  // HANDLE SIGNUP
  // ============================================================================
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log("📝 Signing up...");
      const response = await axios.post(`${API_URL}/customer/signup`, {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
      });

      console.log("✅ Signup successful:", response.data);
      setSuccessMessage("Account created successfully! Please sign in.");

      // Clear form and switch to login
      setFormData({ name: "", email: "", phone_number: "", password: "" });
      setModalShow("Login");
    } catch (error) {
      console.error("❌ Signup error:", error);
      setError(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HANDLE LOGIN
  // ============================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log("🔐 Logging in...");
      const response = await axios.post(`${API_URL}/customer/login`, {
        email: formData.email,
        password: formData.password,
      });

      console.log("✅ Login successful:", response.data);

      if (response.data && response.data.auth === true && response.data.token) {
        // Save to localStorage
        setCustomerToken(response.data.token);
        setCustomerUser(response.data.user);

        setSuccessMessage("Welcome back!");

        // Navigate to dashboard
        setTimeout(() => {
          navigate("/customer/dashboard");
        }, 500);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HANDLE MODAL CLOSE
  // ============================================================================
  const handleClose = () => {
    setModalShow(null);
    setError(null);
    setSuccessMessage(null);
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <Container>
      <Row className="min-vh-100">
        <Col sm={7} className="d-none d-sm-block p-0">
          <Image
            src={pic2}
            fluid
            style={{ height: "100%", objectFit: "cover" }}
          />
        </Col>

        <Col sm={5} className="p-5 d-flex flex-column justify-content-center">
          <h2 className="mb-2" style={{ fontSize: 36, fontWeight: "bold" }}>
            Welcome Back!
          </h2>
          <p className="text-muted mb-5">
            Sign in to manage your salon bookings
          </p>

          {/* Error Message */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {/* Success Message */}
          {successMessage && (
            <Alert
              variant="success"
              dismissible
              onClose={() => setSuccessMessage(null)}
            >
              {successMessage}
            </Alert>
          )}

          <div className="d-grid gap-3">
            <Button
              size="lg"
              className="rounded-pill"
              onClick={() => setModalShow("SignUp")}
            >
              Create Account
            </Button>

            <p className="text-center mb-0" style={{ fontWeight: "bold" }}>
              Already have an account?
            </p>

            <Button
              size="lg"
              className="rounded-pill"
              variant="outline-primary"
              onClick={() => setModalShow("Login")}
            >
              Sign In
            </Button>
          </div>
        </Col>
      </Row>

      {/* ====================================================================== */}
      {/* AUTH MODAL */}
      {/* ====================================================================== */}
      <Modal show={modalShow !== null} onHide={handleClose} centered size="lg">
        <Modal.Body className="p-5">
          <h2 className="mb-4" style={{ fontWeight: "bold" }}>
            {modalShow === "SignUp" ? "Create Your Account" : "Sign In"}
          </h2>

          <Form
            className="d-grid gap-3"
            onSubmit={modalShow === "SignUp" ? handleSignup : handleLogin}
          >
            {modalShow === "SignUp" && (
              <>
                <Form.Group>
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+60123456789"
                    required
                  />
                </Form.Group>
              </>
            )}

            <Form.Group>
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Password *</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (min 8 characters)"
                required
                minLength={8}
              />
            </Form.Group>

            <Button
              className="rounded-pill mt-3"
              type="submit"
              size="lg"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : modalShow === "SignUp"
                ? "Create Account"
                : "Sign In"}
            </Button>
          </Form>

          {modalShow === "SignUp" && (
            <p className="text-center mt-3 text-muted">
              Already have an account?{" "}
              <Button
                variant="link"
                onClick={() => {
                  setModalShow("Login");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="p-0"
              >
                Sign in here
              </Button>
            </p>
          )}

          {modalShow === "Login" && (
            <p className="text-center mt-3 text-muted">
              Don't have an account?{" "}
              <Button
                variant="link"
                onClick={() => {
                  setModalShow("SignUp");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="p-0"
              >
                Create one here
              </Button>
            </p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
