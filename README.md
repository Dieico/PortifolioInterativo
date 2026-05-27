# Meu Pequeno Mundo

Template de portfólio 3D em que um pequeno viajante explora um planeta redondo e
abre projetos em objetos narrativos.

## Executar

```bash
npm install
npm run dev
```

Use `WASD` ou as setas para caminhar, `Shift` para correr, `Espaço` para pular,
`E` para interagir, `C` para alternar entre as distâncias de câmera
centralizadas no viajante e `Esc` para fechar o painel.

## Personalizar

- Edite projetos, textos, links e posicoes em `src/data/projects.ts`.
- Ajuste a paleta e o visual do HUD em `src/styles.css`.
- Troque os marcos procedurais por modelos `.glb` em `src/world/PlanetWorld.tsx`.
- Substitua os links `https://example.com` pelos projetos publicados.

## Stack

- React + TypeScript + Vite
- React Three Fiber e Drei
- Zustand para estado da interacao e do HUD

## Próximos passos recomendados

1. Substituir o conteudo demonstrativo pelos seus projetos.
2. Modelar ou importar um personagem e marcos autorais em GLB.
3. Adicionar controles touch antes de divulgar em dispositivos moveis.
