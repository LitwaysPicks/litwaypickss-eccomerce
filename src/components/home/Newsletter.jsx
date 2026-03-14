import React, { useState } from 'react'
import { Mail, Gift, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success('Successfully subscribed to newsletter!')
      setEmail('')
      setIsLoading(false)
    }, 1000)
  }

  return (
    <section className="py-16">
      <div className="card-elevated bg-gradient-to-br from-primary-600 via-primary-700 to-orange-600 text-white overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 bg-white rounded-full"></div>
        </div>
        
        <div className="p-12 text-center relative z-10 space-y-8">
          <div className="flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full border border-white/30 shadow-xl">
              <Mail className="h-12 w-12" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">EXCLUSIVE OFFERS</span>
            </div>
            
            <h3 className="text-3xl md:text-5xl font-bold leading-tight">
              Stay Updated with LitwayPicks
            </h3>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto leading-relaxed">
              Subscribe to our newsletter and be the first to know about new products, 
              exclusive deals, and special offers.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 max-w-md mx-auto">
            <Gift className="h-5 w-5 text-orange-200" />
            <span className="text-orange-100 font-medium">Get 10% off your first order when you subscribe!</span>
          </div>

          <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-white text-primary-600 hover:bg-orange-50 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </form>

          <p className="text-sm text-orange-100/80">
            By subscribing, you agree to receive marketing emails from LitwayPicks. 
            You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  )
}