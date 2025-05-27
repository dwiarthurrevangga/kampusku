// src/components/MockPostForm.jsx
import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

export default function MockPostForm({ onSuccess }) {
  const [content, setContent] = useState('');

  const submitHandler = e => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;

    const newPost = {
      id: Date.now(),
      username: 'current_user',             // nanti ganti dengan user sesungguhnya
      content: text,
      created_at: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      comments: []
    };

    onSuccess(newPost);
    setContent('');
  };

  return (
    <Card className="post-card mb-4">
      <Card.Body>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="mockPostContent">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Apa yang Anda pikirkan?"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </Form.Group>
          <div className="text-end mt-2">
            <Button type="submit">Post</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
