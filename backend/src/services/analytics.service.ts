// backend/src/services/analytics.service.ts
import { Response } from '../models/Response.model.js';
import { Poll } from '../models/Poll.model.js';
import { Question } from '../models/Question.model.js';
import { Option } from '../models/Option.model.js';
import { AnalyticsFilterDtoType } from '../dtos/analytics.dto.js';
import mongoose, { Types } from 'mongoose';

// Define simple types
interface SimpleOption {
  id: Types.ObjectId;
  text: string;
  votes: number;
  percentage: number;
}

interface SimpleQuestion {
  id: Types.ObjectId;
  text: string;
  isMandatory: boolean;
  options: SimpleOption[];
  totalResponses: number;
  responseRate: number;
}

interface TimelinePoint {
  date: string;
  responses: number;
}

interface PollAnalytics {
  poll: {
    id: Types.ObjectId;
    title: string;
    description?: string;
    totalResponses: number;
    createdAt: Date;
    expiryDate: Date;
    isPublished: boolean;
  };
  questions: SimpleQuestion[];
  timeline: TimelinePoint[];
  summary: {
    completionRate: number;
    averageResponseTime: number | null;
  };
}

export class AnalyticsService {
  
  async getPollAnalytics(
    pollId: string, 
    creatorId: string, 
    filters?: AnalyticsFilterDtoType
  ): Promise<PollAnalytics> {
    // Verify ownership
    const poll = await Poll.findOne({ _id: pollId, creatorId }).lean();
    if (!poll) {
      throw new Error('Poll not found or unauthorized');
    }
    
    // Get all questions with their options
    const questions = await Question.find({ pollId })
      .sort({ order: 1 })
      .lean();
    
    const questionsWithStats: SimpleQuestion[] = await Promise.all(
      questions.map(async (question) => {
        const options = await Option.find({ questionId: question._id })
          .sort({ order: 1 })
          .lean();
        
        const totalResponses = options.reduce((sum, opt) => sum + opt.responseCount, 0);
        
        // Convert options to simple objects with string text
        const optionsWithPercentage: SimpleOption[] = options.map(opt => ({
          id: opt._id,
          text: String(opt.text), // Convert to string explicitly
          votes: opt.responseCount,
          percentage: totalResponses > 0 ? (opt.responseCount / totalResponses) * 100 : 0
        }));
        
        return {
          id: question._id,
          text: String(question.text), // Convert to string explicitly
          isMandatory: question.isMandatory,
          options: optionsWithPercentage,
          totalResponses,
          responseRate: poll.totalResponses > 0 ? (totalResponses / poll.totalResponses) * 100 : 0
        };
      })
    );
    
    // Get response timeline
    const timeline = await this.getResponseTimeline(pollId, filters);
    
    return {
      poll: {
        id: poll._id,
        title: String(poll.title),
        description: poll.description ? String(poll.description) : undefined,
        totalResponses: poll.totalResponses,
        createdAt: poll.createdAt,
        expiryDate: poll.expiryDate,
        isPublished: poll.isPublished
      },
      questions: questionsWithStats,
      timeline,
      summary: {
        completionRate: await this.getCompletionRate(pollId),
        averageResponseTime: null
      }
    };
  }
  
  async getQuestionSummary(
    questionId: string, 
    creatorId: string
  ): Promise<any> {
    const question = await Question.findById(questionId).lean();
    if (!question) {
      throw new Error('Question not found');
    }
    
    // Verify ownership through poll
    const poll = await Poll.findOne({ 
      _id: question.pollId, 
      creatorId 
    }).lean();
    
    if (!poll) {
      throw new Error('Unauthorized');
    }
    
    const options = await Option.find({ questionId })
      .sort({ order: 1 })
      .lean();
    
    const totalVotes = options.reduce((sum, opt) => sum + opt.responseCount, 0);
    
    return {
      question: {
        id: question._id,
        text: String(question.text),
        isMandatory: question.isMandatory
      },
      options: options.map(opt => ({
        id: opt._id,
        text: String(opt.text),
        votes: opt.responseCount,
        percentage: totalVotes > 0 ? (opt.responseCount / totalVotes) * 100 : 0
      })),
      totalVotes,
      pollTitle: String(poll.title)
    };
  }
  
  async getPublicResults(shareableLink: string): Promise<PollAnalytics> {
    const poll = await Poll.findOne({ shareableLink }).lean();
    if (!poll) {
      throw new Error('Poll not found');
    }
    
    if (!poll.isPublished) {
      throw new Error('Results have not been published yet');
    }
    
    return this.getPollAnalytics(poll._id.toString(), poll.creatorId.toString());
  }
  
  async publishResults(
    pollId: string, 
    creatorId: string, 
    publish: boolean
  ): Promise<{ isPublished: boolean; message: string }> {
    const poll = await Poll.findOne({ _id: pollId, creatorId });
    if (!poll) {
      throw new Error('Poll not found or unauthorized');
    }
    
    poll.isPublished = publish;
    await poll.save();
    
    return { 
      isPublished: poll.isPublished,
      message: publish ? 'Results published successfully' : 'Results unpublished' 
    };
  }
  
  private async getResponseTimeline(
    pollId: string, 
    filters?: AnalyticsFilterDtoType
  ): Promise<{ date: string; responses: number }[]> {
    const matchStage: any = { pollId: new mongoose.Types.ObjectId(pollId) };
    
    if (filters?.startDate) {
      matchStage.submittedAt = { $gte: new Date(filters.startDate) };
    }
    if (filters?.endDate) {
      matchStage.submittedAt = { ...matchStage.submittedAt, $lte: new Date(filters.endDate) };
    }
    
    const timeline = await Response.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' },
            day: { $dayOfMonth: '$submittedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    return timeline.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      responses: item.count
    }));
  }
  
  private async getCompletionRate(pollId: string): Promise<number> {
    const totalResponses = await Response.countDocuments({ pollId });
    const poll = await Poll.findById(pollId).lean();
    
    if (!poll || poll.totalResponses === 0) return 0;
    return (totalResponses / poll.totalResponses) * 100;
  }
}