import api from './api';
import { WeightLog } from '../types';

export const weightService = {
  async getWeights(days?: number): Promise<WeightLog[]> {
    const params = days ? { days } : {};
    const res = await api.get('/weights', { params });
    return res.data.data;
  },

  async createWeight(data: { weight: number; date: string; notes?: string }): Promise<WeightLog> {
    const res = await api.post('/weights', data);
    return res.data.data;
  },

  async updateWeight(id: string, data: { weight?: number; notes?: string }): Promise<WeightLog> {
    const res = await api.put(`/weights/${id}`, data);
    return res.data.data;
  },

  async deleteWeight(id: string): Promise<void> {
    await api.delete(`/weights/${id}`);
  },
};
