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
import {
  createBooking,
  clearMessages,
} from "../features/bookings/bookingSlice";
import useLocalStorage from "use-local-storage";

export default function AddBooking() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector(
    (state) => state.bookings
  );
  const [authToken] = useLocalStorage("authToken", "");

  // Form data state with user information
  const [formData, setFormData] = useState({
    // User Information (Customer)
    user_name: "",
    user_email: "",
    user_phone: "",
    // Booking Details
    title: "",
    description: "",
    date: "",
    time: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create booking data (user info + booking details)
    const bookingData = {
      ...formData,
    };

    // Dispatch the createBooking action
    await dispatch(createBooking(bookingData));

    // Clear form after successful submission
    setFormData({
      user_name: "",
      user_email: "",
      user_phone: "",
      title: "",
      description: "",
      date: "",
      time: "",
    });
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

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
            {/* Customer Information Section */}
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
                    placeholder="John Doe"
                    value={formData.user_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="user_email"
                    placeholder="john.doe@example.com"
                    value={formData.user_email}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    We'll use this to send booking confirmations
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
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Booking Details Section */}
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
                        min={new Date().toISOString().split("T")[0]} // Prevent past dates
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

            {/* Submit Button */}
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

          {!authToken && (
            <Alert variant="info" className="mt-3">
              💡 <strong>No account needed!</strong> Just fill in your details
              and book. Your information will be saved for faster bookings next
              time!
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}
