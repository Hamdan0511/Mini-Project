'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { parse } from 'exifr'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageUploadProps {
  onImageUpload: (file: File, gps?: { lat: number; lng: number }) => void
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setAnalyzing(true)
      setError(null)
      setGpsCoordinates(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      try {
        // Extract GPS data using exifr
        const gps = await parse(file, { gps: true })

        if (gps && gps.latitude && gps.longitude) {
          const latitude = gps.latitude
          const longitude = gps.longitude
          
          // Store coordinates to display
          setGpsCoordinates({ lat: latitude, lng: longitude })
          
          // Simulate analysis delay
          setTimeout(() => {
            onImageUpload(file, { lat: latitude, lng: longitude })
            setAnalyzing(false)
          }, 2000)
        } else {
          setError('No location data found')
          setAnalyzing(false)
        }
      } catch (err) {
        console.error('Error extracting GPS:', err)
        setError('Failed to extract location data')
        setAnalyzing(false)
      }
    },
    [onImageUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic', '.heif']
    },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  })

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div
          {...getRootProps()}
          className={`
            relative glass-card border-2 rounded-2xl p-8 cursor-pointer
            transition-all duration-300 min-w-[400px] max-w-md
            ${isDragActive || isDragging ? 'neon-border scale-105' : 'border-neon-green/30 hover:border-neon-green/60'}
            ${analyzing ? 'pointer-events-none opacity-75' : ''}
          `}
          style={{
            backdropFilter: 'blur(20px)',
          }}
        >
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {!preview && !analyzing && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-neon-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-neon-green text-xl font-semibold mb-2">
                  {isDragActive ? 'Drop your image here' : 'Drop an image of your land'}
                </p>
                <p className="text-gray-400 text-sm">
                  Supported: JPEG, PNG, HEIC
                </p>
              </motion.div>
            )}

            {preview && analyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div className="relative w-64 h-40 mx-auto mb-4 rounded-lg overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full"
                    />
                  </div>
                </div>
                <p className="text-neon-green text-xl font-semibold mb-3">
                  Analyzing land...
                </p>
                
                {/* Display GPS Coordinates */}
                {gpsCoordinates && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-3 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg"
                  >
                    <p className="text-gray-400 text-xs mb-1">📍 Location Found</p>
                    <p className="text-neon-green text-lg font-bold">
                      {gpsCoordinates.lat.toFixed(6)}, {gpsCoordinates.lng.toFixed(6)}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Latitude: {gpsCoordinates.lat.toFixed(6)} | Longitude: {gpsCoordinates.lng.toFixed(6)}
                    </p>
                  </motion.div>
                )}
                
                <p className="text-gray-400 text-sm">
                  {gpsCoordinates ? 'Fetching environmental data...' : 'Extracting GPS coordinates...'}
                </p>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-red-400"
              >
                <p className="text-lg font-semibold mb-2">
                  ⚠️ {error}
                </p>
                <p className="text-sm text-gray-400">
                  Please upload an image with GPS metadata
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

