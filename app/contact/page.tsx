'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import PageWrapper from '@/components/PageWrapper'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFocus = (field: string) => {
    setIsFocused({ ...isFocused, [field]: true })
  }

  const handleBlur = (field: string) => {
    setIsFocused({ ...isFocused, [field]: false })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form submitted:', formData)
    // Add form submission logic here
  }

  return (
    <>
      <Navigation />
      <PageWrapper>
        <main className="relative w-screen h-screen bg-dark-bg overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-950/20 via-black to-black" />

          {/* Animated Lines */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-px bg-gradient-to-r from-transparent via-neon-green to-transparent"
                style={{
                  width: '100%',
                  top: `${i * 10}%`,
                }}
                animate={{
                  x: ['-100%', '100%'],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

        {/* Contact Form */}
        <div className="relative z-10 h-full flex items-center justify-center px-6 py-20 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-2xl glass-card p-8 md:p-12 rounded-2xl my-8"
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-3 text-neon-green text-center"
              style={{
                textShadow: '0 0 20px rgba(0, 255, 153, 0.8), 0 0 40px rgba(0, 255, 153, 0.4)',
              }}
            >
              Get in Touch
            </motion.h1>

            <p className="text-gray-400 text-center mb-8">
              Have questions? We'd love to hear from you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleFocus('name')}
                  onBlur={() => handleBlur('name')}
                  className="w-full px-4 py-3 bg-black/50 border-2 rounded-lg text-white outline-none transition-all duration-300"
                  style={{
                    borderColor: isFocused.name ? '#00FF99' : 'rgba(0, 255, 153, 0.2)',
                    boxShadow: isFocused.name
                      ? '0 0 20px rgba(0, 255, 153, 0.5), inset 0 0 10px rgba(0, 255, 153, 0.1)'
                      : 'none',
                  }}
                  placeholder="John Doe"
                  required
                />
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  className="w-full px-4 py-3 bg-black/50 border-2 rounded-lg text-white outline-none transition-all duration-300"
                  style={{
                    borderColor: isFocused.email ? '#00FF99' : 'rgba(0, 255, 153, 0.2)',
                    boxShadow: isFocused.email
                      ? '0 0 20px rgba(0, 255, 153, 0.5), inset 0 0 10px rgba(0, 255, 153, 0.1)'
                      : 'none',
                  }}
                  placeholder="john@example.com"
                  required
                />
              </motion.div>

              {/* Subject Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onFocus={() => handleFocus('subject')}
                  onBlur={() => handleBlur('subject')}
                  className="w-full px-4 py-3 bg-black/50 border-2 rounded-lg text-white outline-none transition-all duration-300"
                  style={{
                    borderColor: isFocused.subject ? '#00FF99' : 'rgba(0, 255, 153, 0.2)',
                    boxShadow: isFocused.subject
                      ? '0 0 20px rgba(0, 255, 153, 0.5), inset 0 0 10px rgba(0, 255, 153, 0.1)'
                      : 'none',
                  }}
                  placeholder="How can we help?"
                  required
                />
              </motion.div>

              {/* Message Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleFocus('message')}
                  onBlur={() => handleBlur('message')}
                  rows={5}
                  className="w-full px-4 py-3 bg-black/50 border-2 rounded-lg text-white outline-none transition-all duration-300 resize-none"
                  style={{
                    borderColor: isFocused.message ? '#00FF99' : 'rgba(0, 255, 153, 0.2)',
                    boxShadow: isFocused.message
                      ? '0 0 20px rgba(0, 255, 153, 0.5), inset 0 0 10px rgba(0, 255, 153, 0.1)'
                      : 'none',
                  }}
                  placeholder="Tell us more about your inquiry..."
                  required
                />
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                type="submit"
                className="w-full py-4 bg-neon-green/10 border-2 border-neon-green rounded-lg text-neon-green font-semibold text-lg transition-all duration-300 hover:bg-neon-green hover:text-black"
                style={{
                  boxShadow: '0 0 20px rgba(0, 255, 153, 0.3)',
                }}
                whileHover={{
                  boxShadow: '0 0 40px rgba(0, 255, 153, 0.8), 0 0 60px rgba(0, 255, 153, 0.4)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                Send Message
              </motion.button>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-6 border-t border-neon-green/20 text-center space-y-3"
              >
                <p className="text-gray-400 text-sm">Or reach us directly at:</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
                  <a
                    href="mailto:info@ecoevaluator.com"
                    className="text-neon-green hover:underline transition-all duration-300"
                    style={{
                      textShadow: '0 0 10px rgba(0, 255, 153, 0.5)',
                    }}
                  >
                    info@ecoevaluator.com
                  </a>
                  <span className="text-gray-600 hidden sm:block">•</span>
                  <a
                    href="tel:+1234567890"
                    className="text-neon-green hover:underline transition-all duration-300"
                    style={{
                      textShadow: '0 0 10px rgba(0, 255, 153, 0.5)',
                    }}
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </main>
    </PageWrapper>
    </>
  )
}
