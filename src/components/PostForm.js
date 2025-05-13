import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Card } from 'react-bootstrap';

export default function PostForm({ onSuccess }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const submitHandler = async e => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    try {
      const res = await axios.post('/api/posts', { content });
      onSuccess(res.data);
      setContent('');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="postContent">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Apa yang Anda pikirkan?"
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
          <div className="text-right mt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
