import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card } from 'react-bootstrap';
import FeedPages from '../components/FeedPage';

function Home() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container className="my-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="welcome-card mb-4 border-0 shadow-sm">
            <Card.Body className="text-center py-4">
              <h1 className="gradient-text mb-3">
                <i className="fas fa-graduation-cap me-3"></i>
                Beranda Kampusku
              </h1>              <p className="lead text-muted mb-0">
                Selamat datang, {user.username}! Ini halaman utama forum.
              </p>
            </Card.Body>
          </Card>          
          <FeedPages />
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
