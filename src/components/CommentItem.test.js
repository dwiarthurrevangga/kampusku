import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CommentItem from './CommentItem';
import { AuthContext } from '../context/AuthContext';
import { PostsContext } from '../context/PostsContext';
import api from '../api';
import MockAdapter from 'axios-mock-adapter';

const mockApi = new MockAdapter(api);

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com'
};

const mockComment = {
  id: 1,
  username: 'testuser',
  content: 'Test comment content',
  created_at: '2023-01-01T00:00:00Z',
  replies: [
    {
      id: 2,
      username: 'otheruser',
      content: 'Reply to comment',
      created_at: '2023-01-01T01:00:00Z',
      replies: []
    }
  ]
};

const mockOtherUserComment = {
  id: 3,
  username: 'otheruser',
  content: 'Other user comment',
  created_at: '2023-01-01T02:00:00Z',
  replies: []
};

const mockPost = {
  id: 1,
  username: 'postowner',
  content: 'Test post',
  created_at: '2023-01-01T00:00:00Z',
  comments: [mockComment, mockOtherUserComment]
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

describe('CommentItem Component', () => {
  beforeEach(() => {
    mockApi.reset();
    jest.clearAllMocks();
  });
  test('renders comment content correctly', () => {
    renderWithProviders(<CommentItem comment={mockComment} postId={1} />);
    
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('Test comment content')).toBeInTheDocument();
    expect(screen.getByText(/01\/01\/2023/i)).toBeInTheDocument();
  });
  test('shows reply button for all comments', () => {
    renderWithProviders(<CommentItem comment={mockComment} postId={1} />);
    
    expect(screen.getAllByText('Reply').length).toBeGreaterThan(0);
  });

  test('shows delete button only for comment owner', () => {
    renderWithProviders(<CommentItem comment={mockComment} postId={1} />);
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('hides delete button for other users comments', () => {
    renderWithProviders(<CommentItem comment={mockOtherUserComment} postId={1} />);
    
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.getByText('Reply')).toBeInTheDocument();
  });

  test('renders nested replies correctly', () => {
    renderWithProviders(<CommentItem comment={mockComment} postId={1} />);
    
    expect(screen.getByText('Test comment content')).toBeInTheDocument();
    expect(screen.getByText('Reply to comment')).toBeInTheDocument();
    expect(screen.getByText('@otheruser')).toBeInTheDocument();
  });

  test('applies correct indentation for nested levels', () => {
    const { container } = renderWithProviders(<CommentItem comment={mockComment} postId={1} level={2} />);
    
    const commentDiv = container.firstChild;
    expect(commentDiv).toHaveStyle('margin-left: 32px'); // 2 * 16px
  });

  test('toggles reply form visibility', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommentItem comment={mockComment} postId={1} />);
    
    // Initially reply form is hidden
    expect(screen.queryByPlaceholderText('Tulis balasan...')).not.toBeInTheDocument();
      // Click first reply button
    await user.click(screen.getAllByText('Reply')[0]);
    
    // Reply form should be visible
    expect(screen.getByPlaceholderText('Tulis balasan...')).toBeInTheDocument();
    expect(screen.getByText('Kirim')).toBeInTheDocument();
    
    // Click reply button again to hide
    await user.click(screen.getByText('Reply'));
    
    // Reply form should be hidden again
    expect(screen.queryByPlaceholderText('Tulis balasan...')).not.toBeInTheDocument();
  });

  test('submits reply successfully', async () => {
    const user = userEvent.setup();
    const setPosts = jest.fn();
    
    mockApi.onPost('/posts/1/comments').reply(200, {
      id: 4,
      username: 'testuser',
      content: 'New reply content',
      created_at: '2023-01-01T03:00:00Z',
      replies: []
    });

    renderWithProviders(<CommentItem comment={mockComment} postId={1} />, { setPosts });
      // Open reply form
    await user.click(screen.getAllByText('Reply')[0]);
    
    // Type reply content
    const replyInput = screen.getByPlaceholderText('Tulis balasan...');
    await user.type(replyInput, 'New reply content');
    
    // Submit reply
    await user.click(screen.getByText('Kirim'));
    
    await waitFor(() => {
      expect(mockApi.history.post).toHaveLength(1);
      expect(mockApi.history.post[0].data).toBe(JSON.stringify({
        user_id: 1,
        content: 'New reply content',
        parent_id: 1
      }));
    });
    
    expect(setPosts).toHaveBeenCalled();
  });

  test('does not submit empty reply', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommentItem comment={mockComment} postId={1} />);
    
    // Open reply form
    await user.click(screen.getByText('Reply'));
    
    // Try to submit empty reply
    await user.click(screen.getByText('Kirim'));
    
    // No API call should be made
    expect(mockApi.history.post).toHaveLength(0);
  });

  test('does not submit whitespace-only reply', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommentItem comment={mockComment} postId={1} />);
    
    // Open reply form
    await user.click(screen.getByText('Reply'));
    
    // Type only whitespace
    const replyInput = screen.getByPlaceholderText('Tulis balasan...');
    await user.type(replyInput, '   ');
    
    // Try to submit
    await user.click(screen.getByText('Kirim'));
    
    // No API call should be made
    expect(mockApi.history.post).toHaveLength(0);
  });

  test('clears form and hides after successful reply', async () => {
    const user = userEvent.setup();
    const setPosts = jest.fn();
    
    mockApi.onPost('/posts/1/comments').reply(200, {
      id: 4,
      username: 'testuser',
      content: 'New reply',
      created_at: '2023-01-01T03:00:00Z',
      replies: []
    });

    renderWithProviders(<CommentItem comment={mockComment} postId={1} />, { setPosts });
    
    // Open reply form and submit
    await user.click(screen.getByText('Reply'));
    const replyInput = screen.getByPlaceholderText('Tulis balasan...');
    await user.type(replyInput, 'New reply');
    await user.click(screen.getByText('Kirim'));
    
    await waitFor(() => {
      // Form should be hidden after successful submission
      expect(screen.queryByPlaceholderText('Tulis balasan...')).not.toBeInTheDocument();
    });
  });

  test('handles reply submission error', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockApi.onPost('/posts/1/comments').reply(500);

    renderWithProviders(<CommentItem comment={mockComment} postId={1} />);
    
    // Open reply form and submit
    await user.click(screen.getByText('Reply'));
    const replyInput = screen.getByPlaceholderText('Tulis balasan...');
    await user.type(replyInput, 'New reply');
    await user.click(screen.getByText('Kirim'));
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Gagal balas komentar:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('deletes comment with confirmation', async () => {
    const user = userEvent.setup();
    const setPosts = jest.fn();
    
    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    
    mockApi.onDelete('/comments/1').reply(200);

    renderWithProviders(<CommentItem comment={mockComment} postId={1} />, { setPosts });
    
    // Click delete button
    await user.click(screen.getByText('Delete'));
    
    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith('Yakin ingin menghapus komentar ini?');
      expect(mockApi.history.delete).toHaveLength(1);
      expect(mockApi.history.delete[0].data).toBe(JSON.stringify({
        user_id: 1
      }));
    });
    
    expect(setPosts).toHaveBeenCalled();
    mockConfirm.mockRestore();
  });

  test('cancels comment deletion', async () => {
    const user = userEvent.setup();
    const setPosts = jest.fn();
    
    // Mock window.confirm to return false
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProviders(<CommentItem comment={mockComment} postId={1} />, { setPosts });
    
    // Click delete button
    await user.click(screen.getByText('Delete'));
    
    expect(mockConfirm).toHaveBeenCalled();
    expect(mockApi.history.delete).toHaveLength(0);
    expect(setPosts).not.toHaveBeenCalled();
    
    mockConfirm.mockRestore();
  });

  test('handles comment deletion error', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    
    mockApi.onDelete('/comments/1').reply(500);

    renderWithProviders(<CommentItem comment={mockComment} postId={1} />);
    
    // Click delete button
    await user.click(screen.getByText('Delete'));
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Gagal hapus komentar:', expect.any(Error));
    });

    consoleSpy.mockRestore();
    mockConfirm.mockRestore();
  });

  test('renders deeply nested comments correctly', () => {
    const deeplyNestedComment = {
      id: 1,
      username: 'user1',
      content: 'Level 1 comment',
      created_at: '2023-01-01T00:00:00Z',
      replies: [
        {
          id: 2,
          username: 'user2',
          content: 'Level 2 comment',
          created_at: '2023-01-01T01:00:00Z',
          replies: [
            {
              id: 3,
              username: 'user3',
              content: 'Level 3 comment',
              created_at: '2023-01-01T02:00:00Z',
              replies: []
            }
          ]
        }
      ]
    };

    const { container } = renderWithProviders(<CommentItem comment={deeplyNestedComment} postId={1} />);
    
    expect(screen.getByText('Level 1 comment')).toBeInTheDocument();
    expect(screen.getByText('Level 2 comment')).toBeInTheDocument();
    expect(screen.getByText('Level 3 comment')).toBeInTheDocument();
    
    // Check that nested comments have different indentation
    const commentCards = container.querySelectorAll('.comment-card');
    expect(commentCards).toHaveLength(3);
  });

  test('handles form submission via Enter key', async () => {
    const user = userEvent.setup();
    const setPosts = jest.fn();
    
    mockApi.onPost('/posts/1/comments').reply(200, {
      id: 4,
      username: 'testuser',
      content: 'Reply via enter',
      created_at: '2023-01-01T03:00:00Z',
      replies: []
    });

    renderWithProviders(<CommentItem comment={mockComment} postId={1} />, { setPosts });
    
    // Open reply form
    await user.click(screen.getByText('Reply'));
    
    // Type and submit with Enter
    const replyInput = screen.getByPlaceholderText('Tulis balasan...');
    await user.type(replyInput, 'Reply via enter{enter}');
    
    await waitFor(() => {
      expect(mockApi.history.post).toHaveLength(1);
    });
  });

  test('maintains reply input value during typing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommentItem comment={mockComment} postId={1} />);
    
    // Open reply form
    await user.click(screen.getByText('Reply'));
    
    // Type in the input
    const replyInput = screen.getByPlaceholderText('Tulis balasan...');
    await user.type(replyInput, 'Test reply content');
    
    expect(replyInput).toHaveValue('Test reply content');
  });
});
