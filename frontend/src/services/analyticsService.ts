// frontend/src/services/analyticsService.ts
import api from './api';
import type { AnalyticsData } from '../types/types';

export const analyticsService = {
  async getPollAnalytics(pollId: string): Promise<AnalyticsData> {
    const response = await api.get(`/analytics/poll/${pollId}`);
    return response.data;
  },

  async getPublicResults(shareableLink: string): Promise<AnalyticsData> {
    const response = await api.get(`/analytics/public/${shareableLink}`);
    return response.data;
  },

  async publishResults(pollId: string, publish: boolean): Promise<{ isPublished: boolean }> {
    const response = await api.post(`/analytics/poll/${pollId}/publish`, { publish });
    return response.data;
  },

  async exportAnalyticsCSV(pollId: string): Promise<Blob> {
    const response = await api.get(`/analytics/poll/${pollId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  }
};