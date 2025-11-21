'use client'

import { useRef, useMemo, useEffect, Suspense, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Sphere,
  PerspectiveCamera,
  Stars,
  Preload
} from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import GPSMarker from '@/components/GPSMarker'

// Atmosphere glow shader for neon-green edge glow
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragmentShader = `
  uniform vec3 glowColor;
  uniform float time;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    
    // Add subtle pulsing animation
    float pulse = sin(time * 2.0) * 0.1 + 0.9;
    intensity *= pulse;
    
    vec3 glow = glowColor * intensity;
    gl_FragColor = vec4(glow, intensity * 0.8);
  }
`

// Wireframe Earth Component - matching the exact style from image
function WireframeEarth() {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Mouse movement effect for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Create wireframe/dotted grid Earth texture matching the image
  const earthTexture = useMemo(() => {
    if (typeof document === 'undefined') return null
    
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Dark ocean background (almost black with slight green tint)
    ctx.fillStyle = '#000011'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Create subtle grid dots for oceans (green grid lines)
    for (let i = 0; i < 50000; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      ctx.fillStyle = 'rgba(0, 255, 153, 0.08)'
      ctx.fillRect(x, y, 1, 1)
    }

    // Draw continents as bright green dotted pattern
    ctx.fillStyle = '#00FF99'
    ctx.strokeStyle = '#00FF99'
    ctx.lineWidth = 2
    
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
      // Draw outline
      ctx.strokeRect(
        continent.x * canvas.width, 
        continent.y * canvas.height, 
        continent.w * canvas.width, 
        continent.h * canvas.height
      )
      
      // Fill with dense dots for wireframe look
      for (let i = 0; i < 4000; i++) {
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
          map={earthTexture}
          transparent={true}
          opacity={0.95}
        />
      </Sphere>
    </group>
  )
}

// Neon-Green Atmospheric Glow - matching the exact glow from image
function AtmosphereGlow() {
  const meshRef = useRef<THREE.ShaderMaterial>(null)
  const { clock } = useThree()

  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color('#00FF99') },
      time: { value: 0 }
    }),
    []
  )

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.uniforms.time.value = clock.elapsedTime
    }
  })

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

// Pulsating Data Hubs - with white, yellow, and green colors
function DataHubs() {
  const hubs = useMemo(() => {
    const positions = [
      // Major cities with different colors
      { lat: 40.7128, lng: -74.0060, color: 'white', intensity: 1.0 }, // New York - white
      { lat: 37.7749, lng: -122.4194, color: 'yellow', intensity: 0.9 }, // San Francisco - yellow
      { lat: 51.5074, lng: -0.1278, color: 'white', intensity: 0.8 }, // London - white
      { lat: 48.8566, lng: 2.3522, color: 'green', intensity: 0.85 }, // Paris - green
      { lat: 52.5200, lng: 13.4050, color: 'white', intensity: 0.75 }, // Berlin - white
      { lat: 35.6762, lng: 139.6503, color: 'yellow', intensity: 0.95 }, // Tokyo - yellow
      { lat: 31.2304, lng: 121.4737, color: 'white', intensity: 0.9 }, // Shanghai - white
      { lat: 22.3193, lng: 114.1694, color: 'yellow', intensity: 0.85 }, // Hong Kong - yellow
      { lat: 1.3521, lng: 103.8198, color: 'white', intensity: 0.8 }, // Singapore - white
      { lat: 25.2048, lng: 55.2708, color: 'green', intensity: 0.7 }, // Dubai - green
      { lat: -33.8688, lng: 151.2093, color: 'white', intensity: 0.75 }, // Sydney - white
      { lat: -23.5505, lng: -46.6333, color: 'yellow', intensity: 0.7 }, // São Paulo - yellow
    ]

    return positions.map((hub, idx) => {
      const phi = (90 - hub.lat) * (Math.PI / 180)
      const theta = (hub.lng + 180) * (Math.PI / 180)
      
      const x = -(Math.sin(phi) * Math.cos(theta))
      const y = Math.cos(phi)
      const z = Math.sin(phi) * Math.sin(theta)

      return { ...hub, x, y, z, id: idx }
    })
  }, [])

  const { clock } = useThree()

  return (
    <>
      {hubs.map((hub) => {
        const pulse = Math.sin(clock.elapsedTime * 2 + hub.id) * 0.5 + 0.5
        const scale = 0.015 + pulse * 0.01

        // Color mapping
        let color = '#FFFFFF'
        let emissive = '#FFFFFF'
        if (hub.color === 'yellow') {
          color = '#FFFF00'
          emissive = '#FFFF99'
        } else if (hub.color === 'green') {
          color = '#00FF99'
          emissive = '#00FF99'
        }

        return (
          <group key={hub.id}>
            {/* Main hub light */}
            <Sphere
              args={[scale, 16, 16]}
              position={[hub.x * 1.01, hub.y * 1.01, hub.z * 1.01]}
            >
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={hub.intensity * (0.8 + pulse * 0.4)}
              />
            </Sphere>
            
            {/* Glow ring */}
            <Sphere
              args={[scale * 2, 16, 16]}
              position={[hub.x * 1.01, hub.y * 1.01, hub.z * 1.01]}
            >
              <meshStandardMaterial
                color={emissive}
                transparent={true}
                opacity={0.2 + pulse * 0.2}
                emissive={emissive}
                emissiveIntensity={0.3}
              />
            </Sphere>
          </group>
        )
      })}
    </>
  )
}

// Orbiting Green Rings
function OrbitingRings() {
  const ringsRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y += delta * 0.2
      ringsRef.current.rotation.x += delta * 0.05
    }
  })

  return (
    <group ref={ringsRef}>
      {Array.from({ length: 4 }).map((_, idx) => {
        const radius = 1.3 + idx * 0.4
        const thickness = 0.03
        const opacity = 0.15 - idx * 0.03

        return (
          <mesh key={idx} rotation={[Math.PI / 2 + idx * 0.2, 0, idx * 0.3]}>
            <ringGeometry args={[radius, radius + thickness, 128]} />
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

// Light Trail Arcs - tapered, comet-like appearance
function LightTrails() {
  const trailsRef = useRef<THREE.Group>(null)
  const { clock } = useThree()

  const arcs = useMemo(() => {
    return Array.from({ length: 12 }).map((_, idx) => {
      const angle = (idx / 12) * Math.PI * 2
      const height = (Math.random() - 0.5) * 0.5
      const segments = 40

      const points = []
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const radius = 1.2 + Math.sin(t * Math.PI) * 0.4
        const x = Math.cos(angle + t * Math.PI * 0.4) * radius
        const y = height + Math.sin(t * Math.PI) * 0.3
        const z = Math.sin(angle + t * Math.PI * 0.4) * radius
        points.push(new THREE.Vector3(x, y, z))
      }

      const curve = new THREE.CatmullRomCurve3(points)
      return { curve, idx, points: curve.getPoints(100) }
    })
  }, [])

  useFrame(() => {
    if (trailsRef.current) {
      trailsRef.current.rotation.y += 0.001
    }
  })

  return (
    <group ref={trailsRef}>
      {arcs.map((arc, idx) => {
        const timeOffset = clock.elapsedTime + arc.idx * 0.3
        const visibleLength = 0.3
        const travel = (timeOffset * 0.25) % 1
        const mainPoint = arc.curve.getPointAt(travel)

        // Create tapered trail particles (comet-like)
        const trailParticles = []
        for (let i = 0; i < arc.points.length; i++) {
          const progress = i / arc.points.length
          const relativePos = (progress - travel + 1) % 1
          if (relativePos < visibleLength && relativePos >= 0) {
            const alpha = 1 - (relativePos / visibleLength)
            const size = 0.008 * (1 - relativePos / visibleLength) // Tapered size
            trailParticles.push({ 
              point: arc.points[i], 
              alpha, 
              size,
              key: `${idx}-${i}` 
            })
          }
        }

        return (
          <group key={idx}>
            {/* Trail line - subtle */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={arc.points.length}
                  array={new Float32Array(arc.points.flatMap(p => [p.x, p.y, p.z]))}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color="#00FF99"
                transparent
                opacity={0.2}
              />
            </line>

            {/* Tapered trail particles (comet tail) */}
            {trailParticles.map(({ point, alpha, size, key }) => (
              <mesh key={key} position={point}>
                <sphereGeometry args={[size, 8, 8]} />
                <meshStandardMaterial
                  color="#00FF99"
                  emissive="#00FF99"
                  emissiveIntensity={0.8}
                  roughness={1}
                  metalness={0}
                  transparent
                  opacity={alpha * 0.8}
                />
              </mesh>
            ))}

            {/* Main moving light */}
            <mesh position={mainPoint}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive="#00FF99"
                emissiveIntensity={2}
                roughness={0.8}
                metalness={0}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// Main Scene Component
type RealisticEarthSceneProps = {
  gps?: { lat: number; lng: number } | null
  showTitle?: boolean
}

export default function RealisticEarthScene({ gps, showTitle }: RealisticEarthSceneProps) {
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
      
      {/* Dynamic Lighting - green tinted */}
      <ambientLight intensity={0.2} color="#ffffff" />
      
      {/* Greenish sun light */}
      <directionalLight
        position={[5, 3, 5]}
        intensity={0.8}
        color="#99FFCC"
        castShadow
      />
      
      {/* Subtle blue fill light */}
      <directionalLight
        position={[-5, -2, -3]}
        intensity={0.3}
        color="#6699FF"
      />

      {/* Earth Components */}
      <Suspense fallback={null}>
        <WireframeEarth />
        <AtmosphereGlow />
        <DataHubs />
        <OrbitingRings />
        <LightTrails />
      </Suspense>

      {/* GPS Marker */}
      {gps && <GPSMarker lat={gps.lat} lng={gps.lng} />}

      {/* Deep space starfield with subtle stars */}
      <Stars
        radius={300}
        depth={60}
        count={8000}
        factor={4}
        saturation={0.1}
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