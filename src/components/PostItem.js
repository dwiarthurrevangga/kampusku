import React, { useState } from 'react';
import axios from 'axios';
import { Card, Button, Collapse, Form } from 'react-bootstrap';

export default function PostItem({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  // toggle komentar
  const toggleComments = () => setShowComments(!showComments);

  // kirim komentar baru
  const submitComment = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);

    try {
      const res = await axios.post(`/api/posts/${post.id}/comments`, { content: newComment });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim komentar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Text>{post.content}</Card.Text>
        <div className="d-flex justify-content-between">
          <small className="text-muted">{new Date(post.created_at).toLocaleString()}</small>
          <Button variant="link" size="sm" onClick={toggleComments}>
            {showComments ? 'Hide Comments' : `Comment (${comments.length})`}
          </Button>
        </div>

        <Collapse in={showComments}>
          <div className="mt-3">
            <Form onSubmit={submitComment}>
              <Form.Group controlId={`comment-${post.id}`}>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Tulis komentar..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Form>

            <div className="mt-2">
              {comments.map(c => (
                <Card key={c.id} className="mb-2">
                  <Card.Body>
                    <Card.Text>{c.content}</Card.Text>
                    <small className="text-muted">{new Date(c.created_at).toLocaleString()}</small>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
}
