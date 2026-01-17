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

export default function CustomerAuthPage() {
  const navigate = useNavigate();

  // ============================================================================
  // API URL
  // ============================================================================
  const API_URL =
    "https://86605879-7581-472d-a2f1-a4d71a358503-00-1nvtq3qgvln7.pike.replit.dev";

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
            Sign in to create a booking and manage your salon bookings!
          </p>

          {/* Error Message */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
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
                      ? "Create a password (min 12 characters)"
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
                  <div className="progress" style={{ height: "6px" }}>
                    <div
                      className={`progress-bar bg-${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.score / 8) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-1">
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
                <div className="mt-2">
                  <Button
                    variant="link"
                    className="p-0 small"
                    onClick={handlePasswordReset}
                    disabled={loading}
                  >
                    <i className="bi bi-key me-1"></i>
                    Forgot your password?
                  </Button>
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

          {/* Firebase branding */}
          <div className="text-center mt-3">
            <small className="text-muted">
              <i className="bi bi-shield-check me-1"></i>
              Secured by Firebase Authentication
            </small>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
