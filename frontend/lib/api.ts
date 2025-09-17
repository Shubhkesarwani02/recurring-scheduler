import { ApiSlot, SlotCreateRequest, SlotUpdateRequest, SlotDeleteRequest, TimeSlot, RecurringSlot } from '@/types/slot'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export class SlotApiService {
  private static async fetchWithErrorHandling(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
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

// Utility functions for date manipulation
export class DateUtils {
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0] // YYYY-MM-DD
  }

  static getWeekStart(date: Date): string {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day // Sunday as start of week
    d.setDate(diff)
    return this.formatDate(d)
  }

  static addWeeks(dateStr: string, weeks: number): string {
    const date = new Date(dateStr)
    date.setDate(date.getDate() + (weeks * 7))
    return this.formatDate(date)
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString()
  }

  static getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  static getDayOfWeek(date: Date): number {
    return date.getDay() // 0 = Sunday, 1 = Monday, etc.
  }
}