// src/components/PostForm.jsx
import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import api from '../api';

export default function PostForm() {
  const { user } = useAuth();
  const { posts, setPosts } = usePosts();
  const [content, setContent] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    try {
      const { data: newPost } = await api.post('/posts', {
        user_id: user.id,
        content: text
      });
      setPosts([newPost, ...posts]);
      setContent('');
    } catch (err) {
      console.error('Gagal membuat post:', err);
    }
  };

  return (
    <Card className="post-card mb-4">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="postContent">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Apa yang Anda pikirkan?"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </Form.Group>
          <div className="text-end mt-2">
            <Button type="submit" disabled={!content.trim()}>
              Post
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
