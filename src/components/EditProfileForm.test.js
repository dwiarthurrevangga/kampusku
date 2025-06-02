import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditProfileForm from './EditProfileForm';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

// Mock the API module
jest.mock('../api', () => ({
  put: jest.fn(),
}));

const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
const mockUpdateUser = jest.fn();
const mockOnCancel = jest.fn();

const renderEditProfileForm = (
  user = mockUser,
  updateUser = mockUpdateUser,
  onCancel = mockOnCancel
) => {
  const authValue = {
    user,
    updateUser
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <EditProfileForm user={user} onCancel={onCancel} />
    </AuthContext.Provider>
  );
};

describe('EditProfileForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateUser.mockClear();
    mockOnCancel.mockClear();
  });

  test('renders form with current user data', () => {
    renderEditProfileForm();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test('updates profile successfully', async () => {
    const user = userEvent.setup();
    const updatedUser = { id: 1, username: 'updateduser', email: 'updated@example.com' };
    
    mock.onPut('/users/1').reply(200, updatedUser);
    
    renderEditProfileForm();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const saveButton = screen.getByText('Save');
    
    await user.clear(usernameInput);
    await user.type(usernameInput, 'updateduser');
    await user.clear(emailInput);
    await user.type(emailInput, 'updated@example.com');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  test('shows error when username is empty', async () => {
    const user = userEvent.setup();
    renderEditProfileForm();
    
    const usernameInput = screen.getByLabelText('Username');
    const saveButton = screen.getByText('Save');
    
    await user.clear(usernameInput);
    await user.click(saveButton);
    
    expect(screen.getByText('Username dan email tidak boleh kosong.')).toBeInTheDocument();
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  test('shows error when email is empty', async () => {
    const user = userEvent.setup();
    renderEditProfileForm();
    
    const emailInput = screen.getByLabelText('Email');
    const saveButton = screen.getByText('Save');
    
    await user.clear(emailInput);
    await user.click(saveButton);
    
    expect(screen.getByText('Username dan email tidak boleh kosong.')).toBeInTheDocument();
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  test('shows error when fields contain only whitespace', async () => {
    const user = userEvent.setup();
    renderEditProfileForm();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const saveButton = screen.getByText('Save');
    
    await user.clear(usernameInput);
    await user.type(usernameInput, '   ');
    await user.clear(emailInput);
    await user.type(emailInput, '   ');
    await user.click(saveButton);
    
    expect(screen.getByText('Username dan email tidak boleh kosong.')).toBeInTheDocument();
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  test('trims whitespace from input values', async () => {
    const user = userEvent.setup();
    const updatedUser = { id: 1, username: 'trimmeduser', email: 'trimmed@example.com' };
    
    mock.onPut('/users/1').reply(config => {
      const data = JSON.parse(config.data);
      expect(data.username).toBe('trimmeduser');
      expect(data.email).toBe('trimmed@example.com');
      return [200, updatedUser];
    });
    
    renderEditProfileForm();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const saveButton = screen.getByText('Save');
    
    await user.clear(usernameInput);
    await user.type(usernameInput, '  trimmeduser  ');
    await user.clear(emailInput);
    await user.type(emailInput, '  trimmed@example.com  ');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
    });
  });

  test('handles API error gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mock.onPut('/users/1').reply(400, { error: 'Username already taken' });
    
    renderEditProfileForm();
    
    const usernameInput = screen.getByLabelText('Username');
    const saveButton = screen.getByText('Save');
    
    await user.clear(usernameInput);
    await user.type(usernameInput, 'existinguser');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username already taken')).toBeInTheDocument();
    });
    
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('handles API error without error message', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mock.onPut('/users/1').reply(500);
    
    renderEditProfileForm();
    
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Gagal memperbarui profil')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('cancel button calls onCancel', async () => {
    const user = userEvent.setup();
    renderEditProfileForm();
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  test('shows loading state while saving', async () => {
    const user = userEvent.setup();
    
    // Mock a slow response
    mock.onPut('/users/1').reply(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve([200, mockUser]), 1000);
      });
    });
    
    renderEditProfileForm();
    
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    // Check if button shows spinner and is disabled
    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
    expect(saveButton).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  test('disables form inputs while saving', async () => {
    const user = userEvent.setup();
    
        mock.onPut('/users/1').reply(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve([200, mockUser]), 1000);
      });
    });
    
    renderEditProfileForm();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const saveButton = screen.getByText('Save');
    
    await user.click(saveButton);
    
    expect(usernameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
  });

  test('clears error message when resubmitting', async () => {
    const user = userEvent.setup();
    renderEditProfileForm();
    
    const usernameInput = screen.getByLabelText('Username');
    const saveButton = screen.getByText('Save');
    
    // First submission with empty username
    await user.clear(usernameInput);
    await user.click(saveButton);
    expect(screen.getByText('Username dan email tidak boleh kosong.')).toBeInTheDocument();
    
    // Second submission should clear error
    await user.type(usernameInput, 'validuser');
    await user.click(saveButton);
    
    expect(screen.queryByText('Username dan email tidak boleh kosong.')).not.toBeInTheDocument();
  });
});
