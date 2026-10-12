# Revisão editorial EN/ES — 10/10/2026

Correções aplicadas localmente nos 21 módulos. Sem commit, push, merge ou publicação.

## Cobertura

Revisão das aberturas, introduções, explicações centrais e perguntas dos módulos. Leitura dos exemplos resolvidos dos 21 módulos com correções de sentido e terminologia. Revisão de títulos, mensagens e termos dos laboratórios; conferência adicional das instruções práticas dos módulos 11–21. Varredura terminológica dos dicionários.

448 passagens-fonte possuem correções editoriais explícitas em inglês e espanhol. O histórico conserva original, antes/depois e identificação da fonte; algumas entradas representam correções intermediárias, e não passagens distintas.

## Correções de maior impacto

- *Chicks* → *offspring*, para crias de equinos.
- *Identity by offspring* → *identity by descent*.
- *Genomic parenting* → *genomic relatedness* / *parentesco genómico*.
- *Peso al anhelo* → *peso al sobreaño*.
- Correção de endogamia, heterose, efeito aditivo, correlação genética e instruções de genotipagem.
- Explicações de herdabilidade, BLUP e associação genômica reformuladas para evitar interpretações inadequadas.

Português, identificadores, código científico/R e dados dos laboratórios foram preservados conforme os testes. A revisão não valida novamente todas as afirmações científicas ou referências do currículo original.

## Validação e limites

13 testes aprovados; compilação aprovada. Relatório funcional separado: 21 módulos × 3 idiomas, controles e preservação de estado. O aviso de tamanho do pacote principal permanece.

**Pendente:** leitura editorial integral das interpretações biológicas, checkpoints, tabelas e demais instruções longas. A cobertura acima não equivale a uma revisão palavra por palavra de todo o curso. Ainda não considero a edição bilíngue final encerrada.

## Fontes terminológicas consultadas

[FAO — Melhoramento genético animal (espanhol)](https://www.fao.org/4/i1103s/i1103s00.htm), [FAO — princípios de melhoramento](https://www.fao.org/4/v8720s/v8720s02.htm), [EBI — GWAS Catalog](https://www.ebi.ac.uk/gwas/).

## Reproduzir

Aplicar `scripts/i18n/editorial_review.py`, depois `scripts/i18n/build_translations.py`. O hash do plano protege os índices editoriais contra mudanças acidentais na ordem das fontes. Arquivos gerados devem ser reconstruídos a partir das correções, não editados diretamente.
