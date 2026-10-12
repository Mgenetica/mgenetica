# Blog MGenética — edição local

Conteúdo em `posts.mjs`, independente do currículo, backend e painel. Primeira versão em português, sem inscrição, coleta de email ou newsletter.

Para adicionar artigo: slug único em minúsculas com hífens; categoria, título, resumo, data ISO, tempo estimado de leitura, módulo relacionado; ideia central, seções com IDs únicos e parágrafos; fontes públicas verificáveis. Sem HTML arbitrário. React renderiza os textos como conteúdo escapado.

Guia editorial: explicar termos, exemplos cotidianos, distinguir analogia de evidência, preservar incertezas e evitar determinismo. Não inventar autoria, resultados ou validação externa. Os três textos iniciais são introdutórios, preparados para revisão de Gleb antes de publicar; autoria exibida como MGenética.

Prévia: `/mgenetica/#blog`; artigo: `/mgenetica/#blog/SLUG`. Rotas seguem o site existente. Título do documento muda por artigo. Hash routing não oferece páginas HTML individuais nem metadados sociais por artigo para robôs que não executam JavaScript. Avaliar pré-renderização/URLs dedicadas antes de exigir indexação e compartilhamento avançados; não apresentar esta versão como SEO completo.

Teste: `npm --prefix frontend test`, `npm --prefix frontend run build`; com servidor local na porta 4180, `node scripts/blog/verify-local.cjs`. Se Playwright não estiver instalado localmente, indicar pacote em `PLAYWRIGHT_PATH`. Teste funcional inclui busca, filtros, artigos em três larguras, foco do sumário, atalho para conteúdo, endereço inexistente e navegação para curso. Capturas ficam em `/tmp/blog-*.png`.

Sem publicação autorizada. Revisar textos, datas editoriais e integração final antes do prepublish_site_check.R e eventual publicação.
