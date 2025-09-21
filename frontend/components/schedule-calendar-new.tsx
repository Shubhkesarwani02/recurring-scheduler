"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DaySlot } from "@/components/day-slot-enhanced"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScheduleSkeleton } from "@/components/ui/skeleton"
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Settings,
  Bell,
  TrendingUp
} from "lucide-react"
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, isSameDay } from "date-fns"
import { useSchedule } from "@/hooks/use-schedule"
import { DateUtils } from "@/lib/api"
import { TimeSlot } from "@/types/slot"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface DaySchedule {
  date: Date
  slots: TimeSlot[]
}

export function ScheduleCalendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
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

  // Calculate stats with IST-aware date handling
  const totalSlots = slots.length
  const todayIST = DateUtils.getTodayIST()
  const todaySlots = slots.filter(slot => slot.date === todayIST).length
  const upcomingSlots = weekDates.reduce((acc, date) => acc + getSlotsForDate(date).length, 0)

  // Show skeleton loading state
  if (isLoading && slots.length === 0) {
    return <ScheduleSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm sticky top-0 z-50 dark:bg-gray-900/80 dark:border-gray-700/20"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg"
              >
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Your Schedule
                </h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Manage your weekly recurring slots</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Badge variant="secondary" className="hidden md:flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3" />
                {totalSlots} total slots
              </Badge>
              <Button variant="outline" size="sm" className="hidden lg:flex">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-lg dark:bg-gray-800/80 dark:border-gray-700/20">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Today's Slots</p>
                  <p className="text-xl md:text-2xl font-bold text-indigo-600">={todaySlots}</p>
                </div>
                <div className="p-2 md:p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-lg dark:bg-gray-800/80 dark:border-gray-700/20">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">This Week</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">{upcomingSlots}</p>
                </div>
                <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-lg dark:bg-gray-800/80 dark:border-gray-700/20 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Slots</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-600">{totalSlots}</p>
                </div>
                <div className="p-2 md:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading and Error States */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-lg rounded-2xl px-6 py-4 shadow-lg">
                <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                <span className="text-gray-600">Loading your schedule...</span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-xl dark:bg-gray-800/80 dark:border-gray-700/20">
            <CardHeader className="pb-2 md:pb-4">
              <div className="flex items-center justify-between">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateWeek('prev')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
                
                <motion.h2 
                  key={monthYear}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                  {monthYear}
                </motion.h2>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateWeek('next')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mt-4 md:mt-6">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                  <div key={index} className="text-center text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium p-1 md:p-2">
                    <span className="hidden sm:inline">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}</span>
                    <span className="sm:hidden">{day}</span>
                  </div>
                ))}
              </div>

              {/* Week Dates */}
              <div className="grid grid-cols-7 gap-1">
                {weekDates.map((date, index) => {
                  const daySlots = getSlotsForDate(date)
                  const isSelected = selectedDate && isSameDay(date, selectedDate)
                  
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(isSelected ? null : date)}
                      className={cn(
                        "relative p-2 md:p-3 rounded-xl text-center transition-all duration-200",
                        isToday(date) 
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg" 
                          : isSelected
                          ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700",
                        daySlots.length > 0 && !isToday(date) && "border-2 border-indigo-200 dark:border-indigo-700"
                      )}
                    >
                      <div className="text-sm md:text-lg font-medium">
                        {format(date, "d")}
                      </div>
                      {daySlots.length > 0 && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            "absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full text-xs flex items-center justify-center font-bold",
                            isToday(date) 
                              ? "bg-yellow-400 text-yellow-900" 
                              : "bg-indigo-500 text-white"
                          )}
                        >
                          {daySlots.length}
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <AnimatePresence mode="wait">
                {selectedDate ? (
                  <motion.div
                    key={selectedDate.toISOString()}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {format(selectedDate, "EEEE, MMMM d")}
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                    
                    <DaySlot
                      daySchedule={getDaySchedule(selectedDate)}
                      onAddSlot={addSlot}
                      onUpdateSlot={updateSlotHandler}
                      onDeleteSlot={deleteSlotHandler}
                      canAddSlot={canAddSlot(selectedDate)}
                      error={getErrorForDate(selectedDate)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 md:py-12 text-gray-500 dark:text-gray-400"
                  >
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a date to view and manage your slots</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}