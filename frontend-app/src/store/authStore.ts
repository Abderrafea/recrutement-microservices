import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSummary } from '../types/user.types';

interface AuthStore {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: UserSummary, token: string) => void;
  logout: () => void;
  setUser: (user: UserSummary) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set((state) => ({ ...state, user })),
    }),
    { name: 'recruitment-auth' },
  ),
);
