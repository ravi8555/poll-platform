// backend/src/controllers/poll.controller.ts
import { Request, Response } from 'express';
import { PollService } from '../services/poll.service.js';
import { CreatePollDto, UpdatePollDto } from '../dtos/poll.dto.js';

const pollService = new PollService();

export class PollController {
  // Create a new poll
  
  async createPoll(req: Request, res: Response) {
    try {
      console.log('=== CREATE POLL REQUEST ===');
      console.log('User:', req.user);
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      const validation = CreatePollDto.safeParse(req.body);
      if (!validation.success) {
        console.log('Validation failed:', validation.error.errors);
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.errors
        });
      }
      
      console.log('Validation passed, creating poll...');
      const result = await pollService.createPoll(req.user!.id, validation.data);
      console.log('Poll created successfully:', result.poll._id);
      
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Create poll error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  }
  
  
  // Get poll by ID (for creator)
  async getPollById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const poll = await pollService.getPollById(id);
      
      // Check if user owns the poll
      if (poll.creatorId.toString() !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized to view this poll' });
      }
      
      res.json(poll);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
  
  // Get poll by shareable link (public access)
  async getPollByLink(req: Request, res: Response) {
    try {
      const { link } = req.params;
      const poll = await pollService.getPollByLink(link);
      res.json(poll);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
  
  // Get all polls for current user
  async getUserPolls(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await pollService.getUserPolls(req.user!.id, page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update poll
  async updatePoll(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validation = UpdatePollDto.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.errors 
        });
      }
      
      const poll = await pollService.updatePoll(id, req.user!.id, validation.data);
      res.json({ message: 'Poll updated successfully', poll });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Delete poll
  async deletePoll(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await pollService.deletePoll(id, req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Check if poll is active
  async checkPollActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const isActive = await pollService.isPollActive(id);
      res.json({ isActive });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}