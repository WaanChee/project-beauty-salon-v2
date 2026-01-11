import {
  Container,
  Col,
  Image,
  Row,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import useLocalStorage from "use-local-storage";
import { useNavigate } from "react-router-dom";
import pic2 from "../assets/images/beauty-salon-login-page-bg.png";

export default function AuthPage() {
  const navigate = useNavigate();

  // ============================================================================
  // API URL - Update this to match your backend
  // ============================================================================
  const API_URL =
    "https://bdf8b629-3ab0-47ff-9325-50227345e965-00-1zki6gacehg14.pike.replit.dev";

  // ============================================================================
  // STATE
  // ============================================================================
  const [authToken, setAuthToken] = useLocalStorage("authToken", "");

  // Modal state
  const [modalShow, setModalShow] = useState(null);

  // Form data
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ============================================================================
  // REDIRECT IF ALREADY LOGGED IN
  // ============================================================================
  useEffect(() => {
    if (authToken) {
      navigate("/adminPage");
    }
  }, [authToken, navigate]);

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
  // VALIDATE FORM
  // ============================================================================
  const validateForm = () => {
    const errors = {};

    if (!username.trim()) {
      errors.username = "Username is required";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (modalShow === "SignUp" && password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================================
  // HANDLE SIGNUP
  // ============================================================================
  const handleSignup = async (e) => {
    e.preventDefault();

    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("📝 Creating admin account...");

      const response = await axios.post(`${API_URL}/signup`, {
        username: username.trim(),
        password,
      });

      console.log("✅ Signup successful:", response.data);

      setSuccessMessage("🎉 Admin account created! Please sign in.");
      setUsername("");
      setPassword("");

      setTimeout(() => {
        setModalShow("Login");
        setSuccessMessage(null);
      }, 1500);
    } catch (error) {
      console.error("❌ Signup error:", error);

      let errorMessage = "Signup failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Username already exists or invalid input.";
      } else if (!error.response) {
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HANDLE LOGIN
  // ============================================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Admin login attempt...");

      const response = await axios.post(`${API_URL}/login`, {
        username: username.trim(),
        password,
      });

      console.log("✅ Login successful:", response.data);

      if (response.data?.auth && response.data?.token) {
        setAuthToken(response.data.token);
        setSuccessMessage("✅ Welcome back, Admin!");

        setTimeout(() => {
          navigate("/adminPage");
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid username or password.";
      } else if (!error.response) {
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      }

      setError(errorMessage);
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
    setFieldErrors({});
    setUsername("");
    setPassword("");
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
          <div className="text-center mb-4">
            <i
              className="bi bi-shield-lock"
              style={{ fontSize: "3rem", color: "#0d6efd" }}
            ></i>
          </div>

          <h2
            className="mb-2 text-center"
            style={{ fontSize: 36, fontWeight: "bold" }}
          >
            Admin Portal
          </h2>
          <p className="text-muted mb-5 text-center">
            Manage bookings and system settings
          </p>

          {/* Error Message */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
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
              variant="primary"
              onClick={() => setModalShow("Login")}
              disabled={loading}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Admin Login
            </Button>

            <Button
              size="lg"
              variant="outline-secondary"
              onClick={() => setModalShow("SignUp")}
              disabled={loading}
            >
              <i className="bi bi-person-plus me-2"></i>
              Create Admin Account
            </Button>
          </div>

          <Alert variant="warning" className="mt-4">
            <i className="bi bi-info-circle me-2"></i>
            <small>
              <strong>Note:</strong> Admin accounts have full access to manage
              all bookings and customer data.
            </small>
          </Alert>
        </Col>
      </Row>

      {/* ====================================================================== */}
      {/* AUTH MODAL */}
      {/* ====================================================================== */}
      <Modal
        show={modalShow !== null}
        onHide={handleClose}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-shield-lock me-2"></i>
            {modalShow === "SignUp" ? "Create Admin Account" : "Admin Login"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          {/* Error in modal */}
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </Alert>
          )}

          {/* Success in modal */}
          {successMessage && (
            <Alert variant="success" className="mb-3">
              {successMessage}
            </Alert>
          )}

          <Form onSubmit={modalShow === "SignUp" ? handleSignup : handleLogin}>
            {/* USERNAME */}
            <Form.Group className="mb-3">
              <Form.Label>Username *</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) {
                    setFieldErrors({ ...fieldErrors, username: null });
                  }
                }}
                placeholder="Enter admin username"
                isInvalid={!!fieldErrors.username}
                disabled={loading}
                autoFocus
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.username}
              </Form.Control.Feedback>
            </Form.Group>

            {/* PASSWORD */}
            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors({ ...fieldErrors, password: null });
                    }
                  }}
                  placeholder={
                    modalShow === "SignUp"
                      ? "Create password (min 8 characters)"
                      : "Enter your password"
                  }
                  isInvalid={!!fieldErrors.password}
                  disabled={loading}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                </Button>
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.password}
                </Form.Control.Feedback>
              </InputGroup>
              {modalShow === "SignUp" && (
                <Form.Text className="text-muted">
                  Password must be at least 8 characters long
                </Form.Text>
              )}
            </Form.Group>

            {/* SUBMIT BUTTON */}
            <Button
              className="w-100 mt-3"
              type="submit"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  {modalShow === "SignUp"
                    ? "Creating Account..."
                    : "Signing In..."}
                </>
              ) : (
                <>
                  {modalShow === "SignUp" ? "Create Admin Account" : "Sign In"}
                </>
              )}
            </Button>
          </Form>

          {/* SWITCH BETWEEN LOGIN/SIGNUP */}
          <div className="text-center mt-4">
            {modalShow === "SignUp" && (
              <p className="text-muted mb-0">
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => {
                    setModalShow("Login");
                    setError(null);
                    setFieldErrors({});
                  }}
                  className="p-0"
                  disabled={loading}
                >
                  Sign in here
                </Button>
              </p>
            )}

            {modalShow === "Login" && (
              <p className="text-muted mb-0">
                Need to create an admin account?{" "}
                <Button
                  variant="link"
                  onClick={() => {
                    setModalShow("SignUp");
                    setError(null);
                    setFieldErrors({});
                  }}
                  className="p-0"
                  disabled={loading}
                >
                  Create one here
                </Button>
              </p>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
