import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LoginSelector() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isHovered, setIsHovered] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (role) => {
    setSelectedRole(role);

    // Simulate a brief selection feedback before navigation
    setTimeout(() => {
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "user") {
        navigate("/user/dashboard");
      }
    }, 700);
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center p-0"
    >
      {/* Beautiful night sky background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          background:
            "linear-gradient(135deg, #0c1445 0%, #1a237e 30%, #311b92 70%, #4a148c 100%)",
        }}
      ></div>

      {/* Subtle pattern overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
          backgroundSize: "50px 50px",
          opacity: 0.3,
        }}
      ></div>

      <Row className="justify-content-center w-100 mx-0">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card
            className="border-0"
            style={{
              borderRadius: "20px",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(15px)",
              backgroundImage: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.18) 0%, 
                  rgba(255, 255, 255, 0.10) 50%, 
                  rgba(255, 255, 255, 0.05) 100%
                )
              `,
              boxShadow: `
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 8px 24px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 0 20px rgba(103, 58, 183, 0.1)
              `,
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            {/* Top accent */}
            <div
              style={{
                height: "6px",
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                width: "100%",
              }}
            ></div>

            <Card.Body className="p-4 p-md-5">
              {/* Header */}
              <div className="text-center mb-5">
                <div className="mb-4 position-relative">
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow:
                        "0 4px 15px rgba(102, 126, 234, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <i className="bi bi-door-open text-white fs-3"></i>
                  </div>
                </div>

                <h1
                  className="fw-bold mb-3"
                  style={{
                    color: "rgba(255, 255, 255, 0.95)",
                    fontSize: "2rem",
                    fontWeight: "700",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  Welcome Back
                </h1>
                <p
                  className="mb-0"
                  style={{
                    color: "rgba(200, 210, 255, 0.9)",
                    fontSize: "1.05rem",
                    fontWeight: "500",
                  }}
                >
                  How would you like to sign in?
                </p>
              </div>

              {/* Status message */}
              {selectedRole && (
                <Alert
                  variant="light"
                  className="text-center border-0 mb-4 rounded-3"
                  style={{
                    background: "rgba(102, 126, 234, 0.15)",
                    border: "1px solid rgba(102, 126, 234, 0.3)",
                    color: "rgba(255, 255, 255, 0.95)",
                    fontWeight: "500",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      style={{ color: "#667eea" }}
                      role="status"
                    ></div>
                    <strong style={{ fontSize: "0.95rem" }}>
                      Signing in as{" "}
                      {selectedRole === "admin" ? "Administrator" : "Customer"}
                      ...
                    </strong>
                  </div>
                </Alert>
              )}

              {/* Role selection options */}
              <div className="d-grid gap-4">
                {/* Customer option */}
                <div
                  className={`p-4 rounded-3 ${
                    selectedRole ? "opacity-50" : ""
                  }`}
                  style={{
                    cursor: selectedRole ? "default" : "pointer",
                    background:
                      isHovered === "user" && !selectedRole
                        ? "rgba(102, 126, 234, 0.15)"
                        : "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(102, 126, 234, 0.3)",
                    transition: "all 0.2s ease",
                    boxShadow:
                      isHovered === "user" && !selectedRole
                        ? "0 4px 12px rgba(102, 126, 234, 0.15)"
                        : "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseEnter={() => !selectedRole && setIsHovered("user")}
                  onMouseLeave={() => setIsHovered(null)}
                  onClick={() => !selectedRole && handleLogin("user")}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="p-3 rounded-3 me-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #8a6de6 100%)",
                        boxShadow: "0 4px 8px rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <i className="bi bi-person-fill text-white fs-4"></i>
                    </div>
                    <div className="text-start flex-grow-1">
                      <h5
                        className="fw-bold mb-1"
                        style={{
                          color: "rgba(255, 255, 255, 0.95)",
                          fontSize: "1.1rem",
                        }}
                      >
                        Customer
                      </h5>
                      <p
                        className="mb-0"
                        style={{
                          color: "rgba(200, 210, 255, 0.9)",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                        }}
                      >
                        Access your personal account and workspace
                      </p>
                    </div>
                    <i
                      className="bi bi-chevron-right fs-5"
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontWeight: "bold",
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                        minWidth: "20px",
                      }}
                    ></i>
                  </div>
                </div>

                {/* Admin option */}
                <div
                  className={`p-4 rounded-3 ${
                    selectedRole ? "opacity-50" : ""
                  }`}
                  style={{
                    cursor: selectedRole ? "default" : "pointer",
                    background:
                      isHovered === "admin" && !selectedRole
                        ? "rgba(76, 201, 240, 0.15)"
                        : "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(76, 201, 240, 0.3)",
                    transition: "all 0.2s ease",
                    boxShadow:
                      isHovered === "admin" && !selectedRole
                        ? "0 4px 12px rgba(76, 201, 240, 0.15)"
                        : "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseEnter={() => !selectedRole && setIsHovered("admin")}
                  onMouseLeave={() => setIsHovered(null)}
                  onClick={() => !selectedRole && handleLogin("admin")}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="p-3 rounded-3 me-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #4cc9f0 0%, #6adef0 100%)",
                        boxShadow: "0 4px 8px rgba(76, 201, 240, 0.3)",
                      }}
                    >
                      <i className="bi bi-shield-fill text-white fs-4"></i>
                    </div>
                    <div className="text-start flex-grow-1">
                      <h5
                        className="fw-bold mb-1"
                        style={{
                          color: "rgba(255, 255, 255, 0.95)",
                          fontSize: "1.1rem",
                        }}
                      >
                        Administrator
                      </h5>
                      <p
                        className="mb-0"
                        style={{
                          color: "rgba(200, 240, 255, 0.9)",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                        }}
                      >
                        Manage system settings and administrative tools
                      </p>
                    </div>
                    <i
                      className="bi bi-chevron-right fs-5"
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontWeight: "bold",
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                        minWidth: "20px",
                      }}
                    ></i>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="text-center mt-5 pt-4"
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <p
                  className="mb-2"
                  style={{
                    color: "rgba(180, 200, 255, 0.8)",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                  }}
                >
                  <i className="bi bi-shield-check me-1"></i>
                  Your data is securely protected
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Bottom message */}
          <div className="text-center mt-4">
            <p
              style={{
                color: "rgba(140, 160, 255, 0.6)",
                fontSize: "0.85rem",
                fontWeight: "500",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              © {new Date().getFullYear()} • Nova Grace! • Version 2.4.1
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
