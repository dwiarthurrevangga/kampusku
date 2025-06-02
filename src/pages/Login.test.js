import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, __mockNavigate, __resetMocks } from 'react-router-dom';
import Login from './Login';
import { AuthContext } from '../context/AuthContext';

// Mock the useAuth hook
const mockLogin = jest.fn();

const renderLogin = (contextValue = { login: mockLogin }) => {
  return render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    mockLogin.mockClear();
    __mockNavigate.mockClear();
  });
  test('renders login form correctly', () => {
    renderLogin();
    
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Belum punya akun? Register')).toBeInTheDocument();
  });

  test('handles form submission with valid data', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ id: 1, username: 'testuser' });
    
    renderLogin();
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      await waitFor(() => {
      expect(__mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('shows error when username is empty', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.getByText('Username dan password wajib diisi')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('shows error when password is empty', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const usernameInput = screen.getByLabelText('Username');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    await user.type(usernameInput, 'testuser');
    await user.click(submitButton);
    
    expect(screen.getByText('Username dan password wajib diisi')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('shows error when both fields are empty', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: 'Login' });
    await user.click(submitButton);
    
    expect(screen.getByText('Username dan password wajib diisi')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('handles login API error with error message', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        data: { error: 'Invalid credentials' },
        statusText: 'Unauthorized'
      }
    };
    mockLogin.mockRejectedValue(error);
    
    renderLogin();
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');
    await user.click(submitButton);
      await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    expect(__mockNavigate).not.toHaveBeenCalled();
  });

  test('handles login API error with status text fallback', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        statusText: 'Server Error'
      }
    };
    mockLogin.mockRejectedValue(error);
    
    renderLogin();
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Server Error')).toBeInTheDocument();
    });
  });

  test('handles login API error with generic fallback', async () => {
    const user = userEvent.setup();
    const error = new Error('Network error');
    mockLogin.mockRejectedValue(error);
    
    renderLogin();
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Login gagal')).toBeInTheDocument();
    });
  });

  test('trims whitespace from username input', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ id: 1, username: 'testuser' });
    
    renderLogin();
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    await user.type(usernameInput, '  testuser  ');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
  });

  test('clears error message when resubmitting form', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    // First submission with empty fields
    await user.click(submitButton);
    expect(screen.getByText('Username dan password wajib diisi')).toBeInTheDocument();
    
    // Second submission - error should be cleared first
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    // Error should not be visible during the new submission
    expect(screen.queryByText('Username dan password wajib diisi')).not.toBeInTheDocument();
  });
});
