import { useEffect, useState } from "react";
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
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import axios from "axios";
import {
  fetchCustomerBookings,
  cancelBooking,
  clearCustomerMessages,
  resetCustomerState,
} from "../features/customers/customerSlice";

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get bookings from Redux (still using Redux for bookings management)
  const { bookings, loading, error, successMessage } = useSelector(
    (state) => state.customer
  );

  // Get customer info from localStorage (linked to Firebase)
  const [customerUser, setCustomerUser] = useLocalStorage("customerUser", null);

  useEffect(() => {
    // Force sync from localStorage when component mounts
    const stored = localStorage.getItem("customerUser");

    console.log("🔵 [MOUNT] Raw localStorage customerUser:", stored);

    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        console.log("🔄 [MOUNT] Parsed user data:", parsedUser);

        // Validate that we have required fields
        if (!parsedUser || !parsedUser.email || !parsedUser.id) {
          console.error(
            "❌ [MOUNT] Invalid user data in localStorage:",
            parsedUser
          );
          console.log("🗑️ [MOUNT] Clearing corrupt localStorage data...");

          // Clear ALL customer data
          localStorage.removeItem("customerUser");
          localStorage.removeItem("customerToken");

          // Don't show alert - just redirect
          // Redirect to login
          navigate("/customer/auth", { replace: true });
          return;
        }

        console.log("✅ [MOUNT] Valid user data found");
        setCustomerUser(parsedUser);
      } catch (err) {
        console.error(
          "⚠️ [MOUNT] Failed to parse customerUser from localStorage:",
          err
        );
        localStorage.removeItem("customerUser");
        localStorage.removeItem("customerToken");
        navigate("/customer/auth", { replace: true });
      }
    } else {
      console.log("⚠️ [MOUNT] No customerUser in localStorage, waiting...");
      // Give localStorage more time to write (race condition with navigation)
      setTimeout(() => {
        const retryStored = localStorage.getItem("customerUser");
        if (!retryStored) {
          console.log("⚠️ [MOUNT RETRY] Still no data, redirecting to auth");
          navigate("/customer/auth", { replace: true });
        } else {
          console.log("✅ [MOUNT RETRY] Data found on retry, reloading");
          // Parse and set the user data instead of reloading
          try {
            const parsedUser = JSON.parse(retryStored);
            if (parsedUser && parsedUser.email && parsedUser.id) {
              setCustomerUser(parsedUser);
              console.log("✅ User data loaded on retry");
            } else {
              window.location.reload();
            }
          } catch {
            window.location.reload();
          }
        }
      }, 200); // Increased from 100ms to 200ms for more reliability
    }
  }, []); // Run only once on mount

  // ============================================================================
  // FETCH USER PROFILE FROM DATABASE
  // ============================================================================
  const fetchUserProfile = async () => {
    try {
      const API_URL =
        "https://86605879-7581-472d-a2f1-a4d71a358503-00-1nvtq3qgvln7.pike.replit.dev";

      const response = await axios.get(
        `${API_URL}/customer/profile/${customerUser.uid}`
      );

      const completeProfile = {
        uid: customerUser.uid,
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        phone_number: response.data.phone_number,
      };

      // Update localStorage with complete profile
      localStorage.setItem("customerUser", JSON.stringify(completeProfile));
      setCustomerUser(completeProfile);

      console.log("✅ User profile fetched and updated:", completeProfile);

      // Now fetch bookings with the database ID
      dispatch(fetchCustomerBookings(response.data.id));
    } catch (error) {
      console.error("❌ Failed to fetch user profile:", error);
    }
  };

  // ============================================================================
  // FETCH BOOKINGS ON MOUNT
  // ============================================================================
  useEffect(() => {
    // Prefer in-memory user; fall back to parsed localStorage copy
    let userId = customerUser?.id;
    let userToSet = null;

    if (!userId) {
      const stored = localStorage.getItem("customerUser");
      if (stored) {
        try {
          const parsedUser = JSON.parse(stored);
          userId = parsedUser?.id;
          userToSet = parsedUser;
          console.log("📦 Retrieved user from localStorage:", {
            id: userId,
            name: parsedUser?.name,
            email: parsedUser?.email,
          });
        } catch (err) {
          console.warn("⚠️ Corrupt customerUser in storage, clearing.", err);
          localStorage.removeItem("customerUser");
        }
      }
    }

    // Update state if we parsed a user from storage
    if (userToSet && !customerUser) {
      setCustomerUser(userToSet);
    }

    if (userId) {
      // Make sure userId is an integer, not a Firebase UID string
      const isInteger = Number.isInteger(userId) || /^\d+$/.test(userId);

      if (isInteger) {
        console.log("✅ Fetching bookings with database ID:", userId);
        dispatch(fetchCustomerBookings(userId));
      } else {
        // userId is a Firebase UID (string), need to fetch the profile first
        console.log("⚠️ User ID is Firebase UID, fetching database profile...");
        if (customerUser?.uid) {
          fetchUserProfile();
        }
      }
    } else if (customerUser?.uid) {
      // If we have Firebase UID but no database ID, fetch the profile
      console.log("⚠️ No database ID, fetching profile from backend...");
      fetchUserProfile();
    }
  }, [dispatch, customerUser]);

  // ============================================================================
  // HANDLE MANUAL REFRESH - User-friendly refresh button
  // ============================================================================
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      let userId = customerUser?.id;
      let userToSet = null;

      if (!userId) {
        const stored = localStorage.getItem("customerUser");
        if (stored) {
          try {
            const parsedUser = JSON.parse(stored);
            userId = parsedUser?.id;
            userToSet = parsedUser;
            console.log("🔄 [REFRESH] Retrieved user from storage:", {
              id: userId,
              name: parsedUser?.name,
            });
          } catch (err) {
            console.warn("⚠️ Corrupt customerUser in storage, clearing.", err);
            localStorage.removeItem("customerUser");
          }
        }
      }

      // Update customerUser state if we found it in localStorage
      if (userToSet && !customerUser) {
        console.log("🔄 [REFRESH] Updating customerUser state");
        setCustomerUser(userToSet);
      }

      if (userId) {
        await dispatch(fetchCustomerBookings(userId));
      } else {
        console.warn("⚠️ [BUTTON] No customer ID found; skipping refresh.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

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
      let userId = customerUser?.id;
      let userToSet = null;

      if (!userId) {
        const stored = localStorage.getItem("customerUser");
        if (stored) {
          try {
            const parsedUser = JSON.parse(stored);
            userId = parsedUser?.id;
            userToSet = parsedUser;
          } catch (err) {
            console.warn("⚠️ Corrupt customerUser in storage, clearing.", err);
            localStorage.removeItem("customerUser");
          }
        }
      }

      // Update customerUser state if we found it in localStorage
      if (userToSet && !customerUser) {
        setCustomerUser(userToSet);
      }

      dispatch(
        cancelBooking({
          bookingId,
          userId, // Using database ID for bookings
        })
      );
    }
  };

  // ============================================================================
  // HANDLE LOGOUT WITH FIREBASE
  // ============================================================================
  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...");

      // Clear Redux customer state
      dispatch(resetCustomerState());

      // Sign out from Firebase
      await signOut(auth);

      // Clear localStorage
      setCustomerUser(null);
      localStorage.removeItem("customerUser");

      console.log("✅ Logout successful");

      // Navigate to login selector
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout error:", error);

      // Even if Firebase signOut fails, clear Redux and local data
      dispatch(resetCustomerState());
      setCustomerUser(null);
      localStorage.removeItem("customerUser");
      navigate("/login");
    }
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
                {/* Display name from customerUser */}
                Welcome back, {customerUser?.name || "Guest"}!
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => navigate("/addBooking")}>
                + New Booking
              </Button>
              <Button
                variant="outline-info"
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
              >
                <i
                  className={`bi bi-arrow-clockwise ${
                    isRefreshing ? "spin" : ""
                  }`}
                ></i>
                {isRefreshing ? " Refreshing..." : " Refresh"}
              </Button>
              {/* Now calls Firebase logout */}
              <Button variant="outline-secondary" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
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
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => dispatch(clearCustomerMessages())}
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      {/* ====================================================================== */}
      {/* LOADING */}
      {/* ====================================================================== */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading your bookings...</p>
        </div>
      )}

      {/* ====================================================================== */}
      {/* NO BOOKINGS */}
      {/* ====================================================================== */}
      {!loading && bookings.length === 0 && (
        <Alert variant="info" className="text-center py-5">
          <i className="bi bi-calendar-x" style={{ fontSize: "3rem" }}></i>
          <h5 className="mt-3">No bookings yet</h5>
          <p className="mb-4">
            You haven't made any bookings. Click "New Booking" to schedule your
            first appointment!
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/addBooking")}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Make Your First Booking
          </Button>
        </Alert>
      )}

      {/* ====================================================================== */}
      {/* BOOKINGS GRID */}
      {/* ====================================================================== */}
      {!loading && bookings.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="mb-0">
              <strong>Total Bookings: {bookings.length}</strong>
            </p>
            {/* Filter info */}
            <small className="text-muted">Showing all your bookings</small>
          </div>

          <Row>
            {bookings.map((booking) => (
              <Col key={booking.id} md={6} lg={4} className="mb-4">
                <Card className="h-100 shadow-sm border-0">
                  {/* Card top accent based on status */}
                  <div
                    style={{
                      height: "4px",
                      background:
                        booking.status === "Confirmed"
                          ? "linear-gradient(90deg, #28a745, #20c997)"
                          : booking.status === "Cancelled"
                          ? "linear-gradient(90deg, #dc3545, #fd7e14)"
                          : booking.status === "Completed"
                          ? "linear-gradient(90deg, #17a2b8, #007bff)"
                          : "linear-gradient(90deg, #ffc107, #fd7e14)",
                    }}
                  ></div>

                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="mb-0">{booking.title}</h5>
                      <Badge bg={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>

                    {booking.description && (
                      <p className="text-muted small mb-3">
                        <i className="bi bi-chat-left-text me-2"></i>
                        {booking.description}
                      </p>
                    )}

                    <div className="mt-3">
                      <p className="mb-2">
                        <i className="bi bi-calendar-event me-2 text-primary"></i>
                        <strong>Date:</strong> {booking.date}
                      </p>
                      <p className="mb-2">
                        <i className="bi bi-clock me-2 text-primary"></i>
                        <strong>Time:</strong> {booking.time}
                      </p>
                      <p className="mb-0 text-muted small">
                        <i className="bi bi-info-circle me-2"></i>
                        Booked on:{" "}
                        {new Date(booking.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
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
                      <div className="text-center py-2">
                        <small className="text-muted">
                          {booking.status === "Cancelled" ? (
                            <>
                              <i className="bi bi-x-circle text-danger me-2"></i>
                              This booking was cancelled
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle text-info me-2"></i>
                              This booking is completed
                            </>
                          )}
                        </small>
                      </div>
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
