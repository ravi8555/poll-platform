// backend/src/dtos/poll.dto.ts
import { z } from 'zod';

export const OptionDto = z.object({
  text: z.string().min(1, 'Option text is required').max(500),
  order: z.number().int().min(0).default(0),
});

export const QuestionDto = z.object({
  text: z.string().min(1, 'Question text is required').max(1000),
  type: z.enum(['single-select']).default('single-select'),
  isMandatory: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  options: z.array(OptionDto).min(2, 'Each question must have at least 2 options'),
});

export const CreatePollDto = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  questions: z.array(QuestionDto).min(1, 'Poll must have at least 1 question'),
  expiryDate: z.string().datetime('Invalid date format'),
  responseMode: z.enum(['anonymous', 'authenticated']).default('anonymous'),
});

export const UpdatePollDto = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  expiryDate: z.string().datetime().optional(),
  responseMode: z.enum(['anonymous', 'authenticated']).optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const PollShareDto = z.object({
  pollId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid poll ID'),
});

export type CreatePollDtoType = z.infer<typeof CreatePollDto>;
export type UpdatePollDtoType = z.infer<typeof UpdatePollDto>;
export type QuestionDtoType = z.infer<typeof QuestionDto>;
export type OptionDtoType = z.infer<typeof OptionDto>;