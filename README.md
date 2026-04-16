# Portfolio 3D Interativo

Portfolio pessoal em `Next.js`, `TypeScript` e `Babylon.js`, com navegacao isometrica, cena 3D exportada do Babylon.js Editor e modal contextual para apresentar projetos.

## Stack

- `Next.js 16`
- `React 18`
- `TypeScript`
- `Tailwind CSS`
- `Babylon.js`
- `Havok Physics`
- `GitHub Pages` com export estatico

## Como rodar

Instale as dependencias:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run lint:fix
npm run generate
```

## Estrutura principal

- `src/app`: shell da aplicacao e estilos globais
- `src/data/projects.ts`: dados exibidos no modal dos projetos
- `src/features/portfolio3d`: camera, player, interacoes e UI da cena
- `public/scene`: assets publicados da cena Babylon
- `assets/`: arquivos de trabalho do editor e fontes da cena

## Deploy

O projeto esta configurado para publicar no `GitHub Pages` via GitHub Actions.

Pontos importantes:

- o build usa `next build` com `output: "export"`
- o `basePath` e o `assetPrefix` sao calculados automaticamente a partir do nome do repositorio
- o workflow de deploy esta em `.github/workflows/deploy-pages.yml`

Depois de fazer push para `main`, basta garantir que o repositrio esteja com o Pages configurado para usar `GitHub Actions`.

## O que vale commitar

Arquivos e pastas que fazem parte do projeto:

- `src/`
- `public/`
- `assets/`
- `.github/workflows/`
- `package.json`
- `package-lock.json`
- `next.config.js`
- `tailwind.config.ts`
- `tsconfig.json`
- `postcss.config.js`
- `.gitignore`
- `eslint.config.mjs`
- `README.md`

Arquivos gerados que nao devem voltar para o Git:

- `.next/`
- `out/`
- `node_modules/`
- `.bjseditor/`
- `.idea/`
- `.vs/`
- `.vscode/`
- `tsconfig.tsbuildinfo`
