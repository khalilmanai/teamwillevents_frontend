"use client"

import { useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF } from "@react-three/drei"
import { useIsMobile } from "@/hooks/use-mobile"

function TeamwillLogoModel() {
  const gltf = useGLTF("/logo-teamwill-3d.glb")
  const meshRef = useRef<any>()
  const isMobile = useIsMobile()
  const scale = isMobile ? 1.2 : 2.0

  useFrame((state) => {
    if (meshRef.current) {
      // Floating only, no rotation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15 - 1.2
    }
  })

  return (
    <group ref={meshRef}>
      {/* Flip horizontally by negating X scale */}
      <primitive object={gltf.scene} scale={[-scale, scale, scale]} />
      {/* Soft shadow under the logo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]} receiveShadow>
        <circleGeometry args={[1.2, 32]} />
        <shadowMaterial opacity={0.22} />
      </mesh>
      {/* Subtle green glow */}
      <mesh position={[0, -1.2, 0]}>
        <sphereGeometry args={[1.25, 32, 32]} />
        <meshBasicMaterial color="#16a34a" transparent opacity={0.07} />
      </mesh>
    </group>
  )
}

useGLTF.preload("/logo-teamwill-3d.glb")

export default function ThreeScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 70 }}
        shadows
        className="w-full h-full max-w-[900px] max-h-[500px] mx-auto"
        gl={{ alpha: true }} // Enable transparency
        style={{ background: "transparent" }} // Transparent background
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 10, 7]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Suspense fallback={null}>
          <TeamwillLogoModel />
          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls
          enableZoom={true}
          minDistance={2}
          maxDistance={7}
          enablePan={false}
          enableRotate={true}
        />
      </Canvas>
    </div>
  )
}
