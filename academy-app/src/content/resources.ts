import type { Asset, ModuleId } from './types'
import { modules } from './modules'
import {
  CLAUDE_MD_NOVA,
  CLIENT_ATLAS,
  CLIENT_OCEAN,
  CLIENT_RIF,
  DEMANDE_CONTRADICTOIRE,
  DEMANDE_INCOMPLETE,
  NOVA_CATALOGUE_CSV,
  NOVA_DISCLAIMER,
  NOVA_PRESENTATION_MD,
  NOVA_SERVICES_CSV,
  NOVA_SERVICES_JSON,
  PROJECT_INSTRUCTIONS,
  REGISTRE_DEMANDES_CSV,
  SKILL_PREPARER_DEVIS,
} from './nova'

export interface ResourceItem extends Asset {
  moduleId?: ModuleId
  /** Origine lisible (ex. « Module 5 · Exercice ») */
  origin: string
}

/** Chemin public (relatif à la base) des fichiers publiés. */
export const RESOURCE_DIR = 'resources/nova/'

/** Agrège tous les assets du contenu + les exports NOVA, dédoublonnés par nom de fichier. */
export function collectResources(): ResourceItem[] {
  const out: ResourceItem[] = [
    {
      id: 'presentation-md',
      filename: 'presentation.md',
      kind: 'file',
      mimeType: 'text/markdown',
      description: 'Présentation du cabinet fictif NOVA Conseil.',
      content: NOVA_PRESENTATION_MD,
      origin: 'Données NOVA',
    },
    {
      id: 'catalogue-csv',
      filename: 'catalogue_prestations.csv',
      kind: 'file',
      mimeType: 'text/csv',
      description: 'Catalogue source de vérité des prestations (prix HT MAD).',
      content: NOVA_CATALOGUE_CSV,
      origin: 'Données NOVA',
    },
    {
      id: 'nova-services-csv',
      filename: 'nova_services.csv',
      kind: 'file',
      mimeType: 'text/csv',
      description: 'Alias du catalogue prestations (CSV).',
      content: NOVA_SERVICES_CSV,
      origin: 'Données NOVA',
    },
    {
      id: 'nova-services-json',
      filename: 'nova_services.json',
      kind: 'file',
      mimeType: 'application/json',
      description: 'Grille tarifaire NOVA Conseil au format JSON.',
      content: NOVA_SERVICES_JSON,
      origin: 'Données NOVA',
    },
    {
      id: 'client-atlas',
      filename: 'client_atlas.json',
      kind: 'file',
      mimeType: 'application/json',
      description: 'Fiche prospect Atlas Distribution (données fictives).',
      content: `${JSON.stringify(CLIENT_ATLAS, null, 2)}\n`,
      origin: 'Données NOVA',
    },
    {
      id: 'client-rif',
      filename: 'client_rif.json',
      kind: 'file',
      mimeType: 'application/json',
      description: 'Fiche prospect Rif Atelier — budget inférieur au tarif N03.',
      content: `${JSON.stringify(CLIENT_RIF, null, 2)}\n`,
      origin: 'Données NOVA',
    },
    {
      id: 'client-ocean',
      filename: 'client_ocean.json',
      kind: 'file',
      mimeType: 'application/json',
      description: 'Fiche prospect Océan Services — N01+N04 = 10000 MAD HT, budget 11000 MAD HT.',
      content: `${JSON.stringify(CLIENT_OCEAN, null, 2)}\n`,
      origin: 'Données NOVA',
    },
    {
      id: 'demande-incomplete',
      filename: 'demande_incomplete.txt',
      kind: 'file',
      mimeType: 'text/plain',
      description: 'Demande volontairement incomplète (ne pas inventer identité/prix).',
      content: `${DEMANDE_INCOMPLETE}\n`,
      origin: 'Données NOVA',
    },
    {
      id: 'demande-contradictoire',
      filename: 'demande_contradictoire.txt',
      kind: 'file',
      mimeType: 'text/plain',
      description: 'Demande contradictoire (N02 promis à 4000 alors que catalogue = 6500).',
      content: `${DEMANDE_CONTRADICTOIRE}\n`,
      origin: 'Données NOVA',
    },
    {
      id: 'registre-demandes',
      filename: 'registre_demandes.csv',
      kind: 'file',
      mimeType: 'text/csv',
      description: 'Registre de cinq demandes pour le reporting hebdomadaire.',
      content: REGISTRE_DEMANDES_CSV,
      origin: 'Données NOVA',
    },
    {
      id: 'instructions-projet',
      filename: 'instructions_projet_nova.txt',
      kind: 'file',
      mimeType: 'text/plain',
      description: 'Instructions de projet Claude pour NOVA Conseil.',
      content: PROJECT_INSTRUCTIONS,
      origin: 'Modèles',
    },
    {
      id: 'skill-devis',
      filename: 'SKILL.md',
      kind: 'file',
      mimeType: 'text/markdown',
      description: 'Skill preparer-devis-nova (SKILL.md).',
      content: SKILL_PREPARER_DEVIS,
      origin: 'Modèles',
    },
    {
      id: 'claude-md',
      filename: 'CLAUDE.md',
      kind: 'file',
      mimeType: 'text/markdown',
      description: 'Exemple de CLAUDE.md pour un prototype NOVA.',
      content: CLAUDE_MD_NOVA,
      origin: 'Modèles',
    },
    {
      id: 'disclaimer',
      filename: 'AVERTISSEMENT.txt',
      kind: 'file',
      mimeType: 'text/plain',
      description: 'Mention légale pédagogique.',
      content: `${NOVA_DISCLAIMER}\nDonnées fictives ; vérifiez les résultats de l'IA ; approbation humaine pour les opérations engageantes.\n`,
      origin: 'Sécurité',
    },
  ]
  const seen = new Set(out.map((r) => r.filename))
  const push = (a: Asset, moduleId: ModuleId, origin: string) => {
    if (seen.has(a.filename)) return
    seen.add(a.filename)
    out.push({ ...a, moduleId, origin })
  }
  modules.forEach((m, i) => {
    const n = i + 1
    m.assets?.forEach((a) => push(a, m.id, `Module ${n}`))
    m.exercises.forEach((e) => e.assets?.forEach((a) => push(a, m.id, `Module ${n} · Exercice`)))
    m.practicalMission.assets?.forEach((a) => push(a, m.id, `Module ${n} · Mission`))
  })
  return out
}

/** Fichiers texte publiables sous resources/nova/. */
export function collectResourceFiles(): { filename: string; mimeType: string; content: string }[] {
  return collectResources()
    .filter((r) => r.kind !== 'link' && r.kind !== 'image' && typeof r.content === 'string')
    .map((r) => ({ filename: r.filename, mimeType: r.mimeType, content: r.content as string }))
}
