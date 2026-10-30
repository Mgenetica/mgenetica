# Blog MGenética — edição local

Conteúdo em `posts.mjs`, independente do currículo, backend e painel. Primeira versão em português, sem inscrição, coleta de email ou newsletter.

Para adicionar artigo: slug único em minúsculas com hífens; categoria, título, resumo, data ISO, tempo estimado de leitura, módulo relacionado; ideia central, seções com IDs únicos e parágrafos; fontes públicas verificáveis. Sem HTML arbitrário. React renderiza os textos como conteúdo escapado.

Guia editorial: explicar termos, exemplos cotidianos, distinguir analogia de evidência, preservar incertezas e evitar determinismo. Não inventar autoria, resultados ou validação externa. Os três textos iniciais são introdutórios, preparados para revisão de Gleb antes de publicar; autoria exibida como MGenética.

Prévia: `/mgenetica/blog/`; artigo: `/mgenetica/blog/SLUG/`. Em produção, os endereços usam a raiz do domínio. O build pré-renderiza texto e metadados de cada artigo; links anteriores com `#blog` encaminham para os novos endereços.

Teste: `npm --prefix frontend test`, `npm --prefix frontend run build`; com servidor local na porta 4180, `node scripts/blog/verify-local.cjs`. Se Playwright não estiver instalado localmente, indicar pacote em `PLAYWRIGHT_PATH`. Teste funcional inclui busca, filtros, artigos em três larguras, foco do sumário, atalho para conteúdo, endereço inexistente e navegação para curso. Capturas ficam em `/tmp/blog-*.png`.

Publicar somente quando solicitado, após revisar texto, data, imagem e executar prepublish_site_check.R.

## Texto e capa pelo Codex Work

No projeto onde prepara a divulgação, entregue um pacote com texto completo, referência científica, título, resumo, categoria, tags sugeridas e uma imagem de capa (preferir WebP/JPEG horizontal 1600 × 900, sem título embutido). Inclua descrição da imagem, crédito/licença e eventual indicação de imagem gerada por IA. Use imagens próprias, autorizadas ou geradas; não reutilize figuras do artigo sem conferir os direitos.

No Work com acesso a este repositório, solicite: “Adicione este artigo e a capa ao blog do MGenética, preserve a referência enviada e prepare prévia local”. O contexto de outro projeto não é importado automaticamente: forneça o texto e a imagem ou seus caminhos acessíveis. Adicionar os arquivos aqui não publica o site; publicação continua pelo fluxo GitHub existente, mediante solicitação.

1. Salvar imagem em `frontend/public/blog/covers/SLUG.webp`.
2. Adicionar artigo em `posts.mjs` seguindo os existentes. Categorias são derivadas automaticamente do conteúdo; tags ainda não possuem filtro próprio.
3. Adicionar campo `cover`:

```js
cover: {
  src: 'blog/covers/SLUG.webp',
  alt: 'Descrição objetiva da imagem para quem não consegue vê-la.',
  width: 1600,
  height: 900,
  position: 'center', // pode ajustar o recorte, por exemplo '50% 30%'
  caption: 'Legenda opcional.',
  credit: 'Crédito e licença; indicar IA quando aplicável.'
},
author: 'Nome responsável pelo texto',
// updatedAt: '2026-10-30', // somente quando houver revisão real
```

Campos de capa opcionais mantêm compatibilidade com textos anteriores. Imagens ausentes ou indisponíveis usam composição visual neutra. Capas nos cards carregam sob demanda; capa do artigo carrega imediatamente. Crédito aparece no artigo. Referências continuam no texto enviado; não é recriado o bloco “Fontes para aprofundar”.

Título, descrição e metadados sociais são gerados em HTML por artigo. A disponibilidade desses dados não garante indexação nem a atualização imediata dos caches de WhatsApp/Instagram.

## URLs públicas e SEO (30/10/2026)

O build agora gera `/blog/` e `/blog/SLUG/` com o texto completo em HTML, metadados próprios, URL canônica, Open Graph e JSON-LD BlogPosting. `seoDescription` permite descrição específica; na ausência, usa-se o resumo. Sitemap e robots.txt são gerados no mesmo build. Links antigos `#blog/SLUG` continuam encaminhando ao novo endereço. Em prévias com base `/mgenetica/`, o prefixo é preservado; produção usa `VITE_APP_BASE=/` e `VITE_PUBLIC_SITE_URL=https://www.mgenetica.com/` no fluxo existente. Não se deve editar o HTML gerado: a fonte continua em `posts.mjs` e nos JSONs dos artigos.
