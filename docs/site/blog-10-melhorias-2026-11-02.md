# Dez melhorias locais — 02/11/2026

Priorização por utilidade verificável, sem prometer ausência universal de retorno decrescente. Publicação existente preservada. Nada enviado ao GitHub ou ao domínio.

| # | Melhoria | Valor concreto | Conferência |
|---|---|---|---|
| 1 | Pacote de entrega do projeto MGenética | Texto, referência, legenda e capa chegam com contrato explícito e pedido reutilizável | Projeto real localizado no Codex; instruções de origem lidas e preservadas; guia CODEX_BLOG_HANDOFF.md |
| 2 | Importação recuperável sem sobrescrever | Preserva a origem, recusa slug repetido, mantém legenda fora do catálogo e registra hash | Teste de colisão e comparação dos bytes de origem |
| 3 | Rascunhos com prévia isolada | Permite revisar antes de publicar; HTML de prévia noindex; textos/capas de rascunhos excluídos do build normal | Teste ponta a ponta com pacote temporário e restauração do build normal |
| 4 | Validação editorial antes do build | Identifica seções inválidas, fontes inseguras, referência/capa/responsável/descrição ausentes | Casos negativos e relatório por artigo; arquivo da imagem e dimensões conferidos na importação |
| 5 | Busca no artigo inteiro e URL persistente | Localiza conceitos que não aparecem no título; mantém consulta ao recarregar | Busca por “norma reação”, testes de acentos e múltiplos termos |
| 6 | Caminho de navegação visível e estruturado | Orienta leitor que chega direto do Instagram ou Google | Breadcrumb na página e BreadcrumbList no HTML |
| 7 | RSS automático | Permite acompanhar novos textos sem cadastro/email | XML com um item real e rascunhos excluídos |
| 8 | Tamanho de leitura ajustável | Leitor aumenta texto sem alterar o conteúdo; preferência persiste | Botão, recarga e quatro larguras; sem dependência de armazenamento disponível |
| 9 | Metadados de capa completos | OG e Twitter usam imagem real, descrição e dimensões correspondentes quando fornecida | Capa temporária de teste no HTML; artigo existente sem imagem inventada |
| 10 | Plano de publicação auditável | Mostra pendências e sequência de revisão/PR/deploy; não publica silenciosamente | editorial-release-plan.json; bloqueios de capa/responsável/descrição em pacote incompleto |

## Limites explícitos

- Projeto ChatGPT/Codex de origem não foi alterado: arquivos sincronizados são somente leitura. A ponte é um pacote salvo em pasta acessível ao Work, não uma integração automática entre conversas.
- O guia fornece o pedido adicional de blog sem substituir o formato habitual das três saídas de Instagram. Briefing vertical não é recortado automaticamente para capa horizontal.
- Publicação futura continua exigindo revisão editorial e solicitação explícita; nenhum comando novo faz commit, push ou merge. A fase blog ainda precisa ser conciliada em checkout isolado com o pipeline remoto e seus smoke tests antes de publicar.
- O artigo existente segue sem capa específica; sua ausência aparece como aviso legado. Novos artigos exigem capa e responsável antes de status published passar na validação estrita.
- Datas futuras não são um agendador: é necessário novo build. RSS não é newsletter.

## Fontes técnicas

- [Google: BreadcrumbList](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb): hierarquia visível e metadados correspondentes.
- [Google: imagens](https://developers.google.com/search/docs/appearance/google-images): imagem HTML real, contexto e descrição alternativa; não garante indexação ou exibição em redes.

## Integração para publicação

A entrega foi integrada sobre origin/main atualizado, preservando também o artigo de marcas brancas, sua capa e tabela, publicado pela PR #21. A prévia final contém dois artigos e filtros por categoria. Ambos os JSON originais e a capa foram mantidos sem alterações.
