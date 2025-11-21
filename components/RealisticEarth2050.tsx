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
// Postprocessing temporarily disabled due to runtime error in user's env
import * as THREE from 'three'
import gsap from 'gsap'
import GPSMarker from '@/components/GPSMarker'

// Texture URLs (fallback to local if external fails)
const TEX = {
  day: '/images/earth_atmos_2048.jpg',
  normal: '/images/earth_normal_2048.jpg',
  night: '/images/earth_lights_2048.png'
}

// Atmosphere glow shader (neon-green rim)
const atmosphereVertex = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragment = `
  uniform vec3 glowColor;
  uniform float time;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    float pulse = 0.9 + 0.1 * sin(time * 1.8);
    intensity *= pulse;
    gl_FragColor = vec4(glowColor * intensity, intensity * 0.85);
  }
`

function AtmosphereGlow() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { clock } = useThree()
  const uniforms = useMemo(() => ({ glowColor: { value: new THREE.Color('#00FF99') }, time: { value: 0 } }), [])
  useFrame(() => { if (matRef.current) matRef.current.uniforms.time.value = clock.elapsedTime })
  return (
    <Sphere args={[1.03, 64, 64]}>
      <shaderMaterial ref={matRef} vertexShader={atmosphereVertex} fragmentShader={atmosphereFragment} uniforms={uniforms} side={THREE.BackSide} blending={THREE.AdditiveBlending} transparent />
    </Sphere>
  )
}

function RealisticEarth() {
  const earthRef = useRef<THREE.Mesh>(null)

  const { map, normalMap, emissiveMap } = useTexture({
    map: TEX.day,
    normalMap: TEX.normal,
    emissiveMap: TEX.night,
  })

  useEffect(() => {
    ;[map, normalMap, emissiveMap].forEach((t) => {
      if (!t) return
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.minFilter = THREE.LinearMipmapLinearFilter
      t.magFilter = THREE.LinearFilter
    })
    if (map) map.colorSpace = THREE.SRGBColorSpace
    if (emissiveMap) emissiveMap.colorSpace = THREE.SRGBColorSpace
  }, [map, normalMap, emissiveMap])

  useFrame((_, d) => { if (earthRef.current) earthRef.current.rotation.y += d * 0.06 })

  return (
    <Sphere ref={earthRef} args={[1, 192, 192]}>
      <meshStandardMaterial
        map={map}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.6, 0.6)}
        metalness={0.1}
        roughness={0.8}
        emissiveMap={emissiveMap}
        emissive={new THREE.Color(0x0a1533)}
        emissiveIntensity={0.35}
      />
    </Sphere>
  )
}

// Orbiting rings around Earth (futuristic look)
function OrbitingRings() {
  const ringsRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
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
            <meshBasicMaterial color="#00FF99" transparent opacity={Math.max(opacity, 0.05)} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}

// Animated light trail arcs (comet-like)
function LightTrails() {
  const trailsRef = useRef<THREE.Group>(null)
  const { clock } = useThree()
  const arcs = useMemo(() => {
    return Array.from({ length: 12 }).map((_, idx) => {
      const angle = (idx / 12) * Math.PI * 2
      const height = (Math.random() - 0.5) * 0.5
      const segments = 40
      const points = [] as THREE.Vector3[]
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
  useFrame(() => { if (trailsRef.current) trailsRef.current.rotation.y += 0.001 })
  return (
    <group ref={trailsRef}>
      {arcs.map((arc, idx) => {
        const timeOffset = clock.elapsedTime + arc.idx * 0.3
        const visibleLength = 0.3
        const travel = (timeOffset * 0.25) % 1
        const mainPoint = arc.curve.getPointAt(travel)
        const trailParticles: { point: THREE.Vector3; alpha: number; size: number; key: string }[] = []
        for (let i = 0; i < arc.points.length; i++) {
          const progress = i / arc.points.length
          const relativePos = (progress - travel + 1) % 1
          if (relativePos < visibleLength && relativePos >= 0) {
            const alpha = 1 - relativePos / visibleLength
            const size = 0.008 * (1 - relativePos / visibleLength)
            trailParticles.push({ point: arc.points[i], alpha, size, key: `${idx}-${i}` })
          }
        }
        return (
          <group key={idx}>
            <line>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={arc.points.length} array={new Float32Array(arc.points.flatMap(p => [p.x, p.y, p.z]))} itemSize={3} />
              </bufferGeometry>
              <lineBasicMaterial color="#00FF99" transparent opacity={0.2} />
            </line>
            {trailParticles.map(({ point, alpha, size, key }) => (
              <mesh key={key} position={point}>
                <sphereGeometry args={[size, 8, 8]} />
                <meshStandardMaterial color="#00FF99" emissive="#00FF99" emissiveIntensity={0.8} roughness={1} metalness={0} transparent opacity={alpha * 0.8} />
              </mesh>
            ))}
            <mesh position={mainPoint}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#00FF99" emissiveIntensity={2} roughness={0.8} metalness={0} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

type Props = {
  gps?: { lat: number; lng: number } | null
  showTitle?: boolean
}

export default function RealisticEarth2050({ gps, showTitle }: Props) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    if (!gps || !controlsRef.current) return
    const phi = (90 - gps.lat) * (Math.PI / 180)
    const theta = (gps.lng + 180) * (Math.PI / 180)
    const target = new THREE.Vector3(
      -(Math.sin(phi) * Math.cos(theta)),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    )
    const cam = target.clone().multiplyScalar(2.5)
    gsap.to(camera.position, { duration: 2, x: cam.x, y: cam.y, z: cam.z, ease: 'power2.out', onUpdate: () => controlsRef.current?.update?.() })
    const ct = controlsRef.current.target
    gsap.to(ct, { duration: 2, x: target.x, y: target.y, z: target.z, ease: 'power2.out', onUpdate: () => controlsRef.current?.update?.() })
  }, [gps, camera])

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />

      {/* Lighting */}
      <ambientLight intensity={0.25} color="#ffffff" />
      <directionalLight position={[5, 3, 5]} intensity={1.1} color="#A8FFDA" />
      <directionalLight position={[-5, -2, -3]} intensity={0.35} color="#7FB1FF" />

      <Suspense fallback={null}>
        <RealisticEarth />
        <AtmosphereGlow />
        <OrbitingRings />
        <LightTrails />
      </Suspense>

      {/* Stars */}
      <Stars radius={300} depth={60} count={7000} factor={4} saturation={0.15} fade speed={0.4} />

      <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} minDistance={2.5} maxDistance={15} enablePan={false} />

      {/* Post FX removed for stability. Equivalent look handled via materials/shaders. */}

      <Preload all />
    </>
  )
}


