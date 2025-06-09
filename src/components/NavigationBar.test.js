import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavigationBar from './NavigationBar';
import { AuthContext } from '../context/AuthContext';
import { MemoryRouter, __mockNavigate, __resetMocks } from 'react-router-dom';

const mockLogout = jest.fn();

const renderNavigationBar = (user = null) => {
  const authValue = {
    user,
    logout: mockLogout
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <NavigationBar />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('NavigationBar Component', () => {
  beforeEach(() => {    mockLogout.mockClear();
    __mockNavigate.mockClear();
  });
  test('renders navigation bar correctly', () => {
    renderNavigationBar();
    
    expect(screen.getByText('🎓 Kampusku')).toBeInTheDocument();
    expect(screen.getByText('Beranda')).toBeInTheDocument();
  });

  test('shows login and register links when user is not logged in', () => {
    renderNavigationBar(null);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Profil')).not.toBeInTheDocument();
    expect(screen.queryByText(/Halo,/)).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('shows user info and logout when user is logged in', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    renderNavigationBar(mockUser);
    
    expect(screen.getByText('Halo, testuser')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  test('logout button calls logout function and navigates to login', async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    renderNavigationBar(mockUser);
    
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
    expect(__mockNavigate).toHaveBeenCalledWith('/login');
  });
  test('brand link points to home page', () => {
    renderNavigationBar();
    
    const brandLink = screen.getByText('🎓 Kampusku');
    expect(brandLink.closest('a')).toHaveAttribute('href', '/');
  });

  test('beranda link points to home page', () => {
    renderNavigationBar();
    
    const berandaLink = screen.getByText('Beranda');
    expect(berandaLink.closest('a')).toHaveAttribute('href', '/');
  });

  test('profil link points to profile page when user is logged in', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    renderNavigationBar(mockUser);
    
    const profilLink = screen.getByText('Profil');
    expect(profilLink.closest('a')).toHaveAttribute('href', '/profile');
  });

  test('login link points to login page', () => {
    renderNavigationBar(null);
    
    const loginLink = screen.getByText('Login');
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
  test('register button points to register page', () => {
    renderNavigationBar(null);
    
    const registerButton = screen.getByText('Register');
    expect(registerButton).toHaveAttribute('href', '/register');
  });

  test('navbar toggle button is present for mobile', () => {
    renderNavigationBar();
    
    const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
    expect(toggleButton).toBeInTheDocument();
  });

  test('navbar has correct CSS classes', () => {
    renderNavigationBar();
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('navbar-custom');
  });

  test('handles long usernames gracefully', () => {
    const mockUser = { 
      id: 1, 
      username: 'verylongusernamethatmightbreakthelayout', 
      email: 'test@example.com' 
    };
    renderNavigationBar(mockUser);
    
    expect(screen.getByText('Halo, verylongusernamethatmightbreakthelayout')).toBeInTheDocument();
  });

  test('logout button has correct styling', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    renderNavigationBar(mockUser);
    
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toHaveClass('btn', 'btn-outline-light', 'btn-sm');
  });

  test('register button has correct styling', () => {
    renderNavigationBar(null);
    
    const registerButton = screen.getByText('Register');
    expect(registerButton).toHaveClass('btn', 'btn-outline-light', 'btn-sm');
  });

  test('navigation expands and collapses correctly', () => {
    renderNavigationBar();
    
    const collapseDiv = screen.getByRole('navigation').querySelector('.navbar-collapse');
    expect(collapseDiv).toHaveAttribute('id', 'main-navbar');
  });

  test('displays user greeting with correct formatting', () => {
    const mockUser = { id: 1, username: 'TestUser123', email: 'test@example.com' };
    renderNavigationBar(mockUser);
    
    const greeting = screen.getByText('Halo, TestUser123');
    expect(greeting).toHaveClass('text-secondary');
  });
});
