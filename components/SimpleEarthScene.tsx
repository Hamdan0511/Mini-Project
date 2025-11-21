'use client'

import { useRef, useMemo, useEffect, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Sphere,
  PerspectiveCamera,
  useTexture,
  Stars,
  Preload
} from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import GPSMarker from '@/components/GPSMarker'

// Simple procedural Earth texture
function createEarthTexture() {
  if (typeof document === 'undefined') return null
  
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Ocean background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#001122')
  gradient.addColorStop(0.5, '#002244')
  gradient.addColorStop(1, '#000011')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Add some noise for texture
  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const alpha = Math.random() * 0.1
    ctx.fillStyle = `rgba(0, 255, 153, ${alpha})`
    ctx.fillRect(x, y, 1, 1)
  }

  // Draw continents
  ctx.fillStyle = 'rgba(0, 255, 153, 0.8)'
  
  // North America
  const northAmerica = [
    {x: 0.15, y: 0.25, w: 0.2, h: 0.4},
    {x: 0.12, y: 0.35, w: 0.15, h: 0.2},
    {x: 0.18, y: 0.45, w: 0.12, h: 0.15},
  ]
  
  // South America
  const southAmerica = [
    {x: 0.22, y: 0.55, w: 0.08, h: 0.3},
  ]
  
  // Africa
  const africa = [
    {x: 0.45, y: 0.3, w: 0.1, h: 0.35},
  ]
  
  // Eurasia
  const eurasia = [
    {x: 0.52, y: 0.15, w: 0.3, h: 0.15},
    {x: 0.58, y: 0.25, w: 0.25, h: 0.15},
    {x: 0.65, y: 0.35, w: 0.15, h: 0.1},
  ]
  
  // Australia
  const australia = [
    {x: 0.72, y: 0.65, w: 0.08, h: 0.08},
  ]

  const continents = [...northAmerica, ...southAmerica, ...africa, ...eurasia, ...australia]
  
  continents.forEach(continent => {
    for (let i = 0; i < 2000; i++) {
      const x = continent.x * canvas.width + Math.random() * continent.w * canvas.width
      const y = continent.y * canvas.height + Math.random() * continent.h * canvas.height
      ctx.fillRect(x, y, 1, 1)
    }
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Simple Earth Component
function SimpleEarth() {
  const earthRef = useRef<THREE.Mesh>(null)
  const earthTexture = useMemo(() => createEarthTexture(), [])

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <Sphere ref={earthRef} args={[1, 64, 64]}>
      <meshStandardMaterial
        map={earthTexture}
        emissive={new THREE.Color(0x001133)}
        emissiveIntensity={0.2}
        roughness={0.8}
        metalness={0.1}
        color={new THREE.Color(0xffffff)}
      />
    </Sphere>
  )
}

// Simple Cloud Layer
function SimpleClouds() {
  const cloudRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.12
    }
  })

  return (
    <Sphere ref={cloudRef} args={[1.002, 64, 64]}>
      <meshStandardMaterial
        color="#ffffff"
        transparent
        opacity={0.3}
        emissive="#ffffff"
        emissiveIntensity={0.1}
        depthWrite={false}
      />
    </Sphere>
  )
}

// Simple Atmosphere Glow
function SimpleAtmosphere() {
  return (
    <Sphere args={[1.015, 32, 32]}>
      <meshBasicMaterial
        color="#00FF99"
        transparent
        opacity={0.2}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </Sphere>
  )
}

// Simple Data Hubs
function SimpleDataHubs() {
  const hubs = useMemo(() => {
    const positions = [
      { lat: 40.7128, lng: -74.0060 }, // New York
      { lat: 37.7749, lng: -122.4194 }, // San Francisco
      { lat: 51.5074, lng: -0.1278 }, // London
      { lat: 35.6762, lng: 139.6503 }, // Tokyo
      { lat: 31.2304, lng: 121.4737 }, // Shanghai
    ]

    return positions.map((hub, idx) => {
      const phi = (90 - hub.lat) * (Math.PI / 180)
      const theta = (hub.lng + 180) * (Math.PI / 180)
      
      const x = -(Math.sin(phi) * Math.cos(theta))
      const y = Math.cos(phi)
      const z = Math.sin(phi) * Math.sin(theta)

      return { x, y, z, id: idx }
    })
  }, [])

  const { clock } = useThree()

  return (
    <>
      {hubs.map((hub) => {
        const pulse = Math.sin(clock.elapsedTime * 2 + hub.id) * 0.5 + 0.5
        const scale = 1 + pulse * 0.2

        return (
          <group key={hub.id} position={[hub.x * 1.005, hub.y * 1.005, hub.z * 1.005]}>
            <Sphere args={[0.01 * scale, 16, 16]}>
              <meshStandardMaterial
                color="#FFFFFF"
                emissive="#00FF99"
                emissiveIntensity={1}
              />
            </Sphere>
          </group>
        )
      })}
    </>
  )
}

// Simple Orbiting Rings
function SimpleRings() {
  const ringsRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group ref={ringsRef}>
      {Array.from({ length: 3 }).map((_, idx) => {
        const radius = 1.5 + idx * 0.3
        const opacity = 0.1 - idx * 0.02

        return (
          <mesh key={idx} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + 0.02, 64]} />
            <meshBasicMaterial
              color="#00FF99"
              transparent
              opacity={Math.max(opacity, 0.05)}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Main Scene Component
type SimpleEarthSceneProps = {
  gps?: { lat: number; lng: number } | null
  showTitle?: boolean
}

export default function SimpleEarthScene({ gps, showTitle }: SimpleEarthSceneProps) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  // Animate camera to GPS location when provided
  useEffect(() => {
    if (!gps || !controlsRef.current) return

    const phi = (90 - gps.lat) * (Math.PI / 180)
    const theta = (gps.lng + 180) * (Math.PI / 180)
    const targetVec = new THREE.Vector3(
      -(Math.sin(phi) * Math.cos(theta)),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    )

    const camTarget = targetVec.clone().multiplyScalar(2.5)

    gsap.to(camera.position, {
      duration: 2,
      x: camTarget.x,
      y: camTarget.y,
      z: camTarget.z,
      ease: 'power2.out',
      onUpdate: () => {
        controlsRef.current?.update?.()
      }
    })

    const controlsTarget = controlsRef.current.target
    gsap.to(controlsTarget, {
      duration: 2,
      x: targetVec.x,
      y: targetVec.y,
      z: targetVec.z,
      ease: 'power2.out',
      onUpdate: () => controlsRef.current?.update?.()
    })
  }, [gps, camera])

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#ffffff" />
      <directionalLight
        position={[5, 3, 5]}
        intensity={1.2}
        color="#99FFCC"
        castShadow
      />
      <directionalLight
        position={[-5, -2, -3]}
        intensity={0.4}
        color="#6699FF"
      />

      {/* Earth Components */}
      <Suspense fallback={null}>
        <SimpleEarth />
        <SimpleClouds />
        <SimpleAtmosphere />
        <SimpleDataHubs />
        <SimpleRings />
      </Suspense>

      {/* GPS Marker */}
      {gps && <GPSMarker lat={gps.lat} lng={gps.lng} />}

      {/* Starfield */}
      <Stars
        radius={300}
        depth={60}
        count={5000}
        factor={4}
        saturation={0.2}
        fade
        speed={0.5}
      />

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={2.5}
        maxDistance={15}
        enablePan={false}
        autoRotate={false}
      />
      
      {/* Preload textures */}
      <Preload all />
    </>
  )
}
