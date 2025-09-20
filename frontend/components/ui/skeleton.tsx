import { cn } from '@/lib/utils'
import { motion } from "framer-motion"

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }

// Enhanced skeleton components for the scheduler app
export function ScheduleSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-48 h-4" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="w-20 h-8 rounded-lg" />
            <Skeleton className="w-24 h-8 rounded-lg" />
            <Skeleton className="w-10 h-8 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-16 h-8" />
              </div>
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Calendar Skeleton */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
        <div className="space-y-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-8 rounded-lg" />
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Skeleton className="w-full h-16 rounded-xl" />
              </motion.div>
            ))}
          </div>

          {/* Content Area */}
          <div className="space-y-4">
            <Skeleton className="w-full h-32 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SlotSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="w-24 h-5" />
                <Skeleton className="w-16 h-4" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
