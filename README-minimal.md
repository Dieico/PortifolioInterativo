# Portfolio (minimal)

Este é um resumo minimal do projeto preparado para compartilhar com um agente de IA. Ele exclui assets grandes (cenas e texturas) para manter o repositório leve.

Arquivos incluídos (recomendado):
- `package.json` (+ lockfile)
- `tsconfig.json`
- `next.config.js`
- `src/` (código fonte)
- `README-minimal.md` (este arquivo)

Arquivos excluídos por padrão (ver `.gitignore`):
- `public/scene/` e `assets/example.scene/` (cenários grandes exportados pelo Babylon Editor)
- `node_modules/`, `.next/`, `dist/`

Como preparar o repositório mínimo localmente:

1. Inicialize o repositório e faça commit (execute na raiz do projeto):

```powershell
git init
git add .
git commit -m "Minimal project for AI analysis"
```

2. (Opcional) Crie o repositório remoto e faça push — usando `gh` CLI:

```powershell
gh repo create YOUR_USER/REPO_NAME --public --source=. --remote=origin --push
```

ou crie o repo via GitHub web e então:

```powershell
git remote add origin https://github.com/YOUR_USER/REPO_NAME.git
git branch -M main
git push -u origin main
```

Nota sobre assets: se o agente de IA precisar analisar a cena 3D, anexe os arquivos relevantes separadamente (ZIP) ou publique apenas o `public/scene/example.babylon` em um release separado; assim o repositório principal permanece leve.

Se quiser, eu crio este `.gitignore` e `README-minimal.md` (já criei) e posso gerar um ZIP mínimo agora com os arquivos essenciais. Deseja que eu crie o ZIP aqui no repositório? 
