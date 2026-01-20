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
import { API_URL } from "../config/api";

export default function AuthPage() {
  const navigate = useNavigate();

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
  // CHECK IF ADMIN IS ALREADY LOGGED IN - SILENT CHECK ONLY (No Auto-Redirect)
  // ============================================================================
  useEffect(() => {
    // Only check if already logged in, don't auto-redirect
    // Let the guards handle routing - auth pages should just show forms
    const existingToken = localStorage.getItem("adminToken");
    const existingUser = localStorage.getItem("adminUser");

    // Check if token is valid (not empty/null) and user data is valid (not null string)
    const isValidToken = existingToken && existingToken !== "";
    const isValidUser =
      existingUser && existingUser !== "null" && existingUser !== "";

    if (isValidToken && isValidUser) {
      console.log(
        "✅ Valid admin session already exists - user should use admin page",
      );
      // Don't redirect here - let the user navigate manually or guard will handle it
    }
  }, []); // Empty dependency array - only run once on mount

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
        password,
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

    console.log(
      "🔴 [ADMIN PAGE] handleLogin called at:",
      new Date().toISOString(),
    );
    console.log("🔴 [ADMIN PAGE] Current URL:", window.location.href);

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
        password,
      );

      const user = userCredential.user;
      console.log("✅ Login successful:", user.uid);

      // Get Firebase ID token
      const idToken = await user.getIdToken();
      console.log("✅ Firebase token obtained");

      // Verify admin status
      try {
        const response = await axios.get(`${API_URL}/admin/verify/${user.uid}`);

        if (!response.data.isAdmin) {
          setError("This account doesn't have admin privileges.");
          await auth.signOut();
          setLoading(false);
          return;
        }

        const adminData = {
          uid: user.uid,
          email: user.email,
          username: response.data.username,
        };

        // 🔥 CRITICAL: Store token AND user data - matching customer auth pattern
        localStorage.setItem("adminToken", idToken);
        localStorage.setItem("adminUser", JSON.stringify(adminData));

        // Also set in state
        setAdminUser(adminData);

        console.log("✅ Admin token and data saved to localStorage:", {
          token: idToken.substring(0, 20) + "...",
          user: adminData,
        });

        // Dispatch custom event to notify other components of admin status change
        window.dispatchEvent(new CustomEvent("adminStatusChanged"));

        setSuccessMessage("✅ Welcome back, Admin!");

        // Navigate immediately - no delay needed
        navigate("/adminPage");
      } catch (verifyError) {
        console.error("Verification error:", verifyError);

        // 404 means user is not in admins table (likely a customer account)
        if (verifyError.response?.status === 404) {
          setError(
            "This account doesn't have admin privileges. Please use a customer login.",
          );
          await auth.signOut();
          setLoading(false);
          return;
        }

        setError("Could not verify admin status. Please try again.");
        await auth.signOut();
        setLoading(false);
        return;
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
    <>
      <Row className="min-vh-100 g-0" style={{ margin: 0 }}>
        <Col
          sm={6}
          lg={6}
          className="d-none d-sm-block p-0 position-relative overflow-hidden"
        >
          <div
            style={{
              backgroundImage: `url(${pic2})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              height: "100%",
              width: "100%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(13, 110, 253, 0.05) 100%)",
            }}
          />
        </Col>

        <Col
          sm={6}
          lg={6}
          className="p-4 p-md-5 d-flex flex-column justify-content-center"
          style={{ background: "#f8f9fa" }}
        >
          <div className="text-center mb-5">
            <div
              style={{
                background: "linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)",
                borderRadius: "12px",
                padding: "16px",
                display: "inline-block",
                marginBottom: "20px",
                boxShadow: "0 4px 15px rgba(13, 110, 253, 0.3)",
              }}
            >
              <i
                className="bi bi-shield-lock"
                style={{ fontSize: "2.5rem", color: "white" }}
              ></i>
            </div>
          </div>

          <h1
            className="mb-2 text-center"
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              color: "#1a1a1a",
              letterSpacing: "-0.5px",
            }}
          >
            Admin Portal
          </h1>
          <p
            className="text-center mb-5"
            style={{ color: "#6c757d", fontSize: "1.05rem", fontWeight: "500" }}
          >
            Manage bookings and system settings
          </p>

          {/* Messages */}
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError(null)}
              style={{
                borderRadius: "8px",
                border: "1px solid #f5c2c7",
                marginBottom: "1.5rem",
                padding: "12px 16px",
              }}
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert
              variant="success"
              dismissible
              onClose={() => setSuccessMessage(null)}
              style={{
                borderRadius: "8px",
                border: "1px solid #badbcc",
                marginBottom: "1.5rem",
                padding: "12px 16px",
              }}
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
              style={{
                borderRadius: "8px",
                fontWeight: "600",
                padding: "12px 20px",
                fontSize: "1rem",
                boxShadow: "0 2px 8px rgba(13, 110, 253, 0.25)",
              }}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Admin Login
            </Button>

            <Button
              size="lg"
              variant="outline-secondary"
              onClick={() => setModalShow("SignUp")}
              disabled={loading}
              style={{
                borderRadius: "8px",
                fontWeight: "600",
                padding: "12px 20px",
                fontSize: "1rem",
                borderWidth: "2px",
              }}
            >
              <i className="bi bi-person-plus me-2"></i>
              Create Admin Account
            </Button>
          </div>

          <Alert
            variant="warning"
            className="mt-4"
            style={{
              borderRadius: "8px",
              border: "1px solid #ffecb5",
              padding: "12px 16px",
              background: "#fffbea",
            }}
          >
            <i className="bi bi-info-circle me-2"></i>
            <small style={{ color: "#664d03" }}>
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
        dialogClassName="professional-modal"
        contentClassName="rounded-lg shadow-lg"
      >
        <Modal.Header
          closeButton
          style={{ borderBottom: "1px solid #e9ecef", padding: "20px 24px" }}
        >
          <Modal.Title
            style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1a1a1a" }}
          >
            <i
              className="bi bi-shield-lock me-2"
              style={{ color: "#0d6efd" }}
            ></i>
            {modalShow === "SignUp" ? "Create Admin Account" : "Admin Login"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-5" style={{ background: "#ffffff" }}>
          {error && (
            <Alert
              variant="danger"
              className="mb-3"
              style={{
                borderRadius: "8px",
                border: "1px solid #f5c2c7",
                padding: "12px 16px",
              }}
            >
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert
              variant="success"
              className="mb-3"
              style={{
                borderRadius: "8px",
                border: "1px solid #badbcc",
                padding: "12px 16px",
              }}
            >
              {successMessage}
            </Alert>
          )}

          <Form onSubmit={modalShow === "SignUp" ? handleSignup : handleLogin}>
            {/* Username (Signup only) */}
            {modalShow === "SignUp" && (
              <Form.Group className="mb-4">
                <Form.Label
                  style={{
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: "8px",
                  }}
                >
                  Username *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  isInvalid={!!fieldErrors.username}
                  disabled={loading}
                  style={{
                    borderRadius: "8px",
                    borderColor: "#dee2e6",
                    padding: "10px 14px",
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.username}
                </Form.Control.Feedback>
              </Form.Group>
            )}

            {/* Email */}
            <Form.Group className="mb-4">
              <Form.Label
                style={{
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: "8px",
                }}
              >
                Email *
              </Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                isInvalid={!!fieldErrors.email}
                disabled={loading}
                style={{
                  borderRadius: "8px",
                  borderColor: "#dee2e6",
                  padding: "10px 14px",
                }}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-4">
              <Form.Label
                style={{
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: "8px",
                }}
              >
                Password *
              </Form.Label>
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
                  style={{
                    borderRadius: "8px 0 0 8px",
                    borderColor: "#dee2e6",
                    padding: "10px 14px",
                  }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{ borderRadius: "0 8px 8px 0" }}
                >
                  <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                </Button>
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.password}
                </Form.Control.Feedback>
              </InputGroup>

              {modalShow === "Login" && (
                <div className="mt-3">
                  <Button
                    variant="link"
                    className="p-0 small"
                    onClick={handlePasswordReset}
                    disabled={loading}
                    style={{
                      color: "#0d6efd",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                    }}
                  >
                    Forgot password?
                  </Button>
                </div>
              )}
            </Form.Group>

            {/* Submit */}
            <Button
              className="w-100 mt-4"
              type="submit"
              size="lg"
              disabled={loading}
              style={{
                borderRadius: "8px",
                fontWeight: "600",
                padding: "12px 20px",
                boxShadow: "0 2px 8px rgba(13, 110, 253, 0.25)",
              }}
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
          <div className="text-center mt-5">
            {modalShow === "SignUp" && (
              <p className="text-muted mb-0">
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => setModalShow("Login")}
                  className="p-0"
                  disabled={loading}
                  style={{
                    color: "#0d6efd",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
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
                  style={{
                    color: "#0d6efd",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                >
                  Create one
                </Button>
              </p>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
