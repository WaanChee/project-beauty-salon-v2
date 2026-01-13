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
import { useNavigate } from "react-router-dom";
import useLocalStorage from "use-local-storage";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../config/firebase";
import axios from "axios";
import pic2 from "../assets/images/beauty-salon-login-page-bg.png";

export default function AuthPage() {
  const navigate = useNavigate();

  // ============================================================================
  // API URL
  // ============================================================================
  const API_URL =
    "https://86605879-7581-472d-a2f1-a4d71a358503-00-1nvtq3qgvln7.pike.replit.dev";

  // ============================================================================
  // STATE
  // ============================================================================
  const [adminUser, setAdminUser] = useLocalStorage("adminUser", null);

  // Modal state
  const [modalShow, setModalShow] = useState(null);

  // Form data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ============================================================================
  // CHECK IF ADMIN IS ALREADY LOGGED IN
  // ============================================================================
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Check if user is admin
        try {
          const response = await axios.get(
            `${API_URL}/admin/verify/${user.uid}`
          );
          if (response.data.isAdmin) {
            setAdminUser({
              uid: user.uid,
              email: user.email,
              username: response.data.username,
            });
            navigate("/adminPage");
          }
        } catch (error) {
          console.error("Admin verification failed:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate, setAdminUser, API_URL]);

  // ============================================================================
  // CLEAR MESSAGES
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

    if (modalShow === "SignUp") {
      if (!username.trim()) {
        errors.username = "Username is required";
      } else if (username.trim().length < 3) {
        errors.username = "Username must be at least 3 characters";
      }
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (modalShow === "SignUp" && password.length < 12) {
      errors.password = "Password must be at least 12 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================================
  // HANDLE SIGNUP (Admin)
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

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      const user = userCredential.user;
      console.log("✅ Firebase admin user created:", user.uid);

      // Create admin profile in database
      try {
        await axios.post(`${API_URL}/admin/create-profile`, {
          uid: user.uid,
          username: username.trim(),
          email: email.trim().toLowerCase(),
        });
        console.log("✅ Admin profile created");
      } catch (dbError) {
        console.error("Database error:", dbError);
        setError("Account created but profile setup failed. Contact support.");
        setLoading(false);
        return;
      }

      setSuccessMessage("🎉 Admin account created! Please sign in.");
      setEmail("");
      setPassword("");
      setUsername("");

      setTimeout(() => {
        setModalShow("Login");
        setSuccessMessage(null);
      }, 1500);
    } catch (error) {
      console.error("❌ Signup error:", error);

      let errorMessage = "Signup failed.";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak. Use at least 12 characters.";
          break;
        default:
          errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HANDLE LOGIN (Admin)
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
      console.log("🔐 Admin login...");

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      const user = userCredential.user;
      console.log("✅ Login successful:", user.uid);

      // Verify admin status
      try {
        const response = await axios.get(`${API_URL}/admin/verify/${user.uid}`);

        if (!response.data.isAdmin) {
          setError("This account doesn't have admin privileges.");
          await auth.signOut();
          setLoading(false);
          return;
        }

        setAdminUser({
          uid: user.uid,
          email: user.email,
          username: response.data.username,
        });

        setSuccessMessage("✅ Welcome back, Admin!");

        setTimeout(() => {
          navigate("/adminPage");
        }, 1000);
      } catch (verifyError) {
        console.error("Verification error:", verifyError);
        setError("Could not verify admin status.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);

      let errorMessage = "Login failed.";

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Invalid credentials.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Try again later.";
          break;
        default:
          errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HANDLE PASSWORD RESET
  // ============================================================================
  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError("Please enter your email first.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setSuccessMessage("✅ Password reset email sent!");
    } catch (error) {
      setError(error.message);
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
    setEmail("");
    setPassword("");
    setUsername("");
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

          {/* Messages */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </Alert>
          )}

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

      {/* AUTH MODAL */}
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
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="mb-3">
              {successMessage}
            </Alert>
          )}

          <Form onSubmit={modalShow === "SignUp" ? handleSignup : handleLogin}>
            {/* Username (Signup only) */}
            {modalShow === "SignUp" && (
              <Form.Group className="mb-3">
                <Form.Label>Username *</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  isInvalid={!!fieldErrors.username}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.username}
                </Form.Control.Feedback>
              </Form.Group>
            )}

            {/* Email */}
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                isInvalid={!!fieldErrors.email}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    modalShow === "SignUp"
                      ? "Min 12 characters"
                      : "Enter password"
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

              {modalShow === "Login" && (
                <div className="mt-2">
                  <Button
                    variant="link"
                    className="p-0 small"
                    onClick={handlePasswordReset}
                    disabled={loading}
                  >
                    Forgot password?
                  </Button>
                </div>
              )}
            </Form.Group>

            {/* Submit */}
            <Button
              className="w-100 mt-3"
              type="submit"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {modalShow === "SignUp" ? "Creating..." : "Signing In..."}
                </>
              ) : (
                <>{modalShow === "SignUp" ? "Create Account" : "Sign In"}</>
              )}
            </Button>
          </Form>

          {/* Switch */}
          <div className="text-center mt-4">
            {modalShow === "SignUp" && (
              <p className="text-muted mb-0">
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => setModalShow("Login")}
                  className="p-0"
                  disabled={loading}
                >
                  Sign in
                </Button>
              </p>
            )}

            {modalShow === "Login" && (
              <p className="text-muted mb-0">
                Need an admin account?{" "}
                <Button
                  variant="link"
                  onClick={() => setModalShow("SignUp")}
                  className="p-0"
                  disabled={loading}
                >
                  Create one
                </Button>
              </p>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
