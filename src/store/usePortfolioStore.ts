import { create } from 'zustand'

export type CameraMode = 'walk' | 'story' | 'planet'

type PortfolioState = {
  started: boolean
  nearbyProjectId: string | null
  activeProjectId: string | null
  cameraMode: CameraMode
  start: () => void
  setNearbyProject: (id: string | null) => void
  openProject: (id: string) => void
  closeProject: () => void
  setCameraMode: (mode: CameraMode) => void
  cycleCameraMode: () => void
}

const cameraModes: CameraMode[] = ['walk', 'story', 'planet']

export const usePortfolioStore = create<PortfolioState>((set) => ({
  started: false,
  nearbyProjectId: null,
  activeProjectId: null,
  cameraMode: 'walk',
  start: () => set({ started: true }),
  setNearbyProject: (id) => set({ nearbyProjectId: id }),
  openProject: (id) => set({ activeProjectId: id }),
  closeProject: () => set({ activeProjectId: null }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  cycleCameraMode: () =>
    set((state) => {
      const currentIndex = cameraModes.indexOf(state.cameraMode)
      const nextIndex = (currentIndex + 1) % cameraModes.length
      return { cameraMode: cameraModes[nextIndex] }
    }),
}))
