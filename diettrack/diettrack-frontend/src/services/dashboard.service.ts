import api from './api';
import { DashboardData, AnalyticsData } from '../types';

export const dashboardService = {
  async getDashboard(date?: string): Promise<DashboardData> {
    const params = date ? { date } : {};
    const res = await api.get('/dashboard', { params });
    return res.data.data;
  },

  async getAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsData> {
    const res = await api.get('/analytics', { params: { period } });
    return res.data.data;
  },
};
