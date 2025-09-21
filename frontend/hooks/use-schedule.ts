"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuthenticatedApi } from './use-authenticated-api'
import { DateUtils, SlotApiError } from '@/lib/api'
import { SlotValidator } from '@/lib/validation'
import { TimeSlot, SlotCreateRequest, SlotUpdateRequest } from '@/types/slot'
import { useToast } from '@/hooks/use-toast'

interface UseScheduleResult {
  slots: TimeSlot[]
  isLoading: boolean
  error: string | null
  loadWeek: (weekStart: string) => Promise<void>
  createSlot: (slot: SlotCreateRequest) => Promise<void>
  updateSlot: (id: string, update: SlotUpdateRequest) => Promise<void>
  deleteSlot: (id: string, date: string) => Promise<void>
  getSlotsForDate: (date: Date) => TimeSlot[]
  canAddSlot: (date: Date) => boolean
  canAddSlotAtTime: (date: Date, startTime: string, endTime: string) => { canAdd: boolean; reason?: string }
  getErrorForDate: (date: Date) => string | null
}

export function useSchedule(): UseScheduleResult {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateErrors, setDateErrors] = useState<Map<string, string>>(new Map())
  const [loadingWeeks, setLoadingWeeks] = useState<Set<string>>(new Set()) // Track which weeks are currently loading
  const { toast } = useToast()
  const api = useAuthenticatedApi()

  const loadWeek = useCallback(async (weekStart: string) => {
    // Prevent concurrent loading of the same week
    if (loadingWeeks.has(weekStart)) {
      return
    }

    setLoadingWeeks(prev => new Set(prev).add(weekStart))
    setIsLoading(true)
    setError(null)
    
    try {
      const weekSlots = await api.getSlotsForWeek(weekStart)
      setSlots(weekSlots)
      setDateErrors(new Map()) // Clear previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load slots'
      setError(errorMessage)
      toast({
        title: "Error loading schedule",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setLoadingWeeks(prev => {
        const newSet = new Set(prev)
        newSet.delete(weekStart)
        return newSet
      })
    }
  }, [toast, api, loadingWeeks])

  const createSlot = useCallback(async (slotData: SlotCreateRequest) => {
    setError(null)
    
    // Client-side validation before API call
    const existingSlotsForDay = slots.filter(slot => {
      // Get the day of week for the slot's date or use the requested day
      const slotDate = new Date(slot.date)
      const slotDayOfWeek = slotDate.getDay()
      return slotDayOfWeek === slotData.day_of_week
    })
    
    const validationResult = SlotValidator.validateSlotCreation(
      slotData.start_time,
      slotData.end_time,
      slotData.day_of_week,
      existingSlotsForDay,
      {
        maxSlotsPerDay: 2,
        enforceBusinessHours: true
      }
    )
    
    if (!validationResult.isValid) {
      const errorMessage = validationResult.userMessage || validationResult.error || 'Invalid slot data'
      setError(errorMessage)
      
      // Determine toast title based on error type
      let toastTitle = "Validation Error"
      if (validationResult.error?.includes('conflicts with existing slot')) {
        toastTitle = "Time Conflict"
      } else if (validationResult.error?.includes('Maximum 2 slots per day')) {
        toastTitle = "Daily Limit Reached"
      } else if (validationResult.error?.includes('time range')) {
        toastTitle = "Invalid Time Range"
      } else if (validationResult.error?.includes('business hours')) {
        toastTitle = "Outside Business Hours"
      }
      
      toast({
        title: toastTitle,
        description: errorMessage,
        variant: "destructive",
      })
      
      // Create a validation error to throw
      const validationError = new Error(errorMessage)
      validationError.name = 'ValidationError'
      throw validationError
    }
    
    // Optimistic update - add temporary slot
    const tempId = `temp-${Date.now()}`
    const tempDate = DateUtils.getTodayIST() // Use IST for today's date
    const optimisticSlot: TimeSlot = {
      id: tempId,
      date: tempDate,
      startTime: slotData.start_time,
      endTime: slotData.end_time,
      isException: false,
    }
    
    setSlots(prev => [...prev, optimisticSlot])
    
    try {
      await api.createSlot(slotData)
      
      // Replace optimistic slot with real slot by reloading
      setSlots(prev => prev.filter(slot => slot.id !== tempId))
      
      // Reload the current week to get all slots properly
      const weekStart = DateUtils.getWeekStart(new Date())
      await loadWeek(weekStart)
      
      toast({
        title: "Slot created",
        description: "Your recurring slot has been created successfully.",
      })
    } catch (err) {
      // Remove optimistic slot on error
      setSlots(prev => prev.filter(slot => slot.id !== tempId))
      
      let errorMessage = 'Failed to create slot'
      let toastTitle = "Error creating slot"
      
      if (err instanceof SlotApiError) {
        errorMessage = err.userMessage
        
        // Customize toast title based on error type
        switch (err.code) {
          case 'SLOT_CONFLICT':
            toastTitle = "Time Conflict"
            break
          case 'DAILY_LIMIT_EXCEEDED':
            toastTitle = "Daily Limit Reached"
            break
          case 'INVALID_TIME_RANGE':
            toastTitle = "Invalid Time Range"
            break
          case 'NETWORK_ERROR':
            toastTitle = "Connection Error"
            break
          default:
            toastTitle = "Error creating slot"
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      toast({
        title: toastTitle,
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }, [loadWeek, toast, api, slots])

  const updateSlot = useCallback(async (id: string, update: SlotUpdateRequest) => {
    setError(null)
    
    // Store original slot for rollback
    const originalSlot = slots.find(slot => slot.id === id)
    if (!originalSlot) return

    // Client-side validation for update
    if (update.start_time && update.end_time) {
      const timeRangeResult = SlotValidator.validateTimeRange(update.start_time, update.end_time)
      if (!timeRangeResult.isValid) {
        const errorMessage = timeRangeResult.userMessage || timeRangeResult.error || 'Invalid time range'
        setError(errorMessage)
        toast({
          title: "Invalid Time Range",
          description: errorMessage,
          variant: "destructive",
        })
        
        const validationError = new Error(errorMessage)
        validationError.name = 'ValidationError'
        throw validationError
      }

      // Check for conflicts with other slots on the same date
      const slotsOnSameDate = slots.filter(slot => 
        slot.date === update.date && slot.id !== id
      )
      
      const conflictResult = SlotValidator.checkSlotConflict(
        update.start_time,
        update.end_time,
        slotsOnSameDate
      )
      
      if (!conflictResult.isValid) {
        const errorMessage = conflictResult.userMessage || conflictResult.error || 'Time conflict'
        setError(errorMessage)
        toast({
          title: "Time Conflict",
          description: errorMessage,
          variant: "destructive",
        })
        
        const validationError = new Error(errorMessage)
        validationError.name = 'ValidationError'
        throw validationError
      }
    }
    
    // Optimistic update
    const updatedSlot: TimeSlot = {
      ...originalSlot,
      startTime: update.start_time || originalSlot.startTime,
      endTime: update.end_time || originalSlot.endTime,
      isException: true,
    }
    
    setSlots(prev => prev.map(slot => slot.id === id ? updatedSlot : slot))
    
    try {
      const result = await api.updateSlot(id, update)
      
      // Update with server response
      setSlots(prev => prev.map(slot => slot.id === id ? result : slot))
      
      toast({
        title: "Slot updated",
        description: "Your slot has been updated for this date.",
      })
    } catch (err) {
      // Rollback on error
      setSlots(prev => prev.map(slot => slot.id === id ? originalSlot : slot))
      
      let errorMessage = 'Failed to update slot'
      let toastTitle = "Error updating slot"
      
      if (err instanceof SlotApiError) {
        errorMessage = err.userMessage
        
        switch (err.code) {
          case 'SLOT_CONFLICT':
            toastTitle = "Time Conflict"
            break
          case 'INVALID_TIME_RANGE':
            toastTitle = "Invalid Time Range"
            break
          case 'NETWORK_ERROR':
            toastTitle = "Connection Error"
            break
          default:
            toastTitle = "Error updating slot"
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setDateErrors(prev => new Map(prev).set(update.date, errorMessage))
      toast({
        title: toastTitle,
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }, [slots, toast, api])

  const deleteSlot = useCallback(async (id: string, date: string) => {
    setError(null)
    
    // Store original slot for rollback
    const originalSlot = slots.find(slot => slot.id === id)
    if (!originalSlot) return
    
    // Optimistic update - remove slot
    setSlots(prev => prev.filter(slot => slot.id !== id))
    
    try {
      await api.deleteSlot(id, { date })
      
      toast({
        title: "Slot deleted",
        description: "Your slot has been deleted for this date.",
      })
    } catch (err) {
      // Rollback on error
      setSlots(prev => [...prev, originalSlot])
      
      let errorMessage = 'Failed to delete slot'
      let toastTitle = "Error deleting slot"
      
      if (err instanceof SlotApiError) {
        errorMessage = err.userMessage
        
        switch (err.code) {
          case 'NOT_FOUND':
            toastTitle = "Slot Not Found"
            errorMessage = "The slot you're trying to delete no longer exists."
            break
          case 'NETWORK_ERROR':
            toastTitle = "Connection Error"
            break
          default:
            toastTitle = "Error deleting slot"
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setDateErrors(prev => new Map(prev).set(date, errorMessage))
      toast({
        title: toastTitle,
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }, [slots, toast, api])

  const getSlotsForDate = useCallback((date: Date): TimeSlot[] => {
    const dateStr = DateUtils.formatDate(date)
    return slots.filter(slot => slot.date === dateStr)
  }, [slots])

  const canAddSlot = useCallback((date: Date): boolean => {
    const daySlots = getSlotsForDate(date)
    return daySlots.length < 2
  }, [getSlotsForDate])

  // Enhanced function to check if a specific time slot can be added
  const canAddSlotAtTime = useCallback((date: Date, startTime: string, endTime: string): { canAdd: boolean; reason?: string } => {
    const daySlots = getSlotsForDate(date)
    const dayOfWeek = date.getDay()
    
    const validationResult = SlotValidator.validateSlotCreation(
      startTime,
      endTime,
      dayOfWeek,
      daySlots,
      {
        maxSlotsPerDay: 2,
        enforceBusinessHours: true
      }
    )
    
    return {
      canAdd: validationResult.isValid,
      reason: validationResult.userMessage || validationResult.error
    }
  }, [getSlotsForDate])

  const getErrorForDate = useCallback((date: Date): string | null => {
    const dateStr = DateUtils.formatDate(date)
    return dateErrors.get(dateStr) || null
  }, [dateErrors])

  // Load current week on mount only
  useEffect(() => {
    const weekStart = DateUtils.getWeekStart(new Date())
    loadWeek(weekStart)
  }, []) // Remove loadWeek from dependencies to prevent infinite loop

  return {
    slots,
    isLoading,
    error,
    loadWeek,
    createSlot,
    updateSlot,
    deleteSlot,
    getSlotsForDate,
    canAddSlot,
    canAddSlotAtTime,
    getErrorForDate,
  }
}