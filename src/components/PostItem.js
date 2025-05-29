// src/components/PostItem.js
import React, { useState } from 'react';
import { Card, Button, Collapse, Form, Modal } from 'react-bootstrap';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import EditPostForm from './EditPostForm';

function CommentList({ comments, onReply, onDelete, level = 0 }) {
  const { user } = useAuth();

  return comments.map(c => (
    <div key={c.id} style={{ marginLeft: level * 20 }}>
      <Card className="comment-card mb-2">
        <Card.Body>
          <Card.Subtitle className="mb-1 text-dark">@{c.username}</Card.Subtitle>
          <Card.Text className="text-dark">{c.content}</Card.Text>
          <small className="text-muted">{new Date(c.created_at).toLocaleString()}</small>
          <div className="mt-2 d-flex">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                const reply = prompt('Tulis balasan:');
                if (reply) onReply(c.id, reply);
              }}
            >
              Reply
            </Button>
            {c.username === user.username && (
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-2"
                onClick={() => onDelete(c.id)}
              >
                Delete
              </Button>
            )}
          </div>
        </Card.Body>
        {c.replies && c.replies.length > 0 && (
          <CommentList
            comments={c.replies}
            onReply={onReply}
            onDelete={onDelete}
            level={level + 1}
          />
        )}
      </Card>
    </div>
  ));
}

export default function PostItem({ post }) {
  const { user } = useAuth();
  const { posts, setPosts } = usePosts();

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');

  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes || 0);
  const [userVote, setUserVote] = useState(null);

  const handleSavePost = async updatedContent => {
    try {
      const { data: p } = await api.put(
        `/posts/${post.id}`,
        { user_id: user.id, content: updatedContent }
      );
      setPosts(posts.map(x => (x.id === p.id ? p : x)));
    } catch (err) {
      console.error('Gagal update post:', err);
    } finally {
      setShowEdit(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(
        `/posts/${post.id}`,
        { data: { user_id: user.id } }
      );
      setPosts(posts.filter(x => x.id !== post.id));
    } catch (err) {
      console.error('Gagal hapus post:', err);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleAddComment = async text => {
    try {
      const { data: c } = await api.post(
        `/posts/${post.id}/comments`,
        { user_id: user.id, content: text }
      );
      const updatedPost = { ...post, comments: [c, ...comments] };
      setComments(updatedPost.comments);
      setPosts(posts.map(x => (x.id === post.id ? updatedPost : x)));
    } catch (err) {
      console.error('Gagal tambah komentar:', err);
    } finally {
      setNewComment('');
    }
  };

  const handleReply = async (parentId, text) => {
    try {
      const { data: c } = await api.post(
        `/posts/${post.id}/comments`,
        { user_id: user.id, content: text, parent_id: parentId }
      );
      const injectReply = list =>
        list.map(cm =>
          cm.id === parentId
            ? { ...cm, replies: [c, ...(cm.replies || [])] }
            : cm.replies
            ? { ...cm, replies: injectReply(cm.replies) }
            : cm
        );
      const updatedComments = injectReply(comments);
      setComments(updatedComments);
      setPosts(posts.map(x => (x.id === post.id ? { ...x, comments: updatedComments } : x)));
    } catch (err) {
      console.error('Gagal tambah balasan:', err);
    }
  };

  const handleDeleteComment = async commentId => {
    try {
      await api.delete(
        `/comments/${commentId}`,
        { data: { user_id: user.id } }
      );
      const removeRec = list =>
        list
          .filter(c => c.id !== commentId)
          .map(c =>
            c.replies
              ? { ...c, replies: removeRec(c.replies) }
              : c
          );
      const updatedComments = removeRec(comments);
      setComments(updatedComments);
      setPosts(posts.map(x => (x.id === post.id ? { ...x, comments: updatedComments } : x)));
    } catch (err) {
      console.error('Gagal hapus komentar:', err);
    }
  };

  const handleUpvote = () => { /* unchanged */ };
  const handleDownvote = () => { /* unchanged */ };

  return (
    <>
      <Card className="post-card mb-3">
        <Card.Body>
          <Card.Title className="text-dark mb-1">@{post.username}</Card.Title>
          <Card.Text className="text-dark">{post.content}</Card.Text>
          <div className="d-flex justify-content-between">
            <small className="text-muted">{new Date(post.created_at).toLocaleString()}</small>
            <div>
              {post.username === user.username && (
                <>
                  <Button size="sm" variant="light" onClick={() => setShowEdit(true)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" className="ms-2" onClick={() => setShowConfirm(true)}>
                    Delete
                  </Button>
                </>
              )}
              <Button size="sm" variant="light" className="ms-2" onClick={() => setShowComments(s => !s)}>
                {showComments ? 'Hide Comments' : `Comment (${comments.length})`}
              </Button>
            </div>
          </div>
          <div className="d-flex align-items-center mt-2 mb-3">
            <Button size="sm" variant={userVote === 1 ? 'success' : 'outline-success'} onClick={handleUpvote}>
              ▲ {upvotes}
            </Button>
            <Button size="sm" variant={userVote === -1 ? 'danger' : 'outline-danger'} className="ms-2" onClick={handleDownvote}>
              ▼ {downvotes}
            </Button>
          </div>
          <Collapse in={showComments}>
            <div>
              <Form onSubmit={e => { e.preventDefault(); if (newComment.trim()) handleAddComment(newComment); }}>
                <Form.Group controlId={`comment-${post.id}`}>
                  <Form.Control type="text" size="sm" placeholder="Tulis komentar..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                </Form.Group>
              </Form>
              <div className="mt-2">
                <CommentList comments={comments} onReply={handleReply} onDelete={handleDeleteComment} />
              </div>
            </div>
          </Collapse>
        </Card.Body>
      </Card>
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditPostForm post={post} onSave={handleSavePost} />
        </Modal.Body>
      </Modal>
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Hapus Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>Apakah Anda yakin ingin menghapus post ini?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Batal</Button>
          <Button variant="danger" onClick={handleDeletePost}>Hapus</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
