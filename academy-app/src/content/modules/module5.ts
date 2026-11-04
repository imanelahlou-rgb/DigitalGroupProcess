import type { Module } from '../types'
import { UI_VERIFY_NOTE } from '../types'
import { criterion, levels, mcq } from '../helpers'

/**
 * Module 5 — Skills : transformer une méthode en compétence réutilisable (50 min)
 * Prix NOVA (MAD HT) : N01 4 500 · N02 6 500 · N03 3 000 · N04 5 500 · N05 9 000.
 * Océan Services = N01 + N04 = 10 000 MAD HT (budget 11 000).
 * Disponibilité des skills et mode d'import : à vérifier selon compte et version.
 */

/* -------------------------------------------------------------------------- */
/* Types locaux (pour les UI spécialisées : éditeur de skill, simulateur)      */
/* -------------------------------------------------------------------------- */

export interface SkillFile {
  /** Chemin dans le dossier skills */
  path: string
  name: string
  description: string
  /** Contenu complet du fichier SKILL.md (frontmatter YAML inclus) */
  content: string
}

export interface SimulatorCase {
  id: string
  title: string
  client: string
  kind: 'nominal' | 'depassement' | 'combinaison' | 'incomplet' | 'contradictoire'
  /** Demande reçue, telle que collée dans Claude */
  input: string
  extracted: {
    need: string | null
    budgetMadHt: number | null
    deadline: string | null
    requestedOffers: string[]
  }
  expected: {
    status: 'PRET_A_VALIDER' | 'ALERTE_BUDGET' | 'INFORMATIONS_MANQUANTES' | 'INCOHERENCE'
    offers: string[]
    totalMadHt: number | null
    /** Positif = dépassement, négatif = reliquat, null = non calculable */
    budgetGapMadHt: number | null
    summary: string
    mustContain: string[]
    mustNotContain: string[]
  }
  trap: string
  modelAnswer: string
  debrief: string
}

/* -------------------------------------------------------------------------- */
/* Skill principal : preparer-devis                                            */
/* -------------------------------------------------------------------------- */

export const SKILL_PREPARER_DEVIS_MD = `---
name: preparer-devis-nova
description: Prépare un brouillon de devis NOVA (offres N01 à N05, prix en MAD HT) à partir d'une demande client collée dans la conversation. À utiliser quand l'utilisateur parle de devis, de proposition chiffrée, de budget client ou d'une offre NOVA. Ne jamais envoyer le devis : produire un brouillon à valider par un humain.
---

# Préparer un devis NOVA

## Rôle
Tu es l'assistant commercial de NOVA Conseil. Tu transformes une demande client en brouillon de devis fiable, traçable et prudent. Tu ne décides pas à la place du consultant : tu prépares, tu signales, tu demandes validation.

## Catalogue NOVA (prix en MAD HT, fixes)
| Code | Offre | Prix MAD HT |
|------|-------|-------------|
| N01 | Diagnostic digital | 4 500 |
| N02 | Organisation documentaire | 6 500 |
| N03 | Atelier IA initiation | 3 000 |
| N04 | Cartographie de processus | 5 500 |
| N05 | Accompagnement automatisation | 9 000 |

Ces prix sont la seule source de vérité. Ne jamais les modifier, arrondir, remiser ou inventer une offre absente de ce tableau.

## Procédure (à suivre dans l'ordre)

### Étape 1 — Extraire
Relever dans la demande : client, besoin exprimé, budget (en MAD HT), échéance, offres éventuellement demandées. Si une donnée est absente, écrire "NON FOURNI". Ne jamais la deviner.

### Étape 2 — Contrôler la complétude
Les données indispensables sont : client, besoin, budget. Si l'une manque, passer directement à la section "Questions au client" : ne produire aucun montant total ni recommandation ferme. Poser au maximum 3 questions précises. Statut : INFORMATIONS_MANQUANTES.

### Étape 3 — Contrôler la cohérence
Signaler toute contradiction (budget incompatible avec l'offre demandée, délai irréaliste, TTC confondu avec HT). En cas de contradiction, ne pas trancher : lister les deux versions et demander laquelle fait foi. Statut : INCOHERENCE.

### Étape 4 — Choisir les offres
- Partir du besoin, pas du budget.
- Proposer l'offre la plus simple qui répond au besoin.
- Plusieurs offres sont possibles si elles sont complémentaires (exemple : N01 puis N04).
- Calculer le total par addition exacte des prix du catalogue.

### Étape 5 — Comparer au budget
- Total inférieur ou égal au budget : statut PRET_A_VALIDER, indiquer le reliquat.
- Total supérieur au budget : statut ALERTE_BUDGET, indiquer l'écart en MAD et en pourcentage. Ne jamais baisser un prix. Proposer des options : augmenter le budget, phaser la mission, ou constater qu'aucune offre du catalogue ne rentre dans le budget.
- Budget inférieur au prix de la plus petite offre (3 000) : le dire clairement.

### Étape 6 — Produire le brouillon
Respecter strictement le format de sortie ci-dessous.

## Format de sortie obligatoire

**STATUT** : PRET_A_VALIDER | ALERTE_BUDGET | INFORMATIONS_MANQUANTES | INCOHERENCE

**1. Données extraites** — tableau : client, besoin, budget, échéance, offres demandées (valeur ou NON FOURNI).

**2. Offres recommandées** — tableau : code, libellé, prix MAD HT. Ligne finale : TOTAL MAD HT.

**3. Contrôle budget** — budget, total, reliquat ou écart (MAD et %).

**4. Points d'attention** — risques, hypothèses, contradictions, informations manquantes.

**5. Questions au client** (si nécessaire, 3 maximum)

**6. Validation humaine requise** — terminer toujours par : "Brouillon à relire et valider par un consultant NOVA avant tout envoi."

## Règles de sécurité et de qualité
- Toujours indiquer HT. Ne pas calculer la TVA d'office.
- Ne jamais inventer de remise, de promotion, d'offre ou de délai de livraison.
- Ne jamais écrire "devis envoyé" : tu ne peux pas l'envoyer.
- Ne pas inclure de données personnelles superflues (téléphone, IBAN, pièces d'identité).
- En cas de doute, choisir le statut le plus prudent et poser une question.
- Répondre en français professionnel, phrases courtes.

## Exemples de référence
- Atlas Distribution, besoin d'organisation documentaire, budget 12 000 : N02 = 6 500 MAD HT, reliquat 5 500. Statut PRET_A_VALIDER. Une autre offre ne peut être mentionnée que si le besoin la justifie, jamais pour consommer le budget.
- Rif Atelier, budget 2 500, besoin de formation IA : N03 = 3 000, écart 500 MAD (20 %). Statut ALERTE_BUDGET. Aucune remise proposée.
- Océan Services, diagnostic digital puis cartographie de processus, budget 11 000 : N01 + N04 = 10 000 MAD HT, reliquat 1 000.
- Budget absent : statut INFORMATIONS_MANQUANTES, pas de total.
`

export const skillPreparerDevisNova: SkillFile = {
  path: 'skills/preparer-devis-nova/SKILL.md',
  name: 'preparer-devis-nova',
  description:
    'Prépare un brouillon de devis NOVA à partir d’une demande client : extrait les données, contrôle la complétude et la cohérence, applique le catalogue N01-N05 et le budget.',
  content: SKILL_PREPARER_DEVIS_MD,
}

/** Squelette de départ proposé dans l'éditeur (à compléter par l'apprenant). */
export const SKILL_PREPARER_DEVIS_STARTER = `---
name: preparer-devis-nova
description: Aide pour les devis.
---

# Préparer un devis NOVA

## Rôle
Tu es l'assistant commercial de NOVA Conseil.

## Catalogue NOVA (prix en MAD HT)
| Code | Offre | Prix MAD HT |
|------|-------|-------------|
| N01 | Diagnostic digital | 4 500 |
| N02 | Organisation documentaire | 6 500 |
| N03 | Atelier IA initiation | à compléter |
| N04 | Cartographie de processus | à compléter |
| N05 | Accompagnement automatisation | à compléter |

## Procédure
1. Lis la demande.
2. Calcule le total et compare au budget.
3. Écris le devis.

## Format de sortie
À définir.

## Règles de sécurité
À définir.
`

/* -------------------------------------------------------------------------- */
/* Skill optionnel : rediger-proposition-nova                                  */
/* -------------------------------------------------------------------------- */

export const skillRedigerPropositionNova: SkillFile = {
  path: 'skills/rediger-proposition-nova/SKILL.md',
  name: 'rediger-proposition-nova',
  description:
    'Rédige une proposition commerciale NOVA (e-mail ou document court) à partir d’un devis déjà validé par un humain.',
  content: `---
name: rediger-proposition-nova
description: Rédige une proposition commerciale en français (e-mail ou document court) à partir d'un devis NOVA déjà validé par un humain. À utiliser après le skill preparer-devis-nova, quand le statut est PRET_A_VALIDER et que le consultant a confirmé les offres et le total.
---

# Rédiger une proposition NOVA

## Prérequis
Ne rédiger que si l'utilisateur confirme explicitement que le brouillon de devis a été validé. Sinon, répondre : "Le devis n'est pas encore validé. Merci de le faire valider par un consultant NOVA."

## Structure de la proposition
1. Objet : "Proposition NOVA — [offre(s)] — [client]"
2. Rappel du contexte (2 phrases maximum, sans embellir le besoin)
3. Offre retenue : codes, libellés, prix MAD HT, total MAD HT
4. Déroulé proposé (étapes générales ; aucune date non confirmée)
5. Conditions : validité et paiement "à confirmer par NOVA" si non fournis
6. Prochaine étape : une seule action claire
7. Signature : consultant NOVA (nom à compléter)

## Garde-fous
- Reprendre les montants du devis validé à l'identique.
- Ne jamais ajouter de remise, d'offre, de garantie de résultat ou de chiffre de gain.
- Ne jamais inventer de références clients.
- Terminer par une ligne interne : "[INTERNE] Relecture humaine obligatoire avant envoi."
- Ne pas envoyer : produire uniquement le texte.
`,
}

/** Métadonnées pour l'éditeur de skill dédié (validation, erreurs classiques). */
export const skillEditorMeta = {
  fileName: 'SKILL.md',
  validationChecks: [
    { id: 'frontmatter', label: 'L’en-tête est encadré par deux lignes ---', failMessage: 'Le frontmatter YAML doit être encadré par deux lignes ---.' },
    { id: 'name', label: 'Le champ name est présent et en kebab-case', failMessage: 'Ajoutez name: preparer-devis-nova.' },
    { id: 'description', label: 'La description précise quand utiliser le skill', failMessage: 'Ajoutez un déclencheur : « À utiliser quand… ».' },
    { id: 'prices', label: 'Les 5 prix du catalogue sont exacts', failMessage: 'N01 4 500, N02 6 500, N03 3 000, N04 5 500, N05 9 000.' },
    { id: 'incomplete', label: 'Le cas « information manquante » est traité', failMessage: 'Indiquez quoi faire quand le budget ou le besoin est absent.' },
    { id: 'contradiction', label: 'Le cas contradictoire est traité', failMessage: 'Listez les deux versions et demandez laquelle fait foi.' },
    { id: 'human', label: 'La validation humaine est exigée', failMessage: 'Imposez la relecture avant tout envoi.' },
    { id: 'noinvent', label: 'L’interdiction d’inventer remises/offres est explicite', failMessage: 'Ajoutez « Ne jamais inventer de remise ni d’offre ».' },
  ],
  commonMistakes: [
    { id: 'desc-vague', bad: 'description: Aide pour les devis.', why: 'Trop vague : Claude ne sait ni quoi faire ni quand activer le skill.', fix: 'Décrire l’action, le périmètre et le déclencheur.' },
    { id: 'prix-flous', bad: 'Les offres NOVA coûtent entre 3 000 et 9 000 MAD.', why: 'Une fourchette ne permet pas de calculer un total exact.', fix: 'Un tableau code / offre / prix exact.' },
    { id: 'pas-de-cas-limite', bad: 'Calcule le total et compare au budget.', why: 'Aucune consigne si le total dépasse le budget : Claude risque de proposer une remise.', fix: 'Écrire : « Ne jamais baisser un prix ; proposer des options. »' },
    { id: 'envoi-auto', bad: 'Une fois le devis prêt, envoie-le au client.', why: 'Aucune validation humaine : risque commercial et juridique.', fix: 'Produire un brouillon et exiger la validation d’un consultant.' },
  ],
}

/* -------------------------------------------------------------------------- */
/* Simulateur : 5 cas limites                                                  */
/* -------------------------------------------------------------------------- */

export const skillSimulatorCases: SimulatorCase[] = [
  {
    id: 'atlas',
    title: 'Atlas Distribution — cas nominal',
    client: 'Atlas Distribution',
    kind: 'nominal',
    input:
      'Bonjour, nous sommes Atlas Distribution. Nous souhaitons améliorer notre organisation documentaire. Notre budget est de 12 000 MAD HT. Nous aimerions démarrer d’ici fin du mois.',
    extracted: {
      need: 'Amélioration de l’organisation documentaire',
      budgetMadHt: 12000,
      deadline: 'Fin du mois',
      requestedOffers: [],
    },
    expected: {
      status: 'PRET_A_VALIDER',
      offers: ['N02'],
      totalMadHt: 6500,
      budgetGapMadHt: -5500,
      summary: 'N02 = 6 500 MAD HT, dans le budget de 12 000 MAD HT ; reliquat de 5 500 MAD HT.',
      mustContain: ['N02', '6 500', '12 000', '5 500', 'valider'],
      mustNotContain: ['remise', 'devis envoyé'],
    },
    trap: 'Le reliquat de 5 500 correspond exactement au prix de N04 (Cartographie de processus) : tentation de l’ajouter d’office pour « consommer » le budget.',
    modelAnswer:
      'STATUT : PRET_A_VALIDER. Offre : N02 — 6 500 MAD HT. Budget 12 000, reliquat 5 500 MAD HT. Aucune autre offre n’est imposée pour consommer le budget. Brouillon à relire et valider par un consultant NOVA avant tout envoi.',
    debrief: 'Le skill part du besoin, pas du budget. Le reliquat n’est pas une cible à atteindre.',
  },
  {
    id: 'rif',
    title: 'Rif Atelier — dépassement de budget',
    client: 'Rif Atelier',
    kind: 'depassement',
    input:
      'Bonjour, Rif Atelier. Nous voulons une formation IA pour notre équipe administrative lors d’un atelier pratique. Budget maximum : 2 500 MAD HT.',
    extracted: {
      need: 'Atelier IA initiation pour l’équipe administrative',
      budgetMadHt: 2500,
      deadline: null,
      requestedOffers: [],
    },
    expected: {
      status: 'ALERTE_BUDGET',
      offers: ['N03'],
      totalMadHt: 3000,
      budgetGapMadHt: 500,
      summary: 'N03 = 3 000 MAD HT, soit 500 MAD de plus que le budget (+20 %). Aucune offre du catalogue n’est inférieure à 3 000.',
      mustContain: ['N03', '3 000', '2 500', '500', '20 %', 'ALERTE_BUDGET'],
      mustNotContain: ['remise', 'réduction', 'offert'],
    },
    trap: 'Proposer spontanément N03 à 2 500 MAD « pour faire plaisir au client » : le skill interdit toute baisse de prix.',
    modelAnswer:
      'STATUT : ALERTE_BUDGET. N03 — 3 000 MAD HT. Budget 2 500 MAD HT. Écart : +500 MAD HT (+20 %). Aucune offre du catalogue ne rentre dans ce budget. Options : (1) confirmer un budget de 3 000 MAD HT ; (2) différer l’atelier ; (3) échanger avec un consultant. Aucune remise n’est proposée.',
    debrief: 'Le bon réflexe est de signaler l’écart, pas de le combler. La décision commerciale reste humaine.',
  },
  {
    id: 'ocean',
    title: 'Océan Services — combinaison N01 + N04',
    client: 'Océan Services',
    kind: 'combinaison',
    input:
      'Océan Services souhaite d’abord un diagnostic digital, puis une cartographie de processus. Budget global : 11 000 MAD HT.',
    extracted: {
      need: 'Diagnostic digital puis cartographie de processus',
      budgetMadHt: 11000,
      deadline: null,
      requestedOffers: ['N01', 'N04'],
    },
    expected: {
      status: 'PRET_A_VALIDER',
      offers: ['N01', 'N04'],
      totalMadHt: 10000,
      budgetGapMadHt: -1000,
      summary: 'N01 4 500 + N04 5 500 = 10 000 MAD HT, dans le budget de 11 000 MAD HT ; reliquat de 1 000 MAD HT.',
      mustContain: ['N01', 'N04', '4 500', '5 500', '10 000', '11 000'],
      mustNotContain: ['N05', 'remise'],
    },
    trap: 'Confondre avec N02 + N04 (12 000) ou proposer N05 (9 000) parce qu’il « semble plus complet ».',
    modelAnswer:
      'STATUT : PRET_A_VALIDER. N01 — 4 500 MAD HT ; N04 — 5 500 MAD HT. TOTAL : 10 000 MAD HT. Budget 11 000, reliquat 1 000 MAD HT. Point d’attention : la cartographie de processus s’appuie sur les conclusions du diagnostic.',
    debrief: 'Un total dans le budget est un bon signal, mais le skill rappelle la dépendance entre N01 et N04 et ne cherche pas à consommer le reliquat.',
  },
  {
    id: 'incomplet',
    title: 'Demande incomplète — budget manquant',
    client: 'Maroc Textile',
    kind: 'incomplet',
    input: 'Bonjour, nous sommes Maroc Textile. Nous avons besoin d’aide pour automatiser des choses. Pouvez-vous nous faire un devis ?',
    extracted: { need: 'Aide à l’automatisation (non précisée)', budgetMadHt: null, deadline: null, requestedOffers: [] },
    expected: {
      status: 'INFORMATIONS_MANQUANTES',
      offers: [],
      totalMadHt: null,
      budgetGapMadHt: null,
      summary: 'Besoin flou, budget et échéance absents : aucun total ni recommandation ferme.',
      mustContain: ['INFORMATIONS_MANQUANTES', 'NON FOURNI', 'budget', 'questions'],
      mustNotContain: ['TOTAL :', 'N05', 'remise'],
    },
    trap: 'Proposer une offre par défaut (par exemple N01) avec un montant pour « aider ».',
    modelAnswer:
      'STATUT : INFORMATIONS_MANQUANTES. Budget : NON FOURNI. Échéance : NON FOURNI. Questions : (1) Quel processus améliorer en priorité ? (2) Quel budget (MAD HT) ? (3) Quelle échéance ? Aucun montant n’est proposé.',
    debrief: 'Un bon skill sait dire « je ne peux pas encore chiffrer ». L’absence de total est le résultat attendu.',
  },
  {
    id: 'contradictoire',
    title: 'Demande contradictoire — ambition et budget',
    client: 'Casa Santé Plus',
    kind: 'contradictoire',
    input:
      'Casa Santé Plus : nous voulons accompagner un pilote de déploiement complet sur 6 mois (offre N05). Notre budget est de 4 000 MAD HT et nous voulons commencer lundi prochain.',
    extracted: { need: 'Accompagnement automatisation sur 6 mois', budgetMadHt: 4000, deadline: 'Lundi prochain', requestedOffers: ['N05'] },
    expected: {
      status: 'INCOHERENCE',
      offers: ['N05'],
      totalMadHt: 9000,
      budgetGapMadHt: 5000,
      summary: 'Ambition (N05, 9 000 MAD HT) incompatible avec le budget (4 000, écart 5 000, soit +125 %) et avec le délai.',
      mustContain: ['INCOHERENCE', 'N05', '9 000', '4 000', '5 000', 'délai'],
      mustNotContain: ['remise'],
    },
    trap: 'Choisir silencieusement N03 pour « faire rentrer » le budget : cela change le besoin sans l’accord du client.',
    modelAnswer:
      'STATUT : INCOHERENCE. Le besoin (N05 — 9 000 MAD HT) ne correspond pas au budget annoncé (4 000 MAD HT, écart +5 000 MAD) ; le démarrage lundi est aussi à confirmer. Questions : (1) Le budget est-il ferme ? (2) Démarrer par une première étape ? (3) La date est-elle impérative ?',
    debrief: 'Face à une contradiction, le skill expose les deux versions et demande laquelle fait foi. Il ne tranche pas seul.',
  },
]

/* -------------------------------------------------------------------------- */
/* Leçons                                                                      */
/* -------------------------------------------------------------------------- */

const lesson1Body = `## 1. Pourquoi des skills ?

Quand une tâche revient souvent (devis, compte rendu, relance), recoller le même long prompt à chaque conversation est source d'oublis et de variations. Un **skill** fige la méthode une fois pour toutes.

## 2. Définitions

- **Skill** : un dossier contenant un fichier **SKILL.md**, c'est-à-dire des instructions que Claude peut activer quand la demande correspond.
- **Frontmatter** : l'en-tête YAML du fichier, encadré par deux lignes \`---\`, qui porte \`name\` et \`description\`.
- **Description** : texte que Claude lit pour décider d'activer ou non le skill. Elle dit **ce que fait** le skill et **quand l'utiliser**.
- **Cas limite** : situation hors du cas nominal (dépassement de budget, donnée absente, contradiction) qui fait la fiabilité d'un skill.

## 3. Prompt isolé ou skill ?

| Prompt isolé | Skill |
|---|---|
| À recopier à chaque fois | Stocké et réutilisable |
| Dépend de la mémoire de la personne | Standardisé pour toute l'équipe |
| Difficile à améliorer | Versionnable et améliorable |

Créez un skill quand : la tâche est **fréquente**, les règles sont **stables** (catalogue, ton, format) et le résultat doit être **homogène** d'un collaborateur à l'autre.

## 4. Exemple NOVA

Salma constate que chaque consultant formule différemment les demandes de devis : tarifs approximatifs, remises improvisées, formats variables. Elle transforme la méthode de Karim en skill \`preparer-devis-nova\` : catalogue exact, procédure, format de sortie unique, validation humaine obligatoire.

## 5. Erreurs fréquentes

- Un skill « fourre-tout » qui mélange devis, relances et comptes rendus.
- Une description vague (« Aide pour les devis ») : Claude ne sait pas quand l'activer.
- Penser qu'un skill garantit l'exactitude : il oriente, il ne remplace pas la vérification.

## 6. Bonnes pratiques

- Un skill = un métier précis.
- Écrire des consignes **vérifiables** (« ne jamais baisser un prix ») plutôt que des intentions (« sois prudent »).
- Tester sur des cas limites avant de partager.
- Disponibilité des skills, emplacement et mode d'import : ${UI_VERIFY_NOTE}.
`

const lesson2Body = `## 1. Anatomie d'un SKILL.md

Le fichier commence par un en-tête YAML, suivi du corps en Markdown :

~~~
---
name: preparer-devis-nova
description: Prépare un brouillon de devis NOVA... À utiliser quand l'utilisateur parle de devis.
---

# Titre
## Rôle
## Catalogue
## Procédure
## Format de sortie
## Règles de sécurité
## Exemples de référence
~~~

## 2. Les deux champs clés

- **name** : kebab-case (minuscules, chiffres, tirets), identique au nom du dossier.
- **description** : action + déclencheur (« À utiliser quand… »). Une à trois phrases.

## 3. Les six sections recommandées

| Section | Rôle | Exemple NOVA |
|---|---|---|
| Rôle | Mission et limites | « Tu prépares, tu ne décides pas » |
| Données de référence | Source de vérité | Tableau N01 à N05 en MAD HT |
| Procédure | Étapes ordonnées et cas limites | 6 étapes, dont complétude et cohérence |
| Format de sortie | Structure stable | Statut, tableaux, questions, validation |
| Règles de sécurité | Interdits explicites | Pas de remise, pas d'envoi |
| Exemples | Ancrer les comportements | Atlas Distribution, Rif Atelier, Océan Services |

## 4. Erreurs fréquentes

- Frontmatter mal fermé (une seule ligne \`---\`).
- \`name\` avec espaces ou accents.
- Prix en fourchette (« entre 3 000 et 9 000 ») : impossible de calculer un total exact.
- Aucune consigne pour les cas limites : Claude improvise (remise, offre par défaut).

## 5. Bonnes pratiques

- Mettre les prix dans un **tableau**, et préciser qu'ils ne doivent jamais être modifiés.
- Formuler les interdits en négatif clair : « Ne jamais… ».
- Imposer un **format de sortie fixe** : il permettra de brancher le skill dans une tâche planifiée (module 6) ou un workflow (module 7).
`

const lesson3Body = `## 1. Lecture guidée de preparer-devis-nova

Points à repérer dans le fichier fourni :

1. **Catalogue en tableau** : N01 4 500 · N02 6 500 · N03 3 000 · N04 5 500 · N05 9 000 MAD HT.
2. **Procédure en 6 étapes** : extraire, contrôler la complétude, contrôler la cohérence, choisir, comparer au budget, produire.
3. **Quatre statuts** : PRET_A_VALIDER, ALERTE_BUDGET, INFORMATIONS_MANQUANTES, INCOHERENCE.
4. **Garde-fous** : pas de remise inventée, pas d'envoi, HT uniquement, pas de données personnelles superflues.

## 2. Les cinq cas limites

| Cas | Calcul | Résultat attendu |
|---|---|---|
| Atlas | N02 = 6 500 ; budget 12 000 | Dans le budget, reliquat 5 500 |
| Rif | N03 = 3 000 ; budget 2 500 | Écart +500 (+20 %), aucune remise |
| Océan Services | N01 + N04 = 4 500 + 5 500 = 10 000 ; budget 11 000 | Dans le budget, reliquat 1 000 |
| Incomplet | Budget absent | Aucun total, 3 questions maximum |
| Contradictoire | N05 = 9 000 ; budget 4 000 ; démarrage lundi | Exposer les contradictions, ne pas trancher |

## 3. Pièges à surveiller

- **Atlas** : ajouter N04 d'office parce que le reliquat vaut exactement 5 500.
- **Rif** : proposer une remise ou ramener N03 à 2 500.
- **Océan** : proposer N05 (9 000) « plus complet » ou confondre avec N02 + N04 (12 000).
- **Incomplet** : deviner un budget ou proposer N01 par défaut.
- **Contradictoire** : choisir en silence une offre moins chère.

## 4. Exemple NOVA : corriger le skill, pas la réponse

Si Claude propose une remise pour Rif, la bonne réaction n'est pas de corriger la réponse à la main, mais d'ajouter la règle manquante dans le skill : « Ne jamais baisser un prix ; proposer des options ». Le skill s'améliore pour tous.

## 5. Bonne pratique

Un skill robuste se juge sur ses **cas limites**, pas sur le cas nominal. Testez toujours au moins cinq cas, puis demandez une relecture humaine avant diffusion.
`

/* -------------------------------------------------------------------------- */
/* Module                                                                      */
/* -------------------------------------------------------------------------- */

const weakSkillTarget = `---
name: Devis
description: Aide pour les devis.
---

Tu es un assistant. Calcule le total et compare au budget.
Les offres NOVA coûtent entre 3 000 et 9 000 MAD.
Si le budget est dépassé, propose une remise pour conclure la vente.
Une fois le devis prêt, envoie-le au client.`

export const module5: Module = {
  id: 'm5',
  slug: 'm5-skills',
  title: 'Module 5 — Skills : transformer une méthode en compétence réutilisable',
  durationMin: 50,
  objectives: [
    'Expliquer ce qu’est un skill et décider quand en créer un.',
    'Rédiger un SKILL.md avec frontmatter YAML valide (name, description avec déclencheur).',
    'Intégrer un catalogue de prix exact, un format de sortie fixe et des interdits explicites.',
    'Tester un skill sur 5 cas : nominal, dépassement, combinaison, incomplet, contradictoire.',
    'Imposer une validation humaine dans le skill.',
  ],
  situation:
    "Salma Benjelloun constate que les consultants de NOVA Conseil formulent chacun à leur manière les demandes de devis envoyées à Claude : tarifs approximatifs, remise improvisée pour Rif Atelier, offre ajoutée « pour consommer le budget » d'Atlas Distribution. Karim El Idrissi possède pourtant une méthode éprouvée en six étapes. Elle décide de la transformer en skill réutilisable par toute l'équipe, à condition qu'il gère les cas limites et qu'aucun devis ne parte sans validation humaine.",
  lessons: [
    {
      id: 'm5-l1',
      title: 'Qu’est-ce qu’un skill et quand en créer un ?',
      durationMin: 8,
      body: lesson1Body,
      keyTerms: [
        { term: 'Skill', definition: 'Dossier contenant un fichier SKILL.md que Claude active quand la demande correspond.' },
        { term: 'Frontmatter', definition: 'En-tête YAML encadré par deux lignes --- portant name et description.' },
        { term: 'Description', definition: 'Texte qui indique à Claude ce que fait le skill et quand l’utiliser.' },
        { term: 'Cas limite', definition: 'Situation hors cas nominal (dépassement, donnée absente, contradiction).' },
      ],
    },
    {
      id: 'm5-l2',
      title: 'Anatomie d’un SKILL.md : frontmatter et six sections',
      durationMin: 10,
      body: lesson2Body,
      keyTerms: [
        { term: 'kebab-case', definition: 'Écriture en minuscules séparées par des tirets (preparer-devis-nova).' },
        { term: 'Source de vérité', definition: 'Donnée de référence (ici le catalogue de prix) qui ne doit jamais être modifiée.' },
      ],
    },
    {
      id: 'm5-l3',
      title: 'Le skill preparer-devis-nova et ses cinq cas limites',
      durationMin: 12,
      body: lesson3Body,
      keyTerms: [
        { term: 'PRET_A_VALIDER', definition: 'Total dans le budget : brouillon prêt pour la validation d’un consultant.' },
        { term: 'ALERTE_BUDGET', definition: 'Total supérieur au budget : écart signalé, aucune remise proposée.' },
        { term: 'INFORMATIONS_MANQUANTES', definition: 'Donnée indispensable absente : aucun total, 3 questions maximum.' },
        { term: 'INCOHERENCE', definition: 'Demande contradictoire : exposer les deux versions et demander laquelle fait foi.' },
      ],
    },
  ],
  demo: {
    title: 'Tester le skill preparer-devis-nova sur cinq demandes',
    prerequisites: [
      `Accès à Claude avec les skills activés (${UI_VERIFY_NOTE}).`,
      'Le fichier SKILL.md du module (disponible dans les ressources) importé ou collé comme instructions.',
      'Les cinq demandes de test : Atlas Distribution, Rif Atelier, Océan Services, incomplète, contradictoire.',
    ],
    steps: [
      {
        number: 1,
        title: 'Charger le skill',
        instruction: `Importez ou activez le skill preparer-devis-nova (procédure : ${UI_VERIFY_NOTE}). À défaut, collez le contenu du fichier en début de conversation.`,
        expected: 'Claude confirme qu’il suit la procédure de préparation de devis NOVA.',
      },
      {
        number: 2,
        title: 'Cas nominal : Atlas',
        instruction: 'Collez la demande d’Atlas Distribution (organisation documentaire, budget 12 000 MAD HT).',
        expected: 'STATUT PRET_A_VALIDER, N02 = 6 500 MAD HT, reliquat 5 500, N04 au mieux citée en option.',
      },
      {
        number: 3,
        title: 'Dépassement : Rif',
        instruction: 'Collez la demande de Rif Atelier (formation IA, budget maximum 2 500 MAD HT).',
        expected: 'STATUT ALERTE_BUDGET, N03 = 3 000, écart +500 MAD (+20 %), aucune remise.',
      },
      {
        number: 4,
        title: 'Combinaison : Océan',
        instruction: 'Collez la demande d’Océan Services (diagnostic digital puis cartographie de processus, budget 11 000 MAD HT).',
        expected: 'N01 + N04 = 10 000 MAD HT, reliquat 1 000 (budget 11 000), dépendance N01 puis N04 signalée.',
      },
      {
        number: 5,
        title: 'Cas incomplet et contradictoire',
        instruction: 'Collez la demande de Maroc Textile (sans budget), puis celle de Casa Santé Plus (N05 pour 4 000 MAD HT, démarrage lundi).',
        expected: 'INFORMATIONS_MANQUANTES sans aucun total ; INCOHERENCE avec les deux versions exposées et 3 questions.',
      },
      {
        number: 6,
        title: 'Corriger le skill, pas la réponse',
        instruction: 'Si un cas a dérapé (remise, budget deviné), identifiez la règle manquante, ajoutez-la dans le skill puis relancez le cas.',
        expected: 'Le cas problématique est désormais traité correctement et la mention de validation humaine est présente.',
      },
    ],
    expectedResult:
      'Cinq sorties conformes : quatre statuts distincts, totaux exacts (6 500 ; 3 000 ; 10 000), aucune remise inventée et la mention « Brouillon à relire et valider » à chaque fois.',
    varianceNote:
      "Les réponses d'un modèle de langage varient d'une exécution à l'autre : la formulation, l'ordre des sections ou le détail des options peuvent différer. Vérifiez le statut, les montants et la présence des garde-fous, pas la ressemblance mot pour mot avec l'exemple.",
  },
  exercises: [
    {
      id: 'm5-e1',
      kind: 'file-edit',
      format: 'markdown',
      title: 'Compléter le SKILL.md preparer-devis-nova',
      instructions:
        "Complétez le squelette ci-dessous pour obtenir un skill fiable : corrigez la description (action + déclencheur), complétez les prix N03, N04 et N05, détaillez la procédure (donnée absente, contradiction, dépassement), définissez le format de sortie et les règles de sécurité (aucune remise inventée, validation humaine, pas d'envoi).",
      durationMin: 15,
      starter: SKILL_PREPARER_DEVIS_STARTER,
      solution: SKILL_PREPARER_DEVIS_MD,
      checks: [
        { id: 'c1', description: 'Frontmatter encadré par deux lignes ---', type: 'regex', value: '^---\\n[\\s\\S]*?\\n---', failMessage: 'Le fichier doit commencer par --- et fermer l’en-tête par ---.' },
        { id: 'c2', description: 'name en kebab-case : preparer-devis-nova', type: 'regex', value: 'name:\\s*preparer-devis-nova', failMessage: 'Ajoutez name: preparer-devis-nova.' },
        { id: 'c3', description: 'Description avec déclencheur', type: 'regex', value: 'description:[^\\n]*[Àà] utiliser quand', failMessage: 'La description doit contenir « À utiliser quand… ».' },
        { id: 'c4', description: 'Un titre de niveau 2 « Procédure »', type: 'md-has-heading', value: '2', failMessage: 'Ajoutez des sections de niveau 2 (## Rôle, ## Procédure…).' },
        { id: 'c5', description: 'Prix N01 = 4 500', type: 'regex', value: 'N01[^\\n]*4[\\s\\u202F\\u00A0]?500', failMessage: 'N01 vaut 4 500 MAD HT.' },
        { id: 'c6', description: 'Prix N02 = 6 500', type: 'regex', value: 'N02[^\\n]*6[\\s\\u202F\\u00A0]?500', failMessage: 'N02 vaut 6 500 MAD HT.' },
        { id: 'c7', description: 'Prix N03 = 3 000', type: 'regex', value: 'N03[^\\n]*3[\\s\\u202F\\u00A0]?000', failMessage: 'N03 vaut 3 000 MAD HT.' },
        { id: 'c8', description: 'Prix N04 = 5 500', type: 'regex', value: 'N04[^\\n]*5[\\s\\u202F\\u00A0]?500', failMessage: 'N04 vaut 5 500 MAD HT.' },
        { id: 'c9', description: 'Prix N05 = 9 000', type: 'regex', value: 'N05[^\\n]*9[\\s\\u202F\\u00A0]?000', failMessage: 'N05 vaut 9 000 MAD HT.' },
        { id: 'c10', description: 'Cas donnée absente traité (NON FOURNI)', type: 'contains', value: 'NON FOURNI', failMessage: 'Indiquez d’écrire « NON FOURNI » quand une donnée est absente.' },
        { id: 'c11', description: 'Cas contradictoire traité', type: 'regex', value: '[Cc]ontradiction', failMessage: 'Indiquez quoi faire en cas de contradiction (lister les deux versions).' },
        { id: 'c12', description: 'Interdiction d’inventer une remise', type: 'regex', value: 'Ne jamais[^\\n]*remise', failMessage: 'Ajoutez « Ne jamais inventer de remise ».' },
        { id: 'c13', description: 'Validation humaine exigée', type: 'regex', value: '[Vv]alid(er|ation)[^\\n]*(consultant|humain)|(consultant|humain)[^\\n]*[Vv]alid', failMessage: 'Imposez la validation par un consultant avant tout envoi.' },
      ],
      hints: [
        { id: 'm5-e1-h1', level: 1, text: 'La description doit répondre à deux questions : que fait le skill ? Quand l’utiliser ?' },
        { id: 'm5-e1-h2', level: 2, text: 'Prix : N03 = 3 000, N04 = 5 500, N05 = 9 000. Ajoutez les règles « Ne jamais inventer de remise » et « Ne jamais écrire devis envoyé ».' },
        { id: 'm5-e1-h3', level: 3, text: 'Procédure minimale : 1 Extraire (NON FOURNI si absent) · 2 Complétude (budget absent = aucun total) · 3 Cohérence (contradiction = lister les deux versions) · 4 Choisir · 5 Comparer au budget · 6 Produire. Terminer par « Brouillon à relire et valider par un consultant NOVA avant tout envoi ».' },
      ],
      assets: [
        {
          id: 'm5-a-skill',
          filename: 'SKILL.md',
          kind: 'file',
          mimeType: 'text/markdown',
          description: 'Skill de référence preparer-devis-nova (à comparer avec votre version).',
          content: SKILL_PREPARER_DEVIS_MD,
        },
        {
          id: 'm5-a-skill2',
          filename: 'rediger-proposition-nova.SKILL.md',
          kind: 'file',
          mimeType: 'text/markdown',
          description: 'Second skill optionnel : rédaction d’une proposition après validation du devis.',
          content: skillRedigerPropositionNova.content,
        },
      ],
    },
    {
      id: 'm5-e2',
      kind: 'audit',
      title: 'Auditer un SKILL.md défaillant',
      instructions:
        'Le skill ci-dessous a été rédigé à la hâte. Pour chaque critère, relevez le défaut observé, puis comparez avec la version améliorée.',
      durationMin: 8,
      target: weakSkillTarget,
      criteria: [
        { id: 'a1', label: 'Nom', question: 'Le champ name respecte-t-il le kebab-case et identifie-t-il le métier ?', expectedFinding: '« Devis » : majuscule et trop générique ; attendu : preparer-devis-nova.' },
        { id: 'a2', label: 'Description', question: 'La description dit-elle ce que fait le skill et quand l’activer ?', expectedFinding: '« Aide pour les devis » est vague : ni action précise ni déclencheur.' },
        { id: 'a3', label: 'Prix exacts', question: 'Les prix permettent-ils un calcul exact ?', expectedFinding: 'Une fourchette « 3 000 à 9 000 » interdit tout total exact : il faut un tableau N01 à N05.' },
        { id: 'a4', label: 'Cas limites', question: 'Les cas incomplet et contradictoire sont-ils traités ?', expectedFinding: 'Aucun : pas de « NON FOURNI », pas de questions au client, pas de gestion des contradictions.' },
        { id: 'a5', label: 'Remise', question: 'Le skill protège-t-il contre les remises improvisées ?', expectedFinding: 'Il demande au contraire de proposer une remise : risque commercial majeur.' },
        { id: 'a6', label: 'Validation humaine', question: 'Un humain valide-t-il avant l’envoi ?', expectedFinding: '« Envoie-le au client » : aucun contrôle, risque juridique.' },
      ],
      improvedVersion: SKILL_PREPARER_DEVIS_MD,
      hints: [
        { id: 'm5-e2-h1', level: 1, text: 'Lisez le skill ligne à ligne en vous demandant : « que ferait Claude si le budget est dépassé ? »' },
        { id: 'm5-e2-h2', level: 2, text: 'Trois défauts sont des risques commerciaux directs : prix en fourchette, remise proposée, envoi automatique.' },
      ],
    },
    {
      id: 'm5-e3',
      kind: 'comparison-table',
      title: 'Prédire le résultat des cinq cas du simulateur',
      instructions:
        'Étudiez le tableau des cinq cas, puis répondez aux questions avant de lancer le test dans Claude.',
      durationMin: 8,
      hints: [
        { id: 'm5-e3-h1', level: 1, text: 'Pour chaque ligne, calculez d’abord le total puis comparez-le au budget.' },
        { id: 'm5-e3-h2', level: 2, text: 'Océan Services : 4 500 + 5 500 = 10 000, soit 1 000 sous le budget de 11 000. Rif : 3 000 − 2 500 = 500, soit 20 % de 2 500.' },
      ],
      table: {
        id: 'm5-t1',
        caption: 'Cinq cas limites du skill preparer-devis-nova',
        columns: ['Demande', 'Calcul (MAD HT)', 'Statut attendu', 'Piège à éviter'],
        rows: [
          { id: 'r1', label: 'Atlas Distribution', cells: ['Organisation documentaire, budget 12 000', 'N02 = 6 500 ; reliquat 5 500', 'PRET_A_VALIDER', 'Ajouter une autre offre d’office'] },
          { id: 'r2', label: 'Rif Atelier', cells: ['Formation IA, budget 2 500', 'N03 = 3 000 ; écart +500 (+20 %)', 'ALERTE_BUDGET', 'Proposer une remise'] },
          { id: 'r3', label: 'Océan Services', cells: ['Diagnostic puis cartographie, budget 11 000', 'N01 + N04 = 4 500 + 5 500 = 10 000 ; reliquat 1 000', 'PRET_A_VALIDER', 'Proposer N05 ou N02 + N04'] },
          { id: 'r4', label: 'Maroc Textile', cells: ['« Automatiser des choses », sans budget', 'Aucun calcul', 'INFORMATIONS_MANQUANTES', 'Deviner un budget ou une offre'] },
          { id: 'r5', label: 'Casa Santé Plus', cells: ['N05, budget 4 000, démarrage lundi', 'N05 = 9 000 ; écart +5 000 (+125 %)', 'INCOHERENCE', 'Changer d’offre en silence'] },
        ],
        footnote: 'Prix : N01 4 500 · N02 6 500 · N03 3 000 · N04 5 500 · N05 9 000 MAD HT.',
      },
      questions: [
        { id: 'q1', prompt: 'Quel est le total pour Océan Services et quel est le reliquat ?', answer: '10 000 MAD HT (N01 4 500 + N04 5 500) ; reliquat 1 000 sur le budget de 11 000.' },
        { id: 'q2', prompt: 'De combien le budget de Rif est-il dépassé, en MAD et en pourcentage ?', answer: '500 MAD, soit 20 % de 2 500.' },
        { id: 'q3', prompt: 'Pourquoi le statut de Maroc Textile ne comporte-t-il aucun total ?', answer: 'Le budget est absent : sans donnée indispensable, le skill pose au maximum 3 questions et ne chiffre pas.' },
        { id: 'q4', prompt: 'Que fait le skill face à la demande contradictoire de Casa Santé Plus ?', answer: 'Il expose les deux versions (N05 à 9 000 contre budget 4 000, démarrage lundi) et demande laquelle fait foi, sans trancher seul.' },
      ],
    },
  ],
  quiz: [
    mcq(
      'm5-q1',
      'Quel est le rôle principal du champ « description » dans le frontmatter d’un SKILL.md ?',
      [
        'Servir de titre affiché au client final',
        'Indiquer à Claude ce que fait le skill et quand l’utiliser',
        'Stocker les prix du catalogue',
        'Décrire l’historique des versions du fichier',
      ],
      1,
      'Claude s’appuie sur la description pour décider d’activer le skill : elle doit contenir l’action et les déclencheurs.',
    ),
    mcq(
      'm5-q2',
      'Atlas Distribution a un budget de 12 000 MAD HT et un besoin d’organisation documentaire. Quelle est la bonne recommandation ?',
      [
        'N02 seul, 6 500 MAD HT, reliquat 5 500 MAD HT',
        'N05 seul, 9 000 MAD HT, pour consommer le budget',
        'N02 + N04 + N01, soit 16 500 MAD HT',
        'N03 avec une remise de 20 %',
      ],
      0,
      'On part du besoin : N02 répond à l’organisation documentaire. Aucune autre offre n’est imposée pour consommer le budget.',
    ),
    mcq(
      'm5-q3',
      'Rif Atelier a un budget de 2 500 MAD HT pour un atelier (N03 = 3 000). Que doit faire le skill ?',
      [
        'Proposer N03 à 2 500 MAD HT',
        'Ignorer le budget et envoyer le devis',
        'Signaler un écart de 500 MAD (+20 %), ne proposer aucune remise et suggérer des options',
        'Remplacer N03 par une offre inventée à 2 500 MAD HT',
      ],
      2,
      'Les prix du catalogue sont fixes. Le skill alerte et propose des options ; la décision commerciale reste humaine.',
    ),
    mcq(
      'm5-q4',
      'Océan Services souhaite un diagnostic digital puis une cartographie de processus. Quel total le skill doit-il calculer ?',
      ['9 000 MAD HT', '10 000 MAD HT', '11 000 MAD HT', '12 000 MAD HT'],
      1,
      'N01 (4 500) + N04 (5 500) = 10 000 MAD HT.',
    ),
    mcq(
      'm5-q5',
      'Dans une demande où le budget est absent, quelle sortie est correcte ?',
      [
        'Un devis complet avec N01 par défaut',
        'Un statut INFORMATIONS_MANQUANTES, aucun total, et au maximum 3 questions',
        'Un devis N05 pour être sûr de couvrir le besoin',
        'Un refus de répondre sans explication',
      ],
      1,
      'Un skill fiable sait s’arrêter et demander. Deviner un budget ou une offre crée un risque commercial.',
    ),
    mcq(
      'm5-q6',
      'Pourquoi le skill se termine-t-il toujours par une demande de validation humaine ?',
      [
        'Pour allonger la réponse',
        'Parce que Claude ne sait pas calculer',
        'Parce qu’un devis engage NOVA : l’IA prépare, le consultant décide et envoie',
        'Parce que c’est une obligation technique de Claude',
      ],
      2,
      'Le principe « human in the loop » protège l’entreprise : l’IA accélère la préparation, la responsabilité reste humaine.',
    ),
  ],
  practicalMission: {
    id: 'm5-mission',
    title: 'Industrialiser la préparation de devis NOVA',
    prompt:
      "Adaptez le skill preparer-devis-nova : vérifiez le frontmatter, le catalogue exact et les cas limites. Testez-le dans Claude sur les cinq demandes (Atlas, Rif, Océan, incomplète, contradictoire). Pour chaque cas, notez le statut obtenu, le total et la présence de la mention de validation humaine. Identifiez une ligne du skill à améliorer, reformulez-la et retestez le cas concerné. Données fictives uniquement.",
    deliverables: [
      'Fichier SKILL.md final (frontmatter valide, catalogue N01 à N05)',
      'Tableau de test des 5 cas : statut obtenu, total, validation humaine (oui/non)',
      'Une amélioration documentée : règle ajoutée et résultat avant/après',
    ],
    successCriteria: [
      'Les cinq prix du catalogue sont exacts : 4 500, 6 500, 3 000, 5 500, 9 000 MAD HT.',
      'Le cas Océan donne 10 000 MAD HT et le cas Rif un écart de +500 MAD (+20 %), sans remise.',
      'Le cas incomplet ne produit aucun total ; le cas contradictoire expose les deux versions.',
      'La validation humaine est exigée avant tout envoi.',
    ],
    estimatedMin: 10,
  },
  verification: {
    id: 'm5-rubric',
    title: 'Grille de vérification — Module 5',
    maxPoints: 15,
    passThreshold: 10,
    criteria: [
      criterion('r1', 'Frontmatter et description', 'name en kebab-case et description avec déclencheur.', levels(
        'Frontmatter absent ou invalide.',
        'Frontmatter valide mais description vague.',
        'Description précise sans déclencheur explicite.',
        'name valide et description avec action et « À utiliser quand… ».',
      )),
      criterion('r2', 'Catalogue exact', 'Les cinq prix correspondent à la grille NOVA.', levels(
        'Prix absents ou en fourchette.',
        'Une à trois erreurs de prix.',
        'Une seule erreur de prix.',
        'Les cinq prix sont exacts en MAD HT.',
      )),
      criterion('r3', 'Cas limites', 'Dépassement, combinaison, incomplet et contradictoire sont traités.', levels(
        'Aucun cas limite traité.',
        'Un seul cas limite traité.',
        'Deux ou trois cas limites traités.',
        'Les quatre cas limites sont traités explicitement.',
      )),
      criterion('r4', 'Garde-fous', 'Interdiction de remise inventée, d’envoi et validation humaine.', levels(
        'Aucun garde-fou.',
        'Un garde-fou sur trois.',
        'Deux garde-fous sur trois.',
        'Les trois garde-fous sont formulés clairement.',
      )),
      criterion('r5', 'Test et amélioration', 'Le skill est testé sur 5 cas et corrigé à la source.', levels(
        'Aucun test réalisé.',
        'Test sur un ou deux cas, sans correction.',
        'Test sur cinq cas, correction de la réponse plutôt que du skill.',
        'Test sur cinq cas et règle ajoutée dans le skill avec nouveau test.',
      )),
    ],
  },
  synthesis: {
    takeaways: [
      'Un skill transforme une méthode en compétence d’équipe : sa description (action + déclencheur) décide de son activation.',
      'Un skill fiable se juge sur ses cas limites : dépassement (+500, +20 %), donnée absente, contradiction, combinaison N01 + N04 = 10 000 MAD HT.',
      'Les prix sont une source de vérité, la remise n’est jamais inventée et la validation humaine reste obligatoire avant tout envoi.',
    ],
    nextModule: {
      id: 'm6',
      slug: 'm6-taches-planifiees',
      title: 'Module 6 — Tâches planifiées : automatiser le rythme',
      href: '/modules/m6-taches-planifiees',
      teaser: 'Votre skill fonctionne à la demande ; faites-le travailler à heure fixe avec le rapport du vendredi 17 h.',
    },
  },
  instructorNotes: [
    {
      id: 'm5-n1',
      topic: 'Ouverture (3 min)',
      text: 'Rappeler le lien avec RISEN : un prompt qui marche devient un skill. « Un prompt est une phrase ; un skill est une compétence d’équipe. »',
      timingMin: 3,
    },
    {
      id: 'm5-n2',
      topic: 'Anatomie du SKILL.md (10 min)',
      text: 'Montrer le frontmatter puis les six sections dans l’éditeur. Insister : la description dit quoi faire ET quand l’utiliser.',
      timingMin: 10,
      pitfalls: [
        'Description trop vague ou sans déclencheur.',
        `Ne pas promettre le même emplacement ou mode d’import selon les comptes (${UI_VERIFY_NOTE}).`,
      ],
    },
    {
      id: 'm5-n3',
      topic: 'Lecture guidée et atelier 5 cas (27 min)',
      text: 'Parcourir catalogue, procédure, statuts, garde-fous (12 min) puis circuler pendant le test des cinq demandes (15 min). Rappels : Atlas Distribution N02 = 6 500 dans 12 000 ; Rif Atelier +500 (+20 %) ; Océan Services 10 000 dans 11 000.',
      timingMin: 27,
      pitfalls: [
        'Claude propose une remise pour Rif : corriger le skill, pas seulement la réponse.',
        'Claude devine un budget pour le cas incomplet : l’absence de total est le bon résultat.',
        'Participants qui ajoutent une offre pour Atlas Distribution : rappeler « besoin d’abord, budget ensuite ».',
      ],
    },
    {
      id: 'm5-n4',
      topic: 'Plan B sans skills ni Claude',
      text: 'Projeter le SKILL.md, distribuer les cinq demandes imprimées et faire jouer le rôle de « Claude » en binôme : l’un applique la procédure, l’autre contrôle avec la checklist des 8 contrôles de l’éditeur.',
    },
    {
      id: 'm5-n5',
      topic: 'Quiz et clôture (5 min)',
      text: 'Lancer le quiz de 6 questions. Option pour les plus rapides : rediger-proposition-nova, seulement après validation du devis. Annoncer le module 6.',
      timingMin: 5,
    },
  ],
  references: [
    { id: 'm5-ref1', label: 'Documentation Claude : Skills', note: `Emplacement, import et disponibilité : ${UI_VERIFY_NOTE}.`, verifyUi: true },
    { id: 'm5-ref2', label: 'Spécification YAML (frontmatter)', url: 'https://yaml.org/spec/', note: 'Rappel : pas de tabulations, guillemets si le texte contient « : ».' },
  ],
  assets: [
    {
      id: 'm5-asset-skill',
      filename: 'preparer-devis-nova/SKILL.md',
      kind: 'copyable-text',
      mimeType: 'text/markdown',
      description: 'Skill de référence preparer-devis-nova (catalogue N01 à N05, 4 statuts, garde-fous).',
      content: SKILL_PREPARER_DEVIS_MD,
    },
  ],
}

export default module5
