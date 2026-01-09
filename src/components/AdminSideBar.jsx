import { Button, Col } from "react-bootstrap";
import IconButton from "./IconButton";

export default function AdminSideBar({ handleLogout }) {
  return (
    <Col>
      <IconButton
        className="bi bi-door-closed"
        text="Logout"
        onClick={handleLogout}
      />
    </Col>
  );
}
