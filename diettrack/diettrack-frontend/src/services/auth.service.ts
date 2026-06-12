import api from './api';
import { User } from '../types';

export const authService = {
  async register(data: {
    name: string; email: string; password: string; age: number;
    gender: string; height: number; weight: number; activityLevel: string; goal: string;
  }) {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },

  async logout(refreshToken: string) {
    await api.post('/auth/logout', { refreshToken });
  },

  async getProfile(): Promise<User> {
    const res = await api.get('/profile');
    return res.data.data;
  },

  async updateProfile(data: Partial<User> & { currentPassword?: string; newPassword?: string }) {
    const res = await api.put('/profile', data);
    return res.data.data;
  },
};
