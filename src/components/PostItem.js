// src/components/PostItem.js
import React, { useState } from 'react';
import { Card, Button, Form, Modal } from 'react-bootstrap';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import EditPostForm from './EditPostForm';

function CommentList({ comments, onReply, onDelete, level = 0 }) {
  const { user } = useAuth();

  return comments.map(c => (
    <div key={c.id} style={{ marginLeft: Math.min(level * 20, 60) }}>
      <Card className={`comment-card mb-2 ${level > 0 ? 'comment-reply' : ''}`}>
        <Card.Body className="py-2">
          <div className="d-flex align-items-start">
            <div className="comment-avatar me-2">
              <div className="avatar-circle-sm bg-secondary text-white d-flex align-items-center justify-content-center">
                <i className="fas fa-user" style={{ fontSize: '0.7rem' }}></i>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center mb-1">
                <h6 className="mb-0 me-2 fw-semibold text-primary" style={{ fontSize: '0.85rem' }}>
                  @{c.username}
                </h6>
                <small className="text-muted">
                  <i className="fas fa-clock me-1"></i>
                  {new Date(c.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </small>
              </div>
              <Card.Text className="mb-2" style={{ fontSize: '0.9rem' }}>
                {c.content}
              </Card.Text>
              <div className="comment-actions d-flex gap-1">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="btn-comment-action"
                  onClick={() => {
                    const reply = prompt('💬 Tulis balasan Anda:');
                    if (reply) onReply(c.id, reply);
                  }}
                >                  <i className="fas fa-reply me-1"></i>
                  Reply
                </Button>
                {c.username === user.username && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="btn-comment-action"
                    onClick={() => onDelete(c.id)}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Hapus
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card.Body>
        {c.replies && c.replies.length > 0 && (
          <div className="comment-replies">
            <CommentList
              comments={c.replies}
              onReply={onReply}
              onDelete={onDelete}
              level={level + 1}
            />
          </div>
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

  const [upvotes] = useState(post.upvotes || 0);
  const [downvotes] = useState(post.downvotes || 0);
  const [userVote] = useState(null);

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
      <Card className="post-card mb-4 border-0 shadow-sm hover-lift">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <div className="user-avatar me-3">
              <div className="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center">
                <i className="fas fa-user"></i>
              </div>
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-1 fw-bold text-primary">@{post.username}</h6>
              <small className="text-muted">
                <i className="fas fa-clock me-1"></i>
                {new Date(post.created_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            </div>            {post.username === user.username && (
              <div className="post-actions">
                <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => setShowEdit(true)}>
                  <i className="fas fa-edit me-1"></i>
                  Edit
                </Button>
                <Button size="sm" variant="outline-danger" onClick={() => setShowConfirm(true)}>
                  <i className="fas fa-trash me-1"></i>
                  Delete
                </Button>
              </div>
            )}
          </div>
          
          <Card.Text className="post-content mb-3">
            {post.content}
          </Card.Text>
          
          <div className="post-engagement border-top pt-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="vote-buttons d-flex align-items-center">                <Button 
                  size="sm" 
                  variant={userVote === 1 ? 'success' : 'outline-success'} 
                  className="vote-btn me-2" 
                  onClick={handleUpvote}
                >
                  ▲ {upvotes}
                </Button>
                <Button 
                  size="sm" 
                  variant={userVote === -1 ? 'danger' : 'outline-danger'} 
                  className="vote-btn me-3" 
                  onClick={handleDownvote}
                >
                  ▼ {downvotes}
                </Button>
              </div>
                <Button 
                size="sm" 
                variant="outline-primary" 
                className="comment-toggle-btn" 
                onClick={() => setShowComments(s => !s)}
              >
                <i className="fas fa-comment me-2"></i>
                {showComments ? 'Hide Comments' : `Comment (${comments.length})`}
              </Button>
            </div>
          </div>          {showComments && (
            <div className="comments-section mt-3 border-top pt-3">
              <Form onSubmit={e => { e.preventDefault(); if (newComment.trim()) handleAddComment(newComment); }} className="mb-3">
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text" 
                    size="sm" 
                    placeholder="Tulis komentar..." 
                    value={newComment} 
                    onChange={e => setNewComment(e.target.value)}
                    className="border-0 bg-light"
                  />
                  <Button type="submit" size="sm" variant="primary" disabled={!newComment.trim()}>
                    <i className="fas fa-paper-plane"></i>
                  </Button>
                </div>
              </Form>
              <div className="comments-list">
                <CommentList comments={comments} onReply={handleReply} onDelete={handleDeleteComment} />
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
      
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="gradient-text">
            <i className="fas fa-edit me-2"></i>
            Edit Post
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditPostForm post={post} onSave={handleSavePost} />
        </Modal.Body>
      </Modal>
      
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Konfirmasi Hapus
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">Apakah Anda yakin ingin menghapus post ini?</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowConfirm(false)}>
            <i className="fas fa-times me-2"></i>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDeletePost}>
            <i className="fas fa-trash me-2"></i>
            Hapus Post
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
