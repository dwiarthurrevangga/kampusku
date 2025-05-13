import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container } from 'react-bootstrap';
// 1) Pastikan nama import ini persis sama dengan nama file/ekspor:
import MockFeedPages from '../components/MockFeedPages';

function Home() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container className="my-4">
      <h2>Beranda Kampusku</h2>
      <p>Selamat datang, {user.username}! Ini halaman utama forum.</p>
      
      {/* 2) Render mock feed di sini */}
      <MockFeedPages />
    </Container>
  );
}

export default Home;
