// frontend/src/types/index.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  token?:string,
  oidcId?: string;
  createdAt: string;
}

export interface Option {
  _id: string;
  text: string;
  order: number;
  responseCount: number;
}

export interface Question {
  _id: string;
  text: string;
  type: 'single-select';
  isMandatory: boolean;
  order: number;
  options: Option[];
}

export interface Poll {
  _id: string;
  title: string;
  description?: string;
  creatorId: string;
  shareableLink: string;
  expiryDate: string;
  isActive: boolean;
  isPublished: boolean;
  responseMode: 'anonymous' | 'authenticated';
  totalResponses: number;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}
export interface AnalyticsData {
  poll: {
    id: string;
    title: string;
    description?: string;
    totalResponses: number;
    createdAt: string;
    expiryDate: string;
    isPublished: boolean;
  };
  questions: Array<{
    id: string;
    text: string;
    isMandatory: boolean;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      percentage: number;
    }>;
    totalResponses: number;
    responseRate: number;
  }>;
  timeline: Array<{
    date: string;
    responses: number;
  }>;
  summary: {
    completionRate: number;
    averageResponseTime: number | null;
  };
}
export interface CreatePollData {
  title: string;
  description?: string;
  questions: {
    text: string;
    type: 'single-select';
    isMandatory: boolean;
    order: number;
    options: { text: string; order: number }[];
  }[];
  expiryDate: string;
  responseMode: 'anonymous' | 'authenticated';
}

export interface ResponseSubmit {
  pollLink: string;
  answers: {
    questionId: string;
    selectedOptionId: string;
  }[];
}

export interface AnalyticsData {
  poll: {
    id: string;
    title: string;
    description?: string;
    totalResponses: number;
    createdAt: string;
    expiryDate: string;
    isPublished: boolean;
  };
  questions: Array<{
    id: string;
    text: string;
    isMandatory: boolean;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      percentage: number;
    }>;
    totalResponses: number;
    responseRate: number;
  }>;
  timeline: Array<{
    date: string;
    responses: number;
  }>;
  summary: {
    completionRate: number;
    averageResponseTime: number | null;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  oidcLogin: () => void;
  logout: () => Promise<void>;
}