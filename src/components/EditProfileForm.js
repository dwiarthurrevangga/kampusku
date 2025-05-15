import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function EditProfileForm({ user, onCancel }) {
  const { updateUser } = useAuth();

  const [username, setUsername] = useState(user.username);
  const [email, setEmail]       = useState(user.email);
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setError('Field tidak boleh kosong.');
      return;
    }
    setError('');
    setSaving(true);

    setTimeout(() => {
      updateUser({ username, email });
      setSaving(false);
      onCancel();
    }, 500);
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2" controlId="editUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={saving}
          />
        </Form.Group>

        <Form.Group className="mb-2" controlId="editEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={saving}
          />
        </Form.Group>

        <div className="d-flex">
          <Button 
            type="submit" 
            variant="success" 
            size="sm" 
            disabled={saving}
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
          <Button 
            variant="outline-light" 
            size="sm" 
            className="ms-2" 
            onClick={onCancel}
            disabled={saving}
          >
            Batal
          </Button>
        </div>
      </Form>
    </>
  );
}
