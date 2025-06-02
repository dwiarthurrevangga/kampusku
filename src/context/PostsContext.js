// src/context/PostsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const PostsContext = createContext();

export { PostsContext };

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);

  // Fetch posts dari backend sekali saat mount
  useEffect(() => {
    api.get('/posts')
      .then(({ data }) => setPosts(data))
      .catch(err => {
        console.error('Gagal fetch posts:', err);
      });
  }, []);

  return (
    <PostsContext.Provider value={{ posts, setPosts }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostsContext);
}
