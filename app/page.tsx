'use client'

import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import * as THREE from 'three'
import ImageUpload from '@/components/ImageUpload'
import ResultsPanel from '@/components/ResultsPanel'
import Navigation from '@/components/Navigation'
import PageWrapper from '@/components/PageWrapper'
import ChatBox from '@/components/ChatBox'


const Scene = dynamic(() => import('@/components/RealisticEarth2050'), { ssr: false })

interface GPS {
  lat: number
  lng: number
}

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

export default function Home() {
  const [gps, setGps] = useState<GPS | null>(null)
  const [environment, setEnvironment] = useState<EnvironmentData | null>(null)
  const [value, setValue] = useState<ValueData | null>(null)
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showTitle, setShowTitle] = useState(true)
  const [showUpload, setShowUpload] = useState(true)

  const resetAnalysis = () => {
    setGps(null)
    setEnvironment(null)
    setValue(null)
    setSummary(null)
    setShowResults(false)
    setShowTitle(true)
    setShowUpload(true)
  }

  const handleImageUpload = async (file: File, gpsData?: GPS) => {
    if (!gpsData) return

    setGps(gpsData)
    setShowTitle(false)

    try {
      const [envRes, valRes] = await Promise.all([
        fetch('/api/environment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: gpsData.lat, longitude: gpsData.lng })
        }),
        fetch('/api/value', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: gpsData.lat, longitude: gpsData.lng })
        })
      ])

      const envData = await envRes.json()
      const valData = await valRes.json()

      setEnvironment(envData)
      setValue(valData)

      const summaryRes = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environmentData: envData, valueData: valData })
      })

      const summaryData = await summaryRes.json()
      setSummary(summaryData)
      setShowResults(true)
      setShowUpload(false) // Hide upload after results are shown
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <>
      <Navigation onNewAnalysis={resetAnalysis} showNewAnalysisButton={showResults} />
      <PageWrapper>
        <main className="relative w-screen h-screen bg-dark-bg overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-950/20 via-transparent to-black pointer-events-none z-5" />

          {/* Three.js Canvas */}
          <Canvas
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.3
            }}
            className="absolute inset-0 z-0"
            camera={{ position: [0, 0, 5], fov: 75 }}
          >
            <color attach="background" args={['#000000']} />
            <Suspense fallback={null}>
              <Scene gps={gps} showTitle={showTitle} />
            </Suspense>
          </Canvas>

          {/* Image Upload */}
          {showUpload && <ImageUpload onImageUpload={handleImageUpload} />}

          {/* Results Panels */}  
          <ResultsPanel
            environment={environment}
            value={value}
            summary={summary}
            visible={showResults}
            onNewAnalysis={resetAnalysis}
          />

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-4 left-0 right-0 z-30 text-center pointer-events-none"
          >
            <p className="text-neon-green text-sm font-light">
              Powered by ΞCΘΣVΛLบΛTΘR 🌿
            </p>
          </motion.div>

          {/* EcoBot Chat */}
          <ChatBox />
        </main>
      </PageWrapper>
    </>
  )
}
