import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock the context providers
jest.mock('./context/AuthContext', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({ user: null, login: jest.fn(), register: jest.fn(), logout: jest.fn() })
}));

jest.mock('./context/PostsContext', () => ({
  PostsProvider: ({ children }) => <div data-testid="posts-provider">{children}</div>,
  usePosts: () => ({ posts: [], setPosts: jest.fn() })
}));

describe('App Component', () => {
  test('renders app with navigation and routing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    // Check if navigation bar is rendered
    expect(screen.getByText('Kampusku')).toBeInTheDocument();
  });

  test('renders login page when navigating to /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('renders register page when navigating to /register', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Register')).toBeInTheDocument();
  });
});
