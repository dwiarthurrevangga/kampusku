import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PostItem from './PostItem';
import { AuthContext } from '../context/AuthContext';
import { PostsContext } from '../context/PostsContext';
import api from '../api';
import MockAdapter from 'axios-mock-adapter';

const mockApi = new MockAdapter(api);

// Mock dependencies
jest.mock('./EditPostForm', () => {
  return function MockEditPostForm({ post, onSave }) {
    return (
      <div>
        <h4>Edit Post Form</h4>
        <button onClick={() => onSave('Updated content')}>Save</button>
      </div>
    );
  };
});

const mockPost = {
  id: 1,
  username: 'testuser',
  content: 'Test post content',
  created_at: '2023-01-01T00:00:00Z',
  upvotes: 5,
  downvotes: 2,
  comments: [
    {
      id: 1,
      username: 'commenter1',
      content: 'First comment',
      created_at: '2023-01-01T01:00:00Z',
      replies: [
        {
          id: 2,
          username: 'commenter2',
          content: 'Reply to first comment',
          created_at: '2023-01-01T02:00:00Z',
          replies: []
        }
      ]
    },
    {
      id: 3,
      username: 'testuser',
      content: 'User own comment',
      created_at: '2023-01-01T03:00:00Z',
      replies: []
    }
  ]
};

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com'
};

const mockOtherUser = {
  id: 2,
  username: 'otheruser',
  email: 'other@example.com'
};

const MockAuthProvider = ({ children, user = mockUser }) => (
  <AuthContext.Provider value={{ user, login: jest.fn(), logout: jest.fn(), register: jest.fn() }}>
    {children}
  </AuthContext.Provider>
);

const MockPostsProvider = ({ children, posts = [mockPost], setPosts = jest.fn() }) => (
  <PostsContext.Provider value={{ posts, setPosts, fetchPosts: jest.fn() }}>
    {children}
  </PostsContext.Provider>
);

const renderWithProviders = (ui, { user = mockUser, posts = [mockPost], setPosts = jest.fn() } = {}) => {
  return render(
    <MemoryRouter>
      <MockAuthProvider user={user}>
        <MockPostsProvider posts={posts} setPosts={setPosts}>
          {ui}
        </MockPostsProvider>
      </MockAuthProvider>
    </MemoryRouter>
  );
};

describe('PostItem Component', () => {
  beforeEach(() => {
    mockApi.reset();
    jest.clearAllMocks();
  });

  test('renders post content correctly', () => {
    renderWithProviders(<PostItem post={mockPost} />);
    
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('Test post content')).toBeInTheDocument();
    expect(screen.getByText(/1\/1\/2023/)).toBeInTheDocument();
    expect(screen.getByText('▲ 5')).toBeInTheDocument();
    expect(screen.getByText('▼ 2')).toBeInTheDocument();
  });

  test('shows edit and delete buttons only for post owner', () => {
    renderWithProviders(<PostItem post={mockPost} />);
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('hides edit and delete buttons for other users', () => {
    const otherUserPost = { ...mockPost, username: 'otheruser' };
    renderWithProviders(<PostItem post={otherUserPost} />);
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  test('toggles comments visibility', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostItem post={mockPost} />);
    
    // Initially comments are hidden
    expect(screen.queryByText('First comment')).not.toBeInTheDocument();
    
    // Click to show comments
    const commentButton = screen.getByText('Comment (2)');
    await user.click(commentButton);
    
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('User own comment')).toBeInTheDocument();
    
    // Click to hide comments
    const hideButton = screen.getByText('Hide Comments');
    await user.click(hideButton);
    
    expect(screen.queryByText('First comment')).not.toBeInTheDocument();
  });

  test('renders nested comments correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostItem post={mockPost} />);
    
    // Show comments
    await user.click(screen.getByText('Comment (2)'));
    
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Reply to first comment')).toBeInTheDocument();
  });

  test('shows delete button only for comment owner', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostItem post={mockPost} />);
    
    // Show comments
    await user.click(screen.getByText('Comment (2)'));
    
    const deleteButtons = screen.getAllByText('Delete');
    // Should have one delete button for the user's own comment
    expect(deleteButtons).toHaveLength(1);
  });

  test('adds new comment successfully', async () => {
    const user = userEvent.setup();
    const setPosts = jest.fn();
    mockApi.onPost(`/posts/${mockPost.id}/comments`).reply(200, {
      id: 4,
      username: 'testuser',
      content: 'New comment',
      created_at: '2023-01-01T04:00:00Z',
      replies: []
    });

    renderWithProviders(<PostItem post={mockPost} />, { setPosts });
    
    // Show comments
    await user.click(screen.getByText('Comment (2)'));
    
    // Add new comment
    const commentInput = screen.getByPlaceholderText('Tulis komentar...');
    await user.type(commentInput, 'New comment');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(mockApi.history.post).toHaveLength(1);
      expect(mockApi.history.post[0].data).toBe(JSON.stringify({
        user_id: 1,
        content: 'New comment'
      }));
    });
  });

  test('handles reply to comment', async () => {
    const user = userEvent.setup();
    const setPosts = jest.fn();
    
    // Mock window.prompt
    const mockPrompt = jest.spyOn(window, 'prompt').mockReturnValue('Reply content');
    
    mockApi.onPost(`/posts/${mockPost.id}/comments`).reply(200, {
      id: 5,
      username: 'testuser',
      content: 'Reply content',
      created_at: '2023-01-01T05:00:00Z',
      replies: []
    });

    renderWithProviders(<PostItem post={mockPost} />, { setPosts });
    
    // Show comments
    await user.click(screen.getByText('Comment (2)'));
    
    // Click reply on first comment
    const replyButtons = screen.getAllByText('Reply');
    await user.click(replyButtons[0]);
    
    await waitFor(() => {
      expect(mockApi.history.post).toHaveLength(1);
      expect(mockApi.history.post[0].data).toBe(JSON.stringify({
        user_id: 1,
        content: 'Reply content',
        parent_id: 1
      }));
    });

    mockPrompt.mockRestore();
  });

  test('handles comment deletion', async () => {
    const user = userEvent.setup();
    const setPosts = jest.fn();
    
    mockApi.onDelete('/comments/3').reply(200);

    renderWithProviders(<PostItem post={mockPost} />, { setPosts });
    
    // Show comments
    await user.click(screen.getByText('Comment (2)'));
    
    // Delete user's own comment
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    
    await waitFor(() => {
      expect(mockApi.history.delete).toHaveLength(1);
      expect(mockApi.history.delete[0].data).toBe(JSON.stringify({
        user_id: 1
      }));
    });
  });

  test('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostItem post={mockPost} />);
    
    await user.click(screen.getByText('Edit'));
    
    expect(screen.getByText('Edit Post')).toBeInTheDocument();
    expect(screen.getByText('Edit Post Form')).toBeInTheDocument();
  });

  test('saves edited post successfully', async () => {
    const user = userEvent.setup();
    const setPosts = jest.fn();
    
    mockApi.onPut(`/posts/${mockPost.id}`).reply(200, {
      ...mockPost,
      content: 'Updated content'
    });

    renderWithProviders(<PostItem post={mockPost} />, { setPosts });
    
    // Open edit modal
    await user.click(screen.getByText('Edit'));
    
    // Save the edit
    await user.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(mockApi.history.put).toHaveLength(1);
      expect(mockApi.history.put[0].data).toBe(JSON.stringify({
        user_id: 1,
        content: 'Updated content'
      }));
    });
  });

  test('opens delete confirmation modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostItem post={mockPost} />);
    
    await user.click(screen.getByText('Delete'));
    
    expect(screen.getByText('Hapus Post')).toBeInTheDocument();
    expect(screen.getByText('Apakah Anda yakin ingin menghapus post ini?')).toBeInTheDocument();
  });

  test('deletes post successfully', async () => {
    const user = userEvent.setup();
    const setPosts = jest.fn();
    
    mockApi.onDelete(`/posts/${mockPost.id}`).reply(200);

    renderWithProviders(<PostItem post={mockPost} />, { setPosts });
    
    // Open delete confirmation
    await user.click(screen.getByText('Delete'));
    
    // Confirm deletion
    await user.click(screen.getByRole('button', { name: 'Hapus' }));
    
    await waitFor(() => {
      expect(mockApi.history.delete).toHaveLength(1);
      expect(mockApi.history.delete[0].data).toBe(JSON.stringify({
        user_id: 1
      }));
    });
  });

  test('cancels post deletion', async () => {
    const user = userEvent.setup();
    const setPosts = jest.fn();
    renderWithProviders(<PostItem post={mockPost} />, { setPosts });
    
    // Open delete confirmation
    await user.click(screen.getByText('Delete'));
    
    // Cancel deletion
    await user.click(screen.getByText('Batal'));
    
    // Modal should be closed
    expect(screen.queryByText('Apakah Anda yakin ingin menghapus post ini?')).not.toBeInTheDocument();
    expect(setPosts).not.toHaveBeenCalled();
  });

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockApi.onPost(`/posts/${mockPost.id}/comments`).reply(500);

    renderWithProviders(<PostItem post={mockPost} />);
    
    // Show comments and try to add comment
    await user.click(screen.getByText('Comment (2)'));
    const commentInput = screen.getByPlaceholderText('Tulis komentar...');
    await user.type(commentInput, 'New comment');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Gagal tambah komentar:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('does not submit empty comments', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostItem post={mockPost} />);
    
    // Show comments
    await user.click(screen.getByText('Comment (2)'));
    
    // Try to submit empty comment
    const commentInput = screen.getByPlaceholderText('Tulis komentar...');
    await user.click(commentInput);
    await user.keyboard('{Enter}');
    
    // No API call should be made
    expect(mockApi.history.post).toHaveLength(0);
  });

  test('handles upvote and downvote clicks', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostItem post={mockPost} />);
    
    const upvoteButton = screen.getByText('▲ 5');
    const downvoteButton = screen.getByText('▼ 2');
    
    // These buttons should be clickable (functions are empty but buttons exist)
    await user.click(upvoteButton);
    await user.click(downvoteButton);
    
    expect(upvoteButton).toBeInTheDocument();
    expect(downvoteButton).toBeInTheDocument();
  });
});
