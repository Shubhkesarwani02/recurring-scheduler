"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DaySlot } from "@/components/day-slot"
import { Menu, Home, Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns"
import { useSchedule } from "@/hooks/use-schedule"
import { DateUtils } from "@/lib/api"
import { TimeSlot } from "@/types/slot"

interface DaySchedule {
  date: Date
  slots: TimeSlot[]
}

export function ScheduleCalendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const {
    slots,
    isLoading,
    error,
    loadWeek,
    createSlot,
    updateSlot,
    deleteSlot,
    getSlotsForDate,
    canAddSlot,
    getErrorForDate
  } = useSchedule()

  // Generate current week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }) // Sunday
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const monthYear = format(currentWeek, "MMMM yyyy")

  // Load new week data when week changes
  useEffect(() => {
    const weekStartStr = DateUtils.getWeekStart(currentWeek)
    loadWeek(weekStartStr)
  }, [currentWeek]) // Remove loadWeek from dependencies to prevent infinite loop

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1))
  }

  const addSlot = async (date: Date, startTime: string, endTime: string) => {
    try {
      const dayOfWeek = DateUtils.getDayOfWeek(date)
      await createSlot({
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
      })
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to create slot:', error)
    }
  }

  const updateSlotHandler = async (date: Date, slotId: string, startTime: string, endTime: string) => {
    try {
      await updateSlot(slotId, {
        date: DateUtils.formatDate(date),
        start_time: startTime,
        end_time: endTime,
      })
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to update slot:', error)
    }
  }

  const deleteSlotHandler = async (date: Date, slotId: string) => {
    try {
      await deleteSlot(slotId, DateUtils.formatDate(date))
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to delete slot:', error)
    }
  }

  const getDaySchedule = (date: Date): DaySchedule => {
    const daySlots = getSlotsForDate(date)
    return { date, slots: daySlots }
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <Menu className="w-6 h-6 text-gray-600" />
        <h1 className="text-lg font-semibold text-gray-900">Your Schedule</h1>
        <Button variant="secondary" size="sm" className="bg-gray-200 text-gray-700 hover:bg-gray-300">
          Save
        </Button>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="p-4 text-center text-gray-500">
          Loading schedule...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Week Navigation */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek('prev')}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <button className="flex items-center gap-1 text-lg font-semibold text-gray-900">
            {monthYear}
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek('next')}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Week Calendar Header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={index} className="text-center text-sm text-gray-500 font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-6">
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString()
            const isCurrentMonth = date.getMonth() === currentWeek.getMonth()
            const daySlots = getSlotsForDate(date)
            const hasSlots = daySlots.length > 0

            return (
              <div
                key={index}
                className={`
                  text-center py-2 text-sm rounded-lg relative
                  ${
                    isToday
                      ? "bg-blue-500 text-white font-semibold"
                      : isCurrentMonth
                        ? "text-gray-900"
                        : "text-gray-400"
                  }
                `}
              >
                {format(date, "d")}
                {hasSlots && (
                  <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                    isToday ? 'bg-white' : 'bg-blue-500'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily Slots */}
      <div className="px-4 pb-20">
        {weekDates.map((date) => (
          <DaySlot
            key={date.toISOString()}
            date={date}
            schedule={getDaySchedule(date)}
            onAddSlot={addSlot}
            onUpdateSlot={updateSlotHandler}
            onDeleteSlot={deleteSlotHandler}
            canAddSlot={canAddSlot(date)}
            error={getErrorForDate(date)}
          />
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
        <div className="grid grid-cols-2">
          <button className="flex flex-col items-center py-3 text-gray-600 hover:text-gray-800">
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center py-3 text-blue-500">
            <Calendar className="w-6 h-6 mb-1" />
            <span className="text-xs">Schedule</span>
          </button>
        </div>
      </div>
    </div>
  )
}
