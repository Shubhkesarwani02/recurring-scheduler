export interface TimeSlot {
  id: string
  date: string        // YYYY-MM-DD format
  startTime: string   // HH:MM format
  endTime: string     // HH:MM format
  isException?: boolean
  originalSlotId?: string
}

export interface DaySchedule {
  date: Date
  slots: TimeSlot[]
}

export interface RecurringSlot {
  id: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string // HH:MM format
  endTime: string   // HH:MM format
  createdAt?: Date
}

export interface SlotCreateRequest {
  day_of_week: number
  start_time: string  // HH:MM format
  end_time: string    // HH:MM format
}

export interface SlotUpdateRequest {
  date: string        // YYYY-MM-DD format
  start_time?: string // HH:MM format
  end_time?: string   // HH:MM format
}

export interface SlotDeleteRequest {
  date: string        // YYYY-MM-DD format
}

export interface ApiSlot {
  id: string
  date: string
  start_time: string
  end_time: string
  is_exception: boolean
  original_slot_id?: string
}
