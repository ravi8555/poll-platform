// frontend/src/services/pollService.ts
import api from './api';
import type { Poll, CreatePollData } from '../types/types';

export const pollService = {
  async createPoll(data: CreatePollData): Promise<Poll> {
    const response = await api.post('/polls', data);
    return response.data.poll;
  },

  async getMyPolls(page = 1, limit = 10): Promise<{ polls: Poll[]; total: number; page: number; totalPages: number }> {
    const response = await api.get(`/polls/my-polls?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getPollById(id: string): Promise<Poll> {
    const response = await api.get(`/polls/${id}`);
    return response.data;
  },

  // async getPollByLink(link: string): Promise<Poll> {
  //   const response = await api.get(`/responses/poll/${link}`);
  //   return response.data;
  // },

  async getPollByLink(link: string): Promise<Poll> {
  try {
    console.log('Fetching poll by link:', link);
    const response = await api.get(`/responses/poll/${link}`);
    console.log('Poll response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching poll by link:', error);
    throw error;
  }
},

  async updatePoll(id: string, data: Partial<CreatePollData>): Promise<Poll> {
    const response = await api.put(`/polls/${id}`, data);
    return response.data.poll;
  },

  async deletePoll(id: string): Promise<void> {
    await api.delete(`/polls/${id}`);
  },

  async publishResults(id: string, publish: boolean): Promise<{ isPublished: boolean }> {
    const response = await api.post(`/analytics/poll/${id}/publish`, { publish });
    return response.data;
  }
};