import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import '@testing-library/jest-dom';

// Mock useAuth to control authentication state
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const MockProtectedComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  it('renders the protected component when authenticated', () => {
    // Mock isAuthenticated as true
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });

    const { getByText } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={<ProtectedRoute component={MockProtectedComponent} />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Check if protected content is rendered
    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    // Mock isAuthenticated as false
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });

    const { queryByText } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={<ProtectedRoute component={MockProtectedComponent} />}
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Check if redirected to login and protected content is not rendered
    expect(queryByText('Protected Content')).not.toBeInTheDocument();
    expect(queryByText('Login Page')).toBeInTheDocument();
  });
});
