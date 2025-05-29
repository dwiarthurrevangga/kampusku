// src/components/CommentItem.jsx
import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';

export default function CommentItem({ comment, postId, level = 0 }) {
  const { user } = useAuth();
  const { posts, setPosts } = usePosts();

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent]   = useState('');

  // Balas comment
  const handleReply = async e => {
    e.preventDefault();
    const text = replyContent.trim();
    if (!text) return;
    try {
      const { data: newComment } = await api.post(
        `/posts/${postId}/comments`,
        { user_id: user.id, content: text, parent_id: comment.id }
      );
      const inject = list =>
        list.map(c =>
          c.id === comment.id
            ? { ...c, replies: [newComment, ...(c.replies||[])] }
            : c.replies
              ? { ...c, replies: inject(c.replies) }
              : c
        );
      const updatedComments = inject(
        posts.find(p => p.id === postId).comments
      );
      setPosts(posts.map(p =>
        p.id === postId ? { ...p, comments: updatedComments } : p
      ));
      setReplyContent('');
      setShowReplyForm(false);
    } catch (err) {
      console.error('Gagal balas komentar:', err);
    }
  };

  // Hapus comment
  const handleDelete = async () => {
    if (!window.confirm('Yakin ingin menghapus komentar ini?')) return;
    try {
      await api.delete(
        `/comments/${comment.id}`,
        { data: { user_id: user.id } }
      );
      const removeRec = list =>
        list
          .filter(c => c.id !== comment.id)
          .map(c =>
            c.replies
              ? { ...c, replies: removeRec(c.replies) }
              : c
          );
      const updatedComments = removeRec(
        posts.find(p => p.id === postId).comments
      );
      setPosts(posts.map(p =>
        p.id === postId ? { ...p, comments: updatedComments } : p
      ));
    } catch (err) {
      console.error('Gagal hapus komentar:', err);
    }
  };

  return (
    <div style={{ marginLeft: level * 16 }}>
      <Card className="comment-card mb-2">
        <Card.Body>
          <Card.Subtitle className="mb-1 text-dark">
            @{comment.username}
          </Card.Subtitle>
          <Card.Text className="text-dark">
            {comment.content}
          </Card.Text>
          <small className="text-muted">
            {new Date(comment.created_at).toLocaleString()}
          </small>

          <div className="mt-2 d-flex">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowReplyForm(s => !s)}
            >
              Reply
            </Button>

            {/* Hapus hanya untuk penulis comment */}
            {comment.username === user.username && (
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-2"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </div>

          {showReplyForm && (
            <Form onSubmit={handleReply} className="mt-2">
              <Form.Group controlId={`reply-${comment.id}`}>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Tulis balasan..."
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                />
              </Form.Group>
              <div className="mt-1">
                <Button size="sm" variant="primary" type="submit">
                  Kirim
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>

      {/* Recursive replies */}
      {comment.replies && comment.replies.map(reply => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          level={level + 1}
        />
      ))}
    </div>
  );
}
