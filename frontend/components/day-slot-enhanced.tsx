"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  Edit3, 
  Clock, 
  Calendar as CalendarIcon
} from "lucide-react"
import { format } from "date-fns"
import { TimePicker } from "@/components/time-picker-enhanced"
import { TimeSlot } from "@/types/slot"
import { DateUtils } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface DaySchedule {
  date: Date
  slots: TimeSlot[]
}

interface DaySlotProps {
  daySchedule: DaySchedule
  onAddSlot: (date: Date, startTime: string, endTime: string) => Promise<void>
  onUpdateSlot: (date: Date, slotId: string, startTime: string, endTime: string) => Promise<void>
  onDeleteSlot: (date: Date, slotId: string) => Promise<void>
  canAddSlot?: boolean
  error?: string | null
}

export function DaySlot({ 
  daySchedule, 
  onAddSlot, 
  onUpdateSlot, 
  onDeleteSlot, 
  canAddSlot = true,
  error
}: DaySlotProps) {
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const { date, slots } = daySchedule
  
  // Use IST-aware date comparison for today
  const isToday = DateUtils.isToday(DateUtils.formatDate(date))

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

  const handleDeleteSlot = async (slot: TimeSlot) => {
    setIsLoading(slot.id)
    try {
      await onDeleteSlot(date, slot.id)
    } finally {
      setIsLoading(null)
    }
  }

  const handleTimeConfirm = async (startTime: string, endTime: string) => {
    try {
      if (editingSlot) {
        await onUpdateSlot(date, editingSlot.id, startTime, endTime)
      } else {
        await onAddSlot(date, startTime, endTime)
      }
      setShowTimePicker(false)
      setEditingSlot(null)
    } catch (error) {
      // Error handling is managed by the parent component
      console.error('Failed to save slot:', error)
    }
  }

  const formatTime = (time: string) => {
    try {
      return format(new Date(`1970-01-01T${time}`), 'h:mm a')
    } catch {
      return time
    }
  }

  return (
    <div className="space-y-4">
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className={cn(
            "p-2 md:p-3 rounded-xl shadow-lg",
            isToday 
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" 
              : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
          )}>
            <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <p className={cn(
              "font-semibold text-sm md:text-base",
              isToday ? "text-indigo-600" : "text-gray-900 dark:text-gray-100"
            )}>
              {format(date, "EEEE")}
            </p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              {format(date, "MMMM d, yyyy")}
            </p>
          </div>
          {isToday && (
            <Badge className="bg-indigo-100 text-indigo-600 border-indigo-200 text-xs">
              Today
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-gray-600 dark:text-gray-300 text-xs">
            {slots.length} slot{slots.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slots List */}
      <div className="space-y-2 md:space-y-3">
        <AnimatePresence>
          {slots.map((slot, index) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                      <div className="p-1.5 md:p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                          <span className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100 truncate">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                          {slot.isException && (
                            <Badge variant="secondary" className="text-xs">
                              Modified
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          Duration: {(() => {
                            const start = new Date(`1970-01-01T${slot.startTime}`)
                            const end = new Date(`1970-01-01T${slot.endTime}`)
                            const diff = (end.getTime() - start.getTime()) / (1000 * 60)
                            const hours = Math.floor(diff / 60)
                            const minutes = diff % 60
                            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditSlot(slot)}
                        className="p-1.5 md:p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteSlot(slot)}
                        disabled={isLoading === slot.id}
                        className="p-1.5 md:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading === slot.id ? (
                          <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {slots.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 md:py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600"
          >
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="p-3 md:p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-sm md:text-base">No slots scheduled</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Add your first time slot for this day</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Slot Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: slots.length * 0.1 + 0.2 }}
      >
        <Button
          onClick={handleAddSlot}
          disabled={!canAddSlot}
          className={cn(
            "w-full h-11 md:h-12 rounded-xl transition-all duration-200 text-sm md:text-base",
            canAddSlot
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          )}
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          {canAddSlot ? "Add Time Slot" : "Maximum slots reached (2/2)"}
        </Button>
      </motion.div>

      {/* Time Picker Modal */}
      <AnimatePresence>
        {showTimePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4"
            onClick={() => setShowTimePicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] md:max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {editingSlot ? "Edit Time Slot" : "Add Time Slot"}
                  </h3>
                  <button
                    onClick={() => setShowTimePicker(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl md:text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                
                <TimePicker
                  date={date}
                  initialStartTime={editingSlot?.startTime}
                  initialEndTime={editingSlot?.endTime}
                  onConfirm={handleTimeConfirm}
                  onCancel={() => setShowTimePicker(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}