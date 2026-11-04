import { useSyncExternalStore } from 'react'
import type { Module, ProgressStatus } from '../content/types'

/**
 * Progression locale (localStorage), schéma versionné `dpg-academy-progress-v1`.
 * Aucune donnée n'est envoyée au serveur.
 */

export const STORAGE_KEY = 'dpg-academy-progress-v1'
export const SCHEMA_VERSION = 1 as const

export interface QuizAttemptRecord {
  at: string
  score: number
  total: number
  percent: number
  passed: boolean
}

export interface PracticalRecord {
  submittedAt: string
  note: string
}

export interface ProgressState {
  version: typeof SCHEMA_VERSION
  updatedAt: string
  /** leçon → date de complétion */
  lessons: Record<string, string>
  /** exercice → date de complétion */
  exercises: Record<string, string>
  /** module → date de consultation de la démo */
  demos: Record<string, string>
  /** module → tentatives de quiz */
  quizzes: Record<string, QuizAttemptRecord[]>
  /** notes libres et brouillons d'exercices (clé libre) */
  notes: Record<string, string>
  /** module → mission pratique rendue */
  practical: Record<string, PracticalRecord>
  /** module → critère → points d'auto-évaluation */
  rubric: Record<string, Record<string, number>>
  /** cases à cocher diverses (audit, défi final…) */
  checks: Record<string, boolean>
}

function emptyState(): ProgressState {
  return {
    version: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    lessons: {},
    exercises: {},
    demos: {},
    quizzes: {},
    notes: {},
    practical: {},
    rubric: {},
    checks: {},
  }
}

/* ------------------------------ sanitisation ------------------------------ */

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v)
}

function stringMap(v: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (isRecord(v)) for (const [k, val] of Object.entries(v)) if (typeof val === 'string') out[k] = val
  return out
}

export function sanitize(raw: unknown): ProgressState | null {
  if (!isRecord(raw) || raw.version !== SCHEMA_VERSION) return null
  const s = emptyState()
  s.updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : s.updatedAt
  s.lessons = stringMap(raw.lessons)
  s.exercises = stringMap(raw.exercises)
  s.demos = stringMap(raw.demos)
  s.notes = stringMap(raw.notes)
  if (isRecord(raw.quizzes)) {
    for (const [k, list] of Object.entries(raw.quizzes)) {
      if (!Array.isArray(list)) continue
      s.quizzes[k] = list
        .filter(isRecord)
        .map((a) => ({
          at: typeof a.at === 'string' ? a.at : s.updatedAt,
          score: Number(a.score) || 0,
          total: Number(a.total) || 0,
          percent: Number(a.percent) || 0,
          passed: a.passed === true,
        }))
    }
  }
  if (isRecord(raw.practical)) {
    for (const [k, p] of Object.entries(raw.practical)) {
      if (isRecord(p)) s.practical[k] = { submittedAt: typeof p.submittedAt === 'string' ? p.submittedAt : s.updatedAt, note: typeof p.note === 'string' ? p.note : '' }
    }
  }
  if (isRecord(raw.rubric)) {
    for (const [k, crit] of Object.entries(raw.rubric)) {
      if (!isRecord(crit)) continue
      s.rubric[k] = {}
      for (const [c, pts] of Object.entries(crit)) if (typeof pts === 'number' && Number.isFinite(pts)) s.rubric[k][c] = pts
    }
  }
  if (isRecord(raw.checks)) for (const [k, v] of Object.entries(raw.checks)) if (typeof v === 'boolean') s.checks[k] = v
  return s
}

/* ------------------------------ store ------------------------------ */

function load(): ProgressState {
  try {
    const txt = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (!txt) return emptyState()
    return sanitize(JSON.parse(txt)) ?? emptyState()
  } catch {
    return emptyState()
  }
}

let state: ProgressState = load()
const listeners = new Set<() => void>()

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* stockage plein ou indisponible : la progression reste en mémoire pour la session */
  }
}

function commit(next: ProgressState): void {
  state = { ...next, updatedAt: new Date().toISOString() }
  persist()
  listeners.forEach((l) => l())
}

function mutate(fn: (draft: ProgressState) => void): void {
  const draft = structuredClone(state)
  fn(draft)
  commit(draft)
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getProgress(): ProgressState {
  return state
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      state = load()
      listeners.forEach((l) => l())
    }
  })
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getProgress, getProgress)
}

/* ------------------------------ actions ------------------------------ */

export function setLessonDone(lessonId: string, done: boolean): void {
  mutate((d) => {
    if (done) d.lessons[lessonId] = new Date().toISOString()
    else delete d.lessons[lessonId]
  })
}

export function setExerciseDone(exerciseId: string, done: boolean): void {
  if (done === Boolean(state.exercises[exerciseId])) return
  mutate((d) => {
    if (done) d.exercises[exerciseId] = new Date().toISOString()
    else delete d.exercises[exerciseId]
  })
}

export function markDemoViewed(moduleId: string, viewed = true): void {
  mutate((d) => {
    if (viewed) d.demos[moduleId] = new Date().toISOString()
    else delete d.demos[moduleId]
  })
}

export function recordQuizAttempt(moduleId: string, attempt: Omit<QuizAttemptRecord, 'at'>): void {
  mutate((d) => {
    const list = d.quizzes[moduleId] ?? []
    d.quizzes[moduleId] = [...list, { ...attempt, at: new Date().toISOString() }].slice(-20)
  })
}

export function setNote(key: string, text: string): void {
  if ((state.notes[key] ?? '') === text) return
  mutate((d) => {
    if (text === '') delete d.notes[key]
    else d.notes[key] = text
  })
}

export function submitPractical(moduleId: string, note: string): void {
  mutate((d) => {
    d.practical[moduleId] = { submittedAt: new Date().toISOString(), note }
  })
}

export function withdrawPractical(moduleId: string): void {
  mutate((d) => {
    delete d.practical[moduleId]
  })
}

export function setRubricScore(moduleId: string, criterionId: string, points: number): void {
  mutate((d) => {
    d.rubric[moduleId] = { ...(d.rubric[moduleId] ?? {}), [criterionId]: points }
  })
}

export function clearRubric(moduleId: string): void {
  mutate((d) => {
    delete d.rubric[moduleId]
  })
}

export function setCheck(key: string, value: boolean): void {
  mutate((d) => {
    if (value) d.checks[key] = true
    else delete d.checks[key]
  })
}

/* ------------------------------ import / export / reset ------------------------------ */

export function exportProgress(): string {
  return JSON.stringify(state, null, 2)
}

export function importProgress(json: string): { ok: true } | { ok: false; error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { ok: false, error: 'Fichier illisible : le JSON est invalide.' }
  }
  const next = sanitize(parsed)
  if (!next) return { ok: false, error: `Schéma non reconnu : version ${SCHEMA_VERSION} attendue.` }
  commit(next)
  return { ok: true }
}

/** Réinitialise après confirmation de l'utilisateur. Retourne true si effectué. */
export function resetProgress(): boolean {
  const ok = window.confirm(
    'Réinitialiser toute la progression de cet appareil ? Leçons, exercices, quiz, notes et missions seront effacés. Cette action est irréversible (pensez à exporter avant).',
  )
  if (!ok) return false
  commit(emptyState())
  return true
}

/* ------------------------------ sélecteurs ------------------------------ */

export interface ModuleProgress {
  lessonsDone: number
  lessonsTotal: number
  exercisesDone: number
  exercisesTotal: number
  demoViewed: boolean
  quizPassed: boolean
  bestQuizPercent: number | null
  quizAttempts: number
  practicalSubmitted: boolean
  done: number
  total: number
  percent: number
  status: ProgressStatus
}

export function moduleProgress(module: Module, s: ProgressState): ModuleProgress {
  const lessonsDone = module.lessons.filter((l) => s.lessons[l.id]).length
  const exercisesDone = module.exercises.filter((e) => s.exercises[e.id]).length
  const attempts = s.quizzes[module.id] ?? []
  const quizPassed = attempts.some((a) => a.passed)
  const best = attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null
  const demoViewed = Boolean(s.demos[module.id])
  const practicalSubmitted = Boolean(s.practical[module.id])
  const total = module.lessons.length + module.exercises.length + 3
  const done = lessonsDone + exercisesDone + (demoViewed ? 1 : 0) + (quizPassed ? 1 : 0) + (practicalSubmitted ? 1 : 0)
  const percent = Math.round((done / total) * 100)
  const status: ProgressStatus = done === 0 ? 'not-started' : done >= total ? 'completed' : 'in-progress'
  return {
    lessonsDone,
    lessonsTotal: module.lessons.length,
    exercisesDone,
    exercisesTotal: module.exercises.length,
    demoViewed,
    quizPassed,
    bestQuizPercent: best,
    quizAttempts: attempts.length,
    practicalSubmitted,
    done,
    total,
    percent,
    status,
  }
}

export function globalProgress(modules: Module[], s: ProgressState) {
  const per = modules.map((m) => moduleProgress(m, s))
  const done = per.reduce((a, p) => a + p.done, 0)
  const total = per.reduce((a, p) => a + p.total, 0)
  return {
    per,
    done,
    total,
    percent: total ? Math.round((done / total) * 100) : 0,
    modulesCompleted: per.filter((p) => p.status === 'completed').length,
    lessonsDone: per.reduce((a, p) => a + p.lessonsDone, 0),
    exercisesDone: per.reduce((a, p) => a + p.exercisesDone, 0),
    quizzesPassed: per.filter((p) => p.quizPassed).length,
  }
}

export const STATUS_LABEL: Record<ProgressStatus, string> = {
  'not-started': 'À démarrer',
  'in-progress': 'En cours',
  completed: 'Terminé',
}

/* ------------------------------ mode formateur (local) ------------------------------ */

const INSTRUCTOR_KEY = 'dpg-academy-instructor-mode'
let instructor = (() => {
  try {
    return localStorage.getItem(INSTRUCTOR_KEY) === '1'
  } catch {
    return false
  }
})()
const instructorListeners = new Set<() => void>()

export function setInstructorMode(on: boolean): void {
  instructor = on
  try {
    localStorage.setItem(INSTRUCTOR_KEY, on ? '1' : '0')
  } catch {
    /* ignoré */
  }
  instructorListeners.forEach((l) => l())
}

export function useInstructorMode(): boolean {
  return useSyncExternalStore(
    (l) => {
      instructorListeners.add(l)
      return () => instructorListeners.delete(l)
    },
    () => instructor,
    () => instructor,
  )
}
