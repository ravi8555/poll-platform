
// // backend/src/services/poll.service.ts
// import { Poll } from '../models/Poll.model.js';
// import { Question } from '../models/Question.model.js';
// import { Option } from '../models/Option.model.js';
// import { CreatePollDtoType, UpdatePollDtoType } from '../dtos/poll.dto.js';
// import { generateShareableLink } from '../utils/generateLink.js';
// import mongoose, { FlattenMaps } from 'mongoose';
// import { IQuestion } from '../models/Question.model.js';
// import { IOption } from '../models/Option.model.js';
// import { IPoll } from '../models/Poll.model.js';
// import { PollWithQuestionsType, PaginatedPollsType } from '../types/poll.types.js'; // Add this import

// export class PollService {
  
// //  async createPoll(creatorId: string, pollData: CreatePollDtoType): Promise<{ poll: any; message: string }> {
// //   console.log('Creating poll for user:', creatorId);
// //   console.log('Poll data:', JSON.stringify(pollData, null, 2));
  
// //   const session = await mongoose.startSession();
// //   session.startTransaction();
  
// //   try {
// //     // Create poll
// //     const poll = new Poll({
// //       title: pollData.title,
// //       description: pollData.description,
// //       creatorId: creatorId,
// //       shareableLink: generateShareableLink(),
// //       expiryDate: new Date(pollData.expiryDate),
// //       responseMode: pollData.responseMode,
// //       isActive: true,
// //       isPublished: false,
// //       totalResponses: 0
// //     });
    
// //     console.log('Poll object created:', poll);
// //     await poll.save({ session });
// //     console.log('Poll saved, ID:', poll._id);
    
// //     // Create questions and options
// //     for (let qIndex = 0; qIndex < pollData.questions.length; qIndex++) {
// //       const questionData = pollData.questions[qIndex];
// //       console.log(`Creating question ${qIndex + 1}:`, questionData.text);
      
// //       const question = new Question({
// //         pollId: poll._id,
// //         text: questionData.text,
// //         type: questionData.type,
// //         isMandatory: questionData.isMandatory,
// //         order: qIndex
// //       });
      
// //       await question.save({ session });
// //       console.log(`Question ${qIndex + 1} saved, ID:`, question._id);
      
// //       // Create options
// //       for (let optIndex = 0; optIndex < questionData.options.length; optIndex++) {
// //         const optionData = questionData.options[optIndex];
// //         console.log(`  Creating option ${optIndex + 1}:`, optionData.text);
        
// //         const option = new Option({
// //           questionId: question._id,
// //           text: optionData.text,
// //           order: optIndex,
// //           responseCount: 0
// //         });
        
// //         await option.save({ session });
// //       }
// //     }
    
// //     await session.commitTransaction();
// //     console.log('Transaction committed successfully');
    
// //     const pollObject = poll.toObject();
// //     return { poll: pollObject, message: 'Poll created successfully' };
    
// //   } catch (error) {
// //     console.error('Error in createPoll:', error);
// //     await session.abortTransaction();
// //     throw error;
// //   } finally {
// //     session.endSession();
// //   }
// // }
  
// //   async getPollById(pollId: string): Promise<PollWithQuestionsType> {
// //   const poll = await Poll.findById(pollId).lean();
// //   if (!poll) {
// //     throw new Error('Poll not found');
// //   }
  
// //   const questions = await Question.find({ pollId: pollId })
// //     .sort({ order: 1 })
// //     .lean();
  
// //   const questionsWithOptions = await Promise.all(
// //     questions.map(async (question) => {
// //       const options = await Option.find({ questionId: question._id })
// //         .sort({ order: 1 })
// //         .lean();
      
// //       // Transform options to simple objects with string conversion
// //       const transformedOptions = options.map(opt => ({
// //         _id: opt._id,
// //         text: String(opt.text), // Convert to string
// //         order: opt.order,
// //         responseCount: opt.responseCount
// //       }));
      
// //       // Transform question to simple object
// //       return {
// //         _id: question._id,
// //         text: String(question.text), // Convert to string
// //         type: question.type,
// //         isMandatory: question.isMandatory,
// //         order: question.order,
// //         options: transformedOptions
// //       };
// //     })
// //   );
  
// //   // Return plain object without type assertion
// //   return {
// //     _id: poll._id,
// //     title: String(poll.title),
// //     description: poll.description ? String(poll.description) : undefined,
// //     creatorId: poll.creatorId,
// //     shareableLink: poll.shareableLink,
// //     expiryDate: poll.expiryDate,
// //     isActive: poll.isActive,
// //     isPublished: poll.isPublished,
// //     responseMode: poll.responseMode as 'anonymous' | 'authenticated',
// //     totalResponses: poll.totalResponses,
// //     createdAt: poll.createdAt,
// //     updatedAt: poll.updatedAt,
// //     questions: questionsWithOptions
// //   };
// // }
//   async createPoll(creatorId: string, pollData: CreatePollDtoType): Promise<{ poll: any; message: string }> {
//     try {
//       const poll = new Poll({
//         title: pollData.title,
//         description: pollData.description,
//         creatorId: creatorId,
//         shareableLink: generateShareableLink(),
//         expiryDate: new Date(pollData.expiryDate),
//         responseMode: pollData.responseMode,
//         isActive: true,
//         isPublished: false,
//         totalResponses: 0
//       });
      
//       await poll.save();
      
//       for (const questionData of pollData.questions) {
//         const question = new Question({
//           pollId: poll._id,
//           text: questionData.text,
//           type: questionData.type,
//           isMandatory: questionData.isMandatory,
//           order: questionData.order
//         });
        
//         await question.save();
        
//         for (const optionData of questionData.options) {
//           const option = new Option({
//             questionId: question._id,
//             text: optionData.text,
//             order: optionData.order,
//             responseCount: 0
//           });
          
//           await option.save();
//         }
//       }
      
//       const pollObject = poll.toObject();
//       return { poll: pollObject, message: 'Poll created successfully' };
      
//     } catch (error) {
//       console.error('Create poll error:', error);
//       throw error;
//     }
//   }
  
//   async getPollById(pollId: string): Promise<PollWithQuestionsType> {
//     const poll = await Poll.findById(pollId).lean();
//     if (!poll) {
//       throw new Error('Poll not found');
//     }
    
//     const questions = await Question.find({ pollId: pollId })
//       .sort({ order: 1 })
//       .lean();
    
//     const questionsWithOptions = await Promise.all(
//       questions.map(async (question) => {
//         const options = await Option.find({ questionId: question._id })
//           .sort({ order: 1 })
//           .lean();
        
//         const transformedOptions = options.map(opt => ({
//           _id: opt._id,
//           text: String(opt.text),
//           order: opt.order,
//           responseCount: opt.responseCount
//         }));
        
//         return {
//           _id: question._id,
//           text: String(question.text),
//           type: question.type,
//           isMandatory: question.isMandatory,
//           order: question.order,
//           options: transformedOptions
//         };
//       })
//     );
    
//     return {
//       _id: poll._id,
//       title: String(poll.title),
//       description: poll.description ? String(poll.description) : undefined,
//       creatorId: poll.creatorId,
//       shareableLink: poll.shareableLink,
//       expiryDate: poll.expiryDate,
//       isActive: poll.isActive,
//       isPublished: poll.isPublished,
//       responseMode: poll.responseMode as 'anonymous' | 'authenticated',
//       totalResponses: poll.totalResponses,
//       createdAt: poll.createdAt,
//       updatedAt: poll.updatedAt,
//       questions: questionsWithOptions
//     };
//   }
//   async getPollByLink(shareableLink: string): Promise<PollWithQuestionsType> {
//   const poll = await Poll.findOne({ shareableLink }).lean();
//   if (!poll) {
//     throw new Error('Poll not found');
//   }
  
//   if (poll.expiryDate < new Date() || !poll.isActive) {
//     throw new Error('Poll has expired');
//   }
  
//   const questions = await Question.find({ pollId: poll._id })
//     .sort({ order: 1 })
//     .lean();
  
//   const questionsWithOptions = await Promise.all(
//     questions.map(async (question) => {
//       const options = await Option.find({ questionId: question._id })
//         .sort({ order: 1 })
//         .lean();
      
//       const transformedOptions = options.map(opt => ({
//         _id: opt._id,
//         text: String(opt.text), // Convert to string
//         order: opt.order,
//         responseCount: opt.responseCount
//       }));
      
//       return {
//         _id: question._id,
//         text: String(question.text), // Convert to string
//         type: question.type,
//         isMandatory: question.isMandatory,
//         order: question.order,
//         options: transformedOptions
//       };
//     })
//   );
  
//   return {
//     _id: poll._id,
//     title: String(poll.title),
//     description: poll.description ? String(poll.description) : undefined,
//     creatorId: poll.creatorId,
//     shareableLink: poll.shareableLink,
//     expiryDate: poll.expiryDate,
//     isActive: poll.isActive,
//     isPublished: poll.isPublished,
//     responseMode: poll.responseMode as 'anonymous' | 'authenticated',
//     totalResponses: poll.totalResponses,
//     createdAt: poll.createdAt,
//     updatedAt: poll.updatedAt,
//     questions: questionsWithOptions
//   };
// }
  
//   async getUserPolls(creatorId: string, page: number = 1, limit: number = 10): Promise<PaginatedPollsType> {
//     const skip = (page - 1) * limit;
    
//     const [polls, total] = await Promise.all([
//       Poll.find({ creatorId })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       Poll.countDocuments({ creatorId })
//     ]);
    
//     return {
//       polls,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit)
//     };
//   }
  
//   async updatePoll(pollId: string, creatorId: string, updateData: UpdatePollDtoType): Promise<FlattenMaps<IPoll>> {
//     const poll = await Poll.findOne({ _id: pollId, creatorId });
//     if (!poll) {
//       throw new Error('Poll not found or unauthorized');
//     }
    
//     Object.assign(poll, updateData);
//     await poll.save();
    
//     return poll.toObject();
//   }
  
//   async deletePoll(pollId: string, creatorId: string): Promise<{ message: string }> {
//     const session = await mongoose.startSession();
//     session.startTransaction();
    
//     try {
//       const poll = await Poll.findOne({ _id: pollId, creatorId });
//       if (!poll) {
//         throw new Error('Poll not found or unauthorized');
//       }
      
//       const questions = await Question.find({ pollId });
//       for (const question of questions) {
//         await Option.deleteMany({ questionId: question._id }, { session });
//       }
//       await Question.deleteMany({ pollId }, { session });
//       await Poll.deleteOne({ _id: pollId }, { session });
      
//       await session.commitTransaction();
//       return { message: 'Poll deleted successfully' };
      
//     } catch (error) {
//       await session.abortTransaction();
//       throw error;
//     } finally {
//       session.endSession();
//     }
//   }
  
//   async isPollActive(pollId: string): Promise<boolean> {
//     const poll = await Poll.findById(pollId);
//     if (!poll) return false;
    
//     return poll.isActive && poll.expiryDate > new Date();
//   }
  
//   // Add this method for public access
//   async getPollByLinkForResponse(shareableLink: string): Promise<PollWithQuestionsType> {
//     return this.getPollByLink(shareableLink);
//   }
// }


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