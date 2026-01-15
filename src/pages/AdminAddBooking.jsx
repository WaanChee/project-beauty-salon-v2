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

export default function AdminAddBooking() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Refs
  const phoneInputRef = useRef(null);
  const formRef = useRef(null);

  // Redux state
  const { loading, error, successMessage, formResetTrigger } = useSelector(
    (state) => state.bookings
  );

  // ============================================================================
  // AUTH STATE - Admin Only
  // ============================================================================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);

  // Check admin authentication on mount
  useEffect(() => {
    const adminUserJson = localStorage.getItem("adminUser");

    if (!adminUserJson) {
      console.log("❌ Not authenticated as admin, redirecting...");
      navigate("/login/admin", { replace: true });
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminUserJson);
      if (!parsedAdmin || (!parsedAdmin.email && !parsedAdmin.username)) {
        console.log("❌ Invalid admin data");
        navigate("/login/admin", { replace: true });
        return;
      }

      setAdminUser(parsedAdmin);
      setIsAuthenticated(true);
      console.log("✅ Admin authenticated:", parsedAdmin.username);
    } catch (err) {
      console.error("Failed to parse admin user:", err);
      navigate("/login/admin", { replace: true });
    }
  }, [navigate]);

  // ============================================================================
  // FORM STATE - For admin to create bookings for customers
  // ============================================================================
  const [formData, setFormData] = useState({
    // Customer Information (admin enters for any customer)
    user_name: "",
    user_email: "",
    user_phone: "",
    // Booking Details
    title: "",
    description: "",
    date: "",
    time: "",
  });

  // ============================================================================
  // WATCH REDUX FORM RESET TRIGGER
  // ============================================================================
  useEffect(() => {
    if (formResetTrigger > 0) {
      console.log("🔄 [REDUX TRIGGER] Form reset signal received");

      // Clear all form fields for next booking
      const resetFormData = {
        user_name: "",
        user_email: "",
        user_phone: "", // ✅ CLEAR PHONE for next booking
        title: "",
        description: "",
        date: "",
        time: "",
      };

      console.log("🔄 Clearing form for next booking");
      setFormData(resetFormData);

      setTimeout(() => {
        setFormResetKey((prev) => prev + 1);
      }, 10);
    }
  }, [formResetTrigger]);

  // ============================================================================
  // HANDLE INPUT CHANGES
  // ============================================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate phone number - only allow digits, spaces, +, -, and ()
    if (name === "user_phone") {
      const phoneRegex = /^[\d\s+\-()]*$/;
      if (!phoneRegex.test(value)) {
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

    console.log("📤 Admin creating booking for customer:", formData);

    // Dispatch the createBooking action
    const result = await dispatch(createBooking(formData));

    if (createBooking.fulfilled.match(result)) {
      console.log("✅ Booking created successfully by admin");
      console.log("📋 Booking ID:", result.payload?.id);

      // Refresh bookings list
      await dispatch(fetchBookings());
    } else {
      console.error("❌ Booking creation failed:", result.payload);
    }
  };

  // ============================================================================
  // AUTO-CLEAR MESSAGES
  // ============================================================================
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  // Don't render until authenticated
  if (!isAuthenticated || !adminUser) {
    return null;
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Create Booking (Admin)</h1>
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/adminPage")}
            >
              ← Back to Admin Dashboard
            </Button>
          </div>

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
            {/* ADMIN INFO SECTION */}
            {/* ================================================================ */}
            <Card className="mb-4" style={{ backgroundColor: "#f0f8ff" }}>
              <Card.Header>
                <h5 className="mb-0">👤 Booking Created By</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">
                  <strong>Admin:</strong> {adminUser.username} (
                  {adminUser.email})
                </p>
              </Card.Body>
            </Card>

            {/* ================================================================ */}
            {/* CUSTOMER INFORMATION SECTION - Admin enters for customer */}
            {/* ================================================================ */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Customer Information</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3" key={`name-${formResetKey}`}>
                  <Form.Label>Customer Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="user_name"
                    placeholder="Enter customer's full name"
                    defaultValue={formData.user_name}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                </Form.Group>

                <Form.Group className="mb-3" key={`email-${formResetKey}`}>
                  <Form.Label>Customer Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="user_email"
                    placeholder="customer@example.com"
                    defaultValue={formData.user_email}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                  <Form.Text className="text-muted">
                    Email to identify/create customer record
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" key={`phone-${formResetKey}`}>
                  <Form.Label>Customer Phone Number *</Form.Label>
                  <Form.Control
                    ref={phoneInputRef}
                    type="tel"
                    name="user_phone"
                    inputMode="tel"
                    placeholder="+60123456789"
                    defaultValue={formData.user_phone}
                    onChange={handleChange}
                    required
                    autoComplete="tel-national"
                    pattern="[\d\s+\-()]+"
                    title="Please enter a valid phone number (numbers, +, -, spaces, parentheses)"
                  />
                  <Form.Text className="text-muted">
                    ✅ Each booking can have a different phone number
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* ================================================================ */}
            {/* BOOKING DETAILS SECTION */}
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
                    defaultValue={formData.title}
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
                    defaultValue={formData.description}
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
                        defaultValue={formData.date}
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
                        defaultValue={formData.time}
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
            {/* SUBMIT BUTTON */}
            {/* ================================================================ */}
            <div className="d-flex gap-3 mb-3">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="flex-grow-1"
                size="lg"
              >
                {loading ? "Creating Booking..." : "✅ Create Booking"}
              </Button>
              <Button
                variant="outline-secondary"
                type="button"
                disabled={loading}
                size="lg"
                onClick={() => {
                  setFormData({
                    user_name: "",
                    user_email: "",
                    user_phone: "",
                    title: "",
                    description: "",
                    date: "",
                    time: "",
                  });
                  setFormResetKey((prev) => prev + 1);
                }}
              >
                Clear Form
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
