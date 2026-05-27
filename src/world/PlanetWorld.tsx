import { useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { Float, Sparkles, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { projects, type LandmarkKind, type Project } from '../data/projects'
import { usePortfolioStore, type CameraMode } from '../store/usePortfolioStore'

const PLANET_RADIUS = 4
const UP = new THREE.Vector3(0, 1, 0)
const JUMP_FORCE = 2.55
const JUMP_GRAVITY = 6.4

const cameraPresets: Record<
  CameraMode,
  {
    radial: number
    trailing: number
    lateral: number
    targetAltitude: number
    targetTrailing: number
    fov: number
  }
> = {
  walk: {
    radial: 2.05,
    trailing: -6.1,
    lateral: 0,
    targetAltitude: 0.58,
    targetTrailing: 0,
    fov: 44,
  },
  story: {
    radial: 2.85,
    trailing: -7.8,
    lateral: 0,
    targetAltitude: 0.58,
    targetTrailing: 0,
    fov: 42,
  },
  planet: {
    radial: 6.8,
    trailing: -12.2,
    lateral: 0,
    targetAltitude: 0.45,
    targetTrailing: 0,
    fov: 48,
  },
}

function normalFrom(project: Project) {
  return new THREE.Vector3(...project.normal).normalize()
}

function SurfaceGroup({
  normal,
  altitude = 0,
  children,
}: {
  normal: THREE.Vector3
  altitude?: number
  children: ReactNode
}) {
  const position = useMemo(
    () => normal.clone().multiplyScalar(PLANET_RADIUS + altitude),
    [altitude, normal],
  )
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(UP, normal),
    [normal],
  )

  return (
    <group position={position} quaternion={quaternion}>
      {children}
    </group>
  )
}

function Landmark({ project }: { project: Project }) {
  const activeProjectId = usePortfolioStore((state) => state.activeProjectId)
  const nearbyProjectId = usePortfolioStore((state) => state.nearbyProjectId)
  const normal = useMemo(() => normalFrom(project), [project])
  const isHighlighted =
    activeProjectId === project.id || nearbyProjectId === project.id

  return (
    <SurfaceGroup normal={normal} altitude={0.03}>
      <group scale={isHighlighted ? 1.06 : 1}>
        <LandmarkShape kind={project.kind} />
        {isHighlighted && (
          <pointLight
            position={[0, 1.1, 0]}
            color="#ffd986"
            intensity={2.4}
            distance={3}
          />
        )}
      </group>
    </SurfaceGroup>
  )
}

function LandmarkShape({ kind }: { kind: LandmarkKind }) {
  if (kind === 'home') {
    return (
      <group>
        <mesh position={[0, 0.32, 0]} castShadow>
          <boxGeometry args={[0.76, 0.62, 0.66]} />
          <meshStandardMaterial color="#eadbb8" />
        </mesh>
        <mesh position={[0, 0.76, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.64, 0.5, 4]} />
          <meshStandardMaterial color="#d66f58" />
        </mesh>
        <mesh position={[0, 0.26, 0.34]}>
          <boxGeometry args={[0.16, 0.32, 0.02]} />
          <meshStandardMaterial color="#496070" />
        </mesh>
        <mesh position={[0.3, 0.74, -0.05]}>
          <cylinderGeometry args={[0.05, 0.05, 0.42, 8]} />
          <meshStandardMaterial color="#d6bb8d" />
        </mesh>
      </group>
    )
  }

  if (kind === 'telescope') {
    return (
      <group rotation={[0, 0, -0.18]}>
        <mesh position={[0, 0.56, 0]} rotation={[0, 0, -0.52]} castShadow>
          <cylinderGeometry args={[0.12, 0.17, 0.88, 12]} />
          <meshStandardMaterial color="#e2c680" metalness={0.35} />
        </mesh>
        <mesh position={[-0.1, 0.9, 0]} rotation={[0, 0, -0.52]}>
          <cylinderGeometry args={[0.19, 0.19, 0.12, 12]} />
          <meshStandardMaterial color="#253b59" />
        </mesh>
        {[-0.16, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.22, 0]} rotation={[0, 0, x * 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.5, 6]} />
            <meshStandardMaterial color="#8e6445" />
          </mesh>
        ))}
      </group>
    )
  }

  if (kind === 'tree') {
    return (
      <group>
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.13, 0.7, 8]} />
          <meshStandardMaterial color="#855942" />
        </mesh>
        <mesh position={[0, 0.96, 0]} castShadow>
          <sphereGeometry args={[0.43, 10, 10]} />
          <meshStandardMaterial color="#8fbd82" emissive="#273d31" />
        </mesh>
        <mesh position={[0.26, 1.02, 0]}>
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshStandardMaterial color="#ffd784" emissive="#ffd784" emissiveIntensity={1} />
        </mesh>
      </group>
    )
  }

  if (kind === 'rocket') {
    return (
      <group rotation={[0, 0, -0.23]}>
        <mesh position={[0, 0.54, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.56, 6, 10]} />
          <meshStandardMaterial color="#f1e6ce" />
        </mesh>
        <mesh position={[0, 0.91, 0]} castShadow>
          <coneGeometry args={[0.18, 0.32, 10]} />
          <meshStandardMaterial color="#d66f58" />
        </mesh>
        <mesh position={[0, 0.56, 0.18]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color="#69bacc" emissive="#204b65" />
        </mesh>
        <mesh position={[-0.2, 0.3, 0]} rotation={[0, 0, -0.55]}>
          <coneGeometry args={[0.12, 0.3, 4]} />
          <meshStandardMaterial color="#d66f58" />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <mesh position={[0, 0.36, 0]} castShadow>
        <boxGeometry args={[0.46, 0.4, 0.34]} />
        <meshStandardMaterial color="#e0a554" />
      </mesh>
      <mesh position={[0, 0.61, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.38]} />
        <meshStandardMaterial color="#efd49d" />
      </mesh>
      <mesh position={[0, 0.83, 0]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.06, 0.42, 0.06]} />
        <meshStandardMaterial color="#cc6155" />
      </mesh>
      <mesh position={[0.13, 0.95, 0]}>
        <boxGeometry args={[0.22, 0.12, 0.04]} />
        <meshStandardMaterial color="#cc6155" />
      </mesh>
    </group>
  )
}

function Player() {
  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const normal = useRef(new THREE.Vector3(0, 0, 1))
  const heading = useRef(new THREE.Vector3(0, 1, 0))
  const jumpHeight = useRef(0)
  const jumpVelocity = useRef(0)
  const jumpRequested = useRef(false)
  const pressedKeys = useRef(new Set<string>())
  const previousNearby = useRef<string | null>(null)
  const started = usePortfolioStore((state) => state.started)
  const activeProjectId = usePortfolioStore((state) => state.activeProjectId)
  const cameraMode = usePortfolioStore((state) => state.cameraMode)
  const setNearbyProject = usePortfolioStore((state) => state.setNearbyProject)

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (
        event.code === 'Space' &&
        !event.repeat &&
        !(event.target instanceof HTMLElement && event.target.closest('button, a'))
      ) {
        event.preventDefault()
        jumpRequested.current = true
      }
      pressedKeys.current.add(event.key.toLowerCase())
    }
    const keyUp = (event: KeyboardEvent) => {
      pressedKeys.current.delete(event.key.toLowerCase())
    }

    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
    }
  }, [])

  useFrame(({ camera, clock, size }, delta) => {
    if (!group.current) return

    const canMove = started && !activeProjectId
    const vertical =
      Number(pressedKeys.current.has('w') || pressedKeys.current.has('arrowup')) -
      Number(pressedKeys.current.has('s') || pressedKeys.current.has('arrowdown'))
    const horizontal =
      Number(pressedKeys.current.has('d') || pressedKeys.current.has('arrowright')) -
      Number(pressedKeys.current.has('a') || pressedKeys.current.has('arrowleft'))
    const side = new THREE.Vector3().crossVectors(heading.current, normal.current).normalize()
    const motion = heading.current
      .clone()
      .multiplyScalar(vertical)
      .addScaledVector(side, horizontal)

    if (!canMove) {
      jumpRequested.current = false
    } else if (jumpRequested.current && jumpHeight.current === 0) {
      jumpVelocity.current = JUMP_FORCE
      jumpRequested.current = false
    }

    if (jumpHeight.current > 0 || jumpVelocity.current > 0) {
      jumpVelocity.current -= JUMP_GRAVITY * delta
      jumpHeight.current = Math.max(
        0,
        jumpHeight.current + jumpVelocity.current * delta,
      )

      if (jumpHeight.current === 0) {
        jumpVelocity.current = 0
      }
    }

    if (canMove && motion.lengthSq() > 0) {
      const speed = pressedKeys.current.has('shift') ? 0.86 : 0.57
      motion.normalize()
      normal.current.addScaledVector(motion, speed * delta).normalize()
      heading.current.projectOnPlane(normal.current).normalize()

      if (body.current) {
        body.current.rotation.y = THREE.MathUtils.damp(
          body.current.rotation.y,
          Math.atan2(horizontal, Math.max(Math.abs(vertical), 0.01)),
          9,
          delta,
        )
        body.current.position.y =
          0.04 + Math.sin(clock.elapsedTime * 11) * 0.025
      }
    } else if (body.current) {
      body.current.position.y = 0.04 + Math.sin(clock.elapsedTime * 2) * 0.012
    }

    const position = normal.current
      .clone()
      .multiplyScalar(PLANET_RADIUS + 0.05 + jumpHeight.current)
    group.current.position.copy(position)
    group.current.quaternion.setFromUnitVectors(UP, normal.current)

    const cameraPreset = cameraPresets[cameraMode]
    const compactPlanetScale =
      size.width < 680 && cameraMode === 'planet' ? 1.65 : 1
    const desiredCamera = position
      .clone()
      .addScaledVector(normal.current, cameraPreset.radial * compactPlanetScale)
      .addScaledVector(heading.current, cameraPreset.trailing * compactPlanetScale)
      .addScaledVector(side, cameraPreset.lateral)
    const cameraTarget = position
      .clone()
      .addScaledVector(normal.current, cameraPreset.targetAltitude)
      .addScaledVector(heading.current, cameraPreset.targetTrailing)

    camera.position.lerp(desiredCamera, 1 - Math.exp(-delta * 3.6))
    camera.up.lerp(normal.current, 1 - Math.exp(-delta * 6)).normalize()
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(camera.fov, cameraPreset.fov, 4, delta)
      camera.updateProjectionMatrix()
    }
    camera.lookAt(cameraTarget)

    if (canMove) {
      let nearest: string | null = null
      let highestDot = 0.973
      for (const project of projects) {
        const dot = normal.current.dot(normalFrom(project))
        if (dot > highestDot) {
          nearest = project.id
          highestDot = dot
        }
      }
      if (nearest !== previousNearby.current) {
        previousNearby.current = nearest
        setNearbyProject(nearest)
      }
    }
  })

  return (
    <group ref={group}>
      <group ref={body}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.34, 6, 10]} />
          <meshStandardMaterial color="#e8c16d" />
        </mesh>
        <mesh position={[0, 0.83, 0]} castShadow>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#f0cead" />
        </mesh>
        <mesh position={[0, 0.89, 0]} castShadow>
          <sphereGeometry args={[0.175, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#e4b153" />
        </mesh>
        <mesh position={[-0.17, 0.52, 0]} rotation={[0, 0.35, 0.82]}>
          <boxGeometry args={[0.3, 0.045, 0.04]} />
          <meshStandardMaterial color="#d86155" />
        </mesh>
      </group>
    </group>
  )
}

function PlanetDecor() {
  const flowers = useMemo(
    () => [
      [0.3, 0.6, 0.74],
      [-0.25, 0.57, 0.78],
      [0.73, -0.12, 0.67],
      [-0.73, -0.08, 0.68],
      [0.02, -0.73, 0.68],
    ],
    [],
  )

  return (
    <>
      {flowers.map((point, index) => (
        <SurfaceGroup
          key={point.join('-')}
          normal={new THREE.Vector3(...point).normalize()}
          altitude={0.015}
        >
          <mesh position={[0, 0.11, 0]} castShadow>
            <coneGeometry args={[0.07, 0.22 + (index % 2) * 0.08, 6]} />
            <meshStandardMaterial color={index % 2 ? '#edcf75' : '#d98778'} />
          </mesh>
        </SurfaceGroup>
      ))}
    </>
  )
}

export function PlanetWorld() {
  return (
    <>
      <color attach="background" args={['#090e25']} />
      <fog attach="fog" args={['#090e25', 15, 32]} />
      <ambientLight intensity={0.55} color="#9fb5dc" />
      <directionalLight
        castShadow
        position={[8, 9, 8]}
        intensity={2.4}
        color="#ffe1a6"
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-7, -2, -5]} color="#6877d7" intensity={18} />
      <Stars radius={55} depth={35} count={1200} factor={3} saturation={0.1} fade />
      <Sparkles count={35} scale={20} size={1.7} speed={0.15} color="#ffd77b" />
      <Float speed={0.28} rotationIntensity={0.06} floatIntensity={0.13}>
        <group>
          <mesh receiveShadow castShadow>
            <sphereGeometry args={[PLANET_RADIUS, 48, 48]} />
            <meshStandardMaterial color="#7ba47f" roughness={0.96} />
          </mesh>
          <mesh scale={1.004}>
            <sphereGeometry args={[PLANET_RADIUS, 32, 32]} />
            <meshBasicMaterial color="#729276" transparent opacity={0.18} wireframe />
          </mesh>
          <PlanetDecor />
          {projects.map((project) => (
            <Landmark key={project.id} project={project} />
          ))}
          <Player />
        </group>
      </Float>
    </>
  )
}
