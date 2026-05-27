import { create } from 'zustand'

export type CameraMode = 'walk' | 'story' | 'planet'
export type Language = 'pt' | 'en'
export type VirtualMovement = {
  vertical: number
  horizontal: number
}

type PortfolioState = {
  started: boolean
  nearbyProjectId: string | null
  activeProjectId: string | null
  cameraMode: CameraMode
  language: Language
  virtualMovement: VirtualMovement
  jumpRequest: number
  start: () => void
  setNearbyProject: (id: string | null) => void
  openProject: (id: string) => void
  closeProject: () => void
  setCameraMode: (mode: CameraMode) => void
  cycleCameraMode: () => void
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  setVirtualMovement: (movement: VirtualMovement) => void
  requestJump: () => void
}

const cameraModes: CameraMode[] = ['walk', 'story', 'planet']

export const usePortfolioStore = create<PortfolioState>((set) => ({
  started: false,
  nearbyProjectId: null,
  activeProjectId: null,
  cameraMode: 'walk',
  language: 'pt',
  virtualMovement: { vertical: 0, horizontal: 0 },
  jumpRequest: 0,
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
  setLanguage: (language) => set({ language }),
  toggleLanguage: () =>
    set((state) => ({ language: state.language === 'pt' ? 'en' : 'pt' })),
  setVirtualMovement: (movement) => set({ virtualMovement: movement }),
  requestJump: () => set((state) => ({ jumpRequest: state.jumpRequest + 1 })),
}))
