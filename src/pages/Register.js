// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !email.trim() || !password) {
      setError('Semua field wajib diisi');
      setLoading(false);
      return;
    }

    try {
      await register(username.trim(), email.trim(), password);
      navigate('/login');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.statusText ||
        'Registrasi gagal';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Row className="w-100">
        <Col xs={12} sm={10} md={8} lg={5} xl={4} className="mx-auto">
          <Card className="auth-card shadow-lg">
            <Card.Body>              <div className="text-center mb-4">
                <h1 className="gradient-text mb-2">Register</h1>
                <p className="text-muted">Buat akun baru untuk memulai</p>
              </div>
              
              {error && (
                <Alert variant="danger" className="mb-4 border-0 rounded">
                  {error}
                </Alert>
              )}
                <Form onSubmit={handleSubmit}>
                <Form.Group controlId="registerUsername" className="mb-3">
                  <Form.Label className="form-label-blue">Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Pilih username unik Anda"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group controlId="registerEmail" className="mb-3">
                  <Form.Label className="form-label-blue">Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Masukkan alamat email Anda"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group controlId="registerPassword" className="mb-4">
                  <Form.Label className="form-label-blue">Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Buat password yang kuat"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group><div className="d-grid mb-3">
                  <Button 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Mendaftar...' : 'Register'}
                  </Button>
                </div>
                  <div className="text-center">
                  <p className="text-muted mb-0">
                    Sudah punya akun? 
                    <Link 
                      to="/login" 
                      className="text-decoration-none ms-1 fw-semibold"
                      style={{ color: 'var(--primary-dark)' }}
                    >
                      Masuk di sini
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
