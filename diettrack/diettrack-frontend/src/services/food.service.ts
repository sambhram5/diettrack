import api from './api';
import { Food } from '../types';

export const foodService = {
  async getFoods(search?: string): Promise<Food[]> {
    const params = search ? { search } : {};
    const res = await api.get('/foods', { params });
    return res.data.data;
  },

  async createFood(data: Omit<Food, 'id' | 'isCustom' | 'createdBy'>): Promise<Food> {
    const res = await api.post('/foods', data);
    return res.data.data;
  },

  async updateFood(id: string, data: Partial<Food>): Promise<Food> {
    const res = await api.put(`/foods/${id}`, data);
    return res.data.data;
  },

  async deleteFood(id: string): Promise<void> {
    await api.delete(`/foods/${id}`);
  },
};
