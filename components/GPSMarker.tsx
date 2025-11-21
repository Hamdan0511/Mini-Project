'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'

interface GPSMarkerProps {
  lat: number
  lng: number
}

export default function GPSMarker({ lat, lng }: GPSMarkerProps) {
  const markerRef = useRef<THREE.Mesh>(null)
  const lineRef = useRef<THREE.Line>(null)

  // Convert lat/lng to 3D position on sphere (radius = 1)
  const getPosition = (latitude: number, longitude: number) => {
    const phi = (90 - latitude) * (Math.PI / 180)
    const theta = (longitude + 180) * (Math.PI / 180)

    const x = -(Math.sin(phi) * Math.cos(theta))
    const y = Math.cos(phi)
    const z = Math.sin(phi) * Math.sin(theta)

    return new THREE.Vector3(x, y, z)
  }

  const position = getPosition(lat, lng)

  useFrame(() => {
    if (markerRef.current) {
      markerRef.current.rotation.y += 0.01
    }
  })

  return (
    <group>
      {/* Glowing marker sphere */}
      <Sphere
        ref={markerRef}
        args={[0.03, 32, 32]}
        position={position.multiplyScalar(1.02)}
      >
        <meshStandardMaterial
          color="#00FF99"
          emissive="#00FF99"
          emissiveIntensity={1}
        />
      </Sphere>

      {/* Pulsing ring effect */}
      <Sphere
        args={[0.05, 32, 32]}
        position={position.multiplyScalar(1.02)}
      >
        <meshStandardMaterial
          color="#00FF99"
          transparent
          opacity={0.3}
          emissive="#00FF99"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </group>
  )
}

