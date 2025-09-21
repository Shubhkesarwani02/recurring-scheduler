import { ApiSlot, SlotCreateRequest, SlotUpdateRequest, SlotDeleteRequest, TimeSlot, RecurringSlot } from '@/types/slot'
import { auth } from '@clerk/nextjs/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Enhanced error types for better handling
export class SlotApiError extends Error {
  public code: string
  public userMessage: string

  constructor(message: string, code: string = 'UNKNOWN_ERROR', userMessage?: string) {
    super(message)
    this.name = 'SlotApiError'
    this.code = code
    this.userMessage = userMessage || this.getDefaultUserMessage(message, code)
  }

  private getDefaultUserMessage(message: string, code: string): string {
    // Extract specific error messages and provide user-friendly alternatives
    if (message.includes('Time slot conflicts with existing slot')) {
      return 'This time slot conflicts with an existing appointment. Please choose a different time.'
    }
    
    if (message.includes('Maximum 2 slots per day allowed')) {
      return 'You can only have up to 2 time slots per day. Please remove an existing slot or choose a different day.'
    }
    
    if (message.includes('Invalid time range')) {
      return 'The end time must be after the start time. Please check your time selection.'
    }
    
    if (message.includes('Time slot outside business hours')) {
      return 'Time slots must be within business hours (9 AM - 6 PM). Please choose a different time.'
    }
    
    if (code === 'NETWORK_ERROR') {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }
    
    if (code === 'VALIDATION_ERROR') {
      return 'Please check your input and try again.'
    }
    
    return 'An unexpected error occurred. Please try again.'
  }
}

export class SlotApiService {
  private static async fetchWithErrorHandling(url: string, options?: RequestInit & { token?: string }) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options?.headers as Record<string, string>,
      }
      
      // Add authentication header if token is provided
      if (options?.token) {
        headers['Authorization'] = `Bearer ${options.token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.error || `HTTP ${response.status}`
        
        // Determine error code based on status and message
        let errorCode = 'UNKNOWN_ERROR'
        if (response.status === 400) {
          if (errorMessage.includes('conflicts with existing slot')) {
            errorCode = 'SLOT_CONFLICT'
          } else if (errorMessage.includes('Maximum 2 slots per day')) {
            errorCode = 'DAILY_LIMIT_EXCEEDED'
          } else if (errorMessage.includes('Invalid time range')) {
            errorCode = 'INVALID_TIME_RANGE'
          } else {
            errorCode = 'VALIDATION_ERROR'
          }
        } else if (response.status === 401) {
          errorCode = 'UNAUTHORIZED'
        } else if (response.status === 403) {
          errorCode = 'FORBIDDEN'
        } else if (response.status === 404) {
          errorCode = 'NOT_FOUND'
        } else if (response.status >= 500) {
          errorCode = 'SERVER_ERROR'
        }
        
        throw new SlotApiError(errorMessage, errorCode)
      }

      return response
    } catch (error) {
      if (error instanceof SlotApiError) {
        throw error
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new SlotApiError('Network error', 'NETWORK_ERROR')
      }
      
      console.error('API Error:', error)
      throw new SlotApiError(
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR'
      )
    }
  }

  static async getSlotsForWeek(weekStart: string): Promise<TimeSlot[]> {
    const response = await this.fetchWithErrorHandling(
      `${API_BASE_URL}/slots?weekStart=${weekStart}`
    )
    
    const data = await response.json()
    
    // Transform API response to frontend format
    return data.slots.map((apiSlot: ApiSlot): TimeSlot => ({
      id: apiSlot.id,
      date: apiSlot.date,
      startTime: apiSlot.start_time,
      endTime: apiSlot.end_time,
      isException: apiSlot.is_exception,
      originalSlotId: apiSlot.original_slot_id,
    }))
  }

  static async createSlot(slot: SlotCreateRequest): Promise<RecurringSlot> {
    const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/slots`, {
      method: 'POST',
      body: JSON.stringify(slot),
    })

    const data = await response.json()
    return {
      id: data.slot.id,
      dayOfWeek: data.slot.day_of_week,
      startTime: data.slot.start_time,
      endTime: data.slot.end_time,
      createdAt: new Date(data.slot.created_at),
    }
  }

  static async updateSlot(id: string, update: SlotUpdateRequest): Promise<TimeSlot> {
    // Extract original slot ID if this is a composite ID
    const originalId = id.includes('-') ? id.split('-')[0] : id
    
    const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/slots/${originalId}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    })

    const data = await response.json()
    return {
      id: data.slot.id,
      date: data.slot.date,
      startTime: data.slot.start_time,
      endTime: data.slot.end_time,
      isException: data.slot.is_exception,
      originalSlotId: data.slot.original_slot_id,
    }
  }

  static async deleteSlot(id: string, deleteRequest: SlotDeleteRequest): Promise<void> {
    // Extract original slot ID if this is a composite ID
    const originalId = id.includes('-') ? id.split('-')[0] : id
    
    await this.fetchWithErrorHandling(`${API_BASE_URL}/slots/${originalId}`, {
      method: 'DELETE',
      body: JSON.stringify(deleteRequest),
    })
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`)
      return response.ok
    } catch {
      return false
    }
  }
}

// Utility functions for date manipulation with IST support
export class DateUtils {
  // Indian Standard Time offset (+05:30)
  private static readonly IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds

  /**
   * Get current date in IST
   */
  static getCurrentDateIST(): Date {
    const now = new Date();
    return new Date(now.getTime() + DateUtils.IST_OFFSET);
  }

  /**
   * Convert a date to IST
   */
  static toIST(date: Date): Date {
    return new Date(date.getTime() + DateUtils.IST_OFFSET);
  }

  /**
   * Format date to YYYY-MM-DD in IST timezone
   */
  static formatDate(date: Date): string {
    // Convert to IST and format
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    const year = istDate.getUTCFullYear();
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Create a date from YYYY-MM-DD string in IST
   */
  static parseDate(dateStr: string): Date {
    // Parse as IST by adding the date at IST midnight
    const [year, month, day] = dateStr.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    // Subtract IST offset to get the correct local representation
    return new Date(utcDate.getTime() - DateUtils.IST_OFFSET);
  }

  static getWeekStart(date: Date): string {
    const istDate = new Date(date.getTime() + DateUtils.IST_OFFSET);
    const day = istDate.getUTCDay();
    const diff = istDate.getUTCDate() - day; // Sunday as start of week
    
    const weekStart = new Date(istDate);
    weekStart.setUTCDate(diff);
    weekStart.setUTCHours(0, 0, 0, 0);
    
    return DateUtils.formatDate(new Date(weekStart.getTime() - DateUtils.IST_OFFSET));
  }

  static addWeeks(dateStr: string, weeks: number): string {
    const date = DateUtils.parseDate(dateStr);
    const newDate = new Date(date.getTime() + (weeks * 7 * 24 * 60 * 60 * 1000));
    return DateUtils.formatDate(newDate);
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return DateUtils.formatDate(date1) === DateUtils.formatDate(date2);
  }

  static getDayName(date: Date): string {
    const istDate = new Date(date.getTime() + DateUtils.IST_OFFSET);
    return istDate.toLocaleDateString('en-IN', { 
      weekday: 'long',
      timeZone: 'Asia/Kolkata'
    });
  }

  static getDayOfWeek(date: Date): number {
    const istDate = new Date(date.getTime() + DateUtils.IST_OFFSET);
    return istDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  }

  /**
   * Get today's date in IST format (YYYY-MM-DD)
   */
  static getTodayIST(): string {
    return DateUtils.formatDate(new Date());
  }

  /**
   * Check if a date string represents today in IST
   */
  static isToday(dateStr: string): boolean {
    return dateStr === DateUtils.getTodayIST();
  }

  /**
   * Format time for display in 12-hour format
   */
  static formatTime12Hour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Create a date object for a specific date in IST
   */
  static createISTDate(year: number, month: number, day: number): Date {
    // Create date in IST by using UTC and adjusting
    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    return new Date(utcDate.getTime() - DateUtils.IST_OFFSET);
  }
}