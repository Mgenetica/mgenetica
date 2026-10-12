import temperaturePerformance from './temperature-performance.json' with { type: 'json' }
// Conteúdo editorial local. Revisar aqui antes de qualquer publicação.
export const posts = [
  temperaturePerformance,
  {
    slug: 'genetica-nao-e-destino', category: 'Conceitos', title: 'Genética não é destino',
    summary: 'O que observamos em um indivíduo nasce do encontro entre herança genética e ambiente.',
    date: '2026-10-12', readingMinutes: 2, module: 'module-06',
    takeaway: 'Conhecer a genética ajuda a compreender possibilidades. Não transforma o futuro em uma certeza.',
    sections: [
      { id: 'o-que-vemos', title: 'O que vemos — e o que está por trás', paragraphs: ['Altura, cor e outras características observáveis compõem o fenótipo de um indivíduo. Esse é o nome científico para aquilo que podemos observar ou medir.', 'O fenótipo resulta da participação da constituição genética e do ambiente. Por isso, olhar uma característica não revela, sozinho, toda a informação genética de quem a apresenta.'] },
      { id: 'ambiente', title: 'O ambiente também participa', paragraphs: ['Pense em uma planta: a variedade importa, mas água, luz e condições de cultivo também fazem parte da história. A comparação serve para lembrar que herança e condições de vida precisam ser consideradas juntas.', 'Essa imagem é uma analogia, não uma fórmula capaz de prever qualquer organismo. O papel de cada fator depende da característica e das condições estudadas.'] },
      { id: 'interpretar', title: 'Uma pergunta melhor', paragraphs: ['Em vez de perguntar apenas “isso é genético?”, vale perguntar: qual característica está sendo estudada, em qual população e em quais condições?', 'Entender o contexto evita tratar uma informação genética como promessa de resultado. Observar, medir e comparar continuam sendo essenciais.'] }
    ], sources: [{ title: 'NHGRI · Fenótipo', url: 'https://www.genome.gov/genetics-glossary/Phenotype' }]
  },
  {
    slug: 'genotipo-e-fenotipo', category: 'Genética básica', title: 'Genótipo e fenótipo: duas peças da mesma história',
    summary: 'Uma palavra descreve informação genética; a outra, características observáveis. Entenda a diferença.',
    date: '2026-10-12', readingMinutes: 2, module: 'module-01',
    takeaway: 'Genótipo e fenótipo estão relacionados, mas não são sinônimos.',
    sections: [
      { id: 'genotipo', title: 'Genótipo: informação em uma posição do DNA', paragraphs: ['O DNA contém informação genética. Quando identificamos quais variantes estão presentes em uma determinada posição, descrevemos um genótipo. Variantes são diferenças na sequência do DNA.', 'Em exemplos didáticos, letras como AA, Aa e aa representam combinações de variantes. As letras são uma convenção para estudar herança; não são nomes de animais nem descrições completas de suas características.'] },
      { id: 'fenotipo', title: 'Fenótipo: aquilo que observamos', paragraphs: ['Uma característica que conseguimos observar ou medir faz parte do fenótipo. A relação com o genótipo pode ser simples em alguns exemplos, mas muitas características também dependem de fatores ambientais.', 'É por isso que uma descrição visual não substitui uma análise genética. Cada uma responde a perguntas diferentes.'] },
      { id: 'exemplo', title: 'Como usar essa diferença', paragraphs: ['Ao ler uma notícia, separe o que foi medido no indivíduo da informação encontrada no DNA. Depois, observe o que o estudo realmente demonstrou sobre a relação entre as duas coisas.', 'Essa distinção ajuda a reconhecer quando uma explicação está simplificando demais um resultado.'] }
    ], sources: [{ title: 'NHGRI · Genótipo', url: 'https://www.genome.gov/genetics-glossary/genotype' }, { title: 'NHGRI · Fenótipo', url: 'https://www.genome.gov/genetics-glossary/Phenotype' }]
  },
  {
    slug: 'muitos-genes-uma-caracteristica', category: 'Genética básica', title: 'Muitos genes, uma característica',
    summary: 'Nem toda característica cabe em uma explicação de um único gene. Conheça a herança poligênica.',
    date: '2026-10-12', readingMinutes: 2, module: 'module-07',
    takeaway: 'Uma característica pode envolver vários genes e também a influência do ambiente.',
    sections: [
      { id: 'poligenica', title: 'O significado de “poligênica”', paragraphs: ['Uma característica poligênica é influenciada por dois ou mais genes. O prefixo “poli” significa muitos. Altura humana é um exemplo usado para explicar esse conceito.', 'Essas características não seguem os padrões simples de herança mendeliana que costumamos conhecer nos primeiros exercícios de genética.'] },
      { id: 'soma', title: 'Uma explicação com várias peças', paragraphs: ['Imagine uma música tocada por vários instrumentos: ouvir apenas um deles não revela toda a composição. É uma analogia útil para lembrar que uma característica pode ter várias contribuições genéticas.', 'Na biologia, porém, as contribuições não precisam ser iguais nem funcionar como uma soma simples. O exemplo ajuda a visualizar a ideia, sem substituir a análise científica.'] },
      { id: 'contexto', title: 'O ambiente continua na conversa', paragraphs: ['Muitas características poligênicas também recebem influência ambiental. Quando vários fatores genéticos e ambientais participam, usamos o termo multifatorial.', 'Ao encontrar uma notícia sobre “o gene de uma característica”, pergunte se a pesquisa analisou uma única contribuição ou se demonstrou algo mais amplo. Uma peça importante ainda pode ser apenas parte da história.'] }
    ], sources: [{ title: 'NHGRI · Característica poligênica', url: 'https://www.genome.gov/genetics-glossary/Polygenic-Trait' }]
  }
]
export function filterPosts(query = '', category = 'Todos') {
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const needle = normalize(query.trim())
  return posts.filter(p => (category === 'Todos' || p.category === category) && normalize(`${p.title} ${p.summary} ${p.category}`).includes(needle))
}
