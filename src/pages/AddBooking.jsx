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

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const userJson = localStorage.getItem("customerUser");

    console.log("🔵 AddBooking Auth Check:", {
      hasToken: !!token,
      hasUser: !!userJson,
    });

    if (!token || !userJson) {
      console.log("❌ Not authenticated, redirecting to login...");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userJson);
      setCustomerUser(user);
      setIsAuthenticated(true);
      console.log("✅ User authenticated:", user.email);
    } catch (error) {
      console.error("❌ Failed to parse user data:", error);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ============================================================================
  // FORM STATE - Pre-filled with customer info
  // ============================================================================
  const [formData, setFormData] = useState({
    // User Information (pre-filled from logged-in customer)
    user_name: "",
    user_email: "",
    user_phone: "",
    // Booking Details (empty, user fills these)
    title: "",
    description: "",
    date: "",
    time: "",
  });

  // Pre-fill form when customerUser is loaded
  useEffect(() => {
    if (customerUser) {
      setFormData((prev) => ({
        ...prev,
        user_name: customerUser.name || "",
        user_email: customerUser.email || "",
        user_phone: customerUser.phone_number || "",
      }));
    }
  }, [customerUser]);

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
  // HANDLE FORM SUBMISSION
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dispatch the createBooking action
    const result = await dispatch(createBooking(formData));

    // Only clear booking fields if successful, keep user info
    if (createBooking.fulfilled.match(result)) {
      setFormData({
        user_name: customerUser?.name || "",
        user_email: customerUser?.email || "",
        user_phone: customerUser?.phone_number || "",
        title: "", // Clear service
        description: "", // Clear description
        date: "", // Clear date
        time: "", // Clear time
      });
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
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
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
                    onChange={handleChange}
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
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="user_phone"
                    placeholder="+60123456789"
                    value={formData.user_phone}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Update your phone number if needed
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
            {/* SUBMIT BUTTON */}
            {/* ================================================================ */}
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-100"
              size="lg"
            >
              {loading ? "Creating Booking..." : "Confirm Booking"}
            </Button>
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
