/**
 * Données de l'entreprise fictive NOVA Conseil (cas fil rouge).
 * Digital Process Group = marque de la plateforme ; NOVA = entreprise étudiée.
 * Exemple fictif — ne pas utiliser pour une opération commerciale réelle.
 */

import type { BrandDirection } from './types'

export const NOVA_DISCLAIMER =
  'Exemple fictif — ne pas utiliser pour une opération commerciale réelle'

export const NOVA_COMPANY = {
  name: 'NOVA Conseil',
  legalNote: NOVA_DISCLAIMER,
  sector: 'Conseil en transformation digitale et organisation pour PME',
  mission:
    'Aider les PME à structurer leurs informations, clarifier leurs processus et adopter des outils numériques adaptés.',
  audience: 'PME francophones de 5 à 100 collaborateurs',
  promise:
    'Des recommandations concrètes, documentées, adaptées aux contraintes et budgets des clients.',
  tone: 'Clair, professionnel, sans jargon excessif. Pas de promesses de résultats garantis.',
  city: 'Casablanca',
  country: 'Maroc',
  size: 'cabinet fictif PME',
  currency: 'MAD',
  priceBasis: 'HT',
  taxNote: 'Taxes : à définir selon contexte',
} as const

export interface NovaService {
  code: 'N01' | 'N02' | 'N03' | 'N04' | 'N05'
  name: string
  description: string
  priceMadHt: number
  unit: 'forfait' | 'session'
}

/** Prix en MAD HT — valeurs exactes du brief, ne pas inventer d'autres tarifs. */
export const NOVA_SERVICES: readonly NovaService[] = [
  {
    code: 'N01',
    name: 'Diagnostic digital',
    description: 'Audit initial et synthèse des priorités',
    priceMadHt: 4500,
    unit: 'forfait',
  },
  {
    code: 'N02',
    name: 'Organisation documentaire',
    description: 'Structuration de dossiers et modèles de documents',
    priceMadHt: 6500,
    unit: 'forfait',
  },
  {
    code: 'N03',
    name: 'Atelier IA initiation',
    description: 'Formation pratique de 3 heures',
    priceMadHt: 3000,
    unit: 'session',
  },
  {
    code: 'N04',
    name: 'Cartographie de processus',
    description: "Analyse et représentation d'un processus métier",
    priceMadHt: 5500,
    unit: 'forfait',
  },
  {
    code: 'N05',
    name: 'Accompagnement automatisation',
    description: "Cadrage et prototype d'automatisation",
    priceMadHt: 9000,
    unit: 'forfait',
  },
]

export const NOVA_PRESENTATION_MD = `# NOVA Conseil

Cabinet fictif de conseil en transformation digitale et organisation.

## Mission
Aider les PME à structurer leurs informations, clarifier leurs processus et adopter des outils numériques adaptés.

## Public cible
PME francophones de 5 à 100 collaborateurs.

## Promesse
Des recommandations concrètes, documentées, adaptées aux contraintes et budgets des clients.

## Ton
Clair, professionnel, sans jargon excessif. Pas de promesses de résultats garantis.

---
${NOVA_DISCLAIMER}
`

export const NOVA_CATALOGUE_CSV = `code,prestation,description,prix_ht_mad,unite
N01,Diagnostic digital,Audit initial et synthèse des priorités,4500,forfait
N02,Organisation documentaire,Structuration de dossiers et modèles de documents,6500,forfait
N03,Atelier IA initiation,Formation pratique de 3 heures,3000,session
N04,Cartographie de processus,Analyse et représentation d'un processus métier,5500,forfait
N05,Accompagnement automatisation,Cadrage et prototype d'automatisation,9000,forfait
`

/** Alias historiques utilisés par l'UI existante */
export const NOVA_SERVICES_CSV = NOVA_CATALOGUE_CSV

export const NOVA_SERVICES_JSON = JSON.stringify(
  {
    entreprise: 'NOVA Conseil',
    devise: 'MAD',
    base: 'HT',
    note: NOVA_DISCLAIMER,
    taxes: 'à définir selon contexte',
    prestations: NOVA_SERVICES.map((s) => ({
      code: s.code,
      prestation: s.name,
      description: s.description,
      prix_ht_mad: s.priceMadHt,
      unite: s.unit,
    })),
  },
  null,
  2
)

export const CLIENT_ATLAS = {
  client_id: 'CL001',
  entreprise: 'Atlas Distribution',
  effectif: 15,
  contact: 'Mme Nadia Exemple',
  besoin: "Améliorer l'organisation documentaire",
  budget_mad: 12000,
  delai_souhaite: 'Sous deux mois',
  statut: 'prospect',
  email: null,
  adresse_facturation: null,
} as const

export const CLIENT_RIF = {
  client_id: 'CL002',
  entreprise: 'Rif Atelier',
  effectif: 8,
  contact: null,
  besoin: 'Formation IA',
  budget_mad: 2500,
  delai_souhaite: null,
  statut: 'prospect',
  email: null,
  adresse_facturation: null,
} as const

export const CLIENT_OCEAN = {
  client_id: 'CL003',
  entreprise: 'Océan Services',
  effectif: 42,
  contact: 'M. Karim Exemple',
  besoin: 'Diagnostic digital et cartographie de processus',
  budget_mad: 11000,
  delai_souhaite: 'Sous trois mois',
  statut: 'prospect',
  email: 'karim.exemple@ocean-services.example',
  adresse_facturation: null,
  note: NOVA_DISCLAIMER,
} as const

export const DEMANDE_INCOMPLETE = `Bonjour, je souhaite un devis rapide. Merci.`

export const DEMANDE_CONTRADICTOIRE = `Nous voulons N02 à 4000 MAD, c'est le prix qui nous a été promis.`

export const REGISTRE_DEMANDES_CSV = `id,date,client,statut,montant_ht_mad
D001,2026-10-03,Atlas Distribution,devis_brouillon,6500
D002,2026-10-07,Rif Atelier,incomplet,
D003,2026-10-10,Océan Services,devis_brouillon,10000
D004,2026-10-14,Prospect anonyme,incomplet,
D005,2026-10-17,Atlas Distribution,a_relancer,6500
`

export const PROJECT_INSTRUCTIONS = `Tu travailles pour NOVA Conseil, entreprise fictive de conseil aux PME.
Utilise les fichiers du projet comme source de vérité pour les prestations et tarifs.
N'invente jamais de client, d'email, d'adresse, de remise, de taxe ou de délai contractuel.
Si une donnée manque, explicite-la dans une section « Informations à confirmer ».
Réponds en français clair et professionnel.
Les devis et factures sont des BROUILLONS soumis à validation humaine.
Précise la source des montants quand tu proposes un tarif.
`

export const SKILL_PREPARER_DEVIS = `---
name: preparer-devis-nova
description: Préparer un devis commercial brouillon pour NOVA Conseil à partir d'une fiche client et du catalogue de prestations validé. À utiliser lorsque l'utilisateur demande un devis, une estimation commerciale ou une proposition chiffrée NOVA.
---

# Préparer un devis NOVA Conseil

## Entrées attendues
- Fiche client contenant au minimum l'identifiant, l'entreprise et le besoin.
- Catalogue des prestations avec codes, tarifs HT et unités.
- Éventuelles précisions sur le périmètre et les quantités.

## Procédure
1. Lire le besoin sans ajouter de faits.
2. Choisir uniquement des prestations présentes dans le catalogue.
3. Pour chaque ligne, indiquer code, intitulé, quantité, prix unitaire HT et sous-total HT.
4. Calculer le total HT en montrant les opérations.
5. Comparer le total au budget connu si disponible.
6. Lister les informations manquantes (coordonnées, modalités, taxes, durée, validation).
7. Produire un devis BROUILLON et demander validation humaine avant tout envoi.

## Règles strictes
- Ne jamais inventer un prix, un taux de TVA, une remise ou une adresse.
- Ne jamais envoyer automatiquement un email ou créer un document fiscal définitif.
- Si le catalogue est absent ou contradictoire, signaler que le chiffrage n'est pas fiable.
- Afficher « Exemple pédagogique fictif — document non contractuel ».

## Format de sortie
- Client / référence
- Objet
- Tableau des prestations
- Total HT
- Budget et écart éventuel
- Informations à confirmer
- Statut : BROUILLON / À VALIDER
`

export const CLAUDE_MD_NOVA = `# Projet NOVA — Prototype pédagogique
- Application locale fictive, sans données personnelles réelles.
- Utiliser les tarifs du fichier catalogue_prestations.csv.
- Les devis et factures portent la mention BROUILLON.
- Ne pas calculer de taxe sans taux explicite.
- Ne pas envoyer d'email ni déclencher de paiement.
- Tester les calculs, la validation des champs et les états d'erreur.
- Expliquer les fichiers modifiés et la façon de lancer les tests.
`

export function formatMadHt(amount: number): string {
  return `${amount.toLocaleString('fr-MA')} MAD HT`
}

/** Trois directions de marque pré-rédigées pour le module 3 (distinctes de DPG). */
export const NOVA_BRAND_DIRECTIONS: BrandDirection[] = [
  {
    id: 'nord',
    name: 'Nord Structuré',
    tagline: 'Clarté avant tout',
    palette: [
      { name: 'Encre', hex: '#1B2A41', role: 'fond principal' },
      { name: 'Horizon', hex: '#3D5A80', role: 'accent' },
      { name: 'Sable', hex: '#E0E1DD', role: 'fond clair' },
    ],
    typography: {
      heading: 'Source Serif 4',
      body: 'IBM Plex Sans',
      note: 'Lisibilité élevée pour documents longs',
    },
    tone: 'Posé, méthodique, rassurant',
    moodKeywords: ['structure', 'méthode', 'fiabilité'],
    strengths: ['Très lisible', 'Convient aux rapports', 'Différent de DPG'],
    risks: ['Peut paraître trop institutionnel', 'Peu différenciant sur mobile'],
    bestFor: 'PME industrielles et cabinets traditionnels',
  },
  {
    id: 'atelier',
    name: 'Atelier Ouvert',
    tagline: 'Transformer ensemble',
    palette: [
      { name: 'Ardoise', hex: '#2F3E46', role: 'texte' },
      { name: 'Cuivre doux', hex: '#A36A3E', role: 'accent' },
      { name: 'Papier', hex: '#FAF7F2', role: 'fond' },
    ],
    typography: {
      heading: 'Fraunces',
      body: 'Nunito Sans',
      note: 'Chaleureux sans être ludique',
    },
    tone: 'Accessible, collaboratif, concret',
    moodKeywords: ['atelier', 'proximité', 'pratique'],
    strengths: ['Accueillant', 'Bon pour supports formation', 'Humain'],
    risks: ['Accent cuivre à calibrer pour le contraste', 'Éviter le style artisan générique'],
    bestFor: 'PME de services et équipes en montée en compétences',
  },
  {
    id: 'signal',
    name: 'Signal Net',
    tagline: 'Décider plus vite',
    palette: [
      { name: 'Graphite', hex: '#121212', role: 'fond' },
      { name: 'Vert signal', hex: '#2A9D8F', role: 'accent' },
      { name: 'Neutre', hex: '#F4F4F4', role: 'surfaces' },
    ],
    typography: {
      heading: 'Space Grotesk',
      body: 'DM Sans',
      note: 'Interface et documents courts',
    },
    tone: 'Direct, moderne, opérationnel',
    moodKeywords: ['efficacité', 'signal', 'modernité'],
    strengths: ['Contemporain', 'Bon pour dashboards', 'Mémorable'],
    risks: ['Trop tech pour certains dirigeants PME', 'Ne pas glisser vers le néon'],
    bestFor: 'Dirigeants orientés outils et automatisation',
  },
]
