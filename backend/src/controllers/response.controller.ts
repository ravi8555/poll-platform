// // backend/src/controllers/response.controller.ts
// import { Request, Response } from 'express';
// import { ResponseService } from '../services/response.service.js'
// import { SubmitResponseDto } from '../dtos/response.dto.js';
// import { Poll } from '../models/Poll.model.js';
// import { emitResponseUpdate } from '../sockets/poll.socket.js';

// const responseService = new ResponseService();

// export class ResponseController {
//   async submitResponse(req: Request, res: Response) {
//     try {
//       console.log('=== SUBMIT RESPONSE REQUEST ===');
//       console.log('Request body:', req.body);
//       console.log('User from auth:', req.user);
      
//       const validation = SubmitResponseDto.safeParse(req.body);
//       if (!validation.success) {
//         return res.status(400).json({ 
//           error: 'Validation failed', 
//           details: validation.error.errors 
//         });
//       }
      
//       const { pollLink, answers } = validation.data;
      
//       // First, find the poll to check its response mode
//       const poll = await Poll.findOne({ shareableLink: pollLink });
//       if (!poll) {
//         return res.status(404).json({ error: 'Poll not found' });
//       }
      
//       console.log('Poll response mode:', poll.responseMode);
//       console.log('User authenticated:', !!req.user);
      
//       // Check if poll requires authentication
//       if (poll.responseMode === 'authenticated' && !req.user) {
//         console.log('Authentication required but user not logged in');
//         return res.status(401).json({ 
//           error: 'Authentication required. Please log in to submit this poll.' 
//         });
//       }
      
//       const respondentId = req.user?.id;
//       const ipAddress = req.ip;
//       const userAgent = req.headers['user-agent'];
      
//       const result = await responseService.submitResponse(
//         pollLink,
//         answers,
//         respondentId,
//         ipAddress,
//         userAgent
//       );
      
//       res.status(201).json(result);
//     } catch (error: any) {
//       console.error('Submit response error:', error);
//       res.status(400).json({ error: error.message });
//     }
//   }
  
//   async getPollResponses(req: Request, res: Response) {
//     try {
//       const { pollId } = req.params;
//       const responses = await responseService.getPollResponses(pollId, req.user!.id);
//       res.json(responses);
//     } catch (error: any) {
//       res.status(403).json({ error: error.message });
//     }
//   }
  
//   async getLiveResponseCount(req: Request, res: Response) {
//     try {
//       const { pollId } = req.params;
//       const count = await responseService.getResponseCount(pollId);
//       res.json(count);
//     } catch (error: any) {
//       res.status(500).json({ error: error.message });
//     }
//   }
  
//   // Add this method for public poll access
//   async getPublicPoll(req: Request, res: Response) {
//     try {
//       const { link } = req.params;
//       const poll = await responseService.getPollByLink(link);
//       res.json(poll);
//     } catch (error: any) {
//       res.status(404).json({ error: error.message });
//     }
//   }
// }

// backend/src/controllers/response.controller.ts
import { Request, Response } from 'express';
import { ResponseService } from '../services/response.service.js';
import { SubmitResponseDto } from '../dtos/response.dto.js';
import { Poll } from '../models/Poll.model.js';
import { emitResponseUpdate } from '../sockets/poll.socket.js';

const responseService = new ResponseService();

export class ResponseController {
  async submitResponse(req: Request, res: Response) {
    try {
      console.log('\n=== SUBMIT RESPONSE REQUEST ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('req.user:', req.user);
      console.log('req.cookies:', req.cookies);
      
      const validation = SubmitResponseDto.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.errors 
        });
      }
      
      const { pollLink, answers } = validation.data;
      
      // Find the poll to check its response mode
      const poll = await Poll.findOne({ shareableLink: pollLink });
      if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
      }
      
      console.log('Poll found:', {
        id: poll._id,
        title: poll.title,
        responseMode: poll.responseMode,
        isActive: poll.isActive,
        expiryDate: poll.expiryDate
      });
      
      // Check authentication requirement
      if (poll.responseMode === 'authenticated') {
        console.log('Poll requires authentication');
        console.log('req.user exists:', !!req.user);
        
        if (!req.user) {
          console.log('REJECTED: No authenticated user');
          return res.status(401).json({ 
            error: 'Authentication required. Please log in to submit this poll.' 
          });
        }
        
        console.log('Authenticated user:', req.user);
      }
      
      const respondentId = req.user?.id;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];
      
      const result = await responseService.submitResponse(
      pollLink,
      answers,
      respondentId,
      ipAddress,
      userAgent
    );
    
    // Get io instance and emit event
    const io = req.app.get('io');
    emitResponseUpdate(io, result.pollId.toString());
    
    // if (io) {
    //   console.log('Emitting response update for poll:', result.pollId);
    //   await emitResponseUpdate(io, result.pollId.toString());
    // } else {
    //   console.log('IO not found in app');
    // }
    
    res.status(201).json(result);
    } catch (error: any) {
      console.error('Submit response error:', error);
      res.status(400).json({ error: error.message });
    }
  }
  
  async getPublicPoll(req: Request, res: Response) {
    try {
      const { link } = req.params;
      console.log('Getting public poll:', link);
      
      const poll = await responseService.getPollByLink(link);
      res.json(poll);
    } catch (error: any) {
      console.error('Get public poll error:', error);
      res.status(404).json({ error: error.message });
    }
  }
  
  async getPollResponses(req: Request, res: Response) {
    try {
      const { pollId } = req.params;
      const responses = await responseService.getPollResponses(pollId, req.user!.id);
      res.json(responses);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  }
  
  async getLiveResponseCount(req: Request, res: Response) {
    try {
      const { pollId } = req.params;
      const count = await responseService.getResponseCount(pollId);
      res.json(count);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}