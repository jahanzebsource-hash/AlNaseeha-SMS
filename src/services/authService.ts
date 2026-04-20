import { UserProfile } from '../types';

const AUTH_KEY = 'school_app_auth_user';

export const authService = {
  login: async (loginId: string, password: string): Promise<UserProfile | null> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginId, password }),
      });
      
      if (!response.ok) {
        return null;
      }
      
      const profile = await response.json();
      localStorage.setItem(AUTH_KEY, JSON.stringify(profile));
      return profile;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser: (): UserProfile | null => {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_KEY);
  }
};
