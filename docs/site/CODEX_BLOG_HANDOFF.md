# Do projeto MGenética no Codex ao blog

O projeto de legendas está em `/Users/glebstrauss/.codex/.chatgpt-projects/g-p-6788d494fc5481918fb1b069f9305799`. Suas instruções sincronizadas exigem três saídas para Instagram. Elas foram lidas e preservadas; não foi instalada integração automática nem alterado o projeto de origem. O fluxo abaixo acrescenta uma tarefa explícita de entrega, usando arquivos locais acessíveis ao Work.

## Pedido para usar no projeto das legendas

> Nesta tarefa adicional, prepare um pacote editorial para o blog do MGenética a partir apenas do artigo científico que forneci. Preserve as saídas habituais do Instagram. Depois, no modo Work com acesso aos arquivos, leia `/Users/glebstrauss/git-it/docs/site/CODEX_BLOG_HANDOFF.md` e grave o pacote em uma pasta de entrega que eu possa acessar. Não publique. Entregue `article.json`, `instagram.txt` e a capa horizontal, quando fornecida. Se os arquivos não puderem ser gravados, entregue seu conteúdo e diga que o pacote ainda precisa ser salvo. Não alegue integração ou publicação concluída.
>
> O texto deve explicar resultados, população, métodos e limites sem extrapolar o estudo. Preserve a referência completa no corpo e também preencha `sources`. Não copie figuras sem autorização. A imagem 4:5 do Instagram não substitui automaticamente uma capa horizontal: prepare um briefing 16:9 e aguarde geração/fornecimento da imagem, sem recortar animais silenciosamente. Não gere a imagem se eu não pedir. Informe responsável editorial real, descrição alternativa e crédito; identifique IA quando aplicável.

## Contrato do pacote

Pasta contendo `article.json`, `instagram.txt` (até 2.200 caracteres) e, se disponível, `slug.webp`/PNG/JPEG até 2 MB. Não incluir dados pessoais de terceiros nem credenciais.

```json
{
  "slug": "titulo-curto-do-artigo",
  "status": "draft",
  "title": "Título fiel ao artigo científico",
  "summary": "Resumo acessível que ajuda a escolher a leitura.",
  "seoDescription": "Descrição curta e específica, até 170 caracteres.",
  "category": "Genética e ambiente",
  "tags": ["equinos", "ambiente"],
  "date": "2026-11-02",
  "author": "MGenética",
  "readingMinutes": 5,
  "takeaway": "Ideia central sem extrapolar os resultados.",
  "sections": [
    {"id": "contexto", "title": "O que foi investigado?", "paragraphs": ["Texto baseado exclusivamente no estudo fornecido."]},
    {"id": "referencia", "title": "Referência", "paragraphs": ["Referência bibliográfica completa com DOI ou link."]}
  ],
  "sources": [{"title": "Referência completa do estudo", "url": "https://doi.org/DOI-REAL"}],
  "cover": {
    "src": "blog/covers/titulo-curto-do-artigo.webp",
    "alt": "Descrição objetiva do que aparece na imagem.",
    "credit": "Crédito, licença e identificação de IA se aplicável.",
    "width": 1600,
    "height": 900
  }
}
```

Exemplo de formato, não artigo pronto nem DOI válido. Omitir `cover` enquanto não houver imagem; rascunho pode ser importado, mas o plano apontará pendência. Não inventar dados para satisfazer o formulário. `readingMinutes` é estimativa editorial. Referência no corpo fica visível; `sources` não recria o antigo bloco “Fontes para aprofundar”.

## Pedido para usar neste repositório

> Importe o pacote em PASTA como rascunho, valide conteúdo e capa, gere a prévia e mostre as pendências. Não faça commit, push ou publicação.

CLI correspondente, a partir de `/Users/glebstrauss/git-it`:

```sh
node scripts/blog/editorial.mjs import /caminho/para/pacote
npm --prefix frontend run build:drafts
npm --prefix frontend run start -- --host 127.0.0.1 --port 4184
npm --prefix frontend run blog:plan
```

O importador recusa slugs existentes e mantém texto de origem. Legenda e hash do pacote ficam apenas na entrada editorial, fora do catálogo público gerado. A importação é sempre `draft`. A prévia inclui rascunhos e marca as páginas como `noindex`; nunca enviar esse build para produção. O build padrão exclui rascunhos, inclusive seus textos e legendas dos dados do frontend. Após revisar, voltar ao build padrão para prévia pública.

## Publicação futura

1. Revisar texto, referência, capa, responsabilidade editorial e data na prévia.
2. Conferir `docs/site/editorial-release-plan.json`.
3. Somente após aprovação editorial, mudar status da entrada para `published`.
4. Rodar build normal, testes, verificações de navegador e `prepublish_site_check.R`; usar checkout isolado para não enviar trabalho antigo por acidente.
5. Com autorização explícita de publicação: commit/PR, verificações do GitHub, merge e deploy; conferir o artigo e a capa no domínio público antes de divulgar o link no Instagram.

Não há agendamento automático: datas futuras não aparecem no catálogo até novo build e revisão. Search Console/Google e redes sociais podem manter cache e não garantem indexação ou prévia imediata. O código não faz push nem merge.
