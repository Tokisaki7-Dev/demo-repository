# PromoRadar BR (site estático)

Hub de promoções com visual original, agregação de ofertas em múltiplas fontes, watchlist e alertas locais.

## Funcionalidades

- Busca e filtros avançados (categoria, fonte, preço máximo, desconto mínimo e ordenação).
- Agregação automática de produtos de:
  - FakeStore API
  - DummyJSON API
  - Curadoria interna de ofertas
- Cartões com imagem, desconto calculado, preço atual, preço anterior e link de compra.
- Painel analítico com estatísticas e gráfico de desconto.
- Alertas personalizados por palavra-chave e preço alvo (com Notification API do navegador).
- Watchlist local persistida em `localStorage`.
- Tema claro/escuro.
- Atualização manual e automática (a cada 5 minutos).

## Rodar localmente

```bash
python3 -m http.server 4173
```

Acesse `http://localhost:4173`.

## Deploy no Vercel

Este projeto já está pronto para deploy estático no Vercel (`vercel.json`).

1. Acesse https://vercel.com/new
2. Importe o repositório
3. Framework Preset: **Other**
4. Build Command: vazio
5. Output Directory: vazio
6. Deploy

## Observações

- Algumas integrações públicas podem ter variação de disponibilidade conforme CORS e limites das APIs.
- Este projeto é front-end estático; para produção comercial em larga escala, recomenda-se adicionar backend próprio para normalização de feeds e monitoramento robusto.
