import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PlanetWorld } from './world/PlanetWorld'
import { Overlay } from './ui/Overlay'
import { usePortfolioStore } from './store/usePortfolioStore'

export function App() {
  const nearbyProjectId = usePortfolioStore((state) => state.nearbyProjectId)
  const activeProjectId = usePortfolioStore((state) => state.activeProjectId)
  const started = usePortfolioStore((state) => state.started)
  const openProject = usePortfolioStore((state) => state.openProject)
  const closeProject = usePortfolioStore((state) => state.closeProject)
  const cycleCameraMode = usePortfolioStore((state) => state.cycleCameraMode)

  useEffect(() => {
    const interact = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeProjectId) {
        closeProject()
      }

      if (
        event.key.toLowerCase() === 'e' &&
        nearbyProjectId &&
        !activeProjectId &&
        started
      ) {
        openProject(nearbyProjectId)
      }

      if (
        event.key.toLowerCase() === 'c' &&
        started &&
        !activeProjectId
      ) {
        cycleCameraMode()
      }
    }

    window.addEventListener('keydown', interact)
    return () => window.removeEventListener('keydown', interact)
  }, [activeProjectId, closeProject, cycleCameraMode, nearbyProjectId, openProject, started])

  return (
    <main className="experience">
      <Canvas shadows camera={{ position: [0, -6, 10], fov: 44 }} dpr={[1, 1.7]}>
        <PlanetWorld />
      </Canvas>
      <Overlay />
    </main>
  )
}
