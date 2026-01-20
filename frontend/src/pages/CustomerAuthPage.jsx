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
import { signOut } from "firebase/auth";
import { API_URL } from "../config/api";

export default function CustomerAuthPage() {
  const navigate = useNavigate();

  // ============================================================================
  // STATE
  // ============================================================================
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
  // CHECK IF ALREADY LOGGED IN - SILENT CHECK ONLY (No Auto-Redirect)
  // ============================================================================
  useEffect(() => {
    // Only check if already logged in, don't auto-redirect
    // Let the guards handle routing - auth pages should just show forms
    const existingToken = localStorage.getItem("customerToken");
    const existingUser = localStorage.getItem("customerUser");

    // Validate token and user (checking for empty/null strings)
    const isValidToken =
      existingToken && existingToken !== "" && existingToken !== "null";
    const isValidUser =
      existingUser && existingUser !== "null" && existingUser !== "";

    if (isValidToken && isValidUser) {
      console.log(
        "✅ Valid session already exists - user should use dashboard guard",
      );
      // Don't redirect here - let the user navigate manually or guard will handle it
    }
  }, []); // Empty dependency array - only run once on mount

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
  // VALIDATE SIGNUP FORM
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
    } else if (formData.phone_number.replace(/\D/g, "").length < 10) {
      errors.phone_number = "Please enter a valid phone number (min 10 digits)";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 12) {
      errors.password =
        "Password must be at least 12 characters (recommended for security)";
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
  // HANDLE SIGNUP (Signs out after signup to prevent auto-redirect)
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
      console.log("🔵 Creating Firebase account...");

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password,
      );

      const user = userCredential.user;
      console.log("✅ Firebase user created:", user.uid);

      // Create user profile in PostgreSQL database
      try {
        console.log("🔵 Creating database profile with data:", {
          uid: user.uid,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone_number: formData.phone_number.trim(),
        });

        const profileResponse = await axios.post(
          `${API_URL}/customer/create-profile`,
          {
            uid: user.uid,
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone_number: formData.phone_number.trim(),
          },
        );

        console.log(
          "✅ User profile created in database:",
          profileResponse.data,
        );
      } catch (dbError) {
        console.error("❌ Database profile creation error:", dbError);
        console.error("❌ Error details:", {
          message: dbError.message,
          response: dbError.response?.data,
          status: dbError.response?.status,
        });

        // Check if it's a duplicate email error
        const errorMessage =
          dbError.response?.data?.message ||
          dbError.response?.data?.error ||
          "";

        if (
          errorMessage.includes("duplicate") ||
          errorMessage.includes("already exists")
        ) {
          // Email already exists - this means user already signed up before
          console.log("⚠️ Email already exists in database");

          // Don't delete the Firebase user - they can log in
          setError(
            "An account with this email already exists. Please log in instead.",
          );
          setLoading(false);

          // Switch to login modal after a moment
          setTimeout(() => {
            setModalShow("Login");
            setError(null);
          }, 2000);
          return;
        }

        // FALLBACK: For other errors, just continue with Firebase-only mode
        console.warn("⚠️ Backend unavailable - using Firebase-only mode");
        console.log(
          "✅ Continuing with Firebase authentication only (no backend profile)",
        );
      }

      // Sign out after signup to prevent auto-redirect
      await auth.signOut();
      console.log("✅ Signed out after signup (prevents auto-redirect)");

      // Success message
      setSuccessMessage(
        "🎉 Account created successfully! You can now sign in.",
      );

      // Clear form
      setFormData({ name: "", email: "", phone_number: "", password: "" });

      // Wait and switch to login modal
      setTimeout(() => {
        setModalShow("Login");
        setSuccessMessage(null);
      }, 2000);
    } catch (error) {
      console.error("❌ Signup error:", error);

      // Firebase-specific error handling
      let errorMessage = "Signup failed. Please try again.";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage =
            "An account with this email already exists. Please sign in instead.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/operation-not-allowed":
          errorMessage =
            "Email/password accounts are not enabled. Please contact support.";
          break;
        case "auth/weak-password":
          errorMessage =
            "Password is too weak. Please use at least 12 characters with mixed case, numbers, and symbols.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = error.message || "Signup failed. Please try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HANDLE LOGIN (Fixed - Properly stores data)
  // ============================================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    console.log(
      "🟢 [CUSTOMER PAGE] handleLogin called at:",
      new Date().toISOString(),
    );
    console.log("🟢 [CUSTOMER PAGE] Current URL:", window.location.href);

    setError(null);
    setFieldErrors({});

    if (!validateLoginForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("🔵 Logging in with Firebase...");

      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password,
      );

      const user = userCredential.user;
      console.log("✅ Login successful:", user.uid);

      // Get Firebase ID token
      const idToken = await user.getIdToken();
      console.log("✅ Firebase ID token obtained");

      // Fetch user profile from database
      try {
        console.log(`🔍 Fetching profile for UID: ${user.uid}`);

        const response = await axios.get(
          `${API_URL}/customer/profile/${user.uid}`,
        );

        console.log("📦 Backend response:", response.data);

        // Validate response data and enforce customer-only login
        if (!response.data || !response.data.id) {
          throw new Error("CUSTOMER_PROFILE_NOT_FOUND");
        }

        // If backend returns a role flag, ensure this account is not an admin
        if (
          response.data.role &&
          response.data.role.toLowerCase() !== "customer"
        ) {
          throw new Error("NOT_CUSTOMER_ACCOUNT");
        }

        const userProfile = {
          uid: user.uid,
          id: response.data.id, // Use database ID
          name: response.data.name,
          email: response.data.email,
          phone_number: response.data.phone_number,
        };

        console.log("✅ User profile constructed:", userProfile);

        // 🔥 CRITICAL: Store data BEFORE setting state
        localStorage.setItem("customerToken", idToken);
        localStorage.setItem("customerUser", JSON.stringify(userProfile));

        // Verify what was actually stored
        const storedUser = localStorage.getItem("customerUser");
        console.log("✅ Verified stored data:", storedUser);

        // Then update state
        setCustomerUser(userProfile);

        console.log("✅ Token and profile saved to localStorage");
        console.log("📦 Stored user profile:", {
          token: idToken.substring(0, 20) + "...",
          email: userProfile.email,
          id: userProfile.id,
          name: userProfile.name,
          uid: userProfile.uid,
        });

        setSuccessMessage("✅ Welcome back! Redirecting to your dashboard...");

        // Navigate IMMEDIATELY without delay to ensure localStorage is written
        navigate("/customer/dashboard", { replace: true });
      } catch (profileError) {
        console.error("❌ Failed to fetch user profile:", profileError);
        console.error("❌ Error details:", {
          message: profileError.message,
          response: profileError.response?.data,
          status: profileError.response?.status,
        });

        // Stop login if no customer profile or role mismatch
        await signOut(auth);
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerUser");

        if (
          profileError.message === "NOT_CUSTOMER_ACCOUNT" ||
          profileError.response?.data?.role === "admin"
        ) {
          setError(
            "This account is for admins. Please sign in using the admin portal.",
          );
        } else if (
          profileError.message === "CUSTOMER_PROFILE_NOT_FOUND" ||
          profileError.response?.status === 404
        ) {
          setError(
            "No customer profile found for this account. Please create a customer account to continue.",
          );
        } else {
          setError(
            "Unable to load your customer profile. Please try again or contact support.",
          );
        }

        return;
      }
    } catch (error) {
      console.error("❌ Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Invalid email or password. Please try again.";
          break;
        case "auth/user-disabled":
          errorMessage =
            "This account has been disabled. Please contact support.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Too many failed login attempts. Please try again later or reset your password.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = error.message || "Login failed. Please try again.";
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
    if (!formData.email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, formData.email.trim().toLowerCase());
      setSuccessMessage(
        "✅ Password reset email sent! Check your inbox for instructions.",
      );
    } catch (error) {
      console.error("Password reset error:", error);

      let errorMessage = "Failed to send reset email.";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
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
  // PASSWORD STRENGTH INDICATOR
  // ============================================================================
  const getPasswordStrength = (password) => {
    if (!password) return { strength: "", color: "", score: 0 };

    let score = 0;

    if (password.length >= 12) score += 2;
    else if (password.length >= 10) score += 1;
    else return { strength: "Too short (min 12)", color: "danger", score: 0 };

    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (password.length >= 16) score += 1;
    if (password.length >= 20) score += 1;

    const commonPatterns = ["password", "123456", "qwerty", "abc123"];
    if (
      commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))
    ) {
      return { strength: "Too common", color: "danger", score: 0 };
    }

    if (score <= 3) {
      return { strength: "Weak", color: "danger", score };
    } else if (score <= 5) {
      return { strength: "Fair", color: "warning", score };
    } else if (score <= 7) {
      return { strength: "Good", color: "info", score };
    } else {
      return { strength: "Strong", color: "success", score };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
                "linear-gradient(135deg, rgba(108, 117, 125, 0.08) 0%, rgba(108, 117, 125, 0.04) 100%)",
            }}
          />
        </Col>

        <Col
          sm={6}
          lg={6}
          className="p-4 p-md-5 d-flex flex-column justify-content-center"
          style={{ background: "#f8f9fa" }}
        >
          <h1
            className="mb-3"
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              color: "#1a1a1a",
              letterSpacing: "-0.5px",
            }}
          >
            Welcome Back!
          </h1>
          <p
            className="mb-5"
            style={{ color: "#6c757d", fontSize: "1.05rem", fontWeight: "500" }}
          >
            Sign in to create a booking and manage your salon bookings!
          </p>

          {/* Error Message */}
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

          {/* Success Message */}
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
              onClick={() => setModalShow("SignUp")}
              disabled={loading}
              style={{
                borderRadius: "8px",
                fontWeight: "600",
                padding: "12px 20px",
                fontSize: "1rem",
                boxShadow: "0 2px 8px rgba(13, 110, 253, 0.25)",
              }}
            >
              Create Account
            </Button>

            <p
              className="text-center mb-0"
              style={{ fontWeight: "600", color: "#1a1a1a" }}
            >
              Already have an account?
            </p>

            <Button
              size="lg"
              variant="outline-primary"
              onClick={() => setModalShow("Login")}
              disabled={loading}
              style={{
                borderRadius: "8px",
                fontWeight: "600",
                padding: "12px 20px",
                fontSize: "1rem",
                borderWidth: "2px",
              }}
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
            {modalShow === "SignUp" ? "Create Your Account" : "Sign In"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-5" style={{ background: "#ffffff" }}>
          {/* Error in modal */}
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
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </Alert>
          )}

          {/* Success in modal */}
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
            {/* SIGNUP FIELDS */}
            {modalShow === "SignUp" && (
              <>
                <Form.Group className="mb-4">
                  <Form.Label
                    style={{
                      fontWeight: "600",
                      color: "#1a1a1a",
                      marginBottom: "8px",
                    }}
                  >
                    Full Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    isInvalid={!!fieldErrors.name}
                    disabled={loading}
                    style={{
                      borderRadius: "8px",
                      borderColor: "#dee2e6",
                      padding: "10px 14px",
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label
                    style={{
                      fontWeight: "600",
                      color: "#1a1a1a",
                      marginBottom: "8px",
                    }}
                  >
                    Phone Number *
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+60123456789"
                    isInvalid={!!fieldErrors.phone_number}
                    disabled={loading}
                    style={{
                      borderRadius: "8px",
                      borderColor: "#dee2e6",
                      padding: "10px 14px",
                    }}
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
            <Form.Group className="mb-4">
              <Form.Label
                style={{
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: "8px",
                }}
              >
                Email Address *
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
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

            {/* PASSWORD FIELD (Both) */}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    modalShow === "SignUp"
                      ? "Create a password (min 12 characters)"
                      : "Enter your password"
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

              {/* Password strength indicator (signup only) */}
              {modalShow === "SignUp" && formData.password && (
                <div className="mt-3">
                  <div
                    className="progress"
                    style={{ height: "6px", borderRadius: "3px" }}
                  >
                    <div
                      className={`progress-bar bg-${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.score / 8) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className={`text-${passwordStrength.color} fw-bold`}>
                      <i className="bi bi-shield-fill me-1"></i>
                      {passwordStrength.strength}
                    </small>
                    <small className="text-muted">
                      {formData.password.length}/128 characters
                    </small>
                  </div>
                </div>
              )}

              {/* Forgot password link (login only) */}
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
                    <i className="bi bi-key me-1"></i>
                    Forgot your password?
                  </Button>
                </div>
              )}
            </Form.Group>

            {/* SUBMIT BUTTON */}
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
          <div className="text-center mt-5">
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
                  style={{
                    color: "#0d6efd",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
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
                  style={{
                    color: "#0d6efd",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                >
                  Create one here
                </Button>
              </p>
            )}
          </div>

          {/* Firebase branding */}
          <div className="text-center mt-4">
            <small className="text-muted">
              <i className="bi bi-shield-check me-1"></i>
              Secured by Firebase Authentication
            </small>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
