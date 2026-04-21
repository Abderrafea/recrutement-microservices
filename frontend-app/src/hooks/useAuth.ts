import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  return useMemo(
    () => ({
      user,
      token,
      logout,
      isAuthenticated: Boolean(user && token),
    }),
    [logout, token, user],
  );
}
