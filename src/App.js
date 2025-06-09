import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AuthProvider from './context/AuthContext';
import { PostsProvider } from './context/PostsContext';

import NavigationBar from './components/NavigationBar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <Router>
          <NavigationBar />
          <div className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
        </Router>
      </PostsProvider>
    </AuthProvider>
  );
}

export default App;
