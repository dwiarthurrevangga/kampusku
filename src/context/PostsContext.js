// src/context/PostsContext.js
import React, { createContext, useContext, useState } from 'react';

// Mock data awal untuk posts
const initialPosts = [
  {
    id: 1,
    username: 'alice',
    content: 'Halo semua, ini postingan dummy!',
    created_at: new Date().toISOString(),
    upvotes: 2,
    downvotes: 1,
    comments: [
      {
        id: 101,
        username: 'bob',
        content: 'Komentar pertama di dummy!',
        created_at: new Date().toISOString(),
        replies: []
      }
    ]
  },
  {
    id: 2,
    username: 'charlie',
    content: 'Postingan kedua—coba feednya!',
    created_at: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    comments: []
  }
];

const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState(initialPosts);
  return (
    <PostsContext.Provider value={{ posts, setPosts }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostsContext);
}
