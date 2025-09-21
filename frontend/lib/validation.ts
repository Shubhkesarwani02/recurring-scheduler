/**
 * Validation utilities for slot operations with IST timezone support
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  userMessage?: string
}

export class SlotValidator {
  /**
   * Validate time range
   */
  static validateTimeRange(startTime: string, endTime: string): ValidationResult {
    if (!startTime || !endTime) {
      return {
        isValid: false,
        error: 'Start time and end time are required',
        userMessage: 'Please select both start and end times.'
      }
    }

    // Use a fixed date to compare times (IST timezone aware)
    const baseDate = '2000-01-01T'
    const start = new Date(`${baseDate}${startTime}:00+05:30`) // IST offset
    const end = new Date(`${baseDate}${endTime}:00+05:30`)

    if (start >= end) {
      return {
        isValid: false,
        error: 'End time must be after start time',
        userMessage: 'The end time must be after the start time.'
      }
    }

    // Check minimum duration (15 minutes)
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
    if (diffMinutes < 15) {
      return {
        isValid: false,
        error: 'Minimum slot duration is 15 minutes',
        userMessage: 'Time slots must be at least 15 minutes long.'
      }
    }

    // Check maximum duration (8 hours)
    if (diffMinutes > 480) {
      return {
        isValid: false,
        error: 'Maximum slot duration is 8 hours',
        userMessage: 'Time slots cannot be longer than 8 hours.'
      }
    }

    return { isValid: true }
  }

  /**
   * Validate business hours (IST)
   */
  static validateBusinessHours(startTime: string, endTime: string): ValidationResult {
    const businessStart = '09:00'
    const businessEnd = '18:00'

    if (startTime < businessStart || endTime > businessEnd) {
      return {
        isValid: false,
        error: 'Time slots must be within business hours',
        userMessage: `Time slots must be between ${businessStart} and ${businessEnd} (IST).`
      }
    }

    return { isValid: true }
  }

  /**
   * Check for slot conflicts
   */
  static checkSlotConflict(
    newStartTime: string,
    newEndTime: string,
    existingSlots: Array<{ startTime: string; endTime: string }>
  ): ValidationResult {
    // Use IST timezone for comparisons
    const baseDate = '2000-01-01T'
    const newStart = new Date(`${baseDate}${newStartTime}:00+05:30`)
    const newEnd = new Date(`${baseDate}${newEndTime}:00+05:30`)

    for (const slot of existingSlots) {
      const existingStart = new Date(`${baseDate}${slot.startTime}:00+05:30`)
      const existingEnd = new Date(`${baseDate}${slot.endTime}:00+05:30`)

      // Check for overlap
      if (newStart < existingEnd && newEnd > existingStart) {
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(':').map(Number)
          const period = hours >= 12 ? 'PM' : 'AM'
          const displayHours = hours % 12 || 12
          return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
        }

        return {
          isValid: false,
          error: 'Time slot conflicts with existing slot',
          userMessage: `This time slot overlaps with an existing appointment from ${formatTime(slot.startTime)} to ${formatTime(slot.endTime)} (IST).`
        }
      }
    }

    return { isValid: true }
  }

  /**
   * Check daily slot limit
   */
  static checkDailyLimit(existingSlotCount: number, maxSlots: number = 2): ValidationResult {
    if (existingSlotCount >= maxSlots) {
      return {
        isValid: false,
        error: `Maximum ${maxSlots} slots per day allowed`,
        userMessage: `You can only have up to ${maxSlots} time slots per day. Please remove an existing slot first.`
      }
    }

    return { isValid: true }
  }

  /**
   * Validate day of week
   */
  static validateDayOfWeek(dayOfWeek: number): ValidationResult {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return {
        isValid: false,
        error: 'Invalid day of week',
        userMessage: 'Please select a valid day of the week.'
      }
    }

    return { isValid: true }
  }

  /**
   * Comprehensive slot validation
   */
  static validateSlotCreation(
    startTime: string,
    endTime: string,
    dayOfWeek: number,
    existingSlotsForDay: Array<{ startTime: string; endTime: string }>,
    options: {
      maxSlotsPerDay?: number
      enforceBusinessHours?: boolean
    } = {}
  ): ValidationResult {
    const { maxSlotsPerDay = 2, enforceBusinessHours = true } = options

    // Validate time range
    const timeRangeResult = this.validateTimeRange(startTime, endTime)
    if (!timeRangeResult.isValid) {
      return timeRangeResult
    }

    // Validate day of week
    const dayResult = this.validateDayOfWeek(dayOfWeek)
    if (!dayResult.isValid) {
      return dayResult
    }

    // Check business hours if enforced
    if (enforceBusinessHours) {
      const businessHoursResult = this.validateBusinessHours(startTime, endTime)
      if (!businessHoursResult.isValid) {
        return businessHoursResult
      }
    }

    // Check daily limit
    const dailyLimitResult = this.checkDailyLimit(existingSlotsForDay.length, maxSlotsPerDay)
    if (!dailyLimitResult.isValid) {
      return dailyLimitResult
    }

    // Check for conflicts
    const conflictResult = this.checkSlotConflict(startTime, endTime, existingSlotsForDay)
    if (!conflictResult.isValid) {
      return conflictResult
    }

    return { isValid: true }
  }
}