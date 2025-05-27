// src/components/MockFeedPage.jsx
import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import MockPostForm from './MockPostForm';
import MockPostItem from './MockPostItem';

export default function MockFeedPage() {
  const { user } = useAuth();
  const { posts, setPosts } = usePosts();

  // how many posts to load per “page”
  const PAGE_SIZE = 5;

  // displayed slice of posts (newest first)
  const [displayed, setDisplayed] = useState([]);

  // when posts change, reset display
  useEffect(() => {
    setDisplayed(posts.slice(0, PAGE_SIZE));
  }, [posts]);

  // load next chunk
  const fetchMore = () => {
    const next = posts.slice(displayed.length, displayed.length + PAGE_SIZE);
    setDisplayed(displayed.concat(next));
  };

  // handle creating a new post
  const handleNewPost = newPostData => {
    const newPost = {
      id: Date.now(),
      username: user.username,
      content: newPostData.content,
      created_at: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      comments: []
    };
    setPosts([newPost, ...posts]);
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
