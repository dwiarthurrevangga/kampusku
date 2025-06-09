// src/components/PostForm.jsx
import React, { useState } from 'react';
import { Card, Form, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import api from '../api';

export default function PostForm() {
  const { user } = useAuth();
  const { posts, setPosts } = usePosts();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    
    setLoading(true);
    try {
      const { data: newPost } = await api.post('/posts', {
        user_id: user.id,
        content: text
      });
      setPosts([newPost, ...posts]);
      setContent('');
    } catch (err) {
      console.error('Gagal membuat post:', err);
    } finally {
      setLoading(false);
    }
  };

  const characterCount = content.length;
  const maxLength = 500;

  return (
    <Card className="post-form-card mb-4 border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <Badge bg="primary" className="me-2">
            <i className="fas fa-user"></i>
          </Badge>
          <h6 className="mb-0 text-muted">
            Berbagi sebagai <span className="fw-bold text-primary">{user.username}</span>
          </h6>
        </div>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="postContent">
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="💭 Apa yang ingin Anda bagikan dengan komunitas kampus hari ini?"
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={maxLength}
              className="border-0 bg-light"
              style={{ resize: 'none' }}
            />
          </Form.Group>
          
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className={`text-muted ${characterCount > maxLength * 0.8 ? 'text-warning' : ''}`}>
              {characterCount}/{maxLength} karakter
            </small>
            
            <Button 
              type="submit" 
              disabled={!content.trim() || loading}
              className="btn-post-submit"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Posting...
                </>              ) : (
                <>
                  <i className="fas fa-paper-plane me-2"></i>
                  Post
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
