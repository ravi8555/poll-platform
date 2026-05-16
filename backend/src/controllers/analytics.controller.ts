// backend/src/controllers/analytics.controller.ts
import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { AnalyticsFilterDto, PublishResultsDto } from '../dtos/analytics.dto.js';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  // Get complete analytics for a poll
  async getPollAnalytics(req: Request, res: Response) {
    try {
      const { pollId } = req.params;
      const filters = AnalyticsFilterDto.parse(req.query);
      
      const analytics = await analyticsService.getPollAnalytics(
        pollId, 
        req.user!.id, 
        filters
      );
      
      res.json(analytics);
    } catch (error: any) {
      if (error.message.includes('unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get specific question summary
  async getQuestionSummary(req: Request, res: Response) {
    try {
      const { questionId } = req.params;
      const summary = await analyticsService.getQuestionSummary(questionId, req.user!.id);
      res.json(summary);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  }
  
  // Get public results (no auth required)
  async getPublicResults(req: Request, res: Response) {
    try {
      const { shareableLink } = req.params;
      const results = await analyticsService.getPublicResults(shareableLink);
      res.json(results);
    } catch (error: any) {
      if (error.message === 'Results have not been published yet') {
        return res.status(403).json({ error: error.message });
      }
      res.status(404).json({ error: error.message });
    }
  }
  
  // Publish or unpublish poll results
  async publishResults(req: Request, res: Response) {
    try {
      const { pollId } = req.params;
      const { publish } = req.body;
      
      const result = await analyticsService.publishResults(pollId, req.user!.id, publish);
      res.json(result);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  }
  
  // Export analytics as CSV
  async exportAnalyticsCSV(req: Request, res: Response) {
    try {
      const { pollId } = req.params;
      const analytics = await analyticsService.getPollAnalytics(pollId, req.user!.id);
      
      // Convert to CSV format
      let csv = 'Question,Option,Votes,Percentage\n';
      
      
      for (const question of analytics.questions) {
        for (const option of question.options) {
          // console.log('CSV OPTION:', option);
          csv += `"${question.text}","${option.text}",${option.votes},${option.percentage.toFixed(2)}%\n`;
        }
      }
      
      res.setHeader('Content-Type', 'text/csv');
      // res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=poll_${pollId}_analytics.csv`);
      // console.log(csv);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}