import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Card,
} from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createBooking,
  clearMessages,
  fetchBookings,
} from "../features/bookings/bookingSlice";
import { useCustomerStatus } from "../hooks/useCustomerStatus";

export default function AddBooking() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Ref for the entire form to reset it
  const formRef = useRef(null);

  // Redux state
  const { loading, error, successMessage, formResetTrigger } = useSelector(
    (state) => state.bookings,
  );

  // ============================================================================
  // AUTH STATE - Customer Only (using centralized hook)
  // ============================================================================
  const {
    isAuthenticated,
    customerUser,
    isLoading: isAuthLoading,
  } = useCustomerStatus();
  const [hasPrefilledForm, setHasPrefilledForm] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  // Check authentication on mount - Customer Only
  useEffect(() => {
    console.log("🔵 AddBooking Auth Check (Customer Only):", {
      isAuthenticated,
      isAuthLoading,
    });

    if (!isAuthLoading && !isAuthenticated) {
      console.log("❌ Not authenticated as customer, redirecting...");
      navigate("/customer/auth", { replace: true });
      return;
    }

    if (customerUser) {
      // If user has ID, we're good
      if (customerUser.id) {
        console.log(
          "✅ Customer authenticated:",
          customerUser.email,
          "| ID:",
          customerUser.id,
        );
      } else if (customerUser.uid) {
        console.log("⏳ User has Firebase UID, fetching database profile...");
        fetchUserProfile(customerUser.uid);
      }
    }
  }, [isAuthenticated, isAuthLoading, customerUser, navigate]);

  // Fetch user profile from backend to get database ID
  const fetchUserProfile = async (firebaseUid) => {
    try {
      const API_URL =
        "https://86605879-7581-472d-a2f1-a4d71a358503-00-1nvtq3qgvln7.pike.replit.dev";
      const response = await fetch(
        `${API_URL}/customer/profile/${firebaseUid}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profileData = await response.json();

      // Update customerUser with complete data in localStorage
      const completeUser = {
        ...customerUser,
        id: profileData.id,
        name: profileData.name,
        phone_number: profileData.phone_number,
      };

      localStorage.setItem("customerUser", JSON.stringify(completeUser));

      console.log(
        "✅ User profile fetched and authenticated:",
        completeUser.email,
        "| ID:",
        completeUser.id,
      );
    } catch (error) {
      console.error("❌ Failed to fetch user profile:", error);
    }
  };

  // ============================================================================
  // FORM STATE - Pre-filled with customer info
  // ============================================================================
  const [formData, setFormData] = useState({
    // User Information (pre-filled from logged-in customer - READ ONLY)
    user_name: "",
    user_email: "",
    user_phone: "", // Fixed to customer's registered phone
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
      console.log("📝 Pre-filling form with customer data:", {
        id: customerUser.id,
        name: customerUser.name,
        email: customerUser.email,
        phone: customerUser.phone_number,
      });

      setFormData((prev) => ({
        ...prev,
        user_name: customerUser.name || "",
        user_email: customerUser.email || "",
        user_phone: customerUser.phone_number || "", // ✅ Fixed phone from profile
        customer_id: customerUser.id,
      }));

      setHasPrefilledForm(true);
    }
  }, [customerUser, hasPrefilledForm]);

  // ============================================================================
  // WATCH REDUX FORM RESET TRIGGER - Reset form when Redux signal changes
  // ============================================================================
  useEffect(() => {
    if (formResetTrigger > 0) {
      console.log("🔄 [REDUX TRIGGER] Form reset signal received");

      // Reset booking details only, keep customer info
      const resetFormData = {
        user_name: customerUser?.name || "",
        user_email: customerUser?.email || "",
        user_phone: customerUser?.phone_number || "", // Keep customer's phone
        customer_id: customerUser?.id,
        title: "", // ✅ CLEAR BOOKING DETAILS
        description: "",
        date: "",
        time: "",
      };

      console.log("🔄 Clearing booking details only");
      setFormData(resetFormData);

      setTimeout(() => {
        setFormResetKey((prev) => prev + 1);
      }, 10);
    }
  }, [formResetTrigger, customerUser]);

  // ============================================================================
  // HANDLE INPUT CHANGES
  // ============================================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

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

    console.log("📤 Customer creating booking:", formData);

    // Dispatch the createBooking action
    const result = await dispatch(createBooking(formData));

    if (createBooking.fulfilled.match(result)) {
      console.log("✅ Booking created successfully!");
      console.log("📋 Booking ID:", result.payload?.id);

      // Refresh bookings list
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

          <Form onSubmit={handleSubmit} key={formResetKey} ref={formRef}>
            {/* ================================================================ */}
            {/* CUSTOMER INFORMATION SECTION - Pre-filled and Read-only */}
            {/* ================================================================ */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Your Information</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="user_name"
                    value={formData.user_name}
                    required
                    readOnly
                    disabled
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                  <Form.Text className="text-muted">
                    This is your registered name
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="user_email"
                    value={formData.user_email}
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
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="user_phone"
                    value={formData.user_phone}
                    readOnly
                    disabled
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                  <Form.Text className="text-muted">
                    This is your registered phone number (read-only)
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
                <Form.Group className="mb-3" key={`title-${formResetKey}`}>
                  <Form.Label>Service *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="e.g., Haircut, Facial, Manicure"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  key={`description-${formResetKey}`}
                >
                  <Form.Label>Special Requests (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    placeholder="Add any special requests or notes"
                    value={formData.description}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" key={`date-${formResetKey}`}>
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
                    <Form.Group className="mb-3" key={`time-${formResetKey}`}>
                      <Form.Label>Time *</Form.Label>
                      <Form.Control
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        autoComplete="off"
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
                    "🔄 Form reset (booking details cleared, phone cleared)",
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
