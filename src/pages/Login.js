// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate    = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi');
      return;
    }

    try {
      await login(username.trim(), password);
      // jika berhasil, redirect ke beranda
      navigate('/');
    } catch (err) {
      // AxiosError, response.data.error atau statusText
      const msg =
        err.response?.data?.error ||
        err.response?.statusText ||
        'Login gagal';
      setError(msg);
    }
  };

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: 400 }}>
      <Card.Body>
        <h3 className="mb-4">Login</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="loginUsername" className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="loginPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center">
            <Button type="submit">Login</Button>
            <Link to="/register">Belum punya akun? Register</Link>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
