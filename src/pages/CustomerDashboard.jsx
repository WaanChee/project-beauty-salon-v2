import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "use-local-storage";
import {
  fetchCustomerBookings,
  cancelBooking,
  clearCustomerMessages,
} from "../features/customers/customerSlice";

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get bookings from Redux (still using Redux for bookings management)
  const { bookings, loading, error, successMessage } = useSelector(
    (state) => state.customer
  );

  // Get customer info from localStorage (not Redux)
  const [customerUser] = useLocalStorage("customerUser", null);
  const [customerToken, setCustomerToken] = useLocalStorage(
    "customerToken",
    ""
  );

  // ============================================================================
  // FETCH BOOKINGS ON MOUNT
  // ============================================================================
  useEffect(() => {
    if (customerUser?.id) {
      dispatch(fetchCustomerBookings(customerUser.id));
    }
  }, [dispatch, customerUser]);

  // ============================================================================
  // CLEAR MESSAGES AFTER 5 SECONDS
  // ============================================================================
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearCustomerMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  // ============================================================================
  // HANDLE CANCEL BOOKING
  // ============================================================================
  const handleCancel = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      dispatch(
        cancelBooking({
          bookingId,
          userId: customerUser.id,
        })
      );
    }
  };

  // ============================================================================
  // HANDLE LOGOUT (Direct - No Redux)
  // ============================================================================
  const handleLogout = () => {
    // Clear localStorage
    setCustomerToken("");
    localStorage.removeItem("customerUser");

    // Navigate to login
    navigate("/login");
  };

  // ============================================================================
  // GET STATUS COLOR
  // ============================================================================
  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "success";
      case "Completed":
        return "info";
      case "Cancelled":
        return "danger";
      default:
        return "warning";
    }
  };

  // ============================================================================
  // CHECK IF BOOKING CAN BE CANCELLED
  // ============================================================================
  const canCancel = (status) => {
    return status !== "Cancelled" && status !== "Completed";
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <Container className="py-5">
      {/* ====================================================================== */}
      {/* HEADER */}
      {/* ====================================================================== */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>My Bookings</h1>
              <p className="text-muted">
                Welcome back, {customerUser?.name || "Guest"}!
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => navigate("/addBooking")}>
                + New Booking
              </Button>
              <Button variant="outline-secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* ====================================================================== */}
      {/* MESSAGES */}
      {/* ====================================================================== */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => dispatch(clearCustomerMessages())}
        >
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => dispatch(clearCustomerMessages())}
        >
          {error}
        </Alert>
      )}

      {/* ====================================================================== */}
      {/* LOADING */}
      {/* ====================================================================== */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {/* ====================================================================== */}
      {/* NO BOOKINGS */}
      {/* ====================================================================== */}
      {!loading && bookings.length === 0 && (
        <Alert variant="info">
          <h5>No bookings yet</h5>
          <p>
            You haven't made any bookings. Click "New Booking" to schedule your
            first appointment!
          </p>
          <Button variant="primary" onClick={() => navigate("/addBooking")}>
            Make Your First Booking
          </Button>
        </Alert>
      )}

      {/* ====================================================================== */}
      {/* BOOKINGS GRID */}
      {/* ====================================================================== */}
      {!loading && bookings.length > 0 && (
        <>
          <p className="mb-3">
            <strong>Total Bookings: {bookings.length}</strong>
          </p>

          <Row>
            {bookings.map((booking) => (
              <Col key={booking.id} md={6} lg={4} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="mb-0">{booking.title}</h5>
                      <Badge bg={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>

                    {booking.description && (
                      <p className="text-muted small mb-3">
                        {booking.description}
                      </p>
                    )}

                    <div className="mt-3">
                      <p className="mb-2">
                        <i className="bi bi-calendar-event me-2"></i>
                        <strong>Date:</strong> {booking.date}
                      </p>
                      <p className="mb-2">
                        <i className="bi bi-clock me-2"></i>
                        <strong>Time:</strong> {booking.time}
                      </p>
                      <p className="mb-0 text-muted small">
                        <i className="bi bi-info-circle me-2"></i>
                        Booked on:{" "}
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Card.Body>

                  <Card.Footer className="bg-white border-top">
                    {canCancel(booking.status) ? (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100"
                        onClick={() => handleCancel(booking.id)}
                        disabled={loading}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel Booking
                      </Button>
                    ) : (
                      <p className="text-muted text-center mb-0 small">
                        {booking.status === "Cancelled"
                          ? "This booking was cancelled"
                          : "This booking is completed"}
                      </p>
                    )}
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}
