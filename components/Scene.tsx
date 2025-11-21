'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere, PerspectiveCamera, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useState } from 'react'
import gsap from 'gsap'
import GPSMarker from '@/components/GPSMarker'

// Shader for atmosphere glow
const atmosphereVertexShader = `
  varying vec3 vNormal;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragmentShader = `
  uniform vec3 glowColor;
  varying vec3 vNormal;
  
  void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    vec3 glow = glowColor * intensity;
    gl_FragColor = vec4(glow, intensity);
  }
`

function AtmosphereGlow({ glowColor = new THREE.Color('#00FF99') }) {
  const meshRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      glowColor: { value: glowColor },
    }),
    [glowColor]
  )

  return (
    <Sphere args={[1.02, 32, 32]} scale={1.1}>
      <shaderMaterial
        ref={meshRef}
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        transparent
      />
    </Sphere>
  )
}

function GlassOverlay() {
  const glassRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (glassRef.current) {
      // Slight wobble for glass effect
      glassRef.current.rotation.y += 0.0001
    }
  })

  return (
    <Sphere ref={glassRef} args={[1.01, 64, 64]}>
      <meshPhysicalMaterial
        transparent
        opacity={0.1}
        roughness={0}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0}
        ior={1.5}
        transmission={1}
        thickness={0.5}
        side={THREE.DoubleSide}
      />
    </Sphere>
  )
}

function WireframeEarth() {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Mouse movement effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Create dot-grid texture for continent-like pattern
  const dotTexture = useMemo(() => {
    if (typeof document === 'undefined') return null
    
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Dark ocean background
    ctx.fillStyle = '#000011'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Create scattered dots for oceans (subtle green dots)
    for (let i = 0; i < 30000; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      ctx.fillStyle = 'rgba(0, 255, 153, 0.15)'
      ctx.fillRect(x, y, 1, 1)
    }

    // Draw continents as dense dot patterns (not solid blocks)
    ctx.fillStyle = 'rgba(0, 255, 153, 0.8)'
    
    // North America - more detailed shape
    const northAmerica = [
      {x: 0.15, y: 0.25, w: 0.2, h: 0.4}, // Main body
      {x: 0.12, y: 0.35, w: 0.15, h: 0.2}, // Alaska area
      {x: 0.18, y: 0.45, w: 0.12, h: 0.15}, // Central America
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
      {x: 0.52, y: 0.15, w: 0.3, h: 0.15}, // Europe
      {x: 0.58, y: 0.25, w: 0.25, h: 0.15}, // Asia
      {x: 0.65, y: 0.35, w: 0.15, h: 0.1}, // India
    ]
    
    // Australia
    const australia = [
      {x: 0.72, y: 0.65, w: 0.08, h: 0.08},
    ]

    const continents = [...northAmerica, ...southAmerica, ...africa, ...eurasia, ...australia]
    
    continents.forEach(continent => {
      // Create dense dot pattern for each continent
      for (let i = 0; i < 2000; i++) {
        const x = continent.x * canvas.width + Math.random() * continent.w * canvas.width
        const y = continent.y * canvas.height + Math.random() * continent.h * canvas.height
        ctx.fillRect(x, y, 1, 1)
      }
    })

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  // Slow rotation animation with parallax
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Base slow rotation
      groupRef.current.rotation.y += delta * 0.1

      // Subtle parallax on mouse movement
      const targetX = mousePosition.y * 0.15
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshBasicMaterial
          map={dotTexture}
          transparent={true}
          opacity={0.9}
        />
      </Sphere>
    </group>
  )
}

function Hotspots() {
  const hotspots = useMemo(() => {
    const positions = [
      // Europe
      { lat: 50, lng: 10, intensity: 1 },
      { lat: 45, lng: 15, intensity: 0.8 },
      // North America
      { lat: 40, lng: -100, intensity: 1 },
      { lat: 35, lng: -80, intensity: 0.9 },
      // Asia
      { lat: 35, lng: 120, intensity: 0.7 },
      { lat: 30, lng: 100, intensity: 0.8 },
      // Africa
      { lat: -10, lng: 20, intensity: 0.6 },
      { lat: -25, lng: 30, intensity: 0.5 },
    ]

    return positions.map((spot, idx) => {
      const phi = (90 - spot.lat) * (Math.PI / 180)
      const theta = (spot.lng + 180) * (Math.PI / 180)
      
      const x = -(Math.sin(phi) * Math.cos(theta))
      const y = Math.cos(phi)
      const z = Math.sin(phi) * Math.sin(theta)

      return (
        <group key={idx}>
          {/* Main hotspot */}
          <Sphere args={[0.015, 16, 16]} position={[x * 1.01, y * 1.01, z * 1.01]}>
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#FFFFFF"
              emissiveIntensity={spot.intensity * 0.6}
            />
          </Sphere>
          
          {/* Subtle glow ring */}
          <Sphere args={[0.025, 16, 16]} position={[x * 1.01, y * 1.01, z * 1.01]}>
            <meshStandardMaterial
              color="#00FF99"
              transparent={true}
              opacity={0.15}
              emissive="#00FF99"
              emissiveIntensity={0.2}
            />
          </Sphere>

          {/* Radiating lines */}
          {Array.from({ length: 8 }).map((_, lineIdx) => {
            const angle = (lineIdx / 8) * Math.PI * 2
            const endDistance = 0.3 + Math.random() * 0.2
            
            const endX = x * 1.01 + Math.cos(angle) * endDistance
            const endY = y * 1.01 + Math.sin(angle) * endDistance
            const endZ = z * 1.01 + Math.sin(angle * 2) * endDistance * 0.5

            return (
              <line key={lineIdx}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([
                      x * 1.01, y * 1.01, z * 1.01,
                      endX, endY, endZ
                    ])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
              </line>
            )
          })}
        </group>
      )
    })
  }, [])

  return <>{hotspots}</>
}

function Earth() {
  return (
    <group>
      <WireframeEarth />
      <Hotspots />
      <AtmosphereGlow />
    </group>
  )
}

function Starfield() {
  const starsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    const colors = []
    const color = new THREE.Color()

    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000
      const y = (Math.random() - 0.5) * 2000
      const z = (Math.random() - 0.5) * 2000

      vertices.push(x, y, z)

      // More green stars to match the theme
      if (Math.random() > 0.7) {
        color.setHex(0x00ff99)
      } else {
        color.setHex(0xffffff)
      }
      colors.push(color.r, color.g, color.b)
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    return geometry
  }, [])

  return (
    <points geometry={starsGeometry}>
      <pointsMaterial size={1.5} vertexColors sizeAttenuation={false} />
    </points>
  )
}

function OrbitalRings() {
  const ringsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y += 0.001
    }
  })

  return (
    <group ref={ringsRef}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <mesh key={idx} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5 + idx * 0.3, 1.6 + idx * 0.3, 64]} />
          <meshBasicMaterial
            color="#00FF99"
            transparent
            opacity={0.1 - idx * 0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

type SceneProps = {
  gps?: { lat: number; lng: number } | null
  showTitle?: boolean
}

export default function Scene({ gps, showTitle }: SceneProps) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  // Animate camera to GPS location when provided
  useEffect(() => {
    if (!gps || !controlsRef.current) return

    // Convert lat/lng to 3D point on unit sphere
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

    // Ease controls target
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
      
      <ambientLight intensity={0.4} color="#ffffff" />
      
      <directionalLight
        position={[5, 3, 5]}
        intensity={1.2}
        color="#FFE4B5"
        castShadow
      />
      
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00FF99" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00D9FF" />

      <Earth />

      {gps && <GPSMarker lat={gps.lat} lng={gps.lng} />}

      <Starfield />
      <OrbitalRings />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={2.5}
        maxDistance={15}
        enablePan={false}
      />
      
      <Environment preset="night" />
    </>
  )
}
