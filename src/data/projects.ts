export type LandmarkKind = 'home' | 'telescope' | 'tree' | 'rocket' | 'mailbox'

export type Project = {
  id: string
  kind: LandmarkKind
  title: string
  eyebrow: string
  description: string
  role?: string
  technologies?: string[]
  videoUrl?: string
  videoTitle?: string
  actionLabel?: string
  actionUrl?: string
  normal: [number, number, number]
}

export const projects: Project[] = [
  {
    id: 'sobre',
    kind: 'home',
    title: '',
    eyebrow: 'Sobre mim',
    description:
      'I am a professional graduate in Sistemas e Mídias Digitais with extensive experience in media development. My skills encompass areas such as 2D/3D animation, 3D modeling, programming, UI/UX, and image editing. I have knowledge of software such as Blender, Photoshop, Illustrator, and experience in developing 3D assets for games on Unity and Unreal Engine platforms. I am passionate about creating captivating worlds and narratives, and I am constantly seeking to improve my skills. I am available to collaborate on challenging projects and contribute to the success of the team.',
    //role: '',
    //technologies: [''],
    normal: [0, 0.18, 0.984],
  },
  {
    id: 'sertania',
    kind: 'telescope',
    title: 'Protótipo Sertania',
    eyebrow: 'Experiência digital',
    description:
      'Um telescópio aponta para seu projeto de destaque. Aqui entram o desafio, a solução criada e os resultados do trabalho.',
    role: 'Generalist 3D, Art Director',
    technologies: ['Blender', 'Unity', 'Substance Painter'],
    // videoUrl: '/assets/meu-video.mp4',
    // videoUrl: 'https://www.youtube.com/watch?v=SEU_VIDEO',
    // videoTitle: 'Video do Projeto Atlas',
    actionLabel: 'Ver projeto',
    actionUrl: 'https://example.com',
    normal: [-0.61, 0.31, 0.73],
  },
  {
    id: 'jardim',
    kind: 'tree',
    title: 'Jardim de Marca',
    eyebrow: 'Identidade visual',
    description:
      'A árvore representa uma identidade que cresceu ao longo do processo: estratégia, linguagem visual e aplicações.',
    role: 'Branding e direção de arte',
    technologies: ['Branding', 'Illustrator', 'Motion'],
    actionLabel: 'Ver estudo',
    actionUrl: 'https://example.com',
    normal: [0.62, 0.34, 0.7],
  },
  {
    id: 'orbita',
    kind: 'rocket',
    title: 'Orbita App',
    eyebrow: 'Aplicação web',
    description:
      'Uma pequena nave para apresentar produto, plataforma ou aplicativo. Mostre telas, funcionalidades e aprendizados.',
    role: 'Produto e desenvolvimento',
    technologies: ['TypeScript', 'React', 'API'],
    actionLabel: 'Abrir aplicativo',
    actionUrl: 'https://example.com',
    normal: [-0.4, -0.54, 0.74],
  },
  {
    id: 'contato',
    kind: 'mailbox',
    title: 'Mensagem Interestelar',
    eyebrow: 'Contato',
    description:
      'Gostou da viagem? Troque este endereço pelos seus canais reais e convide visitantes a iniciar uma conversa.',
    role: 'Disponível para novos projetos',
    technologies: ['email@portfolio.com', 'LinkedIn', 'GitHub'],
    actionLabel: 'Enviar e-mail',
    actionUrl: 'mailto:email@portfolio.com',
    normal: [0.49, -0.5, 0.71],
  },
]
