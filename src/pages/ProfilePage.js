import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import EditProfileForm from '../components/EditProfileForm';

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  if (!user) return <p>Loading...</p>;

  return (
    <Card className="post-card p-3 text-dark">
      <h3>Profil Saya</h3>
      {editing ? (
        <EditProfileForm 
          user={user} 
          onCancel={() => setEditing(false)} 
        />
      ) : (
        <>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong>    {user.email}</p>
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
  );
}
