import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MockPostForm from './MockPostForm';
import MockPostItem from './MockPostItem';

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
      },
    ],
  },
  {
    id: 2,
    username: 'charlie',
    content: 'Postingan kedua—coba feednya!',
    created_at: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    comments: [],
  },
];

export default function MockFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(initialPosts);

  const handleNewPost = newPost => {
    setPosts([
      {
        ...newPost,
        username: user.username,
        comments: [],
      },
      ...posts,
    ]);
  };

  return (
    <>
      <h3 className="mt-4">Feed</h3>
      <MockPostForm onSuccess={handleNewPost} />
      <div className="mt-4">
        {posts.map(p => <MockPostItem key={p.id} post={p} />)}
      </div>
    </>
  );
}
