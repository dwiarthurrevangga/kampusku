// src/components/FeedPage.jsx
import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Card, Spinner } from 'react-bootstrap';
import { usePosts } from '../context/PostsContext';
import PostForm from './PostForm';
import PostItem from './PostItem';

export default function FeedPage() {
  const { posts } = usePosts();
  const PAGE_SIZE = 5;

  // 'displayed' adalah potongan awal dari 'posts'
  const [displayed, setDisplayed] = useState([]);

  // setiap kali 'posts' berubah (fetch awal atau setelah create/delete),
  // reset 'displayed' ke slice pertama
  useEffect(() => {
    setDisplayed(posts.slice(0, PAGE_SIZE));
  }, [posts]);

  // ketika scroll, ambil batch selanjutnya
  const fetchMore = () => {
    setDisplayed(prev => [
      ...prev,
      ...posts.slice(prev.length, prev.length + PAGE_SIZE)
    ]);
  };
  return (
    <div data-testid="feed-page">
      <div className="d-flex align-items-center mb-4">
        <h3 className="gradient-text mb-0">
          <i className="fas fa-stream me-2"></i>
          Feed Komunitas
        </h3>
        <div className="ms-auto">
          <small className="text-muted">
            {posts.length} post{posts.length !== 1 ? 's' : ''} tersedia
          </small>
        </div>
      </div>

      {/* Form untuk bikin post baru, langsung update Context + backend */}
      <PostForm />      {displayed.length === 0 ? (
        <div data-testid="infinite-scroll">
          <Card className="text-center py-5 border-0 shadow-sm">
            <Card.Body>
              <i className="fas fa-comments fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Belum ada post</h5>
              <p className="text-muted mb-0">
                Jadilah yang pertama membagikan sesuatu dengan komunitas!
              </p>
            </Card.Body>
          </Card>
        </div>
      ) : (
        <InfiniteScroll
          data-testid="infinite-scroll"
          dataLength={displayed.length}
          next={fetchMore}
          hasMore={displayed.length < posts.length}
          loader={
            <div className="text-center mt-3 mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Body className="py-3">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span className="text-muted">Memuat lebih banyak post...</span>
                </Card.Body>
              </Card>
            </div>
          }
          endMessage={
            displayed.length > 5 ? (
              <div className="text-center mt-4 mb-4">
                <Card className="border-0 bg-light">
                  <Card.Body className="py-3">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    <span className="text-muted">Anda telah melihat semua post</span>
                  </Card.Body>
                </Card>
              </div>
            ) : null
          }
        >
          {displayed.map(post => (
            <PostItem key={post.id} post={post} />
          ))}        </InfiniteScroll>
      )}
    </div>
  );
}
