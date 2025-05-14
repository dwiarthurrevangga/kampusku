// src/components/NavigationBar.jsx
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
    <Navbar bg="primary" variant="dark" expand="md">
      <Container>
        {/* Brand */}
        <Navbar.Brand as={Link} to="/">
          Kampusku
        </Navbar.Brand>

        {/* Hamburger toggle di mobile */}
        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          {/* Nav kiri (jika ingin tambahkan link lain) */}
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Beranda
            </Nav.Link>
            {/* <Nav.Link as={Link} to="/profile">Profil</Nav.Link> */}
          </Nav>

          {/* Greeting + Logout */}
          <Nav className="align-items-center">
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
