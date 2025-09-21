import { Request, Response } from 'express';
import { SlotService } from '../services/slotService';
import { CreateSlotRequest, UpdateSlotRequest, SlotDeleteRequest } from '../types/slot';

export class SlotController {
  static async getSlots(req: Request, res: Response): Promise<void> {
    try {
      const { weekStart } = req.query;
      
      if (!weekStart || typeof weekStart !== 'string') {
        res.status(400).json({
          error: 'weekStart query parameter is required (YYYY-MM-DD format)'
        });
        return;
      }
      
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(weekStart)) {
        res.status(400).json({
          error: 'Invalid date format. Use YYYY-MM-DD format'
        });
        return;
      }
      
      const slots = await SlotService.getSlotsForWeek(weekStart);
      res.json({ slots });
      
    } catch (error) {
      console.error('Error fetching slots:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  static async createSlot(req: Request, res: Response): Promise<void> {
    try {
      const { day_of_week, start_time, end_time }: CreateSlotRequest = req.body;
      
      // Validate required fields
      if (day_of_week === undefined || !start_time || !end_time) {
        res.status(400).json({
          error: 'day_of_week, start_time, and end_time are required'
        });
        return;
      }
      
      const slot = await SlotService.createSlot({
        day_of_week,
        start_time,
        end_time
      });
      
      res.status(201).json({ slot });
      
    } catch (error) {
      console.error('Error creating slot:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Maximum 2 slots') || 
            error.message.includes('conflicts') ||
            error.message.includes('Invalid')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  static async updateSlot(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { date, start_time, end_time }: UpdateSlotRequest = req.body;
      
      if (!id) {
        res.status(400).json({
          error: 'Slot ID is required'
        });
        return;
      }
      
      if (!date) {
        res.status(400).json({
          error: 'Date is required for slot updates'
        });
        return;
      }
      
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        res.status(400).json({
          error: 'Invalid date format. Use YYYY-MM-DD format'
        });
        return;
      }
      
      const updatedSlot = await SlotService.updateSlot(id, {
        date,
        start_time,
        end_time
      });
      
      res.json({ slot: updatedSlot });
      
    } catch (error) {
      console.error('Error updating slot:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({ error: error.message });
          return;
        }
        
        if (error.message.includes('conflicts') ||
            error.message.includes('Invalid')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  static async deleteSlot(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { date }: SlotDeleteRequest = req.body;
      
      if (!id) {
        res.status(400).json({
          error: 'Slot ID is required'
        });
        return;
      }
      
      if (!date) {
        res.status(400).json({
          error: 'Date is required for slot deletion'
        });
        return;
      }
      
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        res.status(400).json({
          error: 'Invalid date format. Use YYYY-MM-DD format'
        });
        return;
      }
      
      await SlotService.deleteSlot(id, date);
      
      res.status(204).send();
      
    } catch (error) {
      console.error('Error deleting slot:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({ error: error.message });
          return;
        }
      }
      
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}