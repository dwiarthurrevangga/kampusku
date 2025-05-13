import React, { useState } from 'react';
import { Card, Button, Collapse, Form } from 'react-bootstrap';

export default function MockPostItem({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [newComment, setNewComment] = useState('');

  const toggleComments = () => setShowComments(!showComments);

  const submitComment = e => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      content: newComment,
      created_at: new Date().toISOString(),
    };
    setComments([comment, ...comments]);
    setNewComment('');
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
              <Form.Group controlId={`mockComment-${post.id}`}>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Tulis komentar..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
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
