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

  // Modal state
  const [modalShow, setModalShow] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
  });

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
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: null,
      });
    }
  };

  // ============================================================================
  // VALIDATE FORM (CLIENT-SIDE)
  // ============================================================================
  const validateSignupForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
    } else if (formData.phone_number.length < 10) {
      errors.phone_number = "Please enter a valid phone number";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLoginForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================================
  // HANDLE SIGNUP
  // ============================================================================
  const handleSignup = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);
    setFieldErrors({});

    // Validate form
    if (!validateSignupForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("📝 Attempting signup...");

      const response = await axios.post(`${API_URL}/customer/signup`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone_number: formData.phone_number.trim(),
        password: formData.password,
      });

      console.log("✅ Signup successful:", response.data);

      setSuccessMessage(
        "🎉 Account created successfully! Please sign in with your credentials."
      );

      // Clear form
      setFormData({ name: "", email: "", phone_number: "", password: "" });

      // Wait 1.5 seconds, then switch to login
      setTimeout(() => {
        setModalShow("Login");
        setSuccessMessage(null);
      }, 1500);
    } catch (error) {
      console.error("❌ Signup error:", error);

      // Extract error message from response
      let errorMessage = "Signup failed. Please try again.";

      if (error.response) {
        // Server responded with error
        const serverMessage = error.response.data?.message;

        if (serverMessage) {
          errorMessage = serverMessage;
        } else if (error.response.status === 400) {
          errorMessage = "Please check your information and try again.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage =
          "Cannot connect to server. Please check your internet connection.";
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

    // Clear previous errors
    setError(null);
    setFieldErrors({});

    // Validate form
    if (!validateLoginForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Attempting login...");

      const response = await axios.post(`${API_URL}/customer/login`, {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("✅ Login successful:", response.data);

      if (response.data?.auth && response.data?.token) {
        // Save to localStorage
        setCustomerToken(response.data.token);
        setCustomerUser(response.data.user);

        setSuccessMessage("✅ Welcome back! Redirecting to your dashboard...");

        // Navigate after short delay
        setTimeout(() => {
          navigate("/customer/dashboard");
        }, 1000);
      }
    } catch (error) {
      console.error("❌ Login error:", error);

      // Extract error message
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        const serverMessage = error.response.data?.message;

        if (serverMessage) {
          errorMessage = serverMessage;
        } else if (error.response.status === 400) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        errorMessage =
          "Cannot connect to server. Please check your internet connection.";
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
    setFormData({ name: "", email: "", phone_number: "", password: "" });
  };

  // ============================================================================
  // GET PASSWORD STRENGTH
  // ============================================================================
  const getPasswordStrength = (password) => {
    if (!password) return { strength: "", color: "" };

    if (password.length < 8) {
      return { strength: "Too short", color: "danger" };
    } else if (password.length < 12) {
      return { strength: "Weak", color: "warning" };
    } else if (password.length < 16) {
      return { strength: "Good", color: "info" };
    } else {
      return { strength: "Strong", color: "success" };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
              className="rounded-pill"
              onClick={() => setModalShow("SignUp")}
              disabled={loading}
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
              disabled={loading}
            >
              Sign In
            </Button>
          </div>
        </Col>
      </Row>

      {/* ====================================================================== */}
      {/* AUTH MODAL */}
      {/* ====================================================================== */}
      <Modal
        show={modalShow !== null}
        onHide={handleClose}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalShow === "SignUp" ? "Create Your Account" : "Sign In"}
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
            {/* SIGNUP FIELDS */}
            {modalShow === "SignUp" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    isInvalid={!!fieldErrors.name}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+60123456789"
                    isInvalid={!!fieldErrors.phone_number}
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.phone_number}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Include country code (e.g., +60 for Malaysia)
                  </Form.Text>
                </Form.Group>
              </>
            )}

            {/* EMAIL FIELD (Both) */}
            <Form.Group className="mb-3">
              <Form.Label>Email Address *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                isInvalid={!!fieldErrors.email}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* PASSWORD FIELD (Both) */}
            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    modalShow === "SignUp"
                      ? "Create a strong password (min 8 characters)"
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

              {/* Password strength indicator (signup only) */}
              {modalShow === "SignUp" && formData.password && (
                <div className="mt-2">
                  <small className={`text-${passwordStrength.color}`}>
                    <i className="bi bi-shield-fill me-1"></i>
                    Password strength:{" "}
                    <strong>{passwordStrength.strength}</strong>
                  </small>
                </div>
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
                <>{modalShow === "SignUp" ? "Create Account" : "Sign In"}</>
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
                Don't have an account?{" "}
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
