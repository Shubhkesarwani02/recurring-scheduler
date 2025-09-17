"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { TimePicker } from "@/components/time-picker"
import { TimeSlot } from "@/types/slot"

interface DaySchedule {
  date: Date
  slots: TimeSlot[]
}

interface DaySlotProps {
  date: Date
  schedule: DaySchedule
  onAddSlot: (date: Date, startTime: string, endTime: string) => Promise<void>
  onUpdateSlot: (date: Date, slotId: string, startTime: string, endTime: string) => Promise<void>
  onDeleteSlot: (date: Date, slotId: string) => Promise<void>
  canAddSlot?: boolean
  error?: string | null
}

export function DaySlot({ 
  date, 
  schedule, 
  onAddSlot, 
  onUpdateSlot, 
  onDeleteSlot, 
  canAddSlot = true,
  error
}: DaySlotProps) {
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isToday = date.toDateString() === new Date().toDateString()
  const dayName = format(date, "EEE")
  const dayDate = format(date, "dd")
  const monthName = format(date, "MMMM")

  const handleAddSlot = () => {
    if (canAddSlot) {
      setEditingSlot(null)
      setShowTimePicker(true)
    }
  }

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot)
    setShowTimePicker(true)
  }

  const handleSaveTime = async (startTime: string, endTime: string) => {
    setIsLoading(true)
    try {
      if (editingSlot) {
        await onUpdateSlot(date, editingSlot.id, startTime, endTime)
      } else {
        await onAddSlot(date, startTime, endTime)
      }
      setShowTimePicker(false)
      setEditingSlot(null)
    } catch (error) {
      // Error is handled by the parent component
      console.error('Error saving time:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    setIsLoading(true)
    try {
      await onDeleteSlot(date, slotId)
    } catch (error) {
      // Error is handled by the parent component
      console.error('Error deleting slot:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="mb-4 bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isToday ? "text-blue-500" : "text-gray-600"}`}>
              {dayName}, {dayDate} {monthName}
            </span>
            {isToday && <span className="text-xs text-blue-500 font-medium">(Today)</span>}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          {schedule.slots.map((slot) => (
            <div key={slot.id} className="flex items-center gap-3">
              <button
                onClick={() => handleEditSlot(slot)}
                disabled={isLoading}
                className={`
                  flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-left text-sm 
                  hover:bg-gray-100 transition-colors
                  ${slot.isException ? 'border-orange-300 bg-orange-50' : ''}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{slot.startTime} - {slot.endTime}</span>
                  {slot.isException && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      Modified
                    </span>
                  )}
                </div>
              </button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={() => handleDeleteSlot(slot.id)}
                className="text-gray-400 hover:text-red-500 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {schedule.slots.length === 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                00:00 - 00:00
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddSlot}
                disabled={!canAddSlot || isLoading}
                className="text-gray-400 hover:text-blue-500 p-2"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}

          {schedule.slots.length > 0 && canAddSlot && (
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                00:00 - 00:00
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddSlot}
                disabled={!canAddSlot || isLoading}
                className="text-gray-400 hover:text-blue-500 p-2"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}

          {!canAddSlot && schedule.slots.length > 0 && (
            <div className="text-xs text-gray-500 text-center py-2">
              Maximum 2 slots per day
            </div>
          )}
        </div>
      </div>

      {showTimePicker && (
        <TimePicker
          initialStartTime={editingSlot?.startTime || "09:00"}
          initialEndTime={editingSlot?.endTime || "10:00"}
          onSave={handleSaveTime}
          onCancel={() => {
            setShowTimePicker(false)
            setEditingSlot(null)
          }}
          isLoading={isLoading}
        />
      )}
    </>
  )
}
