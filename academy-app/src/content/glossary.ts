import type { ModuleId } from './types'
import { modules } from './modules'

export interface GlossaryEntry {
  term: string
  definition: string
  moduleId?: ModuleId
}

/** Termes de l'Atelier (définitions courtes, sans promesse sur l'interface : à vérifier selon compte et version). */
const curated: GlossaryEntry[] = [
  { term: 'LLM', moduleId: 'm7', definition: 'Grand modèle de langage : le modèle qui comprend et génère du texte. Claude en est un exemple.' },
  { term: 'Prompt', moduleId: 'm2', definition: 'Instruction ou ensemble d’instructions envoyées au modèle. Plus il est précis, plus la réponse est exploitable.' },
  { term: 'RISEN', moduleId: 'm2', definition: 'Trame de prompt en cinq blocs : Role (rôle), Input (données / contexte fournis), Steps (étapes), Expectation (livrable attendu), Narrowing (limites).' },
  { term: 'Format de fichier', moduleId: 'm1', definition: 'Convention qui décrit comment une information est stockée : .md, .json, .csv, .txt, .pdf…' },
  { term: 'Markdown', moduleId: 'm1', definition: 'Format texte simple avec titres (#), listes (-) et tableaux, lisible par l’humain et par l’IA.' },
  { term: 'JSON', moduleId: 'm1', definition: 'Format de données structuré en clés et valeurs. Guillemets doubles obligatoires, pas de virgule finale.' },
  { term: 'CSV', moduleId: 'm1', definition: 'Tableau en texte : une ligne par enregistrement, colonnes séparées par un séparateur (ici la virgule).' },
  { term: 'Hallucination', moduleId: 'm2', definition: 'Réponse plausible mais inexacte ou inventée. D’où la règle : vérifier les chiffres et ne jamais deviner.' },
  { term: 'Contexte', moduleId: 'm4', definition: 'Ensemble des informations dont dispose le modèle pour répondre : consignes, fichiers, historique.' },
  { term: 'Fenêtre de contexte', moduleId: 'm4', definition: 'Quantité maximale d’informations que le modèle peut prendre en compte en une fois.' },
  { term: 'Projet Claude', moduleId: 'm4', definition: 'Espace regroupant des instructions et des fichiers de connaissances réutilisés par plusieurs conversations (à vérifier selon compte et version).' },
  { term: 'Mémoire', moduleId: 'm4', definition: 'Informations conservées d’une conversation à l’autre. Disponibilité et fonctionnement : à vérifier selon compte et version.' },
  { term: 'Direction de marque', moduleId: 'm3', definition: 'Proposition cohérente de palette, typographie et ton de voix pour une identité visuelle.' },
  { term: 'Skill', moduleId: 'm5', definition: 'Procédure packagée (fichier SKILL.md) que Claude applique lorsque la demande correspond à sa description.' },
  { term: 'SKILL.md', moduleId: 'm5', definition: 'Fichier d’un skill : un en-tête (frontmatter) avec name et description, puis la procédure, le format de sortie et les règles.' },
  { term: 'Frontmatter', moduleId: 'm5', definition: 'Bloc de métadonnées en tête de fichier, encadré par des lignes « --- ».' },
  { term: 'Tâche planifiée', moduleId: 'm6', definition: 'Consigne exécutée automatiquement à une fréquence donnée (ex. chaque vendredi à 17 h). Fonction : à vérifier selon compte et version.' },
  { term: 'Outil', moduleId: 'm7', definition: 'Capacité extérieure appelée par le modèle : lire un tableau, calculer, créer un brouillon.' },
  { term: 'Agent', moduleId: 'm7', definition: 'Système où le modèle choisit lui-même des actions et des outils pour atteindre un objectif. Plus d’autonomie, donc plus de risque.' },
  { term: 'Workflow', moduleId: 'm7', definition: 'Enchaînement d’étapes défini à l’avance (déclencheur, traitements, contrôles, validation, sortie).' },
  { term: 'MCP', moduleId: 'm7', definition: 'Model Context Protocol : standard ouvert pour relier un modèle à des outils et des sources de données. Disponibilité : à vérifier selon compte et version.' },
  { term: 'Connecteur', moduleId: 'm7', definition: 'Liaison entre Claude et un service extérieur (messagerie, tableur, stockage). Appliquer les permissions minimales.' },
  { term: 'Validation humaine (HITL)', moduleId: 'm7', definition: 'Human in the loop : un humain relit et approuve avant toute action engageante, comme l’envoi d’un devis.' },
  { term: 'Claude Code', moduleId: 'm8', definition: 'Outil qui permet à Claude de lire un projet, écrire du code et lancer des commandes. Installation et plans : à vérifier selon compte et version.' },
  { term: 'CLAUDE.md', moduleId: 'm8', definition: 'Fichier de contexte et de règles d’un projet de code : conventions, commandes, règles métier, sécurité.' },
  { term: 'Permission', moduleId: 'm8', definition: 'Autorisation demandée avant une action sensible. À lire avant d’accepter ; permissions minimales par défaut.' },
  { term: 'NOVA Conseil', definition: 'Entreprise fictive de conseil de Casablanca, fil rouge de l’Atelier. Aucune donnée réelle.' },
  { term: 'MAD HT', definition: 'Dirham marocain, hors taxes. Base de tous les prix du catalogue NOVA (N01 à N05).' },
  { term: 'ALERTE_BUDGET', moduleId: 'm5', definition: 'Statut signalant que le total des offres dépasse le budget du client. Aucune remise automatique.' },
  { term: 'Attestation de participation', definition: 'Document DPG Academy attestant la participation à l’atelier. Ce n’est pas une certification Anthropic.' },
]

function norm(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

/** Termes curatés + termes clés des leçons (dédoublonnés), triés par ordre alphabétique. */
export function buildGlossary(): GlossaryEntry[] {
  const map = new Map<string, GlossaryEntry>()
  for (const e of curated) map.set(norm(e.term), e)
  for (const m of modules) {
    for (const l of m.lessons) {
      for (const k of l.keyTerms ?? []) {
        const key = norm(k.term)
        if (!map.has(key)) map.set(key, { term: k.term, definition: k.definition, moduleId: m.id })
      }
    }
  }
  return [...map.values()].sort((a, b) => norm(a.term).localeCompare(norm(b.term), 'fr'))
}

export const glossary: GlossaryEntry[] = buildGlossary()
