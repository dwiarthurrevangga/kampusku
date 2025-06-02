import React from 'react';

const mockNavigate = jest.fn();
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
};

const mockParams = {};

export const useNavigate = () => mockNavigate;

export const useLocation = () => mockLocation;

export const useParams = () => mockParams;

export const MemoryRouter = ({ children }) => children;

export const Link = ({ children, to, ...props }) => 
  React.createElement('a', { href: to, ...props }, children);

export const NavLink = ({ children, to, ...props }) => 
  React.createElement('a', { href: to, ...props }, children);

export const Routes = ({ children }) => children;

export const Route = ({ element }) => element;

export const BrowserRouter = ({ children }) => children;

export const Navigate = ({ to, replace }) => 
  React.createElement('div', { 'data-testid': 'navigate', 'data-to': to, 'data-replace': replace });

// Reset function for testing
export const __resetMocks = () => {
  mockNavigate.mockClear();
};

// Export the mock functions for test access
export const __mockNavigate = mockNavigate;
export const __mockLocation = mockLocation;
export const __mockParams = mockParams;
