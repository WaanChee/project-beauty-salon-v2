import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Card,
} from "react-bootstrap";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createBooking,
  clearMessages,
  fetchBookings,
} from "../features/bookings/bookingSlice";

export default function AddBooking() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { loading, error, successMessage } = useSelector(
    (state) => state.bookings
  );

  // ============================================================================
  // AUTH STATE - Use direct localStorage instead of hook
  // ============================================================================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerUser, setCustomerUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [hasPrefilledForm, setHasPrefilledForm] = useState(false); // Track if form was already pre-filled
  const [formResetKey, setFormResetKey] = useState(0); // Force form remount after submission

  // Check authentication on mount - works for BOTH customer and admin
  useEffect(() => {
    let token = null;
    let userJson = null;
    let adminDetected = false;

    // Priority 1: admin
    const adminUserJson = localStorage.getItem("adminUser");
    if (adminUserJson) {
      try {
        const parsedAdmin = JSON.parse(adminUserJson);
        if (parsedAdmin && (parsedAdmin.email || parsedAdmin.username)) {
          userJson = adminUserJson;
          token = "admin";
          adminDetected = true;
          setIsAdmin(true);
          console.log("🔵 Admin user detected, using admin credentials");
        }
      } catch (err) {
        console.error("Failed to parse admin user:", err);
      }
    }

    // Priority 2: customer
    if (!adminDetected) {
      token = localStorage.getItem("customerToken");
      userJson = localStorage.getItem("customerUser");

      if (userJson) {
        try {
          const parsed = JSON.parse(userJson);
          if (!parsed) {
            console.log("⚠️ customerUser is null/invalid, clearing...");
            localStorage.removeItem("customerUser");
            localStorage.removeItem("customerToken");
            token = null;
            userJson = null;
          }
        } catch (err) {
          console.error("Failed to parse customer user:", err);
          token = null;
          userJson = null;
        }
      }
    }

    console.log("🔵 AddBooking Auth Check:", {
      hasToken: !!token,
      hasUser: !!userJson,
      isAdmin: adminDetected,
    });

    if (!token || !userJson) {
      console.log("❌ Not authenticated, redirecting to login selector...");
      navigate("/", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userJson);

      // Verify user object has required properties (email or username)
      if (!user || (!user.email && !user.username)) {
        console.log("❌ Invalid user data - missing required fields:", {
          hasEmail: !!user?.email,
          hasUsername: !!user?.username,
          userData: user,
        });
        navigate(adminDetected ? "/login/admin" : "/customer/auth", {
          replace: true,
        });
        return;
      }

      setCustomerUser(user);
      setIsAuthenticated(true);

      // If user has ID or username (admin), we're good
      if (user.id || user.username) {
        console.log(
          "✅ User authenticated:",
          user.email || user.username,
          "| ID:",
          user.id || user.username,
          "| Type:",
          adminDetected ? "ADMIN" : "CUSTOMER"
        );
      } else if (user.uid && !adminDetected) {
        console.log("⏳ User has Firebase UID, fetching database profile...");
        fetchUserProfile(user.uid);
      }
    } catch (error) {
      console.error("❌ Failed to parse user data:", error);
      if (!adminDetected) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerUser");
      }
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Fetch user profile from backend to get database ID
  const fetchUserProfile = async (firebaseUid) => {
    setIsFetchingProfile(true);
    try {
      const API_URL =
        "https://86605879-7581-472d-a2f1-a4d71a358503-00-1nvtq3qgvln7.pike.replit.dev";
      const response = await fetch(
        `${API_URL}/customer/profile/${firebaseUid}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profileData = await response.json();

      // Update customerUser with complete data
      const completeUser = {
        ...customerUser,
        id: profileData.id,
        name: profileData.name,
        phone_number: profileData.phone_number,
      };

      localStorage.setItem("customerUser", JSON.stringify(completeUser));
      setCustomerUser(completeUser);

      console.log(
        "✅ User profile fetched and authenticated:",
        completeUser.email,
        "| ID:",
        completeUser.id
      );
    } catch (error) {
      console.error("❌ Failed to fetch user profile:", error);
      // Still allow form, but warn user
      setError("Could not load your profile. Continuing anyway...");
    } finally {
      setIsFetchingProfile(false);
    }
  };

  // ============================================================================
  // FORM STATE - Pre-filled with customer info
  // ============================================================================
  const [formData, setFormData] = useState({
    // User Information (pre-filled from logged-in customer)
    user_name: "",
    user_email: "",
    user_phone: "",
    customer_id: null, // Database customer ID for linking booking
    // Booking Details (empty, user fills these)
    title: "",
    description: "",
    date: "",
    time: "",
  });

  // Pre-fill form when customerUser is loaded (ONLY ONCE)
  useEffect(() => {
    if (customerUser && !hasPrefilledForm) {
      console.log("📝 Pre-filling form with user data (INITIAL LOAD ONLY):", {
        id: customerUser.id,
        name: customerUser.name || customerUser.username,
        email: customerUser.email,
        isAdmin,
      });

      // For admin: use admin name/email (locked), phone EMPTY (editable per booking)
      // For customer: use customer name/email/phone (locked email, editable phone)
      setFormData((prev) => ({
        ...prev,
        user_name: customerUser.name || customerUser.username || "",
        user_email: customerUser.email || "",
        user_phone: isAdmin ? "" : customerUser.phone_number || "", // Empty for admins
        customer_id: isAdmin ? null : customerUser.id, // Only for customers
      }));

      setHasPrefilledForm(true); // Mark as pre-filled to prevent re-running
    }
  }, [customerUser, isAdmin, hasPrefilledForm]);

  // ============================================================================
  // HELPER: Get user info (handles both admin and customer)
  // ============================================================================
  const getUserDisplayName = () => {
    if (!customerUser) return "";
    return customerUser.name || customerUser.username || "";
  };

  const getUserDisplayEmail = () => {
    return customerUser?.email || "";
  };

  const getUserDisplayPhone = () => {
    return customerUser?.phone_number || "";
  };

  // ============================================================================
  // HANDLE INPUT CHANGES
  // ============================================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate phone number - only allow digits, spaces, +, -, and ()
    if (name === "user_phone") {
      // Allow only numbers, +, spaces, -, and () for phone formatting
      const phoneRegex = /^[\d\s+\-()]*$/;
      if (!phoneRegex.test(value)) {
        console.log("❌ Invalid phone input rejected:", value);
        return; // Don't update if invalid characters
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ============================================================================
  // HANDLE FORM SUBMISSION
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload; if admin, omit customer_id so backend doesn't reject null
    const payload = { ...formData };
    if (isAdmin) {
      delete payload.customer_id;
    }

    console.log("📤 === BOOKING SUBMISSION #" + Date.now() + " ===");
    console.log("📤 Current formData state:", formData);
    console.log(
      "📤 Sending payload to backend:",
      JSON.stringify(payload, null, 2)
    );
    console.log("📤 IsAdmin:", isAdmin);
    console.log("📤 Timestamp:", new Date().toISOString());

    // Dispatch the createBooking action
    const result = await dispatch(createBooking(payload));

    console.log("📥 Backend response received:", {
      success: createBooking.fulfilled.match(result),
      payload: result.payload,
      timestamp: new Date().toISOString(),
    });

    // Only clear booking fields if successful, keep user info
    if (createBooking.fulfilled.match(result)) {
      console.log("✅ Booking created successfully!");
      console.log("📋 Booking ID from backend:", result.payload?.id);

      // Reset to clean state: preserve name/email, clear phone and booking fields
      const resetFormData = {
        user_name: customerUser?.name || customerUser?.username || "",
        user_email: customerUser?.email || "",
        user_phone: "", // Clear phone for next booking
        customer_id: isAdmin ? null : customerUser?.id,
        title: "", // Clear booking details
        description: "",
        date: "",
        time: "",
      };

      console.log(
        "🔄 Resetting form to empty state (name/email preserved, phone cleared):",
        resetFormData
      );
      setFormData(resetFormData);

      // Force form remount to clear browser cache
      setFormResetKey((prev) => prev + 1);

      // Refresh bookings list to verify new booking is separate
      console.log("🔄 Refreshing bookings list from backend...");
      await dispatch(fetchBookings());
    } else {
      console.error("❌ Booking creation failed:", result.payload);
    }
  };

  // ============================================================================
  // AUTO-CLEAR MESSAGES AFTER 5 SECONDS
  // ============================================================================
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  // Don't render form until authenticated
  if (!isAuthenticated || !customerUser) {
    return null;
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="mb-4">Make a Booking</h1>

          {/* Success Message */}
          {successMessage && (
            <Alert
              variant="success"
              dismissible
              onClose={() => dispatch(clearMessages())}
            >
              {successMessage}
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => dispatch(clearMessages())}
            >
              {typeof error === "string"
                ? error
                : error?.error || error?.message || JSON.stringify(error)}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} key={formResetKey}>
            {/* ================================================================ */}
            {/* CUSTOMER INFORMATION SECTION - Pre-filled and Read-only */}
            {/* ================================================================ */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  {isAdmin ? "Booking Created By" : "Your Information"}
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {isAdmin ? "Admin Name" : "Full Name"} *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                    required
                    readOnly
                    disabled
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                  <Form.Text className="text-muted">
                    {isAdmin
                      ? "Logged in as: " + customerUser?.username
                      : "This is your registered name"}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{isAdmin ? "Admin Email" : "Email"} *</Form.Label>
                  <Form.Control
                    type="email"
                    name="user_email"
                    value={formData.user_email}
                    onChange={handleChange}
                    required
                    readOnly
                    disabled
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                  <Form.Text className="text-muted">
                    Logged in as {customerUser?.email}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    {isAdmin ? "Admin Phone" : "Phone Number"} *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="user_phone"
                    placeholder="+60123456789"
                    value={formData.user_phone}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    data-form-type="other"
                    data-lpignore="true"
                    pattern="[\d\s+\-()]+"
                    title="Please enter a valid phone number (only numbers, +, -, spaces, and parentheses allowed)"
                  />
                  <Form.Text className="text-muted">
                    {isAdmin
                      ? "Enter contact phone for this booking (numbers only)"
                      : "Update your phone number if needed"}
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* ================================================================ */}
            {/* BOOKING DETAILS SECTION - User fills these */}
            {/* ================================================================ */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Booking Details</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Service *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="e.g., Haircut, Facial, Manicure"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Special Requests (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    placeholder="Add any special requests or notes"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Time *</Form.Label>
                      <Form.Control
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* ================================================================ */}
            {/* SUBMIT & CLEAR BUTTONS */}
            {/* ================================================================ */}
            <div className="d-flex gap-3 mb-3">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="flex-grow-1"
                size="lg"
              >
                {loading ? "Creating Booking..." : "Confirm Booking"}
              </Button>
              <Button
                variant="outline-secondary"
                type="button"
                disabled={loading}
                size="lg"
                onClick={() => {
                  // Clear booking details AND phone number
                  setFormData((prev) => ({
                    ...prev,
                    user_phone: "", // Clear phone for fresh entry
                    title: "", // Clear booking fields
                    description: "",
                    date: "",
                    time: "",
                  }));
                  console.log(
                    "🔄 Form reset (booking details cleared, phone cleared)"
                  );
                }}
              >
                Reset Form
              </Button>
            </div>
          </Form>

          {/* Info Alert */}
          <Alert variant="info" className="mt-3">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Quick Tip:</strong> Your booking will be confirmed within 24
            hours. You can view and manage all your bookings in the "My
            Bookings" page.
          </Alert>
        </Col>
      </Row>
    </Container>
  );
}
