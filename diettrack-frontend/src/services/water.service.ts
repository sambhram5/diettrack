import api from './api';
import { WaterLog } from '../types';

export interface DailyWaterData {
  logs: WaterLog[];
  total: number;
}

export const waterService = {
  async getWater(date?: string): Promise<DailyWaterData> {
    const params = date ? { date } : {};
    const res = await api.get('/water', { params });
    return res.data.data;
  },

  async logWater(data: { amount: number; date: string }): Promise<WaterLog> {
    const res = await api.post('/water', data);
    return res.data.data;
  },

  async deleteWater(id: string): Promise<void> {
    await api.delete(`/water/${id}`);
  },
};
