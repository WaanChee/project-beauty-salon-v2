import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import pic2 from "../assets/images/beauty-salon-login-page-bg.png";

export default function LoginSelector() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (role) => {
    setSelectedRole(role);

    setTimeout(() => {
      if (role === "admin") {
        navigate("/login/admin");
      } else if (role === "user") {
        navigate("/customer/auth");
      }
    }, 700);
  };

  return (
    <Container fluid className="p-0" style={{ minHeight: "100vh" }}>
      <Row className="g-0" style={{ minHeight: "100vh" }}>
        {/* Left Side - Hero */}
        <Col lg={6} className="d-none d-lg-flex p-0">
          <div
            style={{
              position: "relative",
              width: "100%",
              backgroundImage: `url(${pic2})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Dark overlay for text contrast */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(15, 23, 42, 0.35) 0%, rgba(15, 23, 42, 0.15) 100%)",
                zIndex: 1,
              }}
            />

            {/* Content */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                maxWidth: "500px",
                padding: "60px 40px",
                textAlign: "left",
                color: "#f8fafc",
              }}
            >
              <p
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#cdd7ff",
                  margin: "0 0 12px 0",
                }}
              >
                Nova Grace Salon
              </p>
              <h1
                style={{
                  fontSize: "clamp(32px, 5vw, 48px)",
                  fontWeight: "700",
                  margin: "0 0 16px 0",
                  lineHeight: "1.2",
                  color: "#f8fafc",
                }}
              >
                Choose Your Login Type
              </h1>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#e2e8f0",
                  margin: 0,
                }}
              >
                Select whether you want to access as a customer or an
                administrator to continue.
              </p>
            </div>
          </div>
        </Col>

        {/* Right Side - Login Options */}
        <Col
          lg={6}
          className="d-flex align-items-center justify-content-center p-5"
        >
          <div style={{ maxWidth: "480px", width: "100%" }}>
            {/* Header */}
            <div className="mb-5">
              <h2
                className="fw-bold mb-2"
                style={{
                  color: "#0f172a",
                  fontSize: "2rem",
                  letterSpacing: "-0.5px",
                }}
              >
                Welcome Back
              </h2>
              <p
                style={{
                  color: "#5f6b7c",
                  fontSize: "0.95rem",
                  margin: 0,
                  fontWeight: "500",
                }}
              >
                How would you like to sign in?
              </p>
            </div>

            {/* Status message */}
            {selectedRole && (
              <div
                className="d-flex align-items-center border-0 p-4 mb-4"
                style={{
                  backgroundColor: "#eff6ff",
                  color: "#1e40af",
                  borderRadius: "12px",
                }}
              >
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-3"
                  style={{
                    color: "#3b82f6",
                    "--bs-spinner-width": "1.25rem",
                    "--bs-spinner-height": "1.25rem",
                  }}
                />
                <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                  Signing in as{" "}
                  <strong>
                    {selectedRole === "admin" ? "Administrator" : "Customer"}
                  </strong>
                  ...
                </span>
              </div>
            )}

            {/* Role selection options */}
            <div className="d-grid gap-4 mb-5">
              {/* Customer option */}
              <div
                onClick={() => !selectedRole && handleLogin("user")}
                style={{
                  padding: "24px",
                  borderRadius: "14px",
                  border: "2px solid #e6eaf2",
                  background: "#ffffff",
                  cursor: selectedRole ? "default" : "pointer",
                  opacity: selectedRole && selectedRole !== "user" ? 0.4 : 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  pointerEvents: selectedRole ? "none" : "auto",
                }}
                onMouseEnter={(e) => {
                  if (!selectedRole) {
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(59, 130, 246, 0.12)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.background = "#f8fbff";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e6eaf2";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                  }}
                >
                  <i
                    className="bi bi-person-fill text-white"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                </div>
                <div className="flex-grow-1">
                  <div
                    className="fw-bold"
                    style={{
                      color: "#0f172a",
                      fontSize: "1.05rem",
                      marginBottom: "4px",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    Customer
                  </div>
                  <div
                    style={{
                      color: "#5f6b7c",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                    }}
                  >
                    Access your personal account
                  </div>
                </div>
                <i
                  className="bi bi-chevron-right"
                  style={{
                    color: "#cbd5e1",
                    fontSize: "1.5rem",
                    transition: "all 0.3s ease",
                  }}
                ></i>
              </div>

              {/* Admin option */}
              <div
                onClick={() => !selectedRole && handleLogin("admin")}
                style={{
                  padding: "24px",
                  borderRadius: "14px",
                  border: "2px solid #e6eaf2",
                  background: "#ffffff",
                  cursor: selectedRole ? "default" : "pointer",
                  opacity: selectedRole && selectedRole !== "admin" ? 0.4 : 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  pointerEvents: selectedRole ? "none" : "auto",
                }}
                onMouseEnter={(e) => {
                  if (!selectedRole) {
                    e.currentTarget.style.borderColor = "#10b981";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(16, 185, 129, 0.12)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.background = "#f0fdf4";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e6eaf2";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                  }}
                >
                  <i
                    className="bi bi-shield-fill text-white"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                </div>
                <div className="flex-grow-1">
                  <div
                    className="fw-bold"
                    style={{
                      color: "#0f172a",
                      fontSize: "1.05rem",
                      marginBottom: "4px",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    Administrator
                  </div>
                  <div
                    style={{
                      color: "#5f6b7c",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                    }}
                  >
                    Manage system settings and tools
                  </div>
                </div>
                <i
                  className="bi bi-chevron-right"
                  style={{
                    color: "#cbd5e1",
                    fontSize: "1.5rem",
                    transition: "all 0.3s ease",
                  }}
                ></i>
              </div>
            </div>

            {/* Footer */}
            <div
              className="text-center pt-4"
              style={{ borderTop: "1px solid #e6eaf2" }}
            >
              <p
                className="mb-2"
                style={{
                  color: "#5f6b7c",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                }}
              >
                <i className="bi bi-shield-check me-2"></i>
                Your data is securely protected
              </p>
              <p
                className="mt-3 mb-0"
                style={{
                  color: "#94a3b8",
                  fontSize: "0.8rem",
                }}
              >
                © {new Date().getFullYear()} • Nova Grace Salon • Version 2.4.1
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
