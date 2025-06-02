import { renderHook, act } from '@testing-library/react';
import { PostsProvider, usePosts } from './PostsContext';
import api from '../api';

// Mock the API module
jest.mock('../api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Helper to render hook with provider
const renderWithProvider = () => {
  const wrapper = ({ children }) => (
    <PostsProvider>{children}</PostsProvider>
  );
  return renderHook(() => usePosts(), { wrapper });
};

describe('PostsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('provides initial posts context', async () => {
    const mockPosts = [
      {
        id: 1,
        username: 'testuser',
        content: 'Test post',
        created_at: '2025-06-02T10:00:00Z',
        upvotes: 0,
        downvotes: 0,
        comments: []
      }
    ];
    
    api.get.mockResolvedValue({ data: mockPosts });
    
    const { result } = renderWithProvider();
    
    // Initially posts should be empty
    expect(result.current.posts).toEqual([]);
    expect(typeof result.current.setPosts).toBe('function');
    
    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.posts).toEqual(mockPosts);
  });
  test('handles API errors gracefully', async () => {
    const errorResponse = new Error('Server error');
    errorResponse.response = { status: 500, data: { error: 'Server error' } };
    api.get.mockRejectedValue(errorResponse);
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderWithProvider();
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.posts).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Gagal fetch posts:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
  test('setPosts function updates posts correctly', () => {
    api.get.mockResolvedValue({ data: [] });
    
    const { result } = renderWithProvider();
    
    const newPosts = [
      { id: 1, content: 'New post', username: 'user1' },
      { id: 2, content: 'Another post', username: 'user2' }
    ];
    
    act(() => {
      result.current.setPosts(newPosts);
    });
    
    expect(result.current.posts).toEqual(newPosts);
  });

  test('fetches posts on mount', async () => {
    const mockPosts = [
      {
        id: 1,
        username: 'testuser',
        content: 'Test post content',
        created_at: '2025-06-02T10:00:00Z',
        upvotes: 5,
        downvotes: 1,
        comments: [
          {
            id: 1,
            username: 'commenter',
            content: 'Nice post!',
            created_at: '2025-06-02T10:30:00Z',
            replies: []
          }
        ]
      }    ];
    
    api.get.mockResolvedValue({ data: mockPosts });
    
    const { result } = renderWithProvider();
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.posts).toEqual(mockPosts);
  });
});
