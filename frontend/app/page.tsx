"use client"

import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import { Calendar, CheckCircle, Clock, Users, ArrowRight, Star, Zap, Shield, Globe } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SignedOut>
        <LandingPage />
      </SignedOut>
      
      <SignedIn>
        <RedirectToDashboard />
      </SignedIn>
    </div>
  )
}

function RedirectToDashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg">
            <Calendar className="w-16 h-16 text-white" />
          </div>
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4"
        >
          Welcome back!
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 dark:text-gray-300 mb-8"
        >
          Ready to manage your schedule like a pro?
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/dashboard">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-8"
            >
              <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-xl">
                <Calendar className="w-16 h-16 text-white" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent mb-6"
            >
              Recurring Scheduler
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Revolutionize your productivity with intelligent weekly recurring schedules, 
              smart exception handling, and seamless time management.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <SignUpButton>
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-10 rounded-xl text-lg transition-all duration-300 shadow-lg"
                >
                  Get Started Free
                </motion.button>
              </SignUpButton>
              
              <SignInButton>
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "rgb(99, 102, 241)", color: "white" }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-indigo-600 text-indigo-600 font-semibold py-4 px-10 rounded-xl text-lg transition-all duration-300 hover:shadow-lg"
                >
                  Sign In
                </motion.button>
              </SignInButton>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid md:grid-cols-3 gap-8 mb-20"
          >
            <FeatureCard
              icon={<Clock className="w-10 h-10" />}
              title="Smart Recurring Patterns"
              description="Set up intelligent weekly recurring slots that automatically adapt to your schedule"
              delay={0.2}
              gradient="from-blue-500 to-cyan-500"
            />
            
            <FeatureCard
              icon={<CheckCircle className="w-10 h-10" />}
              title="Exception Management"
              description="Effortlessly modify or cancel specific dates without disrupting your recurring pattern"
              delay={0.4}
              gradient="from-green-500 to-emerald-500"
            />
            
            <FeatureCard
              icon={<Shield className="w-10 h-10" />}
              title="Conflict Prevention"
              description="Advanced validation prevents time conflicts and enforces intelligent schedule limits"
              delay={0.6}
              gradient="from-purple-500 to-pink-500"
            />
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 mb-20 border border-white/20"
          >
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <StatCard number="10k+" label="Active Users" />
              <StatCard number="50k+" label="Schedules Created" />
              <StatCard number="99.9%" label="Uptime" />
              <StatCard number="4.9★" label="User Rating" />
            </div>
          </motion.div>

          {/* Features Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 mb-20 border border-white/20"
          >
            <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-12">
              Powerful Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-indigo-600" />
                  Core Features
                </h3>
                <ul className="space-y-4">
                  <FeatureListItem text="Weekly calendar view with infinite scroll" />
                  <FeatureListItem text="Maximum 2 slots per day enforcement" />
                  <FeatureListItem text="Time conflict validation" />
                  <FeatureListItem text="Mobile-first responsive design" />
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-indigo-600" />
                  Smart Management
                </h3>
                <ul className="space-y-4">
                  <FeatureListItem text="Create recurring weekly patterns" />
                  <FeatureListItem text="Exception-based updates for specific dates" />
                  <FeatureListItem text="Optimistic UI with error rollback" />
                  <FeatureListItem text="Real-time validation and feedback" />
                </ul>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
              Ready to organize your schedule?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Join thousands of professionals who trust our platform to manage their time efficiently.
            </p>
            
            <SignUpButton>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-5 px-12 rounded-xl text-xl transition-all duration-300 shadow-lg"
              >
                Start Scheduling Today
              </motion.button>
            </SignUpButton>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  delay, 
  gradient 
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
  gradient: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
    >
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto text-white shadow-lg`}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
        {title}
      </h3>
      <p className="text-gray-600 text-center leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="text-center"
    >
      <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </motion.div>
  )
}

function FeatureListItem({ text }: { text: string }) {
  return (
    <motion.li 
      whileHover={{ x: 10 }}
      className="flex items-center group"
    >
      <CheckCircle className="w-6 h-6 text-green-500 mr-4 group-hover:text-green-600 transition-colors" />
      <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{text}</span>
    </motion.li>
  )
}
