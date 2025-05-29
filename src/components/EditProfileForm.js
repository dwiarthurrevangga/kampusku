// src/components/EditProfileForm.jsx
import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function EditProfileForm({ user, onCancel }) {
  const { updateUser } = useAuth();
  const [username, setUsername] = useState(user.username);
  const [email, setEmail]       = useState(user.email);
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !email.trim()) {
      setError('Username dan email tidak boleh kosong.');
      return;
    }
    setSaving(true);
    try {
      const { data: updated } = await api.put(
        `/users/${user.id}`,
        { username: username.trim(), email: email.trim() }
      );
      updateUser(updated);
      onCancel();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Gagal memperbarui profil';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="profileUsername" className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={saving}
          />
        </Form.Group>

        <Form.Group controlId="profileEmail" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={saving}
          />
        </Form.Group>

        <div className="d-flex justify-content-end">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="ms-2"
            disabled={saving}
          >
            {saving ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </Form>
    </>
  );
}
