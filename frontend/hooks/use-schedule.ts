"use client"

import { useState, useEffect, useCallback } from 'react'
import { SlotApiService, DateUtils } from '@/lib/api'
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
  getErrorForDate: (date: Date) => string | null
}

export function useSchedule(): UseScheduleResult {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateErrors, setDateErrors] = useState<Map<string, string>>(new Map())
  const { toast } = useToast()

  const loadWeek = useCallback(async (weekStart: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const weekSlots = await SlotApiService.getSlotsForWeek(weekStart)
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
    }
  }, [toast])

  const createSlot = useCallback(async (slotData: SlotCreateRequest) => {
    setError(null)
    
    // Optimistic update - add temporary slot
    const tempId = `temp-${Date.now()}`
    const tempDate = DateUtils.formatDate(new Date()) // Today for now, will be improved
    const optimisticSlot: TimeSlot = {
      id: tempId,
      date: tempDate,
      startTime: slotData.start_time,
      endTime: slotData.end_time,
      isException: false,
    }
    
    setSlots(prev => [...prev, optimisticSlot])
    
    try {
      const newSlot = await SlotApiService.createSlot(slotData)
      
      // Replace optimistic slot with real slot
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
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to create slot'
      setError(errorMessage)
      toast({
        title: "Error creating slot",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }, [loadWeek, toast])

  const updateSlot = useCallback(async (id: string, update: SlotUpdateRequest) => {
    setError(null)
    
    // Store original slot for rollback
    const originalSlot = slots.find(slot => slot.id === id)
    if (!originalSlot) return
    
    // Optimistic update
    const updatedSlot: TimeSlot = {
      ...originalSlot,
      startTime: update.start_time || originalSlot.startTime,
      endTime: update.end_time || originalSlot.endTime,
      isException: true,
    }
    
    setSlots(prev => prev.map(slot => slot.id === id ? updatedSlot : slot))
    
    try {
      const result = await SlotApiService.updateSlot(id, update)
      
      // Update with server response
      setSlots(prev => prev.map(slot => slot.id === id ? result : slot))
      
      toast({
        title: "Slot updated",
        description: "Your slot has been updated for this date.",
      })
    } catch (err) {
      // Rollback on error
      setSlots(prev => prev.map(slot => slot.id === id ? originalSlot : slot))
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to update slot'
      setDateErrors(prev => new Map(prev).set(update.date, errorMessage))
      toast({
        title: "Error updating slot",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }, [slots, toast])

  const deleteSlot = useCallback(async (id: string, date: string) => {
    setError(null)
    
    // Store original slot for rollback
    const originalSlot = slots.find(slot => slot.id === id)
    if (!originalSlot) return
    
    // Optimistic update - remove slot
    setSlots(prev => prev.filter(slot => slot.id !== id))
    
    try {
      await SlotApiService.deleteSlot(id, { date })
      
      toast({
        title: "Slot deleted",
        description: "Your slot has been deleted for this date.",
      })
    } catch (err) {
      // Rollback on error
      setSlots(prev => [...prev, originalSlot])
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete slot'
      setDateErrors(prev => new Map(prev).set(date, errorMessage))
      toast({
        title: "Error deleting slot",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }, [slots, toast])

  const getSlotsForDate = useCallback((date: Date): TimeSlot[] => {
    const dateStr = DateUtils.formatDate(date)
    return slots.filter(slot => slot.date === dateStr)
  }, [slots])

  const canAddSlot = useCallback((date: Date): boolean => {
    const daySlots = getSlotsForDate(date)
    return daySlots.length < 2
  }, [getSlotsForDate])

  const getErrorForDate = useCallback((date: Date): string | null => {
    const dateStr = DateUtils.formatDate(date)
    return dateErrors.get(dateStr) || null
  }, [dateErrors])

  // Load current week on mount
  useEffect(() => {
    const weekStart = DateUtils.getWeekStart(new Date())
    loadWeek(weekStart)
  }, [loadWeek])

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
    getErrorForDate,
  }
}