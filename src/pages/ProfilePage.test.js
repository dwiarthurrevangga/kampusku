import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import { AuthContext } from '../context/AuthContext';
import { PostsContext } from '../context/PostsContext';

// Mock EditProfileForm component
jest.mock('../components/EditProfileForm', () => {
  return function MockEditProfileForm({ user, onCancel }) {
    return (
      <div data-testid="edit-profile-form">
        <h4>Edit Profile Form</h4>
        <p>Editing profile for: {user.username}</p>
        <button onClick={onCancel}>Cancel</button>
        <button>Save Profile</button>
      </div>
    );
  };
});

// Mock PostItem component
jest.mock('../components/PostItem', () => {
  return function MockPostItem({ post }) {
    return (
      <div data-testid={`post-item-${post.id}`} className="post-item">
        <h4>@{post.username}</h4>
        <p>{post.content}</p>
        <small>{post.created_at}</small>
      </div>
    );
  };
});

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com'
};

const mockPosts = [
  {
    id: 1,
    username: 'testuser',
    content: 'My first post',
    created_at: '2023-01-01T00:00:00Z',
    upvotes: 5,
    downvotes: 1,
    comments: []
  },
  {
    id: 2,
    username: 'otheruser',
    content: 'Other user post',
    created_at: '2023-01-02T00:00:00Z',
    upvotes: 3,
    downvotes: 0,
    comments: []
  },
  {
    id: 3,
    username: 'testuser',
    content: 'My second post',
    created_at: '2023-01-03T00:00:00Z',
    upvotes: 2,
    downvotes: 0,
    comments: []
  }
];

const MockAuthProvider = ({ children, user = mockUser }) => (
  <AuthContext.Provider value={{ 
    user, 
    login: jest.fn(), 
    logout: jest.fn(), 
    register: jest.fn(),
    updateUser: jest.fn()
  }}>
    {children}
  </AuthContext.Provider>
);

const MockPostsProvider = ({ children, posts = mockPosts }) => (
  <PostsContext.Provider value={{ posts, setPosts: jest.fn(), fetchPosts: jest.fn() }}>
    {children}
  </PostsContext.Provider>
);

const renderWithProviders = (ui, { user = mockUser, posts = mockPosts } = {}) => {
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

describe('ProfilePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state when user is null', () => {
    renderWithProviders(<ProfilePage />, { user: null });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  test('renders user profile information', () => {
    renderWithProviders(<ProfilePage />);
    
    expect(screen.getByText('Profil Saya')).toBeInTheDocument();
    expect(screen.getByText(/Username:/)).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
    expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
    expect(screen.getByText('Edit Profil')).toBeInTheDocument();
  });

  test('shows timeline section', () => {
    renderWithProviders(<ProfilePage />);
    
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  test('displays only user own posts in timeline', () => {
    renderWithProviders(<ProfilePage />);
    
    // Should show only testuser's posts (posts 1 and 3)
    expect(screen.getByTestId('post-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-3')).toBeInTheDocument();
    
    // Should not show other user's post (post 2)
    expect(screen.queryByTestId('post-item-2')).not.toBeInTheDocument();
    
    // Verify content
    expect(screen.getByText('My first post')).toBeInTheDocument();
    expect(screen.getByText('My second post')).toBeInTheDocument();
    expect(screen.queryByText('Other user post')).not.toBeInTheDocument();
  });

  test('shows message when user has no posts', () => {
    const postsWithoutUserPosts = [
      {
        id: 2,
        username: 'otheruser',
        content: 'Other user post',
        created_at: '2023-01-02T00:00:00Z',
        upvotes: 3,
        downvotes: 0,
        comments: []
      }
    ];
    
    renderWithProviders(<ProfilePage />, { posts: postsWithoutUserPosts });
    
    expect(screen.getByText('Belum ada postingan.')).toBeInTheDocument();
  });
  test('toggles edit profile form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);
    
    // Initially shows profile info
    expect(screen.getByText(/Username:/)).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    
    // Click edit profile button
    await user.click(screen.getByText('Edit Profil'));
    
    // Should show edit form
    expect(screen.getByTestId('edit-profile-form')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile Form')).toBeInTheDocument();
    expect(screen.getByText('Editing profile for: testuser')).toBeInTheDocument();
    
    // Profile info should be hidden
    expect(screen.queryByText(/Username:/)).not.toBeInTheDocument();
  });
  test('cancels edit mode', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit Profil'));
    expect(screen.getByTestId('edit-profile-form')).toBeInTheDocument();
    
    // Cancel edit
    await user.click(screen.getByText('Cancel'));
    
    // Should return to profile view
    expect(screen.queryByTestId('edit-profile-form')).not.toBeInTheDocument();
    expect(screen.getByText(/Username:/)).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('renders posts in correct order', () => {
    renderWithProviders(<ProfilePage />);
    
    const postItems = screen.getAllByTestId(/post-item-/);
    expect(postItems).toHaveLength(2);
    
    // Should maintain the original order from posts array
    expect(postItems[0]).toHaveAttribute('data-testid', 'post-item-1');
    expect(postItems[1]).toHaveAttribute('data-testid', 'post-item-3');
  });

  test('handles empty posts array', () => {
    renderWithProviders(<ProfilePage />, { posts: [] });
    
    expect(screen.getByText('Profil Saya')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Belum ada postingan.')).toBeInTheDocument();
  });

  test('filters posts correctly with mixed usernames', () => {
    const mixedPosts = [
      {
        id: 1,
        username: 'testuser',
        content: 'User post 1',
        created_at: '2023-01-01T00:00:00Z',
        upvotes: 0,
        downvotes: 0,
        comments: []
      },
      {
        id: 2,
        username: 'TestUser', // Different case
        content: 'Different case username',
        created_at: '2023-01-02T00:00:00Z',
        upvotes: 0,
        downvotes: 0,
        comments: []
      },
      {
        id: 3,
        username: 'testuser',
        content: 'User post 2',
        created_at: '2023-01-03T00:00:00Z',
        upvotes: 0,
        downvotes: 0,
        comments: []
      }
    ];
    
    renderWithProviders(<ProfilePage />, { posts: mixedPosts });
    
    // Should only show exact username matches
    expect(screen.getByTestId('post-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-item-3')).toBeInTheDocument();
    expect(screen.queryByTestId('post-item-2')).not.toBeInTheDocument();
    
    expect(screen.getByText('User post 1')).toBeInTheDocument();
    expect(screen.getByText('User post 2')).toBeInTheDocument();
    expect(screen.queryByText('Different case username')).not.toBeInTheDocument();
  });

  test('maintains edit state when posts change', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(<ProfilePage />);
    
    // Enter edit mode
    await user.click(screen.getByText('Edit Profil'));
    expect(screen.getByTestId('edit-profile-form')).toBeInTheDocument();
    
    // Simulate posts context change
    const updatedPosts = [
      ...mockPosts,
      {
        id: 4,
        username: 'testuser',
        content: 'New post',
        created_at: '2023-01-04T00:00:00Z',
        upvotes: 0,
        downvotes: 0,
        comments: []
      }
    ];
    
    rerender(
      <MemoryRouter>
        <MockAuthProvider user={mockUser}>
          <MockPostsProvider posts={updatedPosts}>
            <ProfilePage />
          </MockPostsProvider>
        </MockAuthProvider>
      </MemoryRouter>
    );
    
    // Should still be in edit mode
    expect(screen.getByTestId('edit-profile-form')).toBeInTheDocument();
  });
  test('displays user profile with special characters', () => {
    const userWithSpecialChars = {
      id: 1,
      username: 'test.user_123',
      email: 'test+user@example.com'
    };
    
    renderWithProviders(<ProfilePage />, { user: userWithSpecialChars });
    
    expect(screen.getByText('test.user_123')).toBeInTheDocument();
    expect(screen.getByText(/test\+user@example\.com/)).toBeInTheDocument();
  });

  test('handles posts without required fields gracefully', () => {
    const incompletePost = {
      id: 1,
      username: 'testuser',
      content: 'Post without some fields'
      // Missing created_at, upvotes, downvotes, comments
    };
    
    renderWithProviders(<ProfilePage />, { posts: [incompletePost] });
    
    expect(screen.getByTestId('post-item-1')).toBeInTheDocument();
    expect(screen.getByText('Post without some fields')).toBeInTheDocument();
  });

  test('updates timeline when user posts are added or removed', () => {
    const initialPosts = [
      {
        id: 1,
        username: 'testuser',
        content: 'Initial post',
        created_at: '2023-01-01T00:00:00Z',
        upvotes: 0,
        downvotes: 0,
        comments: []
      }
    ];
    
    const { rerender } = renderWithProviders(<ProfilePage />, { posts: initialPosts });
    
    expect(screen.getByTestId('post-item-1')).toBeInTheDocument();
    expect(screen.getByText('Initial post')).toBeInTheDocument();
    
    // Remove the post
    rerender(
      <MemoryRouter>
        <MockAuthProvider user={mockUser}>
          <MockPostsProvider posts={[]}>
            <ProfilePage />
          </MockPostsProvider>
        </MockAuthProvider>
      </MemoryRouter>
    );
    
    expect(screen.queryByTestId('post-item-1')).not.toBeInTheDocument();
    expect(screen.getByText('Belum ada postingan.')).toBeInTheDocument();
  });

  test('displays correct post count in timeline', () => {
    renderWithProviders(<ProfilePage />);
    
    const postItems = screen.getAllByTestId(/post-item-/);
    expect(postItems).toHaveLength(2); // testuser has 2 posts in mockPosts
  });
});
