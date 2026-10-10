import { getCourseVisualAsset } from './courseVisualAssets'

const BLOCK_LABELS = {
  fundamentos: { 'pt-BR': 'Fundamentos', en: 'Foundations', es: 'Fundamentos' },
  populacoes: { 'pt-BR': 'Genética de populações', en: 'Population genetics', es: 'Genética de poblaciones' },
  quantitativa: { 'pt-BR': 'Genética quantitativa', en: 'Quantitative genetics', es: 'Genética cuantitativa' },
  avaliacao: {
    'pt-BR': 'Parentesco, cruzamentos e avaliação genética',
    en: 'Relationship, crossbreeding and genetic evaluation',
    es: 'Parentesco, cruzamientos y evaluación genética'
  },
  genomica: {
    'pt-BR': 'Genômica aplicada ao melhoramento',
    en: 'Genomics applied to breeding',
    es: 'Genómica aplicada al mejoramiento'
  }
}

const COURSE_LABELS = {
  courseTitle: {
    'pt-BR': 'Curso MGenética',
    en: 'MGenética Course',
    es: 'Curso MGenética'
  },
  studyBlock: {
    'pt-BR': 'Bloco de estudo',
    en: 'Study block',
    es: 'Bloque de estudio'
  },
  mainTheme: {
    'pt-BR': 'Tema principal',
    en: 'Main theme',
    es: 'Tema principal'
  },
  hierarchy: {
    'pt-BR': 'Curso -> Tema principal -> Bloco de estudo -> Itens do bloco',
    en: 'Course -> Main theme -> Study block -> Block items',
    es: 'Curso -> Tema principal -> Bloque de estudio -> Items del bloque'
  }
}

const STUDY_PART_LABELS = {
  reading: { 'pt-BR': 'Leitura', en: 'Reading', es: 'Lectura' },
  concept: { 'pt-BR': 'Conceito', en: 'Concept', es: 'Concepto' },
  exercise: { 'pt-BR': 'Exercício', en: 'Exercise', es: 'Ejercicio' },
  lab: { 'pt-BR': 'Laboratório R', en: 'R Lab', es: 'Laboratorio R' },
  quiz: { 'pt-BR': 'Quiz', en: 'Quiz', es: 'Cuestionario' }
}

const THEME_SUMMARIES = {
  fundamentos: {
    'pt-BR': 'Base genética antes de populações e genética quantitativa.',
    en: 'Genetic foundations before populations and quantitative genetics.',
    es: 'Base genética antes de poblaciones y genética cuantitativa.'
  },
  populacoes: {
    'pt-BR': 'Frequências, equilíbrio e forças que mudam alelos em rebanhos.',
    en: 'Frequencies, equilibrium and forces that change alleles in herds.',
    es: 'Frecuencias, equilibrio y fuerzas que cambian alelos en rebaños.'
  },
  quantitativa: {
    'pt-BR': 'Variação contínua, parâmetros, seleção e respostas correlacionadas.',
    en: 'Continuous variation, parameters, selection and correlated responses.',
    es: 'Variación continua, parámetros, selección y respuestas correlacionadas.'
  },
  avaliacao: {
    'pt-BR': 'Parentesco, cruzamentos, modelos e avaliação genética para decisão.',
    en: 'Relationship, crossbreeding, models and genetic evaluation for decisions.',
    es: 'Parentesco, cruzamientos, modelos y evaluación genética para decisión.'
  },
  genomica: {
    'pt-BR': 'Marcadores, controle de qualidade, matrizes, predição e projeto final.',
    en: 'Markers, quality control, matrices, prediction and final project.',
    es: 'Marcadores, control de calidad, matrices, predicción y proyecto final.'
  }
}

const THEME_ORDER = ['fundamentos', 'populacoes', 'quantitativa', 'avaliacao', 'genomica']

const MODULE_LOCALIZATION = {
  'module-01': {
    en: {
      title: 'Review of Basic Genetics',
      objective: 'Review gene, allele, genotype, phenotype, and segregation.'
    },
    es: {
      title: 'Revisión de Genética Básica',
      objective: 'Revisar gen, alelo, genotipo, fenotipo y segregación.'
    }
  },
  'module-02': {
    en: {
      title: 'Modes of Gene Action',
      objective: 'Understand additive effects, dominance, and epistasis before quantitative genetics.'
    },
    es: {
      title: 'Modos de Acción Génica',
      objective: 'Entender efectos aditivos, dominancia y epistasis antes de la genética cuantitativa.'
    }
  },
  'module-03': {
    en: {
      title: 'Population Genetics I: Allele and Genotype Frequencies',
      objective: 'Calculate allele and genotype frequencies.'
    },
    es: {
      title: 'Genética de Poblaciones I: Frecuencias Alélicas y Genotípicas',
      objective: 'Calcular frecuencias alélicas y genotípicas.'
    }
  },
  'module-04': {
    en: {
      title: 'Hardy-Weinberg, Multiple Alleles, and Sex-Linked Genes',
      objective: 'Use Hardy-Weinberg as an expectation, not a dogma.'
    },
    es: {
      title: 'Hardy-Weinberg, Alelos Múltiples y Genes Ligados al Sexo',
      objective: 'Usar Hardy-Weinberg como expectativa, no como dogma.'
    }
  },
  'module-05': {
    en: {
      title: 'Forces That Change Gene Frequencies',
      objective: 'Compare selection, migration, mutation, and drift.'
    },
    es: {
      title: 'Fuerzas que Cambian las Frecuencias Génicas',
      objective: 'Comparar selección, migración, mutación y deriva.'
    }
  },
  'module-06': {
    en: {
      title: 'Values and Means: Phenotype, Genotype, and Environment',
      objective: 'Separate P, G, and E in small examples.'
    },
    es: {
      title: 'Valores y Medias: Fenotipo, Genotipo y Ambiente',
      objective: 'Separar P, G y E en ejemplos pequeños.'
    }
  },
  'module-07': {
    en: {
      title: 'Foundations of Quantitative Genetics',
      objective: 'Understand many small genes plus environment.'
    },
    es: {
      title: 'Fundamentos de Genética Cuantitativa',
      objective: 'Entender muchos genes pequeños más ambiente.'
    }
  },
  'module-08': {
    en: {
      title: 'Variance Components',
      objective: 'Understand VA, VD, VI, VE, and VP.'
    },
    es: {
      title: 'Componentes de Varianza',
      objective: 'Entender VA, VD, VI, VE y VP.'
    }
  },
  'module-09': {
    en: {
      title: 'Heritability and Repeatability',
      objective: 'Distinguish h² and repeatability.'
    },
    es: {
      title: 'Heredabilidad y Repetibilidad',
      objective: 'Distinguir h² y repetibilidad.'
    }
  },
  'module-10': {
    en: {
      title: 'Selection and Genetic Gain',
      objective: 'Calculate selection differential, response, and gain per generation.'
    },
    es: {
      title: 'Selección y Ganancia Genética',
      objective: 'Calcular diferencial de selección, respuesta y ganancia por generación.'
    }
  },
  'module-11': {
    en: {
      title: 'Genetic, Phenotypic, and Environmental Correlations',
      objective: 'Interpret rA, rP, and rE.'
    },
    es: {
      title: 'Correlaciones Genéticas, Fenotípicas y Ambientales',
      objective: 'Interpretar rA, rP y rE.'
    }
  },
  'module-12': {
    en: {
      title: 'Threshold Traits',
      objective: 'Understand the underlying scale behind categorical traits.'
    },
    es: {
      title: 'Características de Umbral',
      objective: 'Entender la escala subyacente detrás de características categóricas.'
    }
  },
  'module-13': {
    en: {
      title: 'Inbreeding and Relationship',
      objective: 'Calculate simple relationship and interpret F.'
    },
    es: {
      title: 'Endogamia y Parentesco',
      objective: 'Calcular parentesco simple e interpretar F.'
    }
  },
  'module-14': {
    en: {
      title: 'Crossbreeding, Heterosis, and Complementarity',
      objective: 'Understand heterosis and complementarity without overselling them.'
    },
    es: {
      title: 'Cruzamientos, Heterosis y Complementariedad',
      objective: 'Entender heterosis y complementariedad sin vender milagros.'
    }
  },
  'module-15': {
    en: {
      title: 'Genetic Evaluation: EBV/DEP and Animal Ranking',
      objective: 'Understand EBV, DEP, and accuracy as corrected decision signals.'
    },
    es: {
      title: 'Evaluación Genética: EBV/DEP y Ranking de Animales',
      objective: 'Entender EBV, DEP y exactitud como señales de decisión corregidas.'
    }
  },
  'module-16': {
    en: {
      title: 'Linear Models and Mixed Models',
      objective: 'Separate fixed effects, random effects, and residual.'
    },
    es: {
      title: 'Modelos Lineales y Modelos Mixtos',
      objective: 'Separar efectos fijos, aleatorios y residuo.'
    }
  },
  'module-17': {
    en: {
      title: 'BLUP and the Animal Model',
      objective: 'Understand BLUP, shrinkage, the A matrix, and the animal model.'
    },
    es: {
      title: 'BLUP y el Modelo Animal',
      objective: 'Entender BLUP, contracción, la matriz A y el modelo animal.'
    }
  },
  'module-18': {
    en: {
      title: 'Genomics, SNP Markers, and Molecular Data',
      objective: 'Understand SNPs, 0/1/2 genotypes, and allele frequency.'
    },
    es: {
      title: 'Genómica, Marcadores SNP y Datos Moleculares',
      objective: 'Entender SNP, genotipos 0/1/2 y frecuencia alélica.'
    }
  },
  'module-19': {
    en: {
      title: 'Genomic Data Quality Control',
      objective: 'Apply call rate, MAF, and HWE filters.'
    },
    es: {
      title: 'Control de Calidad de Datos Genómicos',
      objective: 'Aplicar filtros de call rate, MAF y HWE.'
    }
  },
  'module-20': {
    en: {
      title: 'Genomic Matrices, GWAS, and Genomic Prediction',
      objective: 'Distinguish the G matrix, GWAS, and genomic prediction.'
    },
    es: {
      title: 'Matrices Genómicas, GWAS y Predicción Genómica',
      objective: 'Distinguir la matriz G, GWAS y predicción genómica.'
    }
  },
  'module-21': {
    en: {
      title: 'Final Project: Full Selection Pipeline',
      objective: 'Integrate phenotype, pedigree, genomics, QC, EBV/DEP, and decision.'
    },
    es: {
      title: 'Proyecto Final: Pipeline Completo de Selección',
      objective: 'Integrar fenotipo, pedigree, genómica, QC, EBV/DEP y decisión.'
    }
  }
}

const DETAIL_COPY = {
  'pt-BR': {
    badgePrefix: 'Módulo',
    noPrerequisite: 'Sem pré-requisito',
    prerequisitePrefix: 'Pré-requisito:',
    blockEyebrow: 'Bloco',
    questionEyebrow: 'Pergunta',
    questionTitle: 'Pergunta que guia o módulo',
    objectiveEyebrow: 'Objetivo',
    objectiveTitle: 'O que este módulo precisa fechar',
    conceptEyebrow: 'Explicação',
    conceptTitle: 'Explicação central e nota técnica',
    contextEyebrow: 'Aplicação',
    contextTitle: 'Analogia, exemplo animal e cálculo manual',
    scopeEyebrow: 'Escopo',
    scopeTitle: 'Tópicos e termos-chave',
    labEyebrow: 'Laboratório',
    labTitle: 'Leitura de R e observação esperada',
    labCodeLabel: 'Trecho-base em R',
    closingEyebrow: 'Fechamento',
    closingTitle: 'Checkpoint, tarefa e evidência',
    checkpointLabel: 'Checkpoint',
    taskLabel: 'Tarefa',
    evidenceLabel: 'Evidência esperada',
    quizLabel: 'Foco do quiz',
    glossaryLabel: 'Glossário',
    topicsLabel: 'Tópicos',
    moduleMetaQuiz: 'Quiz real',
    dedicatedPage: 'Página dedicada do módulo'
  },
  en: {
    badgePrefix: 'Module',
    noPrerequisite: 'No prerequisite',
    prerequisitePrefix: 'Prerequisite:',
    blockEyebrow: 'Block',
    questionEyebrow: 'Question',
    questionTitle: 'Question that anchors this module',
    objectiveEyebrow: 'Objective',
    objectiveTitle: 'What this module needs to close clearly',
    conceptEyebrow: 'Explanation',
    conceptTitle: 'Core explanation and technical note',
    contextEyebrow: 'Applied view',
    contextTitle: 'Analogy, animal example, and manual calculation',
    scopeEyebrow: 'Scope',
    scopeTitle: 'Topics and key terms',
    labEyebrow: 'Lab',
    labTitle: 'R prompt and expected observation',
    labCodeLabel: 'Base R snippet',
    closingEyebrow: 'Completion',
    closingTitle: 'Checkpoint, task, and evidence',
    checkpointLabel: 'Checkpoint',
    taskLabel: 'Task',
    evidenceLabel: 'Expected evidence',
    quizLabel: 'Quiz focus',
    glossaryLabel: 'Glossary',
    topicsLabel: 'Topics',
    moduleMetaQuiz: 'Real quiz',
    dedicatedPage: 'Dedicated module page'
  },
  es: {
    badgePrefix: 'Módulo',
    noPrerequisite: 'Sin prerequisito',
    prerequisitePrefix: 'Prerequisito:',
    blockEyebrow: 'Bloque',
    questionEyebrow: 'Pregunta',
    questionTitle: 'Pregunta que guía este módulo',
    objectiveEyebrow: 'Objetivo',
    objectiveTitle: 'Lo que este módulo debe cerrar con claridad',
    conceptEyebrow: 'Explicación',
    conceptTitle: 'Explicación central y nota técnica',
    contextEyebrow: 'Aplicación',
    contextTitle: 'Analogía, ejemplo animal y cálculo manual',
    scopeEyebrow: 'Alcance',
    scopeTitle: 'Temas y términos clave',
    labEyebrow: 'Laboratorio',
    labTitle: 'Punto de R y observación esperada',
    labCodeLabel: 'Fragmento base en R',
    closingEyebrow: 'Cierre',
    closingTitle: 'Checkpoint, tarea y evidencia',
    checkpointLabel: 'Checkpoint',
    taskLabel: 'Tarea',
    evidenceLabel: 'Evidencia esperada',
    quizLabel: 'Foco del cuestionario',
    glossaryLabel: 'Glosario',
    topicsLabel: 'Temas',
    moduleMetaQuiz: 'Cuestionario real',
    dedicatedPage: 'Página dedicada del módulo'
  }
}

function getLocaleCopy(locale) {
  return DETAIL_COPY[locale] || DETAIL_COPY['pt-BR']
}

function getBlockLabel(blockId, locale) {
  return BLOCK_LABELS[blockId]?.[locale] || BLOCK_LABELS[blockId]?.['pt-BR'] || blockId
}

function getLocalizedText(source, locale) {
  return source?.[locale] || source?.['pt-BR'] || ''
}

function getStudyParts(locale) {
  return ['reading', 'concept', 'exercise', 'lab', 'quiz'].map((id) => ({
    id,
    label: getLocalizedText(STUDY_PART_LABELS[id], locale)
  }))
}

function getLocalizedModule(moduleRow, locale) {
  if (locale === 'pt-BR') return { title: moduleRow.title, objective: moduleRow.objective }
  const localized = MODULE_LOCALIZATION[moduleRow.id]?.[locale]
  return localized || { title: moduleRow.title, objective: moduleRow.objective }
}

function buildMeta(moduleRow, locale) {
  const copy = getLocaleCopy(locale)
  const prerequisite = moduleRow.prerequisites === 'Nenhum.'
    ? copy.noPrerequisite
    : `${copy.prerequisitePrefix} ${moduleRow.prerequisites}`
  return [moduleRow.estimatedTime, prerequisite]
}

function buildTopicsSection(moduleRow, locale) {
  const copy = getLocaleCopy(locale)
  const items = []
  if (Array.isArray(moduleRow.topics) && moduleRow.topics.length > 0) {
    items.push(`${copy.topicsLabel}: ${moduleRow.topics.join(', ')}.`)
  }
  if (Array.isArray(moduleRow.glossaryTerms) && moduleRow.glossaryTerms.length > 0) {
    items.push(`${copy.glossaryLabel}: ${moduleRow.glossaryTerms.join(', ')}.`)
  }
  return items
}

function compactParagraphs(items = []) {
  return items.flat().filter((item) => typeof item === 'string' && item.trim().length > 0)
}

function buildReviewQuizParagraphs(moduleRow, copy) {
  if (!Array.isArray(moduleRow.reviewQuiz) || moduleRow.reviewQuiz.length === 0) {
    return []
  }
  return moduleRow.reviewQuiz.map((item, index) => (
    `${copy.quizLabel} ${index + 1}: ${item.question} Resposta: ${item.answer}`
  ))
}

function buildReferenceParagraphs(moduleRow) {
  if (!Array.isArray(moduleRow.references) || moduleRow.references.length === 0) {
    return []
  }
  return moduleRow.references.map((reference) => `Referência: ${reference}`)
}

function buildSections(moduleRow, locale) {
  const copy = getLocaleCopy(locale)
  return [
    {
      eyebrow: copy.questionEyebrow,
      title: copy.questionTitle,
      paragraphs: compactParagraphs([moduleRow.feynmanQuestion, moduleRow.intro]),
      part: 'reading'
    },
    {
      eyebrow: copy.objectiveEyebrow,
      title: copy.objectiveTitle,
      paragraphs: compactParagraphs([moduleRow.objective, moduleRow.blockSummary]),
      part: 'reading'
    },
    {
      eyebrow: copy.conceptEyebrow,
      title: copy.conceptTitle,
      paragraphs: compactParagraphs([moduleRow.coreExplanation, moduleRow.formula, moduleRow.technicalNote]),
      part: 'concept',
      scientific: true
    },
    {
      eyebrow: copy.contextEyebrow,
      title: copy.contextTitle,
      paragraphs: compactParagraphs([
        moduleRow.analogy,
        moduleRow.animalExample,
        moduleRow.workedExample,
        moduleRow.visualExplanation,
        moduleRow.manualCalculation
      ]),
      part: 'exercise'
    },
    {
      eyebrow: copy.scopeEyebrow,
      title: copy.scopeTitle,
      paragraphs: buildTopicsSection(moduleRow, locale),
      part: 'concept'
    },
    {
      eyebrow: copy.labEyebrow,
      title: copy.labTitle,
      paragraphs: compactParagraphs([moduleRow.labObjective, moduleRow.labObserve, moduleRow.biologicalInterpretation]),
      code: moduleRow.rScript,
      codeLabel: copy.labCodeLabel,
      part: 'lab'
    },
    {
      eyebrow: copy.closingEyebrow,
      title: copy.closingTitle,
      paragraphs: compactParagraphs([
        `${copy.checkpointLabel}: ${moduleRow.checkpoint}`,
        `${copy.taskLabel}: ${moduleRow.task}`,
        `${copy.evidenceLabel}: ${moduleRow.completionEvidence}`,
        ...buildReviewQuizParagraphs(moduleRow, copy),
        ...buildReferenceParagraphs(moduleRow)
      ]),
      part: 'quiz'
    }
  ]
}

function formatCourseCatalog(moduleRows = [], locale = 'pt-BR') {
  return moduleRows.map((moduleRow) => {
    const localized = getLocalizedModule(moduleRow, locale)
    return {
      id: moduleRow.id,
      legacyId: moduleRow.legacyId,
      order: moduleRow.order,
      blockId: moduleRow.blockId,
      blockTitle: getBlockLabel(moduleRow.blockId, locale),
      studyBlockLabel: getLocalizedText(COURSE_LABELS.studyBlock, locale),
      title: localized.title,
      description: localized.objective,
      active: true
    }
  })
}

function formatCourseGroups(moduleRows = [], locale = 'pt-BR') {
  const catalog = formatCourseCatalog(moduleRows, locale)
  return THEME_ORDER.map((blockId, index) => {
    const courses = catalog.filter((course) => course.blockId === blockId)
    return {
      id: blockId,
      order: index + 1,
      title: getBlockLabel(blockId, locale),
      summary: getLocalizedText(THEME_SUMMARIES[blockId], locale),
      mainThemeLabel: getLocalizedText(COURSE_LABELS.mainTheme, locale),
      hierarchy: getLocalizedText(COURSE_LABELS.hierarchy, locale),
      studyParts: getStudyParts(locale),
      courses
    }
  }).filter((group) => group.courses.length > 0)
}

function formatCourseDetail(moduleRow, locale = 'pt-BR') {
  if (!moduleRow) return null
  const localized = getLocalizedModule(moduleRow, locale)
  const copy = getLocaleCopy(locale)
  return {
    id: moduleRow.id,
    title: localized.title,
    description: localized.objective,
    badge: `${copy.badgePrefix} ${String(moduleRow.order).padStart(2, '0')} · ${getBlockLabel(moduleRow.blockId, locale)}`,
    courseTitle: getLocalizedText(COURSE_LABELS.courseTitle, locale),
    blockTitle: getBlockLabel(moduleRow.blockId, locale),
    blockSummary: getLocalizedText(THEME_SUMMARIES[moduleRow.blockId], locale),
    hierarchy: getLocalizedText(COURSE_LABELS.hierarchy, locale),
    studyParts: getStudyParts(locale),
    meta: buildMeta(moduleRow, locale),
    moduleMeta: [copy.dedicatedPage, moduleRow.legacyId, copy.moduleMetaQuiz],
    sections: buildSections(moduleRow, locale),
    visualAsset: getCourseVisualAsset(moduleRow.id),
    lab: moduleRow.lab,
    labFile: moduleRow.labFile
  }
}

export { formatCourseCatalog, formatCourseDetail, formatCourseGroups, getBlockLabel, getStudyParts }
