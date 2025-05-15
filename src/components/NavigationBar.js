// src/components/NavigationBar.js
import React from 'react';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';
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
    <BSNavbar className="navbar-custom" variant="dark" expand="md">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          Kampusku
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="main-navbar" />
        <BSNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Beranda
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/profile">
                Profil
              </Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-center">
            {!user ? (
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
            ) : (
              <>
                {/* use Nav.Item instead of Navbar.Text */}
                <Nav.Item className="me-3 text-secondary">
                  Halo, {user.username}
                </Nav.Item>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
