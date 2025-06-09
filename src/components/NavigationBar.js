// src/components/NavigationBar.js
import React from 'react';
import { Navbar as BSNavbar, Nav, Container, Button, Badge } from 'react-bootstrap';
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
    <BSNavbar className="navbar-custom shadow-sm" variant="dark" expand="md" fixed="top">
      <Container>        <BSNavbar.Brand as={Link} to="/" className="fw-bold fs-3">
          <span className="gradient-text-white">🎓 Kampusku</span>
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="main-navbar" />
        <BSNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="nav-link-enhanced">
              <i className="fas fa-home me-2"></i>
              Beranda
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/profile" className="nav-link-enhanced">
                <i className="fas fa-user me-2"></i>
                Profil
              </Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-center">
            {!user ? (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-enhanced me-2">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Login
                </Nav.Link>                <a
                  href="/register"
                  className="btn btn-outline-light btn-sm btn-register-nav"
                >
                  <i className="fas fa-user-plus me-2"></i>
                  Register
                </a>
              </>
            ) : (
              <>
                <Nav.Item className="me-3 d-flex align-items-center">
                  <div className="user-greeting">
                    <Badge bg="primary" className="me-2">
                      <i className="fas fa-user"></i>
                    </Badge>                    <span className="text-secondary">
                      Halo, {user.username}
                    </span>
                  </div>
                </Nav.Item>
                <Button 
                  variant="outline-light" 
                  size="sm" 
                  onClick={handleLogout}
                  className="btn-logout-nav"
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
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
