import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import PostForm from './PostForm';
import PostItem from './PostItem';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);

  // fetch semua post
  useEffect(() => {
    axios.get('/api/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
  }, []);

  // handler untuk menambahkan post baru ke state
  const handleNewPost = newPost => {
    setPosts([newPost, ...posts]);
  };

  return (
    <Container className="my-4">
      <Row>
        <Col md={8} className="mx-auto">
          <h2 className="mb-4">Feed</h2>
          <PostForm onSuccess={handleNewPost} />
          <div className="mt-4">
            {posts.map(post => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
