import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Image,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LoginSelector() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (role) => {
    setSelectedRole(role);

    // Simulate a brief selection feedback before navigation
    setTimeout(() => {
      if (role === "admin") {
        navigate("/admin/dashboard"); // Update with your actual admin route
      } else if (role === "user") {
        navigate("/user/dashboard"); // Update with your actual user route
      }
    }, 300);
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
    >
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h1 className="fw-bold text-primary mb-3">Welcome Back</h1>
                <p className="text-muted">
                  Please select your role to continue to the platform
                </p>
              </div>

              {selectedRole && (
                <Alert variant="info" className="text-center">
                  <strong>
                    Logging in as{" "}
                    {selectedRole === "admin" ? "Administrator" : "Customer"}...
                  </strong>
                </Alert>
              )}

              <div className="d-grid gap-4 mt-4">
                <Button
                  variant="outline-primary"
                  size="lg"
                  className="p-4 rounded-3 d-flex align-items-center justify-content-start"
                  onClick={() => handleLogin("user")}
                  disabled={selectedRole}
                >
                  <div className="d-flex align-items-center w-100">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-4">
                      <i className="bi bi-person-circle fs-2 text-primary"></i>
                    </div>
                    <div className="text-start">
                      <h5 className="mb-1 fw-bold">Customer</h5>
                      <p className="text-muted mb-0">
                        Access your personal account
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline-success"
                  size="lg"
                  className="p-4 rounded-3 d-flex align-items-center justify-content-start"
                  onClick={() => handleLogin("admin")}
                  disabled={selectedRole}
                >
                  <div className="d-flex align-items-center w-100">
                    <div className="bg-success bg-opacity-10 p-3 rounded-3 me-4">
                      <i className="bi bi-shield-check fs-2 text-success"></i>
                    </div>
                    <div className="text-start">
                      <h5 className="mb-1 fw-bold">Administrator</h5>
                      <p className="text-muted mb-0">
                        Access administrative features
                      </p>
                    </div>
                  </div>
                </Button>
              </div>

              <div className="text-center mt-5 pt-3 border-top">
                <p className="text-muted small">
                  Need help?{" "}
                  <a href="/support" className="text-decoration-none">
                    Contact support
                  </a>
                </p>
              </div>
            </Card.Body>
          </Card>

          <div className="text-center mt-4">
            <p className="text-muted">
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
