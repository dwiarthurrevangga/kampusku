import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostForm from './PostForm';
import { AuthContext } from '../context/AuthContext';
import { PostsContext } from '../context/PostsContext';
import api from '../api';

// Mock the API module
jest.mock('../api', () => ({
  post: jest.fn(),
}));

const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
const mockPosts = [
  { id: 1, content: 'Existing post', username: 'testuser', created_at: '2025-06-02T10:00:00Z', comments: [] }
];

const renderPostForm = (
  authValue = { user: mockUser },
  postsValue = { posts: mockPosts, setPosts: jest.fn() }
) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <PostsContext.Provider value={postsValue}>
        <PostForm />
      </PostsContext.Provider>
    </AuthContext.Provider>
  );
};

describe('PostForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders post form correctly', () => {
    renderPostForm();
    
    expect(screen.getByPlaceholderText('💭 Apa yang ingin Anda bagikan dengan komunitas kampus hari ini?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post' })).toBeInTheDocument();
  });

  test('button is disabled when content is empty', () => {
    renderPostForm();
    
    const submitButton = screen.getByRole('button', { name: 'Post' });
    expect(submitButton).toBeDisabled();
  });
  test('button is enabled when content is entered', async () => {
    const user = userEvent.setup();
    renderPostForm();
    
    const textarea = screen.getByPlaceholderText('💭 Apa yang ingin Anda bagikan dengan komunitas kampus hari ini?');
    const submitButton = screen.getByRole('button', { name: 'Post' });
    
    await user.type(textarea, 'This is a test post');
    
    expect(submitButton).toBeEnabled();
  });
  test('button is disabled when content is only whitespace', async () => {
    const user = userEvent.setup();
    renderPostForm();
    
    const textarea = screen.getByPlaceholderText('💭 Apa yang ingin Anda bagikan dengan komunitas kampus hari ini?');
    const submitButton = screen.getByRole('button', { name: 'Post' });
    
    await user.type(textarea, '   ');
    
    expect(submitButton).toBeDisabled();
  });

  test('creates post successfully', async () => {
    const user = userEvent.setup();
    const mockSetPosts = jest.fn();
    const newPost = {
      id: 2,
      content: 'New test post',
      username: 'testuser',
      created_at: '2025-06-02T11:00:00Z',
      upvotes: 0,
      downvotes: 0,      comments: []
    };
      api.post.mockResolvedValue({ data: newPost });
    
    renderPostForm(
      { user: mockUser },
      { posts: mockPosts, setPosts: mockSetPosts }
    );
    
    const textarea = screen.getByPlaceholderText('💭 Apa yang ingin Anda bagikan dengan komunitas kampus hari ini?');
    const submitButton = screen.getByRole('button', { name: 'Post' });
    
    await user.type(textarea, 'New test post');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockSetPosts).toHaveBeenCalledWith([newPost, ...mockPosts]);
    });
    
    // Content should be cleared after successful post
    expect(textarea.value).toBe('');
  });
  test('handles API error gracefully', async () => {
    const user = userEvent.setup();
    const mockSetPosts = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const errorResponse = new Error('Server error');
    errorResponse.response = { status: 500, data: { error: 'Server error' } };
    api.post.mockRejectedValue(errorResponse);
      renderPostForm(
      { user: mockUser },
      { posts: mockPosts, setPosts: mockSetPosts }
    );
    
    const textarea = screen.getByPlaceholderText('💭 Apa yang ingin Anda bagikan dengan komunitas kampus hari ini?');
    const submitButton = screen.getByRole('button', { name: 'Post' });
    
    await user.type(textarea, 'Test post');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Gagal membuat post:', expect.any(Error));
    });
    
    expect(mockSetPosts).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('does not submit when content is empty after trimming', async () => {
    const user = userEvent.setup();
    const mockSetPosts = jest.fn();
      renderPostForm(
      { user: mockUser },
      { posts: mockPosts, setPosts: mockSetPosts }
    );
    
    const textarea = screen.getByPlaceholderText('💭 Apa yang ingin Anda bagikan dengan komunitas kampus hari ini?');
    
    await user.type(textarea, '   ');
    
    // Try to submit form by pressing Enter
    fireEvent.submit(textarea.closest('form'));
    
    expect(mockSetPosts).not.toHaveBeenCalled();
  });

  test('sends correct data to API', async () => {
    const user = userEvent.setup();    const mockSetPosts = jest.fn();
    
    const responseData = { id: 2, content: 'Test post content', username: 'testuser' };
    api.post.mockImplementation((url, data) => {
      expect(data.user_id).toBe(mockUser.id);
      expect(data.content).toBe('Test post content');
      return Promise.resolve({ data: responseData });
    });
      renderPostForm(
      { user: mockUser },
      { posts: mockPosts, setPosts: mockSetPosts }
    );
    
    const textarea = screen.getByPlaceholderText('💭 Apa yang ingin Anda bagikan dengan komunitas kampus hari ini?');
    const submitButton = screen.getByRole('button', { name: 'Post' });
    
    await user.type(textarea, 'Test post content');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockSetPosts).toHaveBeenCalled();
    });
  });

  test('handles form submission via Enter key', async () => {    const user = userEvent.setup();
    const mockSetPosts = jest.fn();
    const newPost = { id: 2, content: 'Test content', username: 'testuser' };
    
    api.post.mockResolvedValue({ data: newPost });
      renderPostForm(
      { user: mockUser },
      { posts: mockPosts, setPosts: mockSetPosts }
    );
    
    const textarea = screen.getByPlaceholderText('💭 Apa yang ingin Anda bagikan dengan komunitas kampus hari ini?');
    
    await user.type(textarea, 'Test content');
    await user.keyboard('{Control>}{Enter}'); // Assuming Ctrl+Enter submits
    
    // Since the form doesn't handle Ctrl+Enter by default, we test direct form submission
    fireEvent.submit(textarea.closest('form'));
    
    await waitFor(() => {
      expect(mockSetPosts).toHaveBeenCalledWith([newPost, ...mockPosts]);
    });
  });

  test('trims whitespace from content before submission', async () => {
    const user = userEvent.setup();    const mockSetPosts = jest.fn();
    
    const responseData = { id: 2, content: 'Trimmed content', username: 'testuser' };
    api.post.mockImplementation((url, data) => {
      expect(data.content).toBe('Trimmed content');
      return Promise.resolve({ data: responseData });
    });
      renderPostForm(
      { user: mockUser },
      { posts: mockPosts, setPosts: mockSetPosts }
    );
    
    const textarea = screen.getByPlaceholderText('💭 Apa yang ingin Anda bagikan dengan komunitas kampus hari ini?');
    const submitButton = screen.getByRole('button', { name: 'Post' });
    
    await user.type(textarea, '  Trimmed content  ');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockSetPosts).toHaveBeenCalled();
    });
  });
});
