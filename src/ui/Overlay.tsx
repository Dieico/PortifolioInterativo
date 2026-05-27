import { projects, type Project } from '../data/projects'
import type { ReactNode } from 'react'
import { usePortfolioStore, type CameraMode, type Language } from '../store/usePortfolioStore'

const copy = {
  pt: {
    welcomeLabel: 'Introdução',
    kicker: 'Portfólio interativo',
    title: (
      <>
        Meu Pequeno
        <br />
        Mundo
      </>
    ),
    body: 'Caminhe por um planeta de ideias e encontre os projetos que vivem nele.',
    start: 'Explorar planeta',
    artstation: 'Ir para ArtStation',
    objectiveTitle: 'Meu Pequeno Mundo',
    objectiveText: 'Descubra os projetos espalhados pelo planeta',
    camera: 'Câmera',
    cameraLabel: 'Modo de câmera',
    controlsLabel: 'Controles',
    controls: { move: 'mover', jump: 'pular', camera: 'câmera' },
    spaceKey: 'Espaço',
    touchControls: {
      up: 'Mover para frente',
      down: 'Mover para trás',
      left: 'Virar para a esquerda',
      right: 'Virar para a direita',
      jump: 'Pular',
    },
    explore: 'Explorar',
    close: 'Fechar',
    role: 'Participação',
    technologies: 'Tecnologias',
    videoFallback: 'Vídeo de projeto',
    languageLabel: 'Idioma',
    languageTitle: 'Trocar idioma',
    cameraOptions: [
      { id: 'walk', label: 'Perto', description: 'Jogador centralizado, câmera próxima' },
      { id: 'story', label: 'Médio', description: 'Jogador centralizado, mais cenário' },
      { id: 'planet', label: 'Longe', description: 'Jogador centralizado, planeta amplo' },
    ],
  },
  en: {
    welcomeLabel: 'Introduction',
    kicker: 'Interactive portfolio',
    title: (
      <>
        My Little
        <br />
        World
      </>
    ),
    body: 'Walk across a planet of ideas and find the projects living on it.',
    start: 'Explore planet',
    artstation: 'Go to ArtStation',
    objectiveTitle: 'My Little World',
    objectiveText: 'Discover the projects scattered across the planet',
    camera: 'Camera',
    cameraLabel: 'Camera mode',
    controlsLabel: 'Controls',
    controls: { move: 'move', jump: 'jump', camera: 'camera' },
    spaceKey: 'Space',
    touchControls: {
      up: 'Move forward',
      down: 'Move backward',
      left: 'Turn left',
      right: 'Turn right',
      jump: 'Jump',
    },
    explore: 'Explore',
    close: 'Close',
    role: 'Role',
    technologies: 'Technologies',
    videoFallback: 'Project video',
    languageLabel: 'Language',
    languageTitle: 'Change language',
    cameraOptions: [
      { id: 'walk', label: 'Near', description: 'Centered player, close camera' },
      { id: 'story', label: 'Mid', description: 'Centered player, wider scene' },
      { id: 'planet', label: 'Far', description: 'Centered player, full planet view' },
    ],
  },
} satisfies Record<
  Language,
  {
    welcomeLabel: string
    kicker: string
    title: ReactNode
    body: string
    start: string
    artstation: string
    objectiveTitle: string
    objectiveText: string
    camera: string
    cameraLabel: string
    controlsLabel: string
    controls: { move: string; jump: string; camera: string }
    spaceKey: string
    touchControls: {
      up: string
      down: string
      left: string
      right: string
      jump: string
    }
    explore: string
    close: string
    role: string
    technologies: string
    videoFallback: string
    languageLabel: string
    languageTitle: string
    cameraOptions: { id: CameraMode; label: string; description: string }[]
  }
>

function getLocalizedProject(project: Project | undefined, language: Language) {
  if (!project) return undefined

  return {
    ...project,
    ...(language === 'en' ? project.translations?.en : undefined),
  }
}

function getVideoEmbedUrl(videoUrl: string) {
  try {
    const url = new URL(videoUrl)

    if (url.hostname.includes('youtube.com')) {
      const videoId = url.searchParams.get('v') || url.pathname.split('/').pop()
      return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl
    }

    if (url.hostname === 'youtu.be') {
      const videoId = url.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl
    }

    if (url.hostname.includes('vimeo.com')) {
      const videoId = url.pathname.split('/').filter(Boolean).pop()
      return videoId ? `https://player.vimeo.com/video/${videoId}` : videoUrl
    }
  } catch {
    return videoUrl
  }

  return videoUrl
}

function isVideoFile(videoUrl: string) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(videoUrl)
}

export function Overlay() {
  const started = usePortfolioStore((state) => state.started)
  const start = usePortfolioStore((state) => state.start)
  const nearbyProjectId = usePortfolioStore((state) => state.nearbyProjectId)
  const activeProjectId = usePortfolioStore((state) => state.activeProjectId)
  const openProject = usePortfolioStore((state) => state.openProject)
  const closeProject = usePortfolioStore((state) => state.closeProject)
  const cameraMode = usePortfolioStore((state) => state.cameraMode)
  const setCameraMode = usePortfolioStore((state) => state.setCameraMode)
  const language = usePortfolioStore((state) => state.language)
  const setLanguage = usePortfolioStore((state) => state.setLanguage)
  const setVirtualMovement = usePortfolioStore((state) => state.setVirtualMovement)
  const requestJump = usePortfolioStore((state) => state.requestJump)
  const t = copy[language]
  const nearbyProject = getLocalizedProject(
    projects.find((project) => project.id === nearbyProjectId),
    language,
  )
  const activeProject = getLocalizedProject(
    projects.find((project) => project.id === activeProjectId),
    language,
  )
  const visibleTechnologies =
    activeProject?.technologies?.filter((technology) => technology.trim().length > 0) ?? []
  const videoUrl = activeProject?.videoUrl ? getVideoEmbedUrl(activeProject.videoUrl) : ''
  const videoTitle = activeProject?.videoTitle || t.videoFallback
  const stopVirtualMovement = () => setVirtualMovement({ vertical: 0, horizontal: 0 })
  const touchButtonProps = (vertical: number, horizontal: number) => ({
    onPointerDown: () => setVirtualMovement({ vertical, horizontal }),
    onPointerUp: stopVirtualMovement,
    onPointerCancel: stopVirtualMovement,
    onPointerLeave: stopVirtualMovement,
  })

  return (
    <div className="overlay">
      {!started && (
        <section className="welcome" aria-label={t.welcomeLabel}>
          <p className="welcome__kicker">{t.kicker}</p>
          <h1>{t.title}</h1>
          <p className="welcome__body">{t.body}</p>
          <div className="welcome__actions">
            <button className="primary-button" type="button" onClick={start}>
              {t.start}
            </button>
            <a className="secondary-button" href="https://www.artstation.com/dieico" target="_blank" rel="noreferrer">
              {t.artstation}
            </a>
            <nav className="language-picker" aria-label={t.languageLabel}>
              {(['pt', 'en'] as const).map((option) => (
                <button
                  className={option === language ? 'is-active' : ''}
                  type="button"
                  key={option}
                  onClick={() => setLanguage(option)}
                  aria-pressed={option === language}
                  title={t.languageTitle}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </nav>
          </div>
        </section>
      )}

      {started && !activeProject && (
        <>
          <header className="objective">
            <p>{t.objectiveTitle}</p>
            <span>{t.objectiveText}</span>
          </header>
          <nav className="camera-picker" aria-label={t.cameraLabel}>
            <p>
              {t.camera} <kbd>C</kbd>
            </p>
            {t.cameraOptions.map((option) => (
              <button
                className={option.id === cameraMode ? 'is-active' : ''}
                type="button"
                key={option.id}
                onClick={() => setCameraMode(option.id)}
                aria-pressed={option.id === cameraMode}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </nav>
          <div className="controls" aria-label={t.controlsLabel}>
            <kbd>WASD</kbd> {t.controls.move} <kbd>{t.spaceKey}</kbd> {t.controls.jump}{' '}
            <kbd>C</kbd> {t.controls.camera}
          </div>
          <div className="touch-controls" aria-label={t.controlsLabel}>
            <div className="touch-controls__pad">
              <button type="button" aria-label={t.touchControls.up} {...touchButtonProps(1, 0)}>
                ↑
              </button>
              <button type="button" aria-label={t.touchControls.left} {...touchButtonProps(0, -1)}>
                ←
              </button>
              <button type="button" aria-label={t.touchControls.down} {...touchButtonProps(-1, 0)}>
                ↓
              </button>
              <button type="button" aria-label={t.touchControls.right} {...touchButtonProps(0, 1)}>
                →
              </button>
            </div>
            <button className="touch-controls__jump" type="button" onClick={requestJump}>
              {t.controls.jump}
            </button>
          </div>
        </>
      )}

      {started && nearbyProject && !activeProject && (
        <button
          className="interaction"
          type="button"
          onClick={() => openProject(nearbyProject.id)}
        >
          <kbd>E</kbd>
          <span>
            {t.explore} <strong>{nearbyProject.title}</strong>
          </span>
        </button>
      )}

      {activeProject && (
        <div className="modal-backdrop">
          <article className="project-card" role="dialog" aria-modal="true" aria-labelledby="project-title">
            <button className="close-button" type="button" onClick={closeProject} aria-label={t.close}>
              {t.close} <kbd>Esc</kbd>
            </button>
            <p className="project-card__eyebrow">{activeProject.eyebrow}</p>
            <h2 id="project-title">{activeProject.title}</h2>
            {activeProject.imageUrl && (
              <img
                className="project-card__image"
                src={activeProject.imageUrl}
                alt={activeProject.imageAlt || activeProject.title}
              />
            )}
            <p className="project-card__description">{activeProject.description}</p>
            {videoUrl && (
              <div className="project-card__video">
                {isVideoFile(videoUrl) ? (
                  <video controls src={videoUrl} title={videoTitle} />
                ) : (
                  <iframe
                    src={videoUrl}
                    title={videoTitle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>
            )}
            {activeProject.role && (
              <div className="project-card__role">
                <span>{t.role}</span>
                <strong>{activeProject.role}</strong>
              </div>
            )}
            {visibleTechnologies.length > 0 && (
              <ul className="tags" aria-label={t.technologies}>
                {visibleTechnologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            )}
            {activeProject.actionLabel && activeProject.actionUrl && (
              <a className="primary-button link-button" href={activeProject.actionUrl} target="_blank" rel="noreferrer">
                {activeProject.actionLabel}
              </a>
            )}
          </article>
        </div>
      )}
    </div>
  )
}
