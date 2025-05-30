import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container } from 'react-bootstrap';
import FeedPages from '../components/FeedPage';

function Home() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container className="my-4">
      <h2>Beranda Kampusku</h2>
      <p>Selamat datang, {user.username}! Ini halaman utama forum.</p>      
      <FeedPages />
    </Container>
  );
}

export default Home;
