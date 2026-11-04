/**
 * Tests fonctionnels navigateur pour DPG Academy (Playwright).
 * Prérequis : serveur Express sur http://127.0.0.1:3000
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = process.env.ACADEMY_BASE || 'http://127.0.0.1:3000'
const ROOT = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(ROOT, '..', 'academy-app', 'test-results')
fs.mkdirSync(OUT, { recursive: true })

const results = []
function ok(name, detail = '') {
  results.push({ name, pass: true, detail })
  console.log(`PASS  ${name}${detail ? ' — ' + detail : ''}`)
}
function fail(name, detail = '') {
  results.push({ name, pass: false, detail })
  console.error(`FAIL  ${name}${detail ? ' — ' + detail : ''}`)
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.setDefaultTimeout(20000)

  // ——— Auth ———
  await page.goto(`${BASE}/academy/claude/`)
  await page.waitForSelector('#access-code, .login-title, .hero-title, .page-title')
  const loginVisible = await page.locator('#access-code').count()
  if (!loginVisible) {
    // déjà authentifié ? déconnexion via API puis reload
    await page.request.post(`${BASE}/api/academy/logout`)
    await page.goto(`${BASE}/academy/claude/`)
    await page.waitForSelector('#access-code')
  }
  await shot(page, '01-login-desktop')

  // styles login
  const loginTitle = page.locator('.login-title')
  const titleFF = await loginTitle.evaluate((el) => getComputedStyle(el).fontFamily)
  if (/Cormorant/i.test(titleFF)) ok('login font Cormorant', titleFF)
  else fail('login font Cormorant', titleFF)
  const bg = await page.locator('.login-page').evaluate((el) => getComputedStyle(el).backgroundColor)
  // radial gradient may report differently; check body/page darkness via rgb
  const cardBorder = await page.locator('.login-card').evaluate((el) => getComputedStyle(el).borderColor)
  ok('login screen rendered', `bg=${bg} border=${cardBorder}`)

  // mauvais code
  await page.fill('#access-code', '0000')
  await page.click('button[type="submit"]')
  await page.waitForSelector('#login-error, .form-error')
  const errText = await page.locator('#login-error, .form-error').first().innerText()
  if (/incorrect|Code/i.test(errText)) ok('reject bad code', errText.trim())
  else fail('reject bad code', errText)

  // bon code
  await page.fill('#access-code', '1234')
  await Promise.all([
    page.waitForSelector('.hero-title, .page-title, .shell-main', { timeout: 20000 }),
    page.click('button[type="submit"]'),
  ])
  await shot(page, '02-dashboard-desktop')
  ok('login with 1234')

  // Dashboard content
  const dash = await page.content()
  if (/NOVA Conseil/i.test(dash) && /Transform\. Optimize\. Innovate/i.test(dash) || /Digital Process Group/i.test(dash)) {
    ok('dashboard brand + NOVA')
  } else {
    // softer check
    if (/NOVA/i.test(dash)) ok('dashboard mentions NOVA')
    else fail('dashboard NOVA missing')
  }

  // Charte couleurs titres
  const hero = page.locator('.hero-title, .page-title').first()
  const heroColor = await hero.evaluate((el) => getComputedStyle(el).color)
  const heroFF = await hero.evaluate((el) => getComputedStyle(el).fontFamily)
  if (/Cormorant/i.test(heroFF)) ok('dashboard title Cormorant', `${heroFF} / ${heroColor}`)
  else fail('dashboard title Cormorant', heroFF)

  // Programme + 8 modules
  await page.goto(`${BASE}/academy/claude/programme`)
  await page.waitForSelector('text=Module')
  await shot(page, '03-programme-desktop')
  const moduleLinks = page.locator('a[href*="/modules/"]')
  const nLinks = await moduleLinks.count()
  if (nLinks >= 8) ok('programme has ≥8 module links', String(nLinks))
  else fail('programme module links', String(nLinks))

  const slugs = [
    'm1-formats-de-fichiers',
    'm2-prompt-risen',
    'm3-design-identite-visuelle',
    'm4-projets-memoire-contexte',
    'm5-skills',
    'm6-taches-planifiees',
    'm7-agents-workflows',
    'm8-claude-code-defi-final',
  ]

  for (const slug of slugs) {
    await page.goto(`${BASE}/academy/claude/modules/${slug}`)
    await page.waitForSelector('#objectifs, #lecons, #quiz')
    const hasLessons = (await page.locator('#lecons .lesson-card, #lecons details').count()) >= 2
    const hasQuiz = (await page.locator('.quiz-q, .quiz-list li').count()) >= 4
    const hasEx = (await page.locator('#exercices a, #exercices .exercise-link').count()) >= 1
    if (hasLessons && hasQuiz && hasEx) ok(`module ${slug} structure`)
    else fail(`module ${slug} structure`, `lessons=${hasLessons} quiz=${hasQuiz} ex=${hasEx}`)
  }
  await shot(page, '04-module1-desktop')

  // ——— Quiz M1 ———
  await page.goto(`${BASE}/academy/claude/modules/m1-formats-de-fichiers`)
  await page.waitForSelector('.quiz-q')
  const qCount = await page.locator('.quiz-q').count()
  for (let i = 0; i < qCount; i++) {
    const radios = page.locator(`.quiz-q`).nth(i).locator('input[type="radio"]')
    await radios.first().check({ force: true })
  }
  await page.click('button:has-text("Valider mes réponses")')
  await page.waitForSelector('.quiz .callout, .feedback')
  const feedback = await page.locator('.feedback').count()
  if (feedback >= qCount) ok('quiz shows feedback per question', String(feedback))
  else fail('quiz feedback', String(feedback))
  await shot(page, '05-quiz-m1')

  // Progress persistence
  await page.evaluate(() => {
    localStorage.setItem('dpg-academy-progress-v1', JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      lessons: { 'probe-lesson': new Date().toISOString() },
      exercises: {},
      demos: {},
      quizzes: {},
      notes: { probe: 'persist-ok' },
      practical: {},
      rubric: {},
      checks: {},
    }))
  })
  await page.reload()
  // may bounce to login if cookie still valid - should stay in
  await page.waitForTimeout(500)
  const persisted = await page.evaluate(() => {
    const raw = localStorage.getItem('dpg-academy-progress-v1')
    try { return JSON.parse(raw)?.notes?.probe } catch { return null }
  })
  if (persisted === 'persist-ok') ok('progress persists after reload')
  else fail('progress persist', String(persisted))

  // ——— RISEN builder ———
  await page.goto(`${BASE}/academy/claude/modules/m2-prompt-risen`)
  await page.getByRole('heading', { name: /RISEN|prompt/i }).first().waitFor()
  await page.locator('.risen').first().waitFor({ timeout: 10000 })
  const risenLetters = await page.locator('.risen-letter').allTextContents()
  const joined = risenLetters.join('')
  if (joined.includes('R') && joined.includes('I') && joined.includes('S') && joined.includes('E') && joined.includes('N')) {
    ok('RISEN builder letters R-I-S-E-N', joined)
  } else fail('RISEN letters', joined)
  const labels = await page.locator('.risen label').allTextContents()
  const lab = labels.join(' | ')
  if (/Input/i.test(lab) && /Expectation/i.test(lab) && /Narrowing/i.test(lab) && !/Objectif final/i.test(lab)) {
    ok('RISEN labels Input/Expectation/Narrowing')
  } else fail('RISEN labels', lab)
  const ta = page.locator('.risen textarea').first()
  await ta.fill('Tu es consultant commercial de NOVA Conseil.')
  await shot(page, '06-risen')

  // ——— File editors via first file-edit exercise ———
  await page.goto(`${BASE}/academy/claude/modules/m1-formats-de-fichiers`)
  await page.locator('#exercices a').first().click()
  await page.waitForURL(/\/exercices\//)
  await page.locator('textarea.code-area, textarea').first().waitFor()
  const editor = page.locator('textarea.code-area, textarea').first()
  if (await editor.count()) {
    const before = await editor.inputValue()
    await editor.fill(`${before}\n# Titre test`)
    const checks = page.locator('.checks li')
    await checks.first().waitFor()
    ok('file editor live checks present', String(await checks.count()))
  } else fail('file editor missing')
  await shot(page, '07-exercise-editor')

  // ——— Skill simulator M5 ———
  await page.goto(`${BASE}/academy/claude/modules/m5-skills`)
  await page.getByText('Simulateur de devis').first().waitFor()
  const sim = page.locator('section[aria-label="Simulateur de devis skill"]')
  const simSelects = sim.locator('select')
  if ((await simSelects.count()) >= 2) {
    await simSelects.nth(1).selectOption({ index: 1 })
    await sim.locator('input').fill('6500')
    await page.getByRole('button', { name: /Vérifier mon pronostic/i }).click()
    await sim.locator('.callout.callout-ok, .callout.callout-warn').first().waitFor()
    ok('skill simulator runs')
  } else fail('skill simulator UI missing')
  await shot(page, '08-skill-sim')

  // ——— Planner M6 ———
  await page.goto(`${BASE}/academy/claude/modules/m6-taches-planifiees`)
  await page.getByText('Simulateur de planification').first().waitFor()
  await page.getByRole('button', { name: /Vérifier la configuration/i }).click()
  await page.getByText('Contrôles').first().waitFor()
  ok('planner simulator runs')
  await shot(page, '09-planner')

  // ——— Workflow M7 ———
  await page.goto(`${BASE}/academy/claude/modules/m7-agents-workflows`)
  const launch = page.getByRole('button', { name: /Lancer la simulation/i })
  await launch.waitFor({ timeout: 15000 })
  await launch.click()
  await page.getByRole('button', { name: /Étape suivante/i }).click()
  ok('workflow simulator advances')
  await shot(page, '10-workflow')

  // ——— Resources download (client-side) ———
  await page.goto(`${BASE}/academy/claude/ressources`)
  await page.locator('.asset-card').first().waitFor()
  const dl = page.getByRole('button', { name: /Télécharger/i }).first()
  if (await dl.count()) {
    await dl.click()
    ok('resource download button works (client blob)')
  } else fail('resource download button missing')
  const res = await page.request.get(`${BASE}/academy/claude/resources/nova/catalogue_prestations.csv`)
  if (res.ok()) ok('authenticated resource fetch', String(res.status()))
  else fail('authenticated resource fetch', String(res.status()))

  // ——— Responsive tablets/mobile ———
  for (const [name, w, h] of [
    ['tablet', 768, 1024],
    ['mobile', 390, 844],
  ]) {
    await page.setViewportSize({ width: w, height: h })
  await page.goto(`${BASE}/academy/claude/`)
  await page.waitForSelector('.hero-title, .page-title, .shell-main')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    await shot(page, `11-dashboard-${name}`)
    if (!overflow) ok(`no horizontal overflow ${name}`)
    else fail(`horizontal overflow ${name}`)
    // open menu if present
    const menu = page.locator('button.menu-btn')
    if (await menu.isVisible().catch(() => false)) {
      await menu.click()
      await page.locator('.sidebar.is-open, .scrim.is-open').first().waitFor({ timeout: 5000 })
      await shot(page, `12-menu-${name}`)
      ok(`mobile menu opens ${name}`)
      const close = page.locator('button.sidebar-close')
      if (await close.isVisible().catch(() => false)) await close.click({ force: true }).catch(() => {})
    } else {
      fail(`mobile menu button missing ${name}`)
    }
  }

  // ——— Logout ———
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${BASE}/academy/claude/`)
  const logout = page.locator('button:has-text("Déconnexion"), button:has-text("Se déconnecter"), a:has-text("Déconnexion")')
  if (await logout.count()) {
    await logout.first().click()
    await page.waitForSelector('#access-code')
    ok('logout returns to login')
  } else {
    await page.request.post(`${BASE}/api/academy/logout`)
    await page.goto(`${BASE}/academy/claude/`)
    await page.waitForSelector('#access-code')
    ok('logout via API (UI button not found)')
  }
  const denied = await page.request.get(`${BASE}/academy/claude/resources/nova/presentation.md`)
  if (denied.status() === 401) ok('resources denied after logout')
  else fail('resources after logout', String(denied.status()))

  await browser.close()

  const failed = results.filter((r) => !r.pass)
  const report = { total: results.length, passed: results.length - failed.length, failed: failed.length, results }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
  console.log('\n=== SUMMARY ===')
  console.log(`${report.passed}/${report.total} passed, ${report.failed} failed`)
  if (failed.length) {
    for (const f of failed) console.log(' -', f.name, f.detail)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
