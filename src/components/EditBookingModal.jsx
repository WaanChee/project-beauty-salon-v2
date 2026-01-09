import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function EditBookingModal({
  show,
  onHide,
  booking,
  onSave,
  loading,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    status: "Pending",
  });

  // Update form when booking changes
  useEffect(() => {
    if (booking) {
      setFormData({
        title: booking.title || "",
        description: booking.description || "",
        date: booking.date || "",
        time: booking.time || "",
        status: booking.status || "Pending",
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(booking.id, formData);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Booking #{booking?.id}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Display User Info (read-only) */}
        {booking && (
          <div className="alert alert-info mb-3">
            <strong>Customer:</strong> {booking.user_name}
            <br />
            <strong>Email:</strong> {booking.user_email}
            <br />
            <strong>Phone:</strong> {booking.user_phone}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Service Title */}
          <Form.Group className="mb-3">
            <Form.Label>Service Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Date and Time */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Time</Form.Label>
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

          {/* Contact Info */}
          {/* Status Field - Most Important for Admin */}
          <Form.Group className="mb-3">
            <Form.Label>
              <strong>Booking Status</strong> ⭐
            </Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
