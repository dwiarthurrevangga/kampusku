import React, { useState } from 'react';
import MockPostForm from './MockPostForm';
import MockPostItem from './MockPostItem';

const initialPosts = [
  {
    id: 1,
    content: 'Halo semua, ini postingan dummy!',
    created_at: new Date().toISOString(),
    comments: [
      { id: 101, content: 'Komentar pertama di dummy!', created_at: new Date().toISOString() },
    ],
  },
  {
    id: 2,
    content: 'Postingan kedua—coba feednya!',
    created_at: new Date().toISOString(),
    comments: [],
  },
];

export default function MockFeedPage() {
  const [posts, setPosts] = useState(initialPosts);

  const handleNewPost = newPost => {
    setPosts([newPost, ...posts]);
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
