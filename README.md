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
