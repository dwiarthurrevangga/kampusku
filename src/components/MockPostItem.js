// src/components/MockPostItem.jsx
import React, { useState } from 'react';
import { Card, Button, Collapse, Form } from 'react-bootstrap';

export default function MockPostItem({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]     = useState(post.comments);
  const [newComment, setNewComment] = useState('');

  const [upvotes, setUpvotes]       = useState(post.upvotes || 0);
  const [downvotes, setDownvotes]   = useState(post.downvotes || 0);
  const [userVote, setUserVote]     = useState(null);

  const toggleComments = () => setShowComments(!showComments);

  const handleUpvote = () => {
    if (userVote === 1) {
      setUpvotes(upvotes - 1);
      setUserVote(null);
    } else if (userVote === -1) {
      setDownvotes(downvotes - 1);
      setUpvotes(upvotes + 1);
      setUserVote(1);
    } else {
      setUpvotes(upvotes + 1);
      setUserVote(1);
    }
  };

  const handleDownvote = () => {
    if (userVote === -1) {
      setDownvotes(downvotes - 1);
      setUserVote(null);
    } else if (userVote === 1) {
      setUpvotes(upvotes - 1);
      setDownvotes(downvotes + 1);
      setUserVote(-1);
    } else {
      setDownvotes(downvotes + 1);
      setUserVote(-1);
    }
  };

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
    <Card className="post-card mb-3">
      <Card.Body>
        <Card.Text className="text-dark">{post.content}</Card.Text>

        {/* Footer: timestamp + tombol Comment */}
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {new Date(post.created_at).toLocaleString()}
          </small>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleComments}
          >
            {showComments ? 'Hide Comments' : `Comment (${comments.length})`}
          </Button>
        </div>

        {/* Voting UI */}
        <div className="d-flex align-items-center mt-2 mb-3">
          <Button
            size="sm"
            variant={userVote === 1 ? 'success' : 'outline-success'}
            onClick={handleUpvote}
          >
            ▲ {upvotes}
          </Button>
          <Button
            size="sm"
            variant={userVote === -1 ? 'danger' : 'outline-danger'}
            onClick={handleDownvote}
            className="ms-2"
          >
            ▼ {downvotes}
          </Button>
        </div>

        {/* Area komentar */}
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
                <Card key={c.id} className="comment-card mb-2">
                  <Card.Body>
                    <Card.Text className="text-dark">{c.content}</Card.Text>
                    <small className="text-muted">
                      {new Date(c.created_at).toLocaleString()}
                    </small>
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
