// backend/src/services/response.service.ts
import { Response } from '../models/Response.model.js';
import { Poll } from '../models/Poll.model.js';
import { Option } from '../models/Option.model.js';
import { Question } from '../models/Question.model.js';
import { SubmitResponseDtoType } from '../dtos/response.dto.js';
import mongoose from 'mongoose';
import { PollWithQuestionsType, PollQuestionType, PollOptionType } from '../types/poll.types.js';

export class ResponseService {
  
  async submitResponse(
    pollLink: string, 
    answers: SubmitResponseDtoType['answers'],
    respondentId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ response: any; message: string; pollId: mongoose.Types.ObjectId }> {
    // No session/transaction - save directly
    try {
    //   // Find poll by shareable link
    //   const poll = await Poll.findOne({ shareableLink: pollLink });
    //   if (!poll) {
    //     throw new Error('Poll not found');
    //   }

    //   console.log('Poll found:', poll._id, 'Response mode:', poll.responseMode);
    //   console.log('Respondent ID provided:', respondentId);

    //   // If poll requires authentication, check if user is logged in
    // if (poll.responseMode === 'authenticated' && !respondentId) {
    //   throw new Error('Authentication required to submit this poll. Please log in.');
    // }
      
    //   // Check if poll is active and not expired
    //   if (!poll.isActive || poll.expiryDate < new Date()) {
    //     throw new Error('Poll is no longer accepting responses');
    //   }
      
    //   // Check if authenticated response mode requires login
    //   if (poll.responseMode === 'authenticated' && !respondentId) {
    //     throw new Error('Authentication required to submit this poll');
    //   }
      
    //   // Check if user has already responded (for authenticated mode)
    //   if (poll.responseMode === 'authenticated' && respondentId) {
    //     const existingResponse = await Response.findOne({
    //       pollId: poll._id,
    //       respondentId: respondentId
    //     });
        
    //     if (existingResponse) {
    //       throw new Error('You have already submitted a response to this poll');
    //     }

      // Find poll by shareable link
    const poll = await Poll.findOne({ shareableLink: pollLink });
    if (!poll) {
      throw new Error('Poll not found');
    }
    
    console.log('Submitting response - Poll Mode:', poll.responseMode);
    console.log('Has Respondent ID:', !!respondentId);
    
    // CHECK: If poll requires authentication and no user is logged in
    if (poll.responseMode === 'authenticated' && !respondentId) {
      console.log('REJECTED: Poll requires authentication but no user');
      throw new Error('This poll requires authentication. Please log in to submit.');
    }
    
    // CHECK: If poll is active and not expired
    if (!poll.isActive || poll.expiryDate < new Date()) {
      throw new Error('Poll is no longer accepting responses');
    }
    
    // For authenticated mode, check if user already responded
    if (poll.responseMode === 'authenticated' && respondentId) {
      const existingResponse = await Response.findOne({
        pollId: poll._id,
        respondentId: respondentId
      });
      
      if (existingResponse) {
        throw new Error('You have already submitted a response to this poll');
      }


      }
      
      // Validate that all mandatory questions are answered
      const questions = await Question.find({ pollId: poll._id });
      const mandatoryQuestions = questions.filter(q => q.isMandatory);
      const answeredQuestionIds = answers.map(a => a.questionId);
      
      for (const mandatory of mandatoryQuestions) {
        if (!answeredQuestionIds.includes(mandatory._id.toString())) {
          throw new Error(`Mandatory question is not answered`);
        }
      }
      
      // Create response
      const response = new Response({
        pollId: poll._id,
        respondentId: respondentId || null,
        isAnonymous: !respondentId,
        answers: answers.map(ans => ({
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId,
          answeredAt: new Date()
        })),
        ipAddress,
        userAgent,
        submittedAt: new Date()
      });
      
      await response.save();
      
      // Update option response counts
      for (const answer of answers) {
        await Option.findByIdAndUpdate(
          answer.selectedOptionId,
          { $inc: { responseCount: 1 } }
        );
      }
      
      // Increment total responses for poll
      await Poll.findByIdAndUpdate(
        poll._id,
        { $inc: { totalResponses: 1 } }
      );
      
      return { 
        response: response.toObject(), 
        message: 'Response submitted successfully',
        pollId: poll._id
      };
      
    } catch (error) {
      console.error('Submit response error:', error);
      throw error;
    }
  }
  
  async getPollResponses(pollId: string, creatorId: string): Promise<any[]> {
    const poll = await Poll.findOne({ _id: pollId, creatorId });
    if (!poll) {
      throw new Error('Poll not found or unauthorized');
    }
    
    const responses = await Response.find({ pollId })
      .populate('respondentId', 'name email')
      .sort({ submittedAt: -1 })
      .lean();
    
    return responses;
  }
  
  async getResponseCount(pollId: string): Promise<{ pollId: string; responseCount: number }> {
    const count = await Response.countDocuments({ pollId });
    return { pollId, responseCount: count };
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
}