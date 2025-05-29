import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import MockPostForm from './MockPostForm';
import MockPostItem from './MockPostItem';

export default function FeedPage() {
  const { user } = useAuth();
  const PAGE_SIZE = 5;
  const [posts, setPosts] = useState([]);
  const [displayed, setDisplayed] = useState([]);

  // load all posts on mount
  useEffect(() => {
    api.get('/posts').then(({ data }) => {
      setPosts(data);
      setDisplayed(data.slice(0, PAGE_SIZE));
    });
  }, []);

  // create post via API
  const handleNewPost = ({ content }) => {
    api.post('/posts', { user_id: user.id, content })
       .then(({ data: p }) => {
         setPosts(prev => [p, ...prev]);
         setDisplayed(prev => [p, ...prev]); 
       });
  };

  // infinite scroll
  const fetchMore = () => {
    const next = posts.slice(displayed.length, displayed.length + PAGE_SIZE);
    setDisplayed(d => [...d, ...next]);
  };

  return (
    <>
      <h3 className="mt-4">Feed</h3>
      <MockPostForm onSuccess={handleNewPost} />

      <InfiniteScroll
        dataLength={displayed.length}
        next={fetchMore}
        hasMore={displayed.length < posts.length}
        loader={<h6 className="text-center mt-3">Loading more...</h6>}
      >
        {displayed.map(post => (
          <MockPostItem key={post.id} post={post} />
        ))}
      </InfiniteScroll>
    </>
  );
}
