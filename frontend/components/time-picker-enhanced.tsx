"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Calendar as CalendarIcon
} from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  date?: Date
  initialStartTime?: string
  initialEndTime?: string
  onConfirm: (startTime: string, endTime: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function TimePicker({ 
  date,
  initialStartTime = "09:00", 
  initialEndTime = "10:00", 
  onConfirm, 
  onCancel, 
  isLoading = false 
}: TimePickerProps) {
  const [startTime, setStartTime] = useState(initialStartTime)
  const [endTime, setEndTime] = useState(initialEndTime)
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate time options (every 15 minutes)
  const generateTimeOptions = () => {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        times.push(timeString)
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  // Validation
  const validateTimes = () => {
    const newErrors: string[] = []

    if (!startTime || !endTime) {
      newErrors.push("Both start and end times are required")
      return newErrors
    }

    const start = new Date(`1970-01-01T${startTime}:00`)
    const end = new Date(`1970-01-01T${endTime}:00`)

    if (start >= end) {
      newErrors.push("End time must be after start time")
    }

    const duration = (end.getTime() - start.getTime()) / (1000 * 60) // minutes
    if (duration < 15) {
      newErrors.push("Minimum duration is 15 minutes")
    }

    if (duration > 480) { // 8 hours
      newErrors.push("Maximum duration is 8 hours")
    }

    return newErrors
  }

  useEffect(() => {
    setErrors(validateTimes())
  }, [startTime, endTime])

  const handleConfirm = async () => {
    const validationErrors = validateTimes()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(startTime, endTime)
    } catch (error) {
      console.error('Failed to save time slot:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime12Hour = (time: string) => {
    try {
      return format(new Date(`1970-01-01T${time}`), 'h:mm a')
    } catch {
      return time
    }
  }

  const getDurationText = () => {
    try {
      const start = new Date(`1970-01-01T${startTime}:00`)
      const end = new Date(`1970-01-01T${endTime}:00`)
      const diff = (end.getTime() - start.getTime()) / (1000 * 60)
      const hours = Math.floor(diff / 60)
      const minutes = diff % 60
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      }
      return `${minutes}m`
    } catch {
      return ''
    }
  }

  const quickTimeSlots = [
    { label: "30 min", duration: 30 },
    { label: "1 hour", duration: 60 },
    { label: "1.5 hours", duration: 90 },
    { label: "2 hours", duration: 120 },
  ]

  const setQuickDuration = (minutes: number) => {
    const start = new Date(`1970-01-01T${startTime}:00`)
    const end = new Date(start.getTime() + minutes * 60000)
    const endTimeStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
    setEndTime(endTimeStr)
  }

  return (
    <Card className="w-full max-w-md bg-white border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-lg">Set Time Slot</span>
            {date && (
              <p className="text-sm font-normal text-gray-500 mt-1">
                {format(date, "EEEE, MMMM d")}
              </p>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Time Duration Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-900">
            <span>{formatTime12Hour(startTime)}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span>{formatTime12Hour(endTime)}</span>
          </div>
          {getDurationText() && (
            <p className="text-sm text-gray-600 mt-1">Duration: {getDurationText()}</p>
          )}
        </motion.div>

        {/* Quick Duration Buttons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Quick Duration</Label>
          <div className="grid grid-cols-4 gap-2">
            {quickTimeSlots.map((slot) => (
              <motion.button
                key={slot.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQuickDuration(slot.duration)}
                className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-colors"
              >
                {slot.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-time" className="text-sm font-medium text-gray-700">
              Start Time
            </Label>
            <select
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {formatTime12Hour(time)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-time" className="text-sm font-medium text-gray-700">
              End Time
            </Label>
            <select
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {formatTime12Hour(time)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Validation Errors */}
        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {errors.map((error, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={errors.length > 0 || isSubmitting}
            className={cn(
              "flex-1 h-11 transition-all duration-200",
              errors.length === 0 
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl" 
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}