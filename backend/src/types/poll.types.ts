// backend/src/types/poll.types.ts
import { Types } from 'mongoose';

export interface PollOptionType {
  _id: Types.ObjectId;
  text: string;
  order: number;
  responseCount: number;
}

export interface PollQuestionType {
  _id: Types.ObjectId;
  text: string;
  type: string;
  isMandatory: boolean;
  order: number;
  options: PollOptionType[];
}

export interface PollWithQuestionsType {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  creatorId: Types.ObjectId;
  shareableLink: string;
  expiryDate: Date;
  isActive: boolean;
  isPublished: boolean;
  responseMode: 'anonymous' | 'authenticated';
  totalResponses: number;
  createdAt: Date;
  updatedAt: Date;
  questions: PollQuestionType[];
}

export interface PaginatedPollsType {
  polls: any[];
  total: number;
  page: number;
  totalPages: number;
}

