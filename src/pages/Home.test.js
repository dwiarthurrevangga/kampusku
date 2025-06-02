import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import { AuthContext } from '../context/AuthContext';

// Mock the FeedPages component
jest.mock('../components/FeedPage', () => {
  return function MockFeedPage() {
    return <div data-testid="feed-page">Feed Content</div>;
  };
});

const renderHome = (user = null) => {
  const authValue = {
    user
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Home Component', () => {
  test('redirects to login when user is not authenticated', () => {
    const { container } = renderHome(null);
    
    // Component should render Navigate component, which doesn't render visible content
    expect(container.firstChild).toBeNull();
  });

  test('renders home page when user is authenticated', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    renderHome(mockUser);
    
    expect(screen.getByText('Beranda Kampusku')).toBeInTheDocument();
    expect(screen.getByText('Selamat datang, testuser! Ini halaman utama forum.')).toBeInTheDocument();
    expect(screen.getByTestId('feed-page')).toBeInTheDocument();
  });

  test('displays correct welcome message with username', () => {
    const mockUser = { id: 1, username: 'JohnDoe', email: 'john@example.com' };
    renderHome(mockUser);
    
    expect(screen.getByText('Selamat datang, JohnDoe! Ini halaman utama forum.')).toBeInTheDocument();
  });

  test('renders Container component with correct styling', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    renderHome(mockUser);
    
    const container = screen.getByText('Beranda Kampusku').closest('.container');
    expect(container).toHaveClass('my-4');
  });

  test('renders h2 heading with correct text', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    renderHome(mockUser);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Beranda Kampusku');
  });

  test('renders Feed component', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    renderHome(mockUser);
    
    expect(screen.getByTestId('feed-page')).toBeInTheDocument();
  });

  test('handles user with special characters in username', () => {
    const mockUser = { id: 1, username: 'user@123_test', email: 'user@example.com' };
    renderHome(mockUser);
    
    expect(screen.getByText('Selamat datang, user@123_test! Ini halaman utama forum.')).toBeInTheDocument();
  });

  test('handles user with long username', () => {
    const mockUser = { 
      id: 1, 
      username: 'verylongusernamethatmightcauseissues', 
      email: 'long@example.com' 
    };
    renderHome(mockUser);
    
    expect(screen.getByText('Selamat datang, verylongusernamethatmightcauseissues! Ini halaman utama forum.')).toBeInTheDocument();
  });

  test('handles user object without email field', () => {
    const mockUser = { id: 1, username: 'testuser' };
    renderHome(mockUser);
    
    expect(screen.getByText('Beranda Kampusku')).toBeInTheDocument();
    expect(screen.getByText('Selamat datang, testuser! Ini halaman utama forum.')).toBeInTheDocument();
  });

  test('handles user object with additional fields', () => {
    const mockUser = { 
      id: 1, 
      username: 'testuser', 
      email: 'test@example.com',
      role: 'admin',
      lastLogin: '2025-06-02T10:00:00Z'
    };
    renderHome(mockUser);
    
    expect(screen.getByText('Selamat datang, testuser! Ini halaman utama forum.')).toBeInTheDocument();
  });

  test('component structure is correct', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    renderHome(mockUser);
    
    const container = screen.getByText('Beranda Kampusku').closest('.container');
    expect(container).toBeInTheDocument();
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    
    const welcomeText = screen.getByText(/Selamat datang,/);
    expect(welcomeText).toBeInTheDocument();
    
    const feedComponent = screen.getByTestId('feed-page');
    expect(feedComponent).toBeInTheDocument();
  });
});
