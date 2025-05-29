import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
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
    <>
      {/* Profil Info */}
      <Card className="post-card p-3 text-dark mb-4">
        <h3>Profil Saya</h3>
        {editing ? (
          <EditProfileForm
            user={user}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <Button
              variant="info"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Edit Profil
            </Button>
          </>
        )}
      </Card>

      {/* Timeline Kegiatan */}
      <h4 className="text-dark mb-3">Timeline</h4>
      {myPosts.length > 0 ? (
        myPosts.map(post => (
          <PostItem key={post.id} post={post} />
        ))
      ) : (
        <p className="text-dark">Belum ada postingan.</p>
      )}
    </>
  );
}
