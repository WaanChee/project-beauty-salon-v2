import {
  Container,
  Col,
  Image,
  Row,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import useLocalStorage from "use-local-storage";
import { useNavigate } from "react-router-dom";
import pic2 from "../assets/images/beauty-salon-login-page-bg.png";

export default function Login() {
  const loginImage = pic2;
  const API_URL =
    "https://eb392aa9-9b22-4ac4-b3cc-7f8d369efa1e-00-3asbq4cs361u6.pike.replit.dev";

  // Possible values: null (no modal shows), "Login", "SignUp"
  const [modalShow, setModalShow] = useState(null);
  const handleShowSignUp = () => setModalShow("SignUp");
  const handleShowLogin = () => setModalShow("Login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useLocalStorage("authToken", "");

  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      navigate("/adminPage");
    }
  }, [authToken, navigate]);

  const handleSignUp = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        username,
        password,
      });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      if (response.data && response.data.auth === true && response.data.token) {
        setAuthToken(response.data.token);
        console.log("Login success, token saved");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => setModalShow(null);

  return (
    <Row>
      <Col sm={7}>
        <Image src={loginImage} fluid />
      </Col>

      <Col sm={5} className="p-4">
        <h2 className="my-5" style={{ fontSize: 31 }}>
          Beauty Salon
        </h2>

        <Col sm={5} className="d-grid gap-2">
          <Button className="rounded-pill" onClick={handleShowSignUp}>
            Create an account
          </Button>

          <p className="mt-5" style={{ fontWeight: "bold" }}>
            Already have an account?
          </p>
          <Button
            className="rounded-pill"
            variant="outline-primary"
            onClick={handleShowLogin}
          >
            Sign in
          </Button>
        </Col>

        <Modal
          show={modalShow !== null}
          onHide={handleClose}
          animation={false}
          centered
        >
          <Modal.Body>
            <h2 className="mb-4" style={{ fontWeight: "bold" }}>
              {modalShow === "SignUp"
                ? "Create your account"
                : "Log in to your account"}
            </h2>

            <Form
              className="d-grid gap-2 px-5"
              onSubmit={modalShow === "SignUp" ? handleSignUp : handleLogin}
            >
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Control
                  onChange={(event) => setUsername(event.target.value)}
                  type="text"
                  placeholder="Enter your username"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Control
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="Enter your password"
                />
              </Form.Group>

              <Button className="rounded-pill" type="submit">
                {modalShow === "SignUp" ? "Sign up" : "Log in"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Col>
    </Row>
  );
}
