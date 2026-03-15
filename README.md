# Demo repository (site estático)

Este repositório publica o `index.html` automaticamente no **GitHub Pages** via GitHub Actions.

## Publicação automática

1. Faça push para a branch principal do repositório.
2. No GitHub, abra **Settings → Pages** e em **Build and deployment** selecione **GitHub Actions** (uma única vez).
3. O workflow **Deploy static site to GitHub Pages** fará o deploy automático.

## URL pública

Depois do deploy, a URL normalmente fica neste formato:

`https://<seu-usuario>.github.io/<nome-do-repositorio>/`

## Como pegar o link publicado

- Vá em **Actions** → workflow **Deploy static site to GitHub Pages**.
- Abra a execução mais recente e veja o log do passo **Show deployed URL**.
- O link também aparece em **Settings → Pages** depois do primeiro deploy.


## Desenvolvimento local

```bash
python3 -m http.server 4173
```

Acesse `http://localhost:4173` no navegador.


## Deploy no Vercel

Este projeto já está pronto para deploy estático no Vercel (`vercel.json` incluído).

### Opção 1 (recomendada): importar repositório no painel Vercel

1. Acesse https://vercel.com/new
2. Faça **Import Git Repository** deste repositório.
3. Framework Preset: **Other**.
4. Build Command: deixe vazio.
5. Output Directory: deixe vazio (raiz com `index.html`).
6. Clique em **Deploy**.

Após isso, o Vercel gera uma URL pública no formato `https://<projeto>.vercel.app`.

### Opção 2: CLI Vercel

```bash
npm i -g vercel
vercel --prod
```

> Se sua rede bloquear o registro npm ou faltar autenticação, use a Opção 1 pelo painel.
