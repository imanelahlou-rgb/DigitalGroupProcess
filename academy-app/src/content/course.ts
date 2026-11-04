import type { Course, Exercise, Lesson, Module } from './types'
import { modules } from './modules'
import { totalDurationMin as sessionDurationMin } from './instructor'

export const COURSE_TITLE = 'Atelier Claude : de la première instruction au workflow métier'
export const COURSE_SUBTITLE =
  'Un fil rouge unique : NOVA Conseil, cabinet fictif de Casablanca. En huit modules, vous passez de la première consigne à un système de préparation de devis fiable, testé et validé par un humain.'

export const INDEPENDENCE_NOTICE =
  'DPG Academy est indépendante d’Anthropic. Cet atelier n’est ni affilié, ni approuvé, ni certifié par Anthropic ; « Claude » est une marque d’Anthropic. Les interfaces et fonctionnalités peuvent varier : à vérifier selon compte et version.'

export const SECURITY_NOTICE =
  'Utilisez uniquement des données fictives. Ne collez aucune donnée client réelle, aucun mot de passe, aucune clé d’API. L’IA prépare, l’humain décide : rien ne part sans relecture et validation.'

export const course: Course = {
  id: 'atelier-claude',
  slug: 'claude',
  title: COURSE_TITLE,
  subtitle: COURSE_SUBTITLE,
  description:
    'Atelier pratique DPG Academy : formats de fichiers, prompts RISEN, design, projets, skills, tâches planifiées, agents et workflows, Claude Code.',
  language: 'fr',
  modules,
  totalDurationMin: sessionDurationMin,
  disclaimer: INDEPENDENCE_NOTICE,
}

export const allExercises: { module: Module; exercise: Exercise }[] = modules.flatMap((module) =>
  module.exercises.map((exercise) => ({ module, exercise })),
)

export function findExercise(exerciseId: string) {
  return allExercises.find((e) => e.exercise.id === exerciseId)
}

export function findLesson(moduleSlug: string, lessonId: string): { module: Module; lesson: Lesson; index: number } | undefined {
  const module = modules.find((m) => m.slug === moduleSlug)
  if (!module) return undefined
  const index = module.lessons.findIndex((l) => l.id === lessonId)
  if (index < 0) return undefined
  return { module, lesson: module.lessons[index], index }
}

export function moduleNumber(module: Module): number {
  return modules.findIndex((m) => m.id === module.id) + 1
}

/** Titre sans le préfixe « Module N — ». */
export function shortTitle(module: Module): string {
  return module.title.replace(/^Module\s+\d+\s*[—–-]\s*/i, '')
}

export const courseStats = {
  modules: modules.length,
  lessons: modules.reduce((s, m) => s + m.lessons.length, 0),
  exercises: modules.reduce((s, m) => s + m.exercises.length, 0),
  quizQuestions: modules.reduce((s, m) => s + m.quiz.length, 0),
  demos: modules.length,
  missions: modules.length,
  modulesDurationMin: modules.reduce((s, m) => s + m.durationMin, 0),
  sessionDurationMin,
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}
