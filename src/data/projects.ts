import artstationColorHeroesImage from '../assets/projects/artstation-color-heroes.jpg'
import artstationCubeForestImage from '../assets/projects/artstation-cube-forest.jpg'
import artstationMedievalAssetsImage from '../assets/projects/artstation-medieval-assets.jpg'
import artstationMushroomMonkImage from '../assets/projects/artstation-mushroom-monk.jpg'
import artstationPixelRoomImage from '../assets/projects/artstation-pixel-room.jpg'
import artstationSertaniaImage from '../assets/projects/artstation-sertania.jpg'
import qgQueenImage from '../assets/projects/qg-queen.jpg'

export type LandmarkKind =
  | 'profile'
  | 'sertania'
  | 'colorHeroes'
  | 'mushroomMonk'
  | 'saswirl'
  | 'qgQueen'
  | 'cubeForest'
  | 'pixelRoom'
  | 'medievalAssets'
  | 'contact'

export type Project = {
  id: string
  kind: LandmarkKind
  title: string
  eyebrow: string
  description: string
  role?: string
  technologies?: string[]
  imageUrl?: string
  imageAlt?: string
  videoUrl?: string
  videoTitle?: string
  actionLabel?: string
  actionUrl?: string
  normal: [number, number, number]
  translations?: {
    en?: Partial<
      Pick<
        Project,
        | 'title'
        | 'eyebrow'
        | 'description'
        | 'role'
        | 'technologies'
        | 'imageAlt'
        | 'videoTitle'
        | 'actionLabel'
      >
    >
  }
}

export const projects: Project[] = [
  {
    id: 'sobre',
    kind: 'profile',
    title: 'Diego Linhares',
    eyebrow: 'Generalista 3D & Producer',
    description:
      'Profissional de comunicação visual com experiência como Designer Gráfico e Generalista 3D. Sou apaixonado por transformar ideias abstratas em conceitos visuais acessíveis e interativos, com foco especial em desenvolvimento de jogos, onde arte e tecnologia se encontram para criar experiências imersivas.',
    role: 'Generalista 3D, Produtor de Jogos e Game Designer',
    technologies: [
      'Blender',
      'Substance Painter',
      'Substance Designer',
      'Photoshop',
      'Krita',
      'Affinity',
      'Illustrator',
      'Figma',
      'Unreal Engine',
      'Unity',
      'Godot',
    ],
    //imageUrl: diegoLinharesImage,
    imageAlt: 'Página de apresentação do portfólio de Diego Linhares.',
    actionLabel: 'Ver ArtStation',
    actionUrl: 'https://www.artstation.com/dieico',
    normal: [0, 0.18, 0.984],
    translations: {
      en: {
        eyebrow: '3D Generalist & Producer',
        description:
          'Visual communication professional with experience as a Graphic Designer and 3D Generalist. I am passionate about turning abstract ideas into accessible, interactive visual concepts, with a special focus on game development, where art and technology meet to create immersive experiences.',
        role: '3D Generalist, Game Producer and Game Designer',
        imageAlt: 'Portfolio introduction page for Diego Linhares.',
        actionLabel: 'View ArtStation',
      },
    },
  },
  {
    id: 'sertania',
    kind: 'sertania',
    title: 'Projeto Sertania',
    eyebrow: 'Modelagem 3D & Tech Art',
    description:
      'Sertânia é um jogo de gerenciamento narrativo ambientado no Nordeste brasileiro, imergindo o jogador na realidade de sobreviventes. Com forte apelo cultural e direção de arte que valoriza a estética do Sertão, o projeto integra identidade cearense aos videogames e foi contemplado pela Lei Paulo Gustavo. Minha atuação cobriu o pipeline de arte 3D, da concepção técnica à integração dos assets na engine, equilibrando fidelidade visual e performance.',
    role: 'Generalista 3D, Tech Artist & Produtor Criativo',
    technologies: ['Blender', 'Unity', 'Substance Painter', 'Tech Art', 'GDD'],
    imageUrl: artstationSertaniaImage,
    imageAlt: 'Página do PDF com a apresentação do projeto Sertania.',
    actionLabel: 'Ver projeto',
    actionUrl: 'https://rebuild-studio.itch.io/sertania',
    normal: [-0.61, 0.31, 0.73],
    translations: {
      en: {
        title: 'Sertania Project',
        eyebrow: '3D Modeling & Tech Art',
        description:
          'Sertania is a narrative management game set in Northeastern Brazil, immersing players in the reality of survivors. With strong cultural appeal and art direction that values the Sertao aesthetic, the project brings Ceara identity into videogames and was selected by the Paulo Gustavo Law. My work covered the 3D art pipeline, from technical planning to asset integration in the engine, balancing visual fidelity and performance.',
        role: '3D Generalist, Tech Artist & Creative Producer',
        imageAlt: 'Character render from the Sertania project published on ArtStation.',
        actionLabel: 'View project',
      },
    },
  },
  {
    id: 'color-heroes',
    kind: 'colorHeroes',
    title: 'Color Heroes',
    eyebrow: 'Texture Painter 3D',
    description:
      'Color Heroes é uma experiência de jogo de resolução de problemas no Roblox, criada para desenvolver raciocínio lógico, pensamento criativo e inteligência emocional. Atuei na otimização de assets 3D e na criação e aplicação de texturas voltadas ao Roblox, refinando malhas e mapeamentos para respeitar as exigências técnicas do Roblox Studio.',
    role: 'Texture Painter 3D',
    technologies: ['Blender', 'Krita', 'Substance Painter', 'Roblox Studio'],
    imageUrl: artstationColorHeroesImage,
    imageAlt: 'Página do PDF com descrição do projeto Color Heroes.',
    actionLabel: 'Ver no ArtStation',
    actionUrl: 'https://www.artstation.com/artwork/AZlmyo',
    normal: [0.62, 0.34, 0.7],
    translations: {
      en: {
        eyebrow: '3D Texture Painter',
        description:
          'Color Heroes is a Roblox problem-solving game experience designed to develop logical reasoning, creative thinking and emotional intelligence. I worked on 3D asset optimization and on creating and applying textures specifically for Roblox, refining meshes and UV mapping to meet Roblox Studio technical requirements.',
        role: '3D Texture Painter',
        imageAlt: '3D asset render used to represent Color Heroes.',
        actionLabel: 'View on ArtStation',
      },
    },
  },
  {
    id: 'mushroom-monk',
    kind: 'mushroomMonk',
    title: 'Mushroom Monk',
    eyebrow: 'Personagem 3D',
    description:
      'Estudo prático de um pipeline completo para produção de personagens 3D. O fluxo abrangeu concept art, escultura digital high-poly, retopologia, mapeamento UV, texturização, rigging, skinning e animação, consolidando um ciclo completo de criação de asset para jogos.',
    role: 'Generalista 3D, Rigging & Animação',
    technologies: ['Blender', 'Sculpt', 'Retopologia', 'UV Mapping', 'Rigging'],
    imageUrl: artstationMushroomMonkImage,
    imageAlt: 'Página do PDF com o projeto Mushroom Monk.',
    actionLabel: 'Ver no ArtStation',
    actionUrl: 'https://www.artstation.com/artwork/qeAyAa',
    normal: [-0.4, -0.54, 0.74],
    translations: {
      en: {
        eyebrow: '3D Character',
        description:
          'A practical study of a complete 3D character production pipeline. The workflow covered concept art, high-poly digital sculpting, retopology, UV mapping, texturing, rigging, skinning and animation, consolidating a full asset creation cycle for games.',
        role: '3D Generalist, Rigging & Animation',
        technologies: ['Blender', 'Sculpting', 'Retopology', 'UV Mapping', 'Rigging'],
        imageAlt: 'Mushroom Monk character render published on ArtStation.',
        actionLabel: 'View on ArtStation',
      },
    },
  },
  {
    id: 'saswirl-fanart',
    kind: 'saswirl',
    title: 'Saswirl Fanart',
    eyebrow: 'Fanart animada',
    description:
      'Fanart animada criada a partir do personagem Saswirl, inspirada pelo RPG de mesa Caçadores de Saci e pelo trabalho conceitual de @hataaoh.bsky.social. O estudo explora animação estilizada, leitura de personagem e adaptação de conceito para movimento.',
    role: 'Animação, modelagem e estudo de personagem',
    technologies: ['Blender', 'Animação 3D', 'Character Art'],
    // imageUrl: saswirlFanartImage,
    imageAlt: 'Página do PDF com o projeto Saswirl Fanart.',
    videoUrl: 'https://youtu.be/pS29f76H7k8',
    videoTitle: 'Animação Saswirl Fanart',
    actionLabel: 'Assistir animação',
    actionUrl: 'https://youtu.be/pS29f76H7k8',
    normal: [0.16, -0.82, 0.55],
    translations: {
      en: {
        eyebrow: 'Animated fanart',
        description:
          'Animated fanart based on the character Saswirl, inspired by the tabletop RPG Cacadores de Saci and the concept work of @hataaoh.bsky.social. The study explores stylized animation, character readability and concept adaptation into motion.',
        role: 'Animation, modeling and character study',
        technologies: ['Blender', '3D Animation', 'Character Art'],
        imageAlt: 'PDF page featuring the Saswirl Fanart project.',
        videoTitle: 'Saswirl Fanart animation',
        actionLabel: 'Watch animation',
      },
    },
  },
  {
    id: 'qg-queen',
    kind: 'qgQueen',
    title: 'Projeto QG Queen',
    eyebrow: 'Cenário e personagens',
    description:
      'Projeto em desenvolvimento com foco em criação de cenários, ambientação e iluminação, além de modelagem e animação de personagens. A proposta combina direção visual, construção de espaço e desenvolvimento de assets animáveis.',
    role: 'Cenários, ambientação, iluminação e animação',
    technologies: ['Blender', 'Environment Art', 'Lighting', 'Character Animation'],
    imageUrl: qgQueenImage,
    imageAlt: 'Página do PDF com o projeto QG Queen.',
    normal: [-0.78, -0.19, 0.6],
    translations: {
      en: {
        title: 'QG Queen Project',
        eyebrow: 'Environment and characters',
        description:
          'A project in development focused on environment creation, atmosphere and lighting, as well as character modeling and animation. The proposal combines visual direction, spatial construction and the development of animation-ready assets.',
        role: 'Environments, atmosphere, lighting and animation',
        imageAlt: 'PDF page featuring the QG Queen project.',
      },
    },
  },
  {
    id: 'cube-forest',
    kind: 'cubeForest',
    title: 'Cube Forest',
    eyebrow: 'Environment study',
    description:
      'Estudo de ambiente 3D com composição modular, formas blocadas e atmosfera estilizada. O projeto explora leitura de cenário, organização espacial e construção visual a partir de volumes simples.',
    role: 'Modelagem 3D e composição de ambiente',
    technologies: ['Blender', 'Environment Design', 'Low Poly', 'Composição'],
    imageUrl: artstationCubeForestImage,
    imageAlt: 'Render do projeto Cube Forest publicado no ArtStation.',
    actionLabel: 'Ver no ArtStation',
    actionUrl: 'https://www.artstation.com/artwork/9EmvRv',
    normal: [-0.18, 0.92, 0.34],
    translations: {
      en: {
        eyebrow: 'Environment study',
        description:
          'A 3D environment study with modular composition, blocky forms and stylized atmosphere. The project explores scene readability, spatial organization and visual construction from simple volumes.',
        role: '3D modeling and environment composition',
        imageAlt: 'Cube Forest render published on ArtStation.',
        actionLabel: 'View on ArtStation',
      },
    },
  },
  {
    id: 'pixel-art-sala',
    kind: 'pixelRoom',
    title: '3D Pixel Art - Sala de Estar',
    eyebrow: 'Environment design',
    description:
      'Estudo pessoal de environment design que une modelagem 3D com técnicas de texturização em pixel art. A direção de arte e a montagem do cenário buscam capturar a cultura regional nordestina em um espaço doméstico marcado por raízes, cotidiano e elementos religiosos.',
    role: 'Modelagem 3D, texturização e direção de arte',
    technologies: ['Blender', 'Pixel Art', 'Environment Design', 'Texturização'],
    imageUrl: artstationPixelRoomImage,
    imageAlt: 'Página do PDF com o estudo 3D Pixel Art - Sala de Estar.',
    actionLabel: 'Ver no ArtStation',
    actionUrl: 'https://www.artstation.com/artwork/yD6NP5',
    normal: [0.83, -0.27, 0.49],
    translations: {
      en: {
        title: '3D Pixel Art - Living Room',
        eyebrow: 'Environment design',
        description:
          'A personal environment design study combining 3D modeling with pixel-art texturing techniques. The art direction and scene assembly aim to capture Northeastern Brazilian regional culture in a domestic space shaped by roots, daily life and religious elements.',
        role: '3D modeling, texturing and art direction',
        technologies: ['Blender', 'Pixel Art', 'Environment Design', 'Texturing'],
        imageAlt: '3D pixel-art living room render published on ArtStation.',
        actionLabel: 'View on ArtStation',
      },
    },
  },
  {
    id: 'assets-medievais',
    kind: 'medievalAssets',
    title: 'Assets Medievais',
    eyebrow: 'Assets para curta animado',
    description:
      'Conjunto de assets temáticos medievais desenvolvidos para um curta-metragem animado no Blender. Fui responsável pela criação de modelos realistas, low-poly e otimizados, com texturização realizada no Substance Painter.',
    role: 'Modelagem low-poly e texturização',
    technologies: ['Blender', 'Substance Painter', 'Low Poly', 'Asset Optimization'],
    imageUrl: artstationMedievalAssetsImage,
    imageAlt: 'Página do PDF com o projeto Assets Medievais.',
    videoUrl: 'https://youtu.be/JLk-XBMbQMA',
    videoTitle: 'Animação com assets medievais',
    actionLabel: 'Ver no ArtStation',
    actionUrl: 'https://www.artstation.com/artwork/OGX4ne',
    normal: [0.36, 0.88, 0.31],
    translations: {
      en: {
        title: 'Medieval Assets',
        eyebrow: 'Assets for animated short',
        description:
          'A set of medieval themed assets developed for an animated short in Blender. I was responsible for creating realistic, low-poly and optimized models, with texturing done in Substance Painter.',
        role: 'Low-poly modeling and texturing',
        imageAlt: 'Medieval asset render published on ArtStation.',
        videoTitle: 'Animation with medieval assets',
        actionLabel: 'View on ArtStation',
      },
    },
  },
  {
    id: 'contato',
    kind: 'contact',
    title: 'Contato',
    eyebrow: 'Vamos conversar',
    description:
      'Entre em contato para colaborações, projetos de jogos, produção de assets 3D, direção de arte ou desenvolvimento de experiências interativas.',
    role: 'Disponível para novos projetos',
    technologies: ['diegolimd3@gmail.com', 'Itapipoca - CE', '@dieicoart'],
    actionLabel: 'Enviar e-mail',
    actionUrl: 'mailto:diegolimd3@gmail.com',
    normal: [0.49, -0.5, 0.71],
    translations: {
      en: {
        title: 'Contact',
        eyebrow: 'Let us talk',
        description:
          'Get in touch for collaborations, game projects, 3D asset production, art direction or interactive experience development.',
        role: 'Available for new projects',
        technologies: ['diegolimd3@gmail.com', 'Itapipoca - CE', '@dieicoart'],
        actionLabel: 'Send e-mail',
      },
    },
  },
]
