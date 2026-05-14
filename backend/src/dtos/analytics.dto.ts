// backend/src/dtos/analytics.dto.ts
import { z } from 'zod';

export const AnalyticsFilterDto = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  questionId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
}).partial();

export const PublishResultsDto = z.object({
  pollId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid poll ID'),
  publish: z.boolean(),
});

export type AnalyticsFilterDtoType = z.infer<typeof AnalyticsFilterDto>;
export type PublishResultsDtoType = z.infer<typeof PublishResultsDto>;