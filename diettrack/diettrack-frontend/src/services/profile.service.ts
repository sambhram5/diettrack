import { api } from './api';
import { User } from '../types';

export const profileService = {
  getProfile: async (): Promise<User> => {
    const res = await api.get('/profile');
    return res.data.data;
  },
  updateProfile: async (data: Partial<User> & { currentPassword?: string; newPassword?: string }): Promise<User> => {
    const res = await api.put('/profile', data);
    return res.data.data;
  },
};
