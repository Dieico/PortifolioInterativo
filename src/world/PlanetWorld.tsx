import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Float, Sparkles, Stars, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { projects, type Project } from '../data/projects'
import { usePortfolioStore, type CameraMode } from '../store/usePortfolioStore'

const PLANET_RADIUS = 5.76
const PLANET_MODEL_URL = `${import.meta.env.BASE_URL}models/planet.glb`
const PLANET_MODEL_SCALE = 1
const DEFAULT_PROJECT_MODEL_URL = `${import.meta.env.BASE_URL}models/DefaultProjet.glb`
const DEFAULT_PROJECT_MODEL_HEIGHT = 0.95
const projectModelUrlCache = new Map<Project['kind'], string | Promise<string>>()
const DEFAULT_PROJECT_COLLISION_SETTINGS = {
  // Raio horizontal do collider em volta do modelo.
  radius: 0.42,
  // Altura do collider a partir da superficie do planeta.
  height: 1,
  // Troque para true quando quiser visualizar/debugar a colisao.
  visible: false,
  // Transparencia usada quando visible estiver true.
  opacity: 0.18,
  // Cor do collider quando estiver visivel.
  color: '#ffcf66',
}
const PLANET_MATERIAL_SETTINGS = {
  // Cor base aplicada por cima da textura do GLB.
  color: '#ffffff',
  // Cor de brilho proprio do material. Use preto para desligar.
  emissive: '#050816',
  // Intensidade do brilho proprio.
  emissiveIntensity: 1,
  // Quanto maior, mais fosco; quanto menor, mais brilhante.
  roughness: 1,
  // Quanto maior, mais metalico/reflexivo.
  metalness: 0,
  // Intensidade dos reflexos de ambiente, caso exista environment map.
  envMapIntensity: 0.65,
  // true deixa as faces mais facetadas/low-poly; false suaviza a luz.
  flatShading: false,
} satisfies Pick<
  THREE.MeshStandardMaterialParameters,
  | 'color'
  | 'emissive'
  | 'emissiveIntensity'
  | 'roughness'
  | 'metalness'
  | 'envMapIntensity'
  | 'flatShading'
>
const DEFAULT_PROJECT_MATERIAL_SETTINGS = {
  // Cor base aplicada por cima da textura do GLB.
  color: '#ffffff',
  // Cor de brilho proprio do material. Use preto para desligar.
  emissive: '#120b04',
  // Intensidade do brilho proprio.
  emissiveIntensity: 0.08,
  // Quanto maior, mais fosco; quanto menor, mais brilhante.
  roughness: 0.82,
  // Quanto maior, mais metalico/reflexivo.
  metalness: 0,
  // Intensidade dos reflexos de ambiente, caso exista environment map.
  envMapIntensity: 0.55,
  // true deixa as faces mais facetadas/low-poly; false suaviza a luz.
  flatShading: false,
} satisfies Pick<
  THREE.MeshStandardMaterialParameters,
  | 'color'
  | 'emissive'
  | 'emissiveIntensity'
  | 'roughness'
  | 'metalness'
  | 'envMapIntensity'
  | 'flatShading'
>
const UP = new THREE.Vector3(0, 1, 0)
const JUMP_FORCE = 2.55
const JUMP_GRAVITY = 6.4
const PLAYER_COLLISION_RADIUS = 0.17

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

function projectModelCandidates(kind: Project['kind']) {
  const capitalizedKind = `${kind.charAt(0).toUpperCase()}${kind.slice(1)}`

  return [
    `${import.meta.env.BASE_URL}models/${kind}.glb`,
    `${import.meta.env.BASE_URL}models/${capitalizedKind}.glb`,
  ]
}

async function resolveProjectModelUrl(kind: Project['kind']) {
  const cached = projectModelUrlCache.get(kind)
  if (typeof cached === 'string') return cached
  if (cached) return cached

  const promise = (async () => {
    for (const modelUrl of projectModelCandidates(kind)) {
      try {
        const response = await fetch(modelUrl, { method: 'HEAD' })
        const contentType = response.headers.get('content-type') ?? ''

        if (response.ok && !contentType.includes('text/html')) {
          return modelUrl
        }
      } catch {
        // Fall back to the default model when a project-specific GLB is missing.
      }
    }

    return DEFAULT_PROJECT_MODEL_URL
  })()

  projectModelUrlCache.set(kind, promise)
  promise.then((modelUrl) => projectModelUrlCache.set(kind, modelUrl))

  return promise
}

function useProjectModelUrl(kind: Project['kind']) {
  const [modelUrl, setModelUrl] = useState(() => {
    const cached = projectModelUrlCache.get(kind)
    return typeof cached === 'string' ? cached : DEFAULT_PROJECT_MODEL_URL
  })

  useEffect(() => {
    let isActive = true

    resolveProjectModelUrl(kind).then((resolvedModelUrl) => {
      if (isActive) {
        setModelUrl(resolvedModelUrl)
      }
    })

    return () => {
      isActive = false
    }
  }, [kind])

  return modelUrl
}

function hitsProjectCollision(nextNormal: THREE.Vector3, jumpHeight: number) {
  if (jumpHeight > DEFAULT_PROJECT_COLLISION_SETTINGS.height) {
    return false
  }

  const collisionRadius =
    DEFAULT_PROJECT_COLLISION_SETTINGS.radius + PLAYER_COLLISION_RADIUS

  return projects.some((project) => {
    const projectNormal = normalFrom(project)
    const surfaceDistance = nextNormal.distanceTo(projectNormal) * PLANET_RADIUS

    return surfaceDistance < collisionRadius
  })
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
        <LandmarkShape project={project} />
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

function DefaultProjectModel({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl)
  const model = useMemo(() => scene.clone(true), [scene])
  const { offset, scale } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = size.y > 0 ? DEFAULT_PROJECT_MODEL_HEIGHT / size.y : 1
    const offset = new THREE.Vector3(-center.x, -box.min.y, -center.z)

    return { offset, scale }
  }, [model])

  useEffect(() => {
    const createdMaterials: THREE.Material[] = []

    const configureMaterial = (source: THREE.Material) => {
      const material = source.clone()
      material.side = THREE.FrontSide
      material.transparent = false
      material.opacity = 1
      material.depthTest = true
      material.depthWrite = true

      if (material instanceof THREE.MeshStandardMaterial) {
        material.color.set(DEFAULT_PROJECT_MATERIAL_SETTINGS.color)
        material.emissive.set(DEFAULT_PROJECT_MATERIAL_SETTINGS.emissive)
        material.emissiveIntensity =
          DEFAULT_PROJECT_MATERIAL_SETTINGS.emissiveIntensity
        material.roughness = DEFAULT_PROJECT_MATERIAL_SETTINGS.roughness
        material.metalness = DEFAULT_PROJECT_MATERIAL_SETTINGS.metalness
        material.envMapIntensity =
          DEFAULT_PROJECT_MATERIAL_SETTINGS.envMapIntensity
        material.flatShading = DEFAULT_PROJECT_MATERIAL_SETTINGS.flatShading
      }

      material.needsUpdate = true
      createdMaterials.push(material)

      return material
    }

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.material = Array.isArray(child.material)
          ? child.material.map(configureMaterial)
          : configureMaterial(child.material)
      }
    })

    return () => {
      createdMaterials.forEach((material) => material.dispose())
    }
  }, [model])

  return (
    <group scale={scale}>
      <primitive object={model} position={offset} />
    </group>
  )
}

function ProjectCollisionMesh({ project }: { project: Project }) {
  const materialOpacity = DEFAULT_PROJECT_COLLISION_SETTINGS.visible
    ? DEFAULT_PROJECT_COLLISION_SETTINGS.opacity
    : 0

  return (
    <mesh
      name={`collision-${project.id}`}
      position={[0, DEFAULT_PROJECT_COLLISION_SETTINGS.height / 2, 0]}
      userData={{
        collision: 'project',
        projectId: project.id,
        projectKind: project.kind,
      }}
    >
      <cylinderGeometry
        args={[
          DEFAULT_PROJECT_COLLISION_SETTINGS.radius,
          DEFAULT_PROJECT_COLLISION_SETTINGS.radius,
          DEFAULT_PROJECT_COLLISION_SETTINGS.height,
          16,
        ]}
      />
      <meshBasicMaterial
        color={DEFAULT_PROJECT_COLLISION_SETTINGS.color}
        transparent
        opacity={materialOpacity}
        depthWrite={false}
        wireframe={DEFAULT_PROJECT_COLLISION_SETTINGS.visible}
      />
    </mesh>
  )
}

function LandmarkShape({ project }: { project: Project }) {
  const modelUrl = useProjectModelUrl(project.kind)

  return (
    <>
      <DefaultProjectModel modelUrl={modelUrl} />
      <ProjectCollisionMesh project={project} />
    </>
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
  const virtualMovement = usePortfolioStore((state) => state.virtualMovement)
  const jumpRequest = usePortfolioStore((state) => state.jumpRequest)
  const setNearbyProject = usePortfolioStore((state) => state.setNearbyProject)

  useEffect(() => {
    if (jumpRequest > 0) {
      jumpRequested.current = true
    }
  }, [jumpRequest])

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
      Number(pressedKeys.current.has('s') || pressedKeys.current.has('arrowdown')) +
      virtualMovement.vertical
    const horizontal =
      Number(pressedKeys.current.has('d') || pressedKeys.current.has('arrowright')) -
      Number(pressedKeys.current.has('a') || pressedKeys.current.has('arrowleft')) +
      virtualMovement.horizontal
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
      const nextNormal = normal.current
        .clone()
        .addScaledVector(motion, speed * delta)
        .normalize()

      if (!hitsProjectCollision(nextNormal, jumpHeight.current)) {
        normal.current.copy(nextNormal)
      }

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

function PlanetModel() {
  const { scene } = useGLTF(PLANET_MODEL_URL)
  const model = useMemo(() => scene.clone(true), [scene])
  const { center, scale } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(-1)
    const largestDimension = Math.max(size.x, size.y, size.z)
    const scale =
      largestDimension > 0 ? (PLANET_RADIUS * 2) / largestDimension : 1

    return { center, scale }
  }, [model])

  useEffect(() => {
    const createdMaterials: THREE.Material[] = []

    const configureMaterial = (source: THREE.Material) => {
      const material = source.clone()
      material.side = THREE.FrontSide
      material.transparent = false
      material.opacity = 1
      material.depthTest = true
      material.depthWrite = true

      if (material instanceof THREE.MeshStandardMaterial) {
        material.color.set(PLANET_MATERIAL_SETTINGS.color)
        material.emissive.set(PLANET_MATERIAL_SETTINGS.emissive)
        material.emissiveIntensity = PLANET_MATERIAL_SETTINGS.emissiveIntensity
        material.roughness = PLANET_MATERIAL_SETTINGS.roughness
        material.metalness = PLANET_MATERIAL_SETTINGS.metalness
        material.envMapIntensity = PLANET_MATERIAL_SETTINGS.envMapIntensity
        material.flatShading = PLANET_MATERIAL_SETTINGS.flatShading
      }

      material.needsUpdate = true
      createdMaterials.push(material)

      return material
    }

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.material = Array.isArray(child.material)
          ? child.material.map(configureMaterial)
          : configureMaterial(child.material)
      }
    })

    return () => {
      createdMaterials.forEach((material) => material.dispose())
    }
  }, [model])

  return (
    <group scale={PLANET_MODEL_SCALE * scale}>
      <primitive object={model} position={center} />
    </group>
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
          <PlanetModel />
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
