import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Table,
  Button,
  Badge,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  fetchBookings,
  deleteBooking,
  updateBooking,
} from "../features/bookings/bookingSlice";
import EditBookingModal from "../components/EditBookingModal";

export default function AdminPage({ handleLogout }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading, error, successMessage } = useSelector(
    (state) => state.bookings,
  );

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch bookings when component loads
  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // Handle delete booking
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this booking? 😈")) {
      dispatch(deleteBooking(id));
    }
  };

  // Handle edit button click
  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  // Handle save changes
  const handleSave = async (id, updatedData) => {
    await dispatch(updateBooking({ id, bookingData: updatedData }));
    setShowEditModal(false);
    setSelectedBooking(null);
    // Refresh bookings list
    dispatch(fetchBookings());
  };

  // Handle silent refresh - no loading spinner, instant background update
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchBookings());
    } finally {
      // Small delay to show the icon briefly
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Get status badge color
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

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Admin - Manage Bookings</h1>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={() => navigate("/admin/addBooking")}
              >
                + Create New Booking
              </Button>
              <Button
                variant="outline-info"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh bookings list"
              >
                <i
                  className={`bi bi-arrow-clockwise ${
                    isRefreshing ? "spin" : ""
                  }`}
                ></i>
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" dismissible>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="danger" dismissible>
          {error}
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && bookings.length === 0 && (
        <Alert variant="info">
          No bookings found. Customers will create bookings from the booking
          page!
        </Alert>
      )}

      {!loading && bookings.length > 0 && (
        <>
          <div className="mb-3">
            <strong>Total Bookings: {bookings.length}</strong>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>
                    <strong>{booking.user_name}</strong>
                    <div className="text-muted small">{booking.user_email}</div>
                    <div className="text-muted small">{booking.user_phone}</div>
                  </td>
                  <td>
                    <strong>{booking.title}</strong>
                    {booking.description && (
                      <div className="text-muted small">
                        {booking.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <div>{booking.date}</div>
                    <div className="text-muted small">{booking.time}</div>
                  </td>
                  <td>
                    <Badge bg={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(booking)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(booking.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {/* Edit Modal */}
      {selectedBooking && (
        <EditBookingModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          booking={selectedBooking}
          onSave={handleSave}
          loading={loading}
        />
      )}
    </Container>
  );
}
