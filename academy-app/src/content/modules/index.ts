import type { Module } from '../types'
import { module1 } from './module1'
import { module2 } from './module2'
import { module3 } from './module3'
import { module4 } from './module4'
import { module5 } from './module5'
import { module6 } from './module6'
import { module7 } from './module7'
import { module8 } from './module8'

export { module1, module2, module3, module4, module5, module6, module7, module8 }

/** Les 8 modules de l'Atelier Claude, dans l'ordre pédagogique. */
export const modules: Module[] = [
  module1,
  module2,
  module3,
  module4,
  module5,
  module6,
  module7,
  module8,
]

export function getModuleBySlug(slug: string): Module | undefined {
  return modules.find((m) => m.slug === slug)
}

export function getModuleById(id: Module['id']): Module | undefined {
  return modules.find((m) => m.id === id)
}
