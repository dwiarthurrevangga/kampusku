import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, __mockNavigate, __resetMocks } from 'react-router-dom';
import Register from './Register';
import { AuthContext } from '../context/AuthContext';

const mockRegister = jest.fn();

const renderRegister = (contextValue = { register: mockRegister }) => {
  return render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Register Component', () => {
  beforeEach(() => {    mockRegister.mockClear();
    __mockNavigate.mockClear();
  });

  test('renders register form correctly', () => {
    renderRegister();
      expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByText('Sudah punya akun?')).toBeInTheDocument();
  });

  test('handles successful registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ id: 1, username: 'newuser', email: 'new@example.com' });
    
    renderRegister();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
      expect(mockRegister).toHaveBeenCalledWith('newuser', 'new@example.com', 'password123');
    
    await waitFor(() => {
      expect(__mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('shows error when username is empty', async () => {
    const user = userEvent.setup();
    renderRegister();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.getByText('Semua field wajib diisi')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('shows error when email is empty', async () => {
    const user = userEvent.setup();
    renderRegister();
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.getByText('Semua field wajib diisi')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('shows error when password is empty', async () => {
    const user = userEvent.setup();
    renderRegister();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    expect(screen.getByText('Semua field wajib diisi')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('trims whitespace from username and email', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ id: 1, username: 'newuser', email: 'new@example.com' });
    
    renderRegister();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    await user.type(usernameInput, '  newuser  ');
    await user.type(emailInput, '  new@example.com  ');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(mockRegister).toHaveBeenCalledWith('newuser', 'new@example.com', 'password123');
  });

  test('handles registration error with error message', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        data: { error: 'Username already taken' },
        statusText: 'Bad Request'
      }
    };
    mockRegister.mockRejectedValue(error);
    
    renderRegister();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    await user.type(usernameInput, 'existinguser');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
      await waitFor(() => {
      expect(screen.getByText('Username already taken')).toBeInTheDocument();
    });
    
    expect(__mockNavigate).not.toHaveBeenCalled();
  });

  test('handles registration error with status text fallback', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        statusText: 'Internal Server Error'
      }
    };
    mockRegister.mockRejectedValue(error);
    
    renderRegister();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });
  });

  test('handles registration error with generic fallback', async () => {
    const user = userEvent.setup();
    const error = new Error('Network error');
    mockRegister.mockRejectedValue(error);
    
    renderRegister();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Registrasi gagal')).toBeInTheDocument();
    });
  });

  test('clears error message when resubmitting form', async () => {
    const user = userEvent.setup();
    renderRegister();
    
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    // First submission with empty fields
    await user.click(submitButton);
    expect(screen.getByText('Semua field wajib diisi')).toBeInTheDocument();
    
    // Fill fields and submit again - error should be cleared
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.queryByText('Semua field wajib diisi')).not.toBeInTheDocument();
  });

  test('shows error when fields contain only whitespace', async () => {
    const user = userEvent.setup();
    renderRegister();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    await user.type(usernameInput, '   ');
    await user.type(emailInput, '   ');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.getByText('Semua field wajib diisi')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });
});
