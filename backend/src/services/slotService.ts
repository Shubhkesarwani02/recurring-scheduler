import { SlotModel, ExceptionModel } from '../models/slot';
import { Slot, Exception, SlotWithDate, CreateSlotRequest, UpdateSlotRequest } from '../types/slot';

export class SlotService {
  static async createSlot(data: CreateSlotRequest): Promise<Slot> {
    // Validate time format
    this.validateTimeFormat(data.start_time);
    this.validateTimeFormat(data.end_time);
    
    // Validate day of week
    if (data.day_of_week < 0 || data.day_of_week > 6) {
      throw new Error('Invalid day_of_week. Must be between 0 (Sunday) and 6 (Saturday)');
    }
    
    // Validate start time is before end time
    if (data.start_time >= data.end_time) {
      throw new Error('Start time must be before end time');
    }
    
    // Check if this would exceed 2 slots per day
    const existingSlots = await SlotModel.findByDayOfWeek(data.day_of_week);
    if (existingSlots.length >= 2) {
      throw new Error('Maximum 2 slots per day allowed');
    }
    
    // Check for time conflicts
    for (const existingSlot of existingSlots) {
      if (this.hasTimeConflict(data.start_time, data.end_time, existingSlot.start_time, existingSlot.end_time)) {
        throw new Error('Time slot conflicts with existing slot');
      }
    }
    
    return SlotModel.create(data);
  }
  
  static async getSlotsForWeek(weekStart: string): Promise<SlotWithDate[]> {
    const weekDates = this.generateWeekDates(weekStart);
    const allSlots = await SlotModel.findAll();
    const exceptions = await ExceptionModel.findByDateRange(weekDates[0], weekDates[6]);
    
    const result: SlotWithDate[] = [];
    
    // Create a map of exceptions for quick lookup
    const exceptionMap = new Map<string, Exception>();
    exceptions.forEach(exc => {
      exceptionMap.set(`${exc.slot_id}-${exc.date}`, exc);
    });
    
    // Generate slots for each day of the week
    weekDates.forEach((date, index) => {
      const dayOfWeek = index; // 0 = Sunday, 1 = Monday, etc.
      const daySlots = allSlots.filter(slot => slot.day_of_week === dayOfWeek);
      
      daySlots.forEach(slot => {
        const exceptionKey = `${slot.id}-${date}`;
        const exception = exceptionMap.get(exceptionKey);
        
        if (exception?.status === 'deleted') {
          // Slot is deleted for this date, don't include it
          return;
        }
        
        if (exception?.status === 'updated') {
          // Slot is modified for this date
          result.push({
            id: `${slot.id}-${date}`,
            date,
            start_time: exception.override_start || slot.start_time,
            end_time: exception.override_end || slot.end_time,
            is_exception: true,
            original_slot_id: slot.id
          });
        } else {
          // Regular recurring slot
          result.push({
            id: `${slot.id}-${date}`,
            date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_exception: false,
            original_slot_id: slot.id
          });
        }
      });
    });
    
    return result.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });
  }
  
  static async updateSlot(id: string, data: UpdateSlotRequest): Promise<SlotWithDate> {
    const slot = await SlotModel.findById(id);
    if (!slot) {
      throw new Error('Slot not found');
    }
    
    // Validate time format if provided
    if (data.start_time) this.validateTimeFormat(data.start_time);
    if (data.end_time) this.validateTimeFormat(data.end_time);
    
    const startTime = data.start_time || slot.start_time;
    const endTime = data.end_time || slot.end_time;
    
    // Validate start time is before end time
    if (startTime >= endTime) {
      throw new Error('Start time must be before end time');
    }
    
    // Check for conflicts with other slots on the same day
    const dayOfWeek = this.getDayOfWeekFromDate(data.date);
    const daySlots = await SlotModel.findByDayOfWeek(dayOfWeek);
    const otherSlots = daySlots.filter(s => s.id !== id);
    
    for (const otherSlot of otherSlots) {
      if (this.hasTimeConflict(startTime, endTime, otherSlot.start_time, otherSlot.end_time)) {
        throw new Error('Time slot conflicts with existing slot');
      }
    }
    
    // Create or update exception
    const exception = await ExceptionModel.upsert({
      slot_id: id,
      date: data.date,
      override_start: data.start_time || slot.start_time,
      override_end: data.end_time || slot.end_time,
      status: 'updated'
    });
    
    return {
      id: `${id}-${data.date}`,
      date: data.date,
      start_time: exception.override_start || slot.start_time,
      end_time: exception.override_end || slot.end_time,
      is_exception: true,
      original_slot_id: id
    };
  }
  
  static async deleteSlot(id: string, date: string): Promise<void> {
    const slot = await SlotModel.findById(id);
    if (!slot) {
      throw new Error('Slot not found');
    }
    
    // Create exception to mark as deleted for this date
    await ExceptionModel.upsert({
      slot_id: id,
      date: date,
      override_start: null,
      override_end: null,
      status: 'deleted'
    });
  }
  
  private static validateTimeFormat(time: string): void {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new Error('Invalid time format. Use HH:MM format');
    }
  }
  
  private static hasTimeConflict(start1: string, end1: string, start2: string, end2: string): boolean {
    return start1 < end2 && end1 > start2;
  }
  
  private static generateWeekDates(weekStart: string): string[] {
    const dates: string[] = [];
    
    // Parse the date as IST to avoid timezone shifts
    const [year, month, day] = weekStart.split('-').map(Number);
    // Create date at IST midnight (UTC + 5:30)
    const startDate = new Date(year, month - 1, day);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Format as YYYY-MM-DD without timezone conversion
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    
    return dates;
  }
  
  private static getDayOfWeekFromDate(dateStr: string): number {
    // Parse date in local timezone (IST) to avoid shifts
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  }
}