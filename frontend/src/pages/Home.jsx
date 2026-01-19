import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import pic1 from "../assets/images/beauty-salon-pic-1.png";
import GallerySection from "../components/GallerySection";
import MapSection from "../components/MapSection";
import { useAdminStatus } from "../hooks/useAdminStatus";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated: isAdminLoggedIn } = useAdminStatus();

  const routeToBooking = () => {
    if (isAdminLoggedIn) {
      navigate("/admin/addBooking");
    } else {
      navigate("/addBooking");
    }
  };

  return (
    <>
      <Container fluid="xl" className="py-4">
        <div className="hero-shell" style={{ backgroundImage: `url(${pic1})` }}>
          <div className="hero-overlay" />
          <div className="hero-inner">
            <p className="hero-eyebrow">Nova Grace Salon</p>
            <h1 className="hero-title">Simple Salon Booking System</h1>
            <p className="hero-subtitle">
              Book haircuts and beauty services easily. No queues. No confusion.
            </p>
            <div className="hero-actions">
              <Button variant="dark" onClick={routeToBooking}>
                Create Booking
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* Gallery Section */}
      <GallerySection />

      {/* Map Section */}
      <MapSection />
    </>
  );
}
