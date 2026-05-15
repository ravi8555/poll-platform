
// backend/src/services/poll.service.ts
import { Poll } from '../models/Poll.model.js';
import { Question } from '../models/Question.model.js';
import { Option } from '../models/Option.model.js';
import { CreatePollDtoType, UpdatePollDtoType } from '../dtos/poll.dto.js';
import { generateShareableLink } from '../utils/generateLink.js';
import mongoose, { FlattenMaps } from 'mongoose';
import { IPoll } from '../models/Poll.model.js';
import { PollWithQuestionsType, PaginatedPollsType } from '../types/poll.types.js';

export class PollService {
  
  async createPoll(creatorId: string, pollData: CreatePollDtoType): Promise<{ poll: any; message: string }> {
    try {
      const poll = new Poll({
        title: pollData.title,
        description: pollData.description,
        creatorId: creatorId,
        shareableLink: generateShareableLink(),
        expiryDate: new Date(pollData.expiryDate),
        responseMode: pollData.responseMode,
        isActive: true,
        isPublished: false,
        totalResponses: 0
      });
      
      await poll.save();
      
      for (const questionData of pollData.questions) {
        const question = new Question({
          pollId: poll._id,
          text: questionData.text,
          type: questionData.type,
          isMandatory: questionData.isMandatory,
          order: questionData.order
        });
        
        await question.save();
        
        for (const optionData of questionData.options) {
          const option = new Option({
            questionId: question._id,
            text: optionData.text,
            order: optionData.order,
            responseCount: 0
          });
          
          await option.save();
        }
      }
      
      const pollObject = poll.toObject();
      return { poll: pollObject, message: 'Poll created successfully' };
      
    } catch (error) {
      console.error('Create poll error:', error);
      throw error;
    }
  }
  
  async getPollById(pollId: string): Promise<PollWithQuestionsType> {
    const poll = await Poll.findById(pollId).lean();
    if (!poll) {
      throw new Error('Poll not found');
    }
    
    const questions = await Question.find({ pollId: pollId })
      .sort({ order: 1 })
      .lean();
    
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await Option.find({ questionId: question._id })
          .sort({ order: 1 })
          .lean();
        
        const transformedOptions = options.map(opt => ({
          _id: opt._id,
          text: String(opt.text),
          order: opt.order,
          responseCount: opt.responseCount
        }));
        
        return {
          _id: question._id,
          text: String(question.text),
          type: question.type,
          isMandatory: question.isMandatory,
          order: question.order,
          options: transformedOptions
        };
      })
    );
    
    return {
      _id: poll._id,
      title: String(poll.title),
      description: poll.description ? String(poll.description) : undefined,
      creatorId: poll.creatorId,
      shareableLink: poll.shareableLink,
      expiryDate: poll.expiryDate,
      isActive: poll.isActive,
      isPublished: poll.isPublished,
      responseMode: poll.responseMode as 'anonymous' | 'authenticated',
      totalResponses: poll.totalResponses,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      questions: questionsWithOptions
    };
  }
  
  async getPollByLink(shareableLink: string): Promise<PollWithQuestionsType> {
    const poll = await Poll.findOne({ shareableLink }).lean();
    if (!poll) {
      throw new Error('Poll not found');
    }
    
    if (poll.expiryDate < new Date() || !poll.isActive) {
      throw new Error('Poll has expired');
    }
    
    const questions = await Question.find({ pollId: poll._id })
      .sort({ order: 1 })
      .lean();
    
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await Option.find({ questionId: question._id })
          .sort({ order: 1 })
          .lean();
        
        const transformedOptions = options.map(opt => ({
          _id: opt._id,
          text: String(opt.text),
          order: opt.order,
          responseCount: opt.responseCount
        }));
        
        return {
          _id: question._id,
          text: String(question.text),
          type: question.type,
          isMandatory: question.isMandatory,
          order: question.order,
          options: transformedOptions
        };
      })
    );
    
    return {
      _id: poll._id,
      title: String(poll.title),
      description: poll.description ? String(poll.description) : undefined,
      creatorId: poll.creatorId,
      shareableLink: poll.shareableLink,
      expiryDate: poll.expiryDate,
      isActive: poll.isActive,
      isPublished: poll.isPublished,
      responseMode: poll.responseMode as 'anonymous' | 'authenticated',
      totalResponses: poll.totalResponses,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      questions: questionsWithOptions
    };
  }
  
  async getUserPolls(creatorId: string, page: number = 1, limit: number = 10): Promise<PaginatedPollsType> {
    const skip = (page - 1) * limit;
    
    const [polls, total] = await Promise.all([
      Poll.find({ creatorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Poll.countDocuments({ creatorId })
    ]);
    
    return {
      polls,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  async updatePoll(pollId: string, creatorId: string, updateData: UpdatePollDtoType): Promise<FlattenMaps<IPoll>> {
    const poll = await Poll.findOne({ _id: pollId, creatorId });
    if (!poll) {
      throw new Error('Poll not found or unauthorized');
    }
    
    Object.assign(poll, updateData);
    await poll.save();
    
    return poll.toObject();
  }
  
  async deletePoll(pollId: string, creatorId: string): Promise<{ message: string }> {
    // No transaction - just delete sequentially
    try {
      const poll = await Poll.findOne({ _id: pollId, creatorId });
      if (!poll) {
        throw new Error('Poll not found or unauthorized');
      }
      
      // Delete all options for questions in this poll
      const questions = await Question.find({ pollId });
      for (const question of questions) {
        await Option.deleteMany({ questionId: question._id });
      }
      
      // Delete all questions
      await Question.deleteMany({ pollId });
      
      // Delete the poll
      await Poll.deleteOne({ _id: pollId });
      
      return { message: 'Poll deleted successfully' };
      
    } catch (error) {
      console.error('Delete poll error:', error);
      throw error;
    }
  }
  
  async isPollActive(pollId: string): Promise<boolean> {
    const poll = await Poll.findById(pollId);
    if (!poll) return false;
    
    return poll.isActive && poll.expiryDate > new Date();
  }
  
  // Add this method for public access
  async getPollByLinkForResponse(shareableLink: string): Promise<PollWithQuestionsType> {
    return this.getPollByLink(shareableLink);
  }
}