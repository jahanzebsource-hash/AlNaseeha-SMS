import { UserProfile, UserRole } from '../types';

const AUTH_KEY = 'school_app_auth_user';

export const MOCK_USERS: (UserProfile & { password: string })[] = [
  {
    id: 'u1',
    email: 'principal@smart.edu',
    name: 'Muhammad Jahanzeb',
    role: 'principal',
    password: '123',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u2',
    email: 'accountant@smart.edu',
    name: 'Mr. Siddiqui',
    role: 'accountant',
    password: '123',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u3',
    email: 'jameel@smart.edu',
    name: 'Dr. Jameel',
    role: 'teacher',
    assignedClass: '10', // Teacher of Grade 10
    password: '123',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u4',
    email: 'ali@smart.edu',
    name: 'Ali Khan',
    role: 'student',
    password: '123',
    createdAt: new Date().toISOString()
  }
];

export const authService = {
  login: (email: string, password: string): UserProfile | null => {
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      const { password, ...profile } = user;
      localStorage.setItem(AUTH_KEY, JSON.stringify(profile));
      return profile;
    }
    return null;
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
