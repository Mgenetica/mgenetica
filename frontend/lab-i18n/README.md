# Public course translations

Portuguese curriculum and scientific datasets remain authoritative and unchanged.
English and Spanish content is stored separately from generated legacy curriculum.
The public site uses checked-in JSON and self-contained laboratory dictionaries;
there are no translation requests, new services or runtime Python dependencies.

## Files

- `source-plan.json`: original text, lab edit positions, source and dataset checksums.
- `translations.json`: editable full-text English and Spanish translations.
- `overrides.json`: curated genetics terminology and small UI translations; overrides generation.
- `generation-manifest.json`: model identity and source checksum.
- `build-manifest.json`: compiled lab checksums and coverage.
- `src/data/courseTranslations/{en,es}.json`: compiled curriculum overlays.

Only displayed prose and supporting glossary/quiz text are translated. Bibliographic
citations, provenance, specimen identifiers, R code, formulas and datasets retain
original identity. The unused `fullText` archival field is preserved in Portuguese;
the public page renders the translated structured sections instead.

## Rebuild after editorial corrections

Edit `translations.json` or `overrides.json`, then from repository root:

```sh
python3 scripts/i18n/build_translations.py
npm --prefix frontend test
npm --prefix frontend run build
```

The lab compiler verifies original source checksums before applying translations.
Repeat compilation reads originals from Git commit
`7ae53fbe1b0af7982b792fa7733097fce633b3d4`. It refuses changed sources rather than
silently applying stale edit positions. To change a lab's calculations or structure,
first create a fresh inventory of the new untranslated source.

## Offline initial generation

Optional tools: CTranslate2 and SentencePiece, installed outside the website.
Models: `ilsp/opus-mt-pt-en_ct2_ft-SciLake` (source/target SentencePiece) and
`etenszyn/argos-opus-mt-en-es-ct2` (shared SentencePiece). Spanish is generated
through English. Model output needs terminology/editorial review before publishing. Curated headings, controls, metadata and scientific explanations are stored in `overrides.json`.

```sh
python3 scripts/i18n/translate_local.py --pt-en /path/to/pt-en-model --en-es /path/to/en-es-model
python3 scripts/i18n/repair_markup.py --pt-en /path/to/pt-en-model --en-es /path/to/en-es-model
python3 scripts/i18n/review_translations.py
python3 scripts/i18n/build_translations.py
```

The initial inventory uses Acorn outside the frontend runtime:

```sh
ACORN_PATH=/path/to/acorn node scripts/i18n/extract_lab_strings.mjs
python3 scripts/i18n/prepare_sources.py
```

## Browser verification

Start frontend dev server on port 4177, then:

```sh
PLAYWRIGHT_PATH=/path/to/playwright node scripts/i18n/verify_local.mjs
```

The report is written to `/tmp/mgenetica-i18n-browser-report.json`. It checks all
63 module/language combinations, mobile overflow, public access, iframe identity,
unchanged controls/results, live sliders, Punnett proportions, SNP cells and
preservation of the stochastic drift trajectory on a language switch.

No commit, push, publication or merge is performed by these scripts.
