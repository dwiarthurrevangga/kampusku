// src/components/MockPostItem.jsx
import React, { useState } from 'react';
import {
  Card,
  Button,
  Collapse,
  Form,
  Modal
} from 'react-bootstrap';
import { usePosts } from '../context/PostsContext';
import { useAuth } from '../context/AuthContext';
import EditPostForm from './EditPostForm';

function CommentList({
  comments,
  onAddReply,
  onEditComment,
  onDeleteComment,
  level = 0
}) {
  const [replyingTo, setReplyingTo] = useState(null);

  return comments.map(comment => (
    <div key={comment.id} style={{ marginLeft: level * 20 }}>
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
              variant="outline-secondary"
              size="sm"
              onClick={() =>
                setReplyingTo(
                  replyingTo === comment.id ? null : comment.id
                )
              }
            >
              Reply
            </Button>
            <Button
              variant="outline-info"
              size="sm"
              className="ms-2"
              onClick={() => onEditComment(comment)}
            >
              Edit
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="ms-2"
              onClick={() => onDeleteComment(comment)}
            >
              Delete
            </Button>
          </div>

          {replyingTo === comment.id && (
            <Form
              onSubmit={e => {
                e.preventDefault();
                const text =
                  e.target.elements[`reply-${comment.id}`].value.trim();
                if (text) {
                  onAddReply(comment.id, text);
                  setReplyingTo(null);
                }
              }}
              className="mt-2"
            >
              <Form.Control
                type="text"
                name={`reply-${comment.id}`}
                size="sm"
                placeholder="Tulis balasan..."
              />
            </Form>
          )}
        </Card.Body>
      </Card>

      {comment.replies &&
        comment.replies.length > 0 && (
          <CommentList
            comments={comment.replies}
            onAddReply={onAddReply}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
            level={level + 1}
          />
        )}
    </div>
  ));
}

export default function MockPostItem({ post }) {
  const { posts, setPosts } = usePosts();
  const { user } = useAuth();

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');

  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes || 0);
  const [userVote, setUserVote] = useState(null);

  // Voting handlers
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

  // Edit & Delete Post
  const handleSavePost = updatedContent => {
    setPosts(
      posts.map(p =>
        p.id === post.id ? { ...p, content: updatedContent } : p
      )
    );
    setShowEdit(false);
  };

  const handleDeletePost = () => {
    setPosts(posts.filter(p => p.id !== post.id));
    setShowConfirm(false);
  };

  // Comments: add, reply, edit, delete
  const handleAddComment = text => {
    const comment = {
      id: Date.now(),
      username: user.username,
      content: text,
      created_at: new Date().toISOString(),
      replies: []
    };
    const updated = {
      ...post,
      comments: [comment, ...comments]
    };
    setComments(updated.comments);
    setPosts(
      posts.map(p => (p.id === post.id ? updated : p))
    );
    setNewComment('');
  };

  const handleAddReply = (parentId, text) => {
    const newReply = {
      id: Date.now(),
      username: user.username,
      content: text,
      created_at: new Date().toISOString(),
      replies: []
    };
    const addReplyRec = list =>
      list.map(c => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [newReply, ... (c.replies || [])]
          };
        }
        return c.replies
          ? { ...c, replies: addReplyRec(c.replies) }
          : c;
      });
    const updatedComments = addReplyRec(comments);
    setComments(updatedComments);
    setPosts(
      posts.map(p =>
        p.id === post.id
          ? { ...p, comments: updatedComments }
          : p
      )
    );
  };

  const handleEditComment = commentToEdit => {
    const newText = prompt(
      'Edit komentar:',
      commentToEdit.content
    );
    if (newText != null) {
      const editRec = list =>
        list.map(c => {
          if (c.id === commentToEdit.id) {
            return { ...c, content: newText };
          }
          return c.replies
            ? { ...c, replies: editRec(c.replies) }
            : c;
        });
      const updatedComments = editRec(comments);
      setComments(updatedComments);
      setPosts(
        posts.map(p =>
          p.id === post.id
            ? { ...p, comments: updatedComments }
            : p
        )
      );
    }
  };

  const handleDeleteComment = commentToDelete => {
    const delRec = list =>
      list
        .filter(c => c.id !== commentToDelete.id)
        .map(c =>
          c.replies
            ? { ...c, replies: delRec(c.replies) }
            : c
        );
    const filtered = delRec(comments);
    setComments(filtered);
    setPosts(
      posts.map(p =>
        p.id === post.id
          ? { ...p, comments: filtered }
          : p
      )
    );
  };

  return (
    <>
      <Card className="post-card mb-3">
        <Card.Body>
          <Card.Title className="text-dark mb-1">
            @{post.username}
          </Card.Title>
          <Card.Text className="text-dark">
            {post.content}
          </Card.Text>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {new Date(
                post.created_at
              ).toLocaleString()}
            </small>
            <div>
              <Button
                size="sm"
                variant="light"
                onClick={() => setShowEdit(true)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                className="ms-2"
                onClick={() => setShowConfirm(true)}
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="ms-2"
                onClick={() =>
                  setShowComments(!showComments)
                }
              >
                {showComments
                  ? 'Hide Comments'
                  : `Comment (${comments.length})`}
              </Button>
            </div>
          </div>

          <div className="d-flex align-items-center mt-2 mb-3">
            <Button
              size="sm"
              variant={
                userVote === 1
                  ? 'success'
                  : 'outline-success'
              }
              onClick={handleUpvote}
            >
              ▲ {upvotes}
            </Button>
            <Button
              size="sm"
              variant={
                userVote === -1
                  ? 'danger'
                  : 'outline-danger'
              }
              onClick={handleDownvote}
              className="ms-2"
            >
              ▼ {downvotes}
            </Button>
          </div>

          <Collapse in={showComments}>
            <div className="mt-3">
              <Form
                onSubmit={e => {
                  e.preventDefault();
                  handleAddComment(newComment);
                }}
              >
                <Form.Group>
                  <Form.Control
                    type="text"
                    size="sm"
                    placeholder="Tulis komentar..."
                    value={newComment}
                    onChange={e =>
                      setNewComment(e.target.value)
                    }
                  />
                </Form.Group>
              </Form>
              <div className="mt-2">
                <CommentList
                  comments={comments}
                  onAddReply={handleAddReply}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                />
              </div>
            </div>
          </Collapse>
        </Card.Body>
      </Card>

      {/* Edit Post Modal */}
      <Modal
        show={showEdit}
        onHide={() => setShowEdit(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditPostForm
            post={post}
            onSave={handleSavePost}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Hapus Post?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Yakin ingin menghapus post ini?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirm(false)}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDeletePost}
          >
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
