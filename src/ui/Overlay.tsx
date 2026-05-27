import { projects } from '../data/projects'
import { usePortfolioStore, type CameraMode } from '../store/usePortfolioStore'

const cameraOptions: { id: CameraMode; label: string; description: string }[] = [
  { id: 'walk', label: 'Perto', description: 'Jogador centralizado, câmera próxima' },
  { id: 'story', label: 'Médio', description: 'Jogador centralizado, mais cenário' },
  { id: 'planet', label: 'Longe', description: 'Jogador centralizado, planeta amplo' },
]

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
  const nearbyProject = projects.find((project) => project.id === nearbyProjectId)
  const activeProject = projects.find((project) => project.id === activeProjectId)
  const visibleTechnologies =
    activeProject?.technologies?.filter((technology) => technology.trim().length > 0) ?? []
  const videoUrl = activeProject?.videoUrl ? getVideoEmbedUrl(activeProject.videoUrl) : ''
  const videoTitle = activeProject?.videoTitle || `Video de ${activeProject?.title ?? 'projeto'}`

  return (
    <div className="overlay">
      {!started && (
        <section className="welcome" aria-label="Introdução">
          <p className="welcome__kicker">Portfólio interativo</p>
          <h1>Meu Pequeno<br />Mundo</h1>
          <p className="welcome__body">
            Caminhe por um planeta de ideias e encontre os projetos que vivem nele.
          </p>
          <button className="primary-button" type="button" onClick={start}>
            Explorar planeta
          </button>
        </section>
      )}

      {started && !activeProject && (
        <>
          <header className="objective">
            <p>Meu Pequeno Mundo</p>
            <span>Descubra os projetos espalhados pelo planeta</span>
          </header>
          <nav className="camera-picker" aria-label="Modo de câmera">
            <p>Câmera <kbd>C</kbd></p>
            {cameraOptions.map((option) => (
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
          <div className="controls" aria-label="Controles">
            <kbd>WASD</kbd> mover <kbd>Espaço</kbd> pular <kbd>C</kbd> câmera
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
            Explorar <strong>{nearbyProject.title}</strong>
          </span>
        </button>
      )}

      {activeProject && (
        <div className="modal-backdrop">
          <article className="project-card" role="dialog" aria-modal="true" aria-labelledby="project-title">
            <button className="close-button" type="button" onClick={closeProject} aria-label="Fechar">
              Fechar <kbd>Esc</kbd>
            </button>
            <p className="project-card__eyebrow">{activeProject.eyebrow}</p>
            <h2 id="project-title">{activeProject.title}</h2>
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
                <span>Participação</span>
                <strong>{activeProject.role}</strong>
              </div>
            )}
            {visibleTechnologies.length > 0 && (
              <ul className="tags" aria-label="Tecnologias">
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
