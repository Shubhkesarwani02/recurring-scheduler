"use client"

import { useAuth } from '@clerk/nextjs'
import { useCallback } from 'react'
import { ApiSlot, SlotCreateRequest, SlotUpdateRequest, SlotDeleteRequest, TimeSlot, RecurringSlot } from '@/types/slot'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export function useAuthenticatedApi() {
  const { getToken } = useAuth()

  const fetchWithAuth = useCallback(async (url: string, options?: RequestInit) => {
    try {
      const token = await getToken()
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options?.headers as Record<string, string>,
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
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
  }, [getToken])

  const getSlotsForWeek = useCallback(async (weekStart: string): Promise<TimeSlot[]> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/slots?weekStart=${weekStart}`
    )
    
    const data = await response.json()
    
    return data.slots.map((apiSlot: ApiSlot): TimeSlot => ({
      id: apiSlot.id,
      date: apiSlot.date,
      startTime: apiSlot.start_time,
      endTime: apiSlot.end_time,
      isException: apiSlot.is_exception,
      originalSlotId: apiSlot.original_slot_id,
    }))
  }, [fetchWithAuth])

  const createSlot = useCallback(async (slot: SlotCreateRequest): Promise<RecurringSlot> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/slots`, {
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
  }, [fetchWithAuth])

  const updateSlot = useCallback(async (id: string, update: SlotUpdateRequest): Promise<TimeSlot> => {
    const originalId = id.includes('-') ? id.split('-')[0] : id
    
    const response = await fetchWithAuth(`${API_BASE_URL}/slots/${originalId}`, {
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
  }, [fetchWithAuth])

  const deleteSlot = useCallback(async (id: string, deleteRequest: SlotDeleteRequest): Promise<void> => {
    const originalId = id.includes('-') ? id.split('-')[0] : id
    
    await fetchWithAuth(`${API_BASE_URL}/slots/${originalId}`, {
      method: 'DELETE',
      body: JSON.stringify(deleteRequest),
    })
  }, [fetchWithAuth])

  const healthCheck = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`)
      return response.ok
    } catch {
      return false
    }
  }, [])

  return {
    getSlotsForWeek,
    createSlot,
    updateSlot,
    deleteSlot,
    healthCheck,
  }
}