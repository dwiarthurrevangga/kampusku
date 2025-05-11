import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h2>Beranda Kampusku</h2>
      <p>Selamat datang, {user.username}! Ini halaman utama forum.</p>
    </div>
  );
}

export default Home;
