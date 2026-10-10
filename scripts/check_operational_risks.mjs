#!/usr/bin/env node

import fs from 'node:fs'

function read(path) {
  return fs.readFileSync(path, 'utf8')
}

function readOptional(path) {
  return fs.existsSync(path) ? read(path) : null
}

function pass(label) {
  console.log(`OK ${label}`)
}

function fail(label) {
  throw new Error(label)
}

function assertIncludes(source, expected, label) {
  if (!source.includes(expected)) fail(`${label} missing: ${expected}`)
  pass(label)
}

function assertNotIncludes(source, forbidden, label) {
  if (source.includes(forbidden)) fail(`${label} still contains stale text: ${forbidden}`)
  pass(label)
}

function assertMatchesPattern(source, pattern, label) {
  if (!pattern.test(source)) fail(`${label} does not match pattern: ${pattern}`)
  pass(label)
}

const gitignore = read('.gitignore')
const projectStatus = readOptional('project_status.md')
const nextSite = readOptional('NEXT_SITE.md')
const deploymentPlan = readOptional('DEPLOYMENT_PLAN.md')
const workflow = read('.github/workflows/pages-frontend.yml')
const functionsConfig = JSON.parse(read('appwrite/functions.json'))

assertIncludes(gitignore, '/mgenetica-course-visual-artifacts-*/', 'raw visual artifacts ignored')

if (projectStatus) {
  assertMatchesPattern(projectStatus, /Version: 1\.\d+\.\d+ \| Date: 2026-06-\d{2}/, 'project status current date')
  assertMatchesPattern(projectStatus, /\*\*Current Phase:\*\*/, 'project current phase')
  assertNotIncludes(projectStatus, 'Delivery is planned for completion by Friday, 2026-06-05', 'project status stale delivery plan')
} else {
  pass('project status absent in CI checkout')
}

if (nextSite) {
  assertMatchesPattern(nextSite, /## Status \(\d{4}-\d{2}-\d{2}\)/, 'next site current date')
  assertIncludes(nextSite, '`public-course-verification`', 'next block type')
  assertNotIncludes(nextSite, '## Status (2026-06-01)', 'next site stale status date')
} else {
  pass('next site absent in CI checkout')
}

if (deploymentPlan) {
  assertIncludes(deploymentPlan, 'External production risk register', 'deployment risk register')
  assertIncludes(deploymentPlan, 'Browser QA command', 'deployment browser QA command')
} else {
  pass('deployment plan absent in CI checkout')
}

for (const step of [
  'Smoke deployed frontend',
  'Smoke learner routes',
  'Smoke Appwrite runtime',
  'Audit Appwrite backend',
  'Smoke real Appwrite login'
]) {
  assertIncludes(workflow, `name: ${step}`, `workflow step ${step}`)
}

const functionIds = functionsConfig.map((entry) => entry.$id)
const uniqueFunctionIds = new Set(functionIds)
if (functionIds.length !== uniqueFunctionIds.size) fail('appwrite/functions.json has duplicate function ids')
pass('appwrite function ids unique')

const adminFunction = functionsConfig.find((entry) => entry.$id === 'mgenetica_admin_fn')
if (!adminFunction) fail('admin function missing')
if (!Array.isArray(adminFunction.execute) || !adminFunction.execute.includes('users')) {
  fail('admin function execute policy must include users')
}
pass('admin function execute policy')

assertIncludes(read('scripts/playwright_learner_visual_qa.cjs'), 'mgenetica-course-assets', 'playwright qa script marker')

console.log('Operational risk check OK')
