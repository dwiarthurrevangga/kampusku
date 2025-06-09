import React, { useState } from 'react';
import { Card, Button, Container, Row, Col, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import EditProfileForm from '../components/EditProfileForm';
import PostItem from '../components/PostItem';

export default function ProfilePage() {
  const { user } = useAuth();
  const { posts } = usePosts();
  const [editing, setEditing] = useState(false);

  if (!user) return <p>Loading...</p>;

  // Filter hanya post milik user ini
  const myPosts = posts.filter(p => p.username === user.username);
  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          {/* Profile Header */}
          <h1>Profil Saya</h1>
          <Card className="profile-card mb-4 border-0 shadow-lg">            {!editing && (
              <div className="profile-header">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div className="profile-avatar bg-white text-primary d-flex align-items-center justify-content-center rounded-circle" 
                       style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                    <i className="fas fa-user"></i>
                  </div>
                </div>              <h2 className="mb-2 fw-bold">{user.username}</h2>
                <p className="mb-0 opacity-75">
                  Username: {user.username}
                </p>
                <p className="mb-0 opacity-75">
                  <i className="fas fa-envelope me-2"></i>
                  Email: {user.email}
                </p>
              </div>
            )}
            
            <Card.Body>
              {editing ? (
                <EditProfileForm
                  user={user}
                  onCancel={() => setEditing(false)}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-between">
                  <div className="profile-stats d-flex gap-4">
                    <div className="text-center">
                      <h5 className="mb-0 text-primary">{myPosts.length}</h5>
                      <small className="text-muted">Post</small>
                    </div>
                    <div className="text-center">
                      <h5 className="mb-0 text-primary">
                        {myPosts.reduce((total, post) => total + (post.comments?.length || 0), 0)}
                      </h5>
                      <small className="text-muted">Komentar</small>
                    </div>
                    <div className="text-center">
                      <h5 className="mb-0 text-primary">
                        {myPosts.reduce((total, post) => total + (post.upvotes || 0), 0)}
                      </h5>
                      <small className="text-muted">Likes</small>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline-primary"
                    onClick={() => setEditing(true)}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit Profil
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>          {/* Posts Timeline */}
          <div className="d-flex align-items-center mb-4">
            <h4 className="gradient-text mb-0">
              <i className="fas fa-history me-2"></i>
              Timeline
            </h4>
            <Badge bg="primary" className="ms-3">
              {myPosts.length} post
            </Badge>
          </div>
          
          {myPosts.length > 0 ? (
            myPosts.map(post => (
              <PostItem key={post.id} post={post} />
            ))
          ) : (
            <Card className="text-center py-5 border-0 shadow-sm">
              <Card.Body>
                <i className="fas fa-pen fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">Belum ada postingan.</h5>
                <p className="text-muted mb-0">
                  Mulai berbagi cerita dan pengalaman Anda dengan komunitas!
                </p>
              </Card.Body>
            </Card>
          )}        </Col>
      </Row>
    </Container>
  );
}
