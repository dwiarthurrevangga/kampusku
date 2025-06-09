// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi');
      setLoading(false);
      return;
    }

    try {
      await login(username.trim(), password);
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.statusText ||
        'Login gagal';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100">
        <Col xs={12} sm={10} md={8} lg={5} xl={4} className="mx-auto">
          <Card className="auth-card shadow-lg">
            <Card.Body>
              <div className="text-center mb-4">
                <h2 className="gradient-text mb-2">Selamat Datang Kembali!</h2>
                <p className="text-muted">Masuk ke akun Kampusku Anda</p>
              </div>
              
              {error && (
                <Alert variant="danger" className="mb-4 border-0 rounded">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="loginUsername" className="mb-3">
                  <Form.Label>
                    <i className="fas fa-user me-2 text-primary"></i>
                    Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan username Anda"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={loading}
                    className="form-control-enhanced"
                  />
                </Form.Group>

                <Form.Group controlId="loginPassword" className="mb-4">
                  <Form.Label>
                    <i className="fas fa-lock me-2 text-primary"></i>
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    className="form-control-enhanced"
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button 
                    type="submit" 
                    className="btn-enhanced"
                    disabled={loading || !username.trim() || !password}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Masuk...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Login
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-muted mb-0">
                    Belum punya akun? 
                    <Link 
                      to="/register" 
                      className="text-decoration-none ms-1 fw-semibold"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      Daftar sekarang
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
