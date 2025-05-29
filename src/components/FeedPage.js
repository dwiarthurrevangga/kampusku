// src/components/FeedPage.jsx
import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import PostForm from './PostForm';
import PostItem from './PostItem';

export default function FeedPage() {
  const { user } = useAuth();
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
    <>
      <h3 className="mt-4">Feed</h3>

      {/* Form untuk bikin post baru, langsung update Context + backend */}
      <PostForm />

      <InfiniteScroll
        dataLength={displayed.length}
        next={fetchMore}
        hasMore={displayed.length < posts.length}
        loader={<h6 className="text-center mt-3">Loading more...</h6>}
      >
        {displayed.map(post => (
          <PostItem key={post.id} post={post} />
        ))}
      </InfiniteScroll>
    </>
  );
}
