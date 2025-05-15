import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavigationBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar className="navbar-custom" variant="dark" expand="md">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Kampusku
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Beranda
            </Nav.Link>
          </Nav>

          <Nav className="align-items-center">
            {!user && (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Button
                  as={Link}
                  to="/register"
                  variant="outline-light"
                  size="sm"
                  className="ms-2"
                >
                  Register
                </Button>
              </>
            )}

            {user && (
              <>
                <Navbar.Text className="me-3">
                  Halo, {user.username}
                </Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
