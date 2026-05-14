// backend/src/dtos/response.dto.ts
import { z } from 'zod';

export const AnswerDto = z.object({
  questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid question ID'),
  selectedOptionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid option ID'),
});

export const SubmitResponseDto = z.object({
  pollLink: z.string().min(1, 'Poll link is required'),  // This expects the shareable link string
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptionId: z.string(),
  })),
});
export const AnonymousResponseDto = z.object({
  pollId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid poll ID'),
  answers: z.array(AnswerDto),
});

export type SubmitResponseDtoType = z.infer<typeof SubmitResponseDto>;
export type AnswerDtoType = z.infer<typeof AnswerDto>;