import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const ROOT = path.resolve(new URL('..', import.meta.url).pathname)
const EXPECTED_MODULES = 21

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
}

function assertLabShape(course) {
  assert.match(course.id, /^module-\d{2}$/)
  assert.match(course.lab, /^\/labs\/M\d{2}_[A-Za-z0-9_-]+\.html$/)
  assert.match(course.labFile, /^M\d{2}_[A-Za-z0-9_-]+\.html$/)
  assert.equal(course.lab, `/labs/${course.labFile}`)
}

test('frontend curriculum maps all course-engine labs to public assets', () => {
  const payload = readJson('src/data/legacy-curriculum.generated.json')
  const modules = payload.modules.filter((course) => /^module-\d{2}$/.test(course.id))
  assert.equal(modules.length, EXPECTED_MODULES)

  for (const course of modules) {
    assertLabShape(course)
    assert.equal(fs.existsSync(path.join(ROOT, 'public/labs', course.labFile)), true, `${course.labFile} missing`)
  }
})
