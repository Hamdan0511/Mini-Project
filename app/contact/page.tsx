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
  }

  return (
    <>
      <Navigation />
      <PageWrapper>
        <main className="relative w-screen h-screen bg-dark-bg overflow-hidden">
          
          {/* Background */}
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

          {/* Form */}
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
                  textShadow: '0 0 20px rgba(0,255,153,0.8), 0 0 40px rgba(0,255,153,0.4)',
                }}
              >
                Get in Touch
              </motion.h1>

              <p className="text-gray-400 text-center mb-8">
                Have questions? We&apos;d love to hear from you.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">
                    Your Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={() => handleBlur('name')}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 bg-black/50 border-2 rounded-lg text-white outline-none transition-all duration-300"
                    style={{
                      borderColor: isFocused.name ? '#00FF99' : 'rgba(0,255,153,0.2)',
                      boxShadow: isFocused.name
                        ? '0 0 20px rgba(0,255,153,0.5)'
                        : 'none',
                    }}
                  />
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-3 bg-black/50 border-2 rounded-lg text-white outline-none transition-all duration-300"
                    style={{
                      borderColor: isFocused.email ? '#00FF99' : 'rgba(0,255,153,0.2)',
                      boxShadow: isFocused.email
                        ? '0 0 20px rgba(0,255,153,0.5)'
                        : 'none',
                    }}
                  />
                </motion.div>

                {/* Subject */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">
                    Subject
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onFocus={() => handleFocus('subject')}
                    onBlur={() => handleBlur('subject')}
                    placeholder="How can we help?"
                    required
                    className="w-full px-4 py-3 bg-black/50 border-2 rounded-lg text-white outline-none transition-all duration-300"
                    style={{
                      borderColor: isFocused.subject ? '#00FF99' : 'rgba(0,255,153,0.2)',
                      boxShadow: isFocused.subject
                        ? '0 0 20px rgba(0,255,153,0.5)'
                        : 'none',
                    }}
                  />
                </motion.div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">
                    Message
                  </label>

                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => handleFocus('message')}
                    onBlur={() => handleBlur('message')}
                    placeholder="Tell us more about your inquiry..."
                    required
                    className="w-full px-4 py-3 bg-black/50 border-2 rounded-lg text-white outline-none transition-all duration-300 resize-none"
                    style={{
                      borderColor: isFocused.message ? '#00FF99' : 'rgba(0,255,153,0.2)',
                      boxShadow: isFocused.message
                        ? '0 0 20px rgba(0,255,153,0.5)'
                        : 'none',
                    }}
                  />
                </motion.div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  className="w-full py-4 bg-neon-green/10 border-2 border-neon-green rounded-lg text-neon-green font-semibold text-lg hover:bg-neon-green hover:text-black transition-all duration-300"
                  whileHover={{
                    boxShadow: '0 0 40px rgba(0,255,153,0.8)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                </motion.button>

                {/* Contact Info */}
                <div className="pt-6 border-t border-neon-green/20 text-center space-y-2">

                  <p className="text-gray-400 text-sm">
                    Or reach us directly at:
                  </p>

                  <a
                    href="mailto:info@ecoevaluator.com"
                    className="text-neon-green hover:underline"
                  >
                    info@ecoevaluator.com
                  </a>

                </div>

              </form>
            </motion.div>
          </div>

        </main>
      </PageWrapper>
    </>
  )
}