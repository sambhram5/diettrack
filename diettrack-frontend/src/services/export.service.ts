import api from './api';

export const exportService = {
  async downloadCSV(type: 'meals' | 'weights' | 'water', from?: string, to?: string): Promise<void> {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const res = await api.get(`/export/${type}`, {
      params,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `diettrack-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  async getWeeklyReport() {
    const res = await api.get('/export-weekly');
    return res.data.data;
  },

  async searchHistory(q: string) {
    const res = await api.get('/search', { params: { q } });
    return res.data.data;
  },

  async getActivity(limit = 15) {
    const res = await api.get('/activity', { params: { limit } });
    return res.data.data;
  },
};
