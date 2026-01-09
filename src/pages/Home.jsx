import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import pic1 from "../assets/images/beauty-salon-pic-1.png";

export default function Home() {
  const navigate = useNavigate();

  const routeToBooking = () => {
    navigate("/AddBooking");
  };

  return (
    <Container fluid="lg">
      <div
        className="hero-section"
        style={{
          backgroundImage: `url(${pic1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "580px",
          borderRadius: "12px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "x",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
          }}
        />

        <Container className="h-100 position-relative">
          <Row className="h-100 align-items-center">
            <Col md={7}>
              <div
                style={{
                  background: "transparent",
                  padding: "2px",
                  borderRadius: "8px",
                }}
              >
                <h1>Simple Salon Booking System</h1>
                <p className="text-muted mb-4">
                  Book haircuts and beauty services easily. No queues. No
                  confusion.
                </p>
                <Button variant="dark" onClick={routeToBooking}>
                  Create Booking
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </Container>
  );
}
