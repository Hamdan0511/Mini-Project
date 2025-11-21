'use client'

import { motion } from 'framer-motion'

interface EnvironmentData {
  coordinates: { lat: number; lng: number }
  airQuality: { aqi: number; quality: string }
  weather: { temperature: number; humidity: number; windSpeed: number }
  vegetation: { index: number; type: string }
}

interface ValueData {
  currentValue: number
  projectedValue5yr: number
  growthRate: number
  currency: string
}

interface SummaryData {
  summary: string
  recommendations: string[]
  riskLevel: string
}

interface ResultsPanelProps {
  environment: EnvironmentData | null
  value: ValueData | null
  summary: SummaryData | null
  visible: boolean
  onNewAnalysis?: () => void
}

export default function ResultsPanel({ environment, value, summary, visible, onNewAnalysis }: ResultsPanelProps) {
  if (!visible || !environment || !value || !summary) return null

  return (
    <>
      {/* Left Panel - Environment Data */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 z-30 pointer-events-auto"
      >
        <div className="glass-card rounded-2xl p-6 max-w-sm backdrop-blur-xl border border-neon-green/30">
          <h3 className="text-neon-green text-2xl font-bold mb-4 neon-glow">Environment</h3>
          
          {/* Coordinates */}
          <div className="mb-4 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg">
            <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
              <span>📍</span> GPS Coordinates
            </p>
            <p className="text-neon-green text-lg font-bold mb-1">
              {environment.coordinates.lat.toFixed(6)}, {environment.coordinates.lng.toFixed(6)}
            </p>
            <div className="flex gap-4 text-gray-500 text-xs">
              <span>Lat: {environment.coordinates.lat.toFixed(6)}</span>
              <span>Lng: {environment.coordinates.lng.toFixed(6)}</span>
            </div>
          </div>

          {/* Air Quality */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-400 text-sm">Air Quality Index</p>
              <p className="text-neon-green text-xl font-bold">{environment.airQuality.aqi}</p>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(environment.airQuality.aqi / 200) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-2 rounded-full ${
                  environment.airQuality.aqi < 50 ? 'bg-green-500' : 
                  environment.airQuality.aqi < 100 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">{environment.airQuality.quality}</p>
          </div>

          {/* Temperature */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-1">Temperature</p>
            <p className="text-neon-blue text-2xl font-bold">{environment.weather.temperature}°C</p>
          </div>

          {/* Vegetation */}
          <div>
            <p className="text-gray-400 text-sm mb-1">Vegetation Index</p>
            <p className="text-green-400 text-xl font-semibold">{environment.vegetation.index}</p>
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Value Data */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 z-30 pointer-events-auto"
      >
        <div className="glass-card rounded-2xl p-6 max-w-sm backdrop-blur-xl border border-neon-green/30">
          <h3 className="text-neon-green text-2xl font-bold mb-4 neon-glow">Property Value</h3>
          
          {/* Current Value */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-1">Current Value</p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white text-3xl font-bold"
            >
              {value.currency === 'INR' ? '₹' : '$'}{value.currentValue.toLocaleString()}
            </motion.p>
          </div>

          {/* Projected Value */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-1">5-Year Projection</p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-neon-green text-3xl font-bold"
            >
              {value.currency === 'INR' ? '₹' : '$'}{value.projectedValue5yr.toLocaleString()}
            </motion.p>
          </div>

          {/* Growth Rate */}
          <div>
            <p className="text-gray-400 text-sm mb-1">Growth Rate</p>
            <div className="flex items-center gap-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-neon-blue text-2xl font-bold"
              >
                {value.growthRate}%
              </motion.p>
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top-Right Panel - AI Report */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute top-24 right-8 z-30 pointer-events-auto max-w-md"
      >
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl border border-neon-green/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-neon-green text-xl font-bold neon-glow">AI Eco Report</h3>
            {onNewAnalysis && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNewAnalysis}
                className="px-3 py-1.5 text-xs font-medium text-neon-green bg-neon-green/10 border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-all duration-300 flex items-center gap-1.5"
                title="Upload New Photo"
              >
                <span>📸</span>
                <span>New</span>
              </motion.button>
            )}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-gray-300 text-sm leading-relaxed mb-4 max-h-64 overflow-y-auto custom-scrollbar"
          >
            {summary.summary}
          </motion.div>

          {/* Risk Level */}
          <div className="mt-4 pt-4 border-t border-neon-green/20">
            <p className="text-gray-400 text-xs mb-2">Risk Level</p>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              summary.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' :
              summary.riskLevel === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {summary.riskLevel}
            </span>
          </div>
        </div>
      </motion.div>
    </>
  )
}

