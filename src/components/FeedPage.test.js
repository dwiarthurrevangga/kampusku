import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import FeedPage from './FeedPage';
import { AuthContext } from '../context/AuthContext';
import { PostsContext } from '../context/PostsContext';

// Mock InfiniteScroll component
jest.mock('react-infinite-scroll-component', () => {
  return function MockInfiniteScroll({ children, dataLength, hasMore, next, loader }) {
    return (
      <div data-testid="infinite-scroll">
        {children}
        {hasMore && (
          <button onClick={next} data-testid="load-more">
            Load More
          </button>
        )}
        {hasMore && loader}
      </div>
    );
  };
});

// Mock PostForm component
jest.mock('./PostForm', () => {
  return function MockPostForm() {
    return <div data-testid="post-form">Post Form Component</div>;
  };
});

// Mock PostItem component
jest.mock('./PostItem', () => {
  return function MockPostItem({ post }) {
    return (
      <div data-testid={`post-item-${post.id}`} className="post-item">
        <h4>@{post.username}</h4>
        <p>{post.content}</p>
      </div>
    );
  };
});

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com'
};

// Create multiple mock posts for pagination testing
const createMockPosts = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    username: `user${index + 1}`,
    content: `Post content ${index + 1}`,
    created_at: `2023-01-0${(index % 9) + 1}T00:00:00Z`,
    upvotes: index,
    downvotes: 0,
    comments: []
  }));
};

const MockAuthProvider = ({ children, user = mockUser }) => (
  <AuthContext.Provider value={{ user, login: jest.fn(), logout: jest.fn(), register: jest.fn() }}>
    {children}
  </AuthContext.Provider>
);

const MockPostsProvider = ({ children, posts = [], fetchPosts = jest.fn() }) => (
  <PostsContext.Provider value={{ posts, setPosts: jest.fn(), fetchPosts }}>
    {children}
  </PostsContext.Provider>
);

const renderWithProviders = (ui, { user = mockUser, posts = [] } = {}) => {
  return render(
    <MemoryRouter>
      <MockAuthProvider user={user}>
        <MockPostsProvider posts={posts}>
          {ui}
        </MockPostsProvider>
      </MockAuthProvider>
    </MemoryRouter>
  );
};

describe('FeedPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders feed page with title and post form', () => {
    renderWithProviders(<FeedPage />);
    
    expect(screen.getByText('Feed Komunitas')).toBeInTheDocument();
    expect(screen.getByTestId('post-form')).toBeInTheDocument();
    expect(screen.getByTestId('infinite-scroll')).toBeInTheDocument();
  });

  test('displays posts in infinite scroll container', () => {
    const mockPosts = createMockPosts(3);
    renderWithProviders(<FeedPage />, { posts: mockPosts });
    
    expect(screen.getByTestId('post-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-3')).toBeInTheDocument();
    
    expect(screen.getByText('@user1')).toBeInTheDocument();
    expect(screen.getByText('Post content 1')).toBeInTheDocument();
  });

  test('shows only first 5 posts initially (pagination)', () => {
    const mockPosts = createMockPosts(10);
    renderWithProviders(<FeedPage />, { posts: mockPosts });
    
    // Should show first 5 posts
    expect(screen.getByTestId('post-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-3')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-4')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-5')).toBeInTheDocument();
    
    // Should not show posts 6-10 yet
    expect(screen.queryByTestId('post-item-6')).not.toBeInTheDocument();
    expect(screen.queryByTestId('post-item-10')).not.toBeInTheDocument();
  });

  test('loads more posts when load more is triggered', async () => {
    const user = userEvent.setup();
    const mockPosts = createMockPosts(10);
    renderWithProviders(<FeedPage />, { posts: mockPosts });
    
    // Initially shows first 5 posts
    expect(screen.getByTestId('post-item-5')).toBeInTheDocument();
    expect(screen.queryByTestId('post-item-6')).not.toBeInTheDocument();
    
    // Click load more
    const loadMoreButton = screen.getByTestId('load-more');
    await user.click(loadMoreButton);
    
    await waitFor(() => {
      // Should now show posts 6-10
      expect(screen.getByTestId('post-item-6')).toBeInTheDocument();
      expect(screen.getByTestId('post-item-7')).toBeInTheDocument();
      expect(screen.getByTestId('post-item-8')).toBeInTheDocument();
      expect(screen.getByTestId('post-item-9')).toBeInTheDocument();
      expect(screen.getByTestId('post-item-10')).toBeInTheDocument();
    });
  });
  test('shows loading message when more posts available', () => {
    const mockPosts = createMockPosts(10);
    renderWithProviders(<FeedPage />, { posts: mockPosts });
    
    expect(screen.getByText('Memuat lebih banyak post...')).toBeInTheDocument();
  });
  test('does not show load more button when all posts displayed', () => {
    const mockPosts = createMockPosts(3); // Less than page size
    renderWithProviders(<FeedPage />, { posts: mockPosts });
    
    expect(screen.queryByTestId('load-more')).not.toBeInTheDocument();
    expect(screen.queryByText('Memuat lebih banyak post...')).not.toBeInTheDocument();
  });
  test('handles empty posts array', () => {
    renderWithProviders(<FeedPage />, { posts: [] });
    
    expect(screen.getByText('Feed Komunitas')).toBeInTheDocument();
    expect(screen.getByTestId('post-form')).toBeInTheDocument();
    expect(screen.getByTestId('infinite-scroll')).toBeInTheDocument();
    
    // No posts should be displayed
    expect(screen.queryByTestId(/post-item-/)).not.toBeInTheDocument();
  });

  test('resets displayed posts when posts context changes', async () => {
    const initialPosts = createMockPosts(3);
    const { rerender } = renderWithProviders(<FeedPage />, { posts: initialPosts });
    
    expect(screen.getByTestId('post-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-3')).toBeInTheDocument();
    
    // Simulate posts context change (e.g., new post added)
    const updatedPosts = [
      { id: 99, username: 'newuser', content: 'New post', created_at: '2023-01-01T00:00:00Z', upvotes: 0, downvotes: 0, comments: [] },
      ...initialPosts
    ];
    
    rerender(
      <MemoryRouter>
        <MockAuthProvider user={mockUser}>
          <MockPostsProvider posts={updatedPosts}>
            <FeedPage />
          </MockPostsProvider>
        </MockAuthProvider>
      </MemoryRouter>
    );
    
    // Should show the new post
    expect(screen.getByTestId('post-item-99')).toBeInTheDocument();
    expect(screen.getByText('@newuser')).toBeInTheDocument();
    expect(screen.getByText('New post')).toBeInTheDocument();
  });

  test('handles large datasets efficiently', () => {
    const largeMockPosts = createMockPosts(50);
    renderWithProviders(<FeedPage />, { posts: largeMockPosts });
    
    // Should only render first page
    expect(screen.getByTestId('post-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-5')).toBeInTheDocument();
    
    // Should not render all 50 posts immediately
    expect(screen.queryByTestId('post-item-50')).not.toBeInTheDocument();
    
    // Should show load more option
    expect(screen.getByTestId('load-more')).toBeInTheDocument();
  });

  test('maintains scroll position during load more', async () => {
    const user = userEvent.setup();
    const mockPosts = createMockPosts(15);
    renderWithProviders(<FeedPage />, { posts: mockPosts });
    
    // Load more posts multiple times
    const loadMoreButton = screen.getByTestId('load-more');
    
    await user.click(loadMoreButton); // Load posts 6-10
    await waitFor(() => {
      expect(screen.getByTestId('post-item-10')).toBeInTheDocument();
    });
    
    await user.click(loadMoreButton); // Load posts 11-15
    await waitFor(() => {
      expect(screen.getByTestId('post-item-15')).toBeInTheDocument();
    });
    
    // All previous posts should still be visible
    expect(screen.getByTestId('post-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-5')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-10')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-15')).toBeInTheDocument();
  });

  test('updates when posts are added or removed', () => {
    const initialPosts = createMockPosts(2);
    const { rerender } = renderWithProviders(<FeedPage />, { posts: initialPosts });
    
    expect(screen.getAllByTestId(/post-item-/)).toHaveLength(2);
    
    // Add a post
    const updatedPosts = [...initialPosts, {
      id: 3,
      username: 'user3',
      content: 'Post content 3',
      created_at: '2023-01-03T00:00:00Z',
      upvotes: 0,
      downvotes: 0,
      comments: []
    }];
    
    rerender(
      <MemoryRouter>
        <MockAuthProvider user={mockUser}>
          <MockPostsProvider posts={updatedPosts}>
            <FeedPage />
          </MockPostsProvider>
        </MockAuthProvider>
      </MemoryRouter>
    );
    
    expect(screen.getAllByTestId(/post-item-/)).toHaveLength(3);
    expect(screen.getByTestId('post-item-3')).toBeInTheDocument();
  });
});
