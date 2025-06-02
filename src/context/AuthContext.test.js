import { renderHook, act } from '@testing-library/react';
import { useAuth } from './AuthContext';
import AuthProvider from './AuthContext';
import api from '../api';

// Mock the API module
jest.mock('../api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
}));

// Helper to render hook with provider
const renderWithProvider = (initialValue) => {
  const wrapper = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
  );
  return renderHook(() => useAuth(), { wrapper });
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('provides initial auth context with null user', () => {
    const { result } = renderWithProvider();
    
    expect(result.current.user).toBeNull();
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.updateUser).toBe('function');
  });

  test('retrieves user from localStorage on initialization', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    const { result } = renderWithProvider();
    
    expect(result.current.user).toEqual(mockUser);
  });
  test('register function works correctly', async () => {
    const mockUser = { id: 1, username: 'newuser', email: 'new@example.com' };
    api.post.mockResolvedValue({ data: mockUser });
    
    const { result } = renderWithProvider();
    
    await act(async () => {
      const response = await result.current.register('newuser', 'new@example.com', 'password123');
      expect(response).toEqual(mockUser);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });
  test('login function works correctly', async () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    api.post.mockResolvedValue({ data: mockUser });
    
    const { result } = renderWithProvider();
    
    await act(async () => {
      const response = await result.current.login('testuser', 'password123');
      expect(response).toEqual(mockUser);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });
  test('login function handles errors correctly', async () => {
    const errorResponse = new Error('Request failed');
    errorResponse.response = { status: 401, data: { error: 'Invalid credentials' } };
    api.post.mockRejectedValue(errorResponse);
    
    const { result } = renderWithProvider();
    
    await act(async () => {
      try {
        await result.current.login('wronguser', 'wrongpass');
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('Invalid credentials');
      }
    });
    
    expect(result.current.user).toBeNull();
  });

  test('logout function works correctly', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    const { result } = renderWithProvider();
    
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('updateUser function works correctly', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    const { result } = renderWithProvider();
    
    const updatedFields = { username: 'updateduser', email: 'updated@example.com' };
    
    act(() => {
      const newUser = result.current.updateUser(updatedFields);
      expect(newUser).toEqual({ ...mockUser, ...updatedFields });
    });
    
    expect(result.current.user).toEqual({ ...mockUser, ...updatedFields });
  });
  test('register function handles validation errors', async () => {
    const errorResponse = new Error('Request failed');
    errorResponse.response = { status: 400, data: { error: 'Username already taken' } };
    api.post.mockRejectedValue(errorResponse);
    
    const { result } = renderWithProvider();
    
    await act(async () => {
      try {
        await result.current.register('existinguser', 'test@example.com', 'password123');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('Username already taken');
      }
    });
    
    expect(result.current.user).toBeNull();
  });
});
