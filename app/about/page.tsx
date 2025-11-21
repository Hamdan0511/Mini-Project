'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import PageWrapper from '@/components/PageWrapper'

export default function About() {
  return (
    <>
      <Navigation />
      <PageWrapper>
        <main className="relative w-screen h-screen bg-dark-bg overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-950/20 via-black to-black" />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 255, 153, 0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(0, 255, 153, 0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl glass-card p-8 md:p-12 rounded-2xl"
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 text-neon-green"
              style={{
                textShadow: '0 0 20px rgba(0, 255, 153, 0.8), 0 0 40px rgba(0, 255, 153, 0.4)',
              }}
            >
              About EcoEvaluator
            </motion.h1>

            <div className="space-y-6 text-gray-300">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg leading-relaxed"
              >
                EcoEvaluator is a cutting-edge platform that bridges the gap between
                environmental consciousness and property valuation. Using advanced AI and
                real-time environmental data, we help you understand your land's ecological
                footprint and its future value.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="border-l-2 border-neon-green pl-6 py-2"
              >
                <h2 className="text-2xl font-semibold text-neon-green mb-4">Our Mission</h2>
                <p className="text-lg leading-relaxed">
                  To empower property owners with the knowledge and tools to make sustainable
                  choices that benefit both the environment and their investment portfolio.
                  We believe that understanding environmental impact is crucial for a
                  sustainable future and smarter real estate desicions. 
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="grid md:grid-cols-3 gap-6 mt-8"
              >
                <div className="glass-card p-6 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all duration-300">
                  <div className="text-4xl mb-4">🌍</div>
                  <h3 className="text-xl font-semibold text-neon-green mb-2">
                    Environmental Data
                  </h3>
                  <p className="text-sm">
                    Real-time air quality, weather, and vegetation analysis for comprehensive
                    environmental insights.
                  </p>
                </div>

                <div className="glass-card p-6 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all duration-300">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-neon-green mb-2">
                    Value Projection
                  </h3>
                  <p className="text-sm">
                    AI-powered predictions of property value changes based on environmental
                    factors and market trends.
                  </p>
                </div>

                <div className="glass-card p-6 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all duration-300">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-neon-green mb-2">
                    Actionable Insights
                  </h3>
                  <p className="text-sm">
                    Personalized recommendations to improve your property's environmental
                    score and market value.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 text-center"
              >
                <p className="text-neon-green text-sm font-light">
                  Building a sustainable future, one property at a time 🌱
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </PageWrapper>
    </>
  )
}
