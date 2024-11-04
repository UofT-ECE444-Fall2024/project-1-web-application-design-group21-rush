import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

describe('useAuth Hook', () => {
  it('provides isAuthenticated as false by default', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('updates isAuthenticated to true after login', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.login('dummyToken');
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('updates isAuthenticated to false after logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.login('dummyToken');
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
