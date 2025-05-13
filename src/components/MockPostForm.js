import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

export default function MockPostForm({ onSuccess }) {
  const [content, setContent] = useState('');

  const submitHandler = e => {
    e.preventDefault();
    if (!content.trim()) return;
    const newPost = {
      id: Date.now(),
      content,
      created_at: new Date().toISOString(),
      comments: [],
    };
    onSuccess(newPost);
    setContent('');
  };

  return (
    <Card>
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
          <div className="text-right mt-2">
            <Button type="submit">Post</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
