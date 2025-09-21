'use client'

import React from 'react'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ErrorHandlerProps {
  children: React.ReactNode
}

export function GlobalErrorHandler({ children }: ErrorHandlerProps) {
  const { toast } = useToast()

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Don't show toast for network errors or API errors that are already handled
      if (event.reason?.name === 'SlotApiError' || event.reason?.name === 'ValidationError') {
        return
      }
      
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error)
      
      // Filter out common non-critical errors
      const message = event.message || ''
      const isCritical = !message.includes('ResizeObserver') && 
                        !message.includes('Non-Error promise rejection') &&
                        !message.includes('Loading chunk')
      
      if (isCritical) {
        toast({
          title: "Application Error",
          description: "An error occurred while running the application. Please refresh the page if issues persist.",
          variant: "destructive",
        })
      }
    }

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    // Clean up
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [toast])

  return <>{children}</>
}

// Error boundary component for React errors
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                An unexpected error occurred. Please refresh the page to continue.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}