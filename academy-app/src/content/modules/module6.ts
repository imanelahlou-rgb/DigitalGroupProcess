import type { Module } from '../types'
import { UI_VERIFY_NOTE } from '../types'
import { criterion, levels, mcq } from '../helpers'

/**
 * Module 6 — Tâches planifiées : automatiser le rythme (35 min)
 * Prix NOVA (MAD HT) : N01 4 500 · N02 6 500 · N03 3 000 · N04 5 500 · N05 9 000.
 * La disponibilité des tâches planifiées, leurs limites et leur paramétrage sont
 * à vérifier selon compte et version.
 */

/* -------------------------------------------------------------------------- */
/* Types locaux (UI spécialisées : planificateur, scénario d'erreur)            */
/* -------------------------------------------------------------------------- */

export interface ReportDossier {
  id: string
  client: string
  offer: string | null
  amountMadHt: number | null
  status: 'en_attente' | 'valide' | 'envoye' | 'relance'
  lastUpdate: string
}

export interface PlannedTaskTemplate {
  id: string
  name: string
  scheduleLabel: string
  /** Expression cron indicative (à vérifier selon compte et version) */
  cron: string
  prompt: string
  expectedOutput: string
  owner: string
}

export interface TimelineEvent {
  /** 1 = lundi … 7 = dimanche */
  day: number
  time: string
  type: 'humain' | 'planifie' | 'alerte'
  label: string
  detail: string
}

export interface PlannerSimulatorConfig {
  weekDays: { index: number; label: string }[]
  defaultTask: PlannedTaskTemplate
  frequencyOptions: { id: string; label: string; cron: string; isDefault?: boolean }[]
  timezone: string
  validations: { id: string; label: string; failMessage: string }[]
  sampleDossiers: ReportDossier[]
}

export interface ErrorScenario {
  id: string
  title: string
  context: string
  inputRows: ReportDossier[]
  badOutput: string
  goodOutput: string
  rootCause: string
  fixInPrompt: string
  learningPoint: string
}

/* -------------------------------------------------------------------------- */
/* Données du rapport du vendredi 17 h                                         */
/* -------------------------------------------------------------------------- */

export const FRIDAY_REPORT_PROMPT = `Tu es l'assistant de pilotage commercial de NOVA Conseil.

Tâche : produire le rapport hebdomadaire des dossiers NOVA de la semaine écoulée.

Données : utilise uniquement le tableau des dossiers fourni ou connecté (client, offre, montant MAD HT, statut, dernière mise à jour).

Règles :
1. Ne jamais inventer un montant, un client ou un statut.
2. Si un montant ou une offre est absent, écrire "À COMPLÉTER" dans la ligne concernée, l'exclure des totaux et l'ajouter à la section "Anomalies".
3. Prix du catalogue : N01 4 500, N02 6 500, N03 3 000, N04 5 500, N05 9 000 MAD HT. Signaler tout montant qui ne correspond pas à une combinaison de ces offres.
4. Ne pas inclure de données personnelles (téléphone, e-mail, IBAN).
5. Ne pas envoyer le rapport : produire un brouillon pour relecture par le responsable.

Format de sortie :
1. Résumé (3 lignes maximum)
2. Tableau des dossiers : client, offre, montant MAD HT, statut
3. Total par statut (MAD HT), lignes "À COMPLÉTER" exclues, avec leur nombre
4. Anomalies et informations manquantes
5. Actions recommandées pour la semaine suivante (5 maximum)
6. Mention finale : "Rapport automatique — à relire avant diffusion."`

export const fridayReportTask: PlannedTaskTemplate = {
  id: 'rapport-hebdo-nova',
  name: 'Rapport hebdomadaire des dossiers NOVA',
  scheduleLabel: 'Chaque vendredi à 17 h 00 (heure du Maroc)',
  cron: '0 17 * * 5',
  prompt: FRIDAY_REPORT_PROMPT,
  expectedOutput:
    'Un rapport structuré en 6 parties, anomalies signalées, aucun montant inventé, prêt pour une relecture le vendredi soir ou le lundi matin.',
  owner: 'Responsable commercial NOVA',
}

export const weeklyTimeline: TimelineEvent[] = [
  { day: 1, time: '09:00', type: 'humain', label: 'Revue des demandes', detail: 'Le consultant utilise le skill preparer-devis-nova sur les nouvelles demandes.' },
  { day: 2, time: '11:00', type: 'humain', label: 'Validation des brouillons', detail: 'Le responsable valide ou corrige les devis préparés.' },
  { day: 3, time: '15:00', type: 'humain', label: 'Mise à jour du suivi', detail: 'Les statuts du tableau de suivi sont mis à jour.' },
  { day: 4, time: '10:00', type: 'humain', label: 'Relances clients', detail: 'Relances rédigées avec rediger-proposition-nova et relues.' },
  { day: 5, time: '16:30', type: 'alerte', label: 'Dernier contrôle des données', detail: 'Vérifier que montants et offres sont renseignés avant le rapport.' },
  { day: 5, time: '17:00', type: 'planifie', label: 'Tâche planifiée : rapport NOVA', detail: 'Claude produit le brouillon de rapport hebdomadaire.' },
  { day: 5, time: '17:10', type: 'humain', label: 'Relecture rapide', detail: 'Le responsable lit les anomalies et valide la diffusion (ou reporte au lundi).' },
]

const sampleDossiers: ReportDossier[] = [
  { id: 'D-101', client: 'Atlas Distribution', offer: 'N02', amountMadHt: 6500, status: 'valide', lastUpdate: 'Mardi' },
  { id: 'D-102', client: 'Rif Atelier', offer: 'N03', amountMadHt: 3000, status: 'en_attente', lastUpdate: 'Mercredi' },
  { id: 'D-103', client: 'Océan Services', offer: 'N01 + N04', amountMadHt: 10000, status: 'envoye', lastUpdate: 'Jeudi' },
  { id: 'D-104', client: 'Maroc Textile', offer: null, amountMadHt: null, status: 'en_attente', lastUpdate: 'Lundi' },
]

export const plannerSimulator: PlannerSimulatorConfig = {
  weekDays: [
    { index: 1, label: 'Lundi' },
    { index: 2, label: 'Mardi' },
    { index: 3, label: 'Mercredi' },
    { index: 4, label: 'Jeudi' },
    { index: 5, label: 'Vendredi' },
    { index: 6, label: 'Samedi' },
    { index: 7, label: 'Dimanche' },
  ],
  timezone: 'Africa/Casablanca',
  defaultTask: fridayReportTask,
  frequencyOptions: [
    { id: 'quotidien', label: 'Tous les jours à 17 h', cron: '0 17 * * *' },
    { id: 'vendredi', label: 'Chaque vendredi à 17 h', cron: '0 17 * * 5', isDefault: true },
    { id: 'lundi', label: 'Chaque lundi à 9 h', cron: '0 9 * * 1' },
    { id: 'mensuel', label: 'Le 1er du mois à 9 h', cron: '0 9 1 * *' },
  ],
  validations: [
    { id: 'jour', label: 'Le jour sélectionné est le vendredi', failMessage: 'Le rapport hebdomadaire doit partir le vendredi.' },
    { id: 'heure', label: 'L’heure est 17 h 00', failMessage: 'Fixez 17 h 00 afin de laisser un dernier contrôle des données à 16 h 30.' },
    { id: 'prompt-autonome', label: 'Le prompt est autonome (rôle, données, format)', failMessage: 'Personne ne répond à 17 h : le prompt doit tout préciser.' },
    { id: 'anomalies', label: 'Le prompt gère les données manquantes', failMessage: 'Ajoutez : « Si un montant est absent, écrire À COMPLÉTER ».' },
    { id: 'pas-envoi', label: 'Le prompt interdit l’envoi automatique', failMessage: 'Produire un brouillon et exiger une relecture humaine.' },
    { id: 'donnees-perso', label: 'Aucune donnée personnelle dans le rapport', failMessage: 'Ajoutez une règle excluant téléphones, e-mails et IBAN.' },
  ],
  sampleDossiers,
}

export const errorScenarioIncompleteAmount: ErrorScenario = {
  id: 'montant-incomplet',
  title: 'Le rapport du vendredi avec un montant manquant',
  context:
    'Vendredi 17 h : la tâche se lance. Le dossier D-104 (Maroc Textile) n’a ni offre ni montant, car la demande était incomplète.',
  inputRows: sampleDossiers,
  badOutput:
    'Total pipeline : 24 000 MAD HT. D-104 Maroc Textile : N01 — 4 500 MAD HT (estimé). Taux de validation : 75 %.',
  goodOutput:
    'Total des dossiers chiffrés : 19 500 MAD HT (D-101 : 6 500 ; D-102 : 3 000 ; D-103 : 10 000). 1 dossier à compléter : D-104 Maroc Textile — offre et montant « À COMPLÉTER ». Anomalies : D-104 en attente depuis lundi ; budget et besoin à confirmer avec le client. Rapport automatique — à relire avant diffusion.',
  rootCause:
    'Le prompt ne disait pas quoi faire en cas de donnée absente : Claude a « complété » la ligne par une estimation plausible, ce qui fausse le total (24 000 au lieu de 19 500).',
  fixInPrompt:
    'Si un montant ou une offre est absent, écrire « À COMPLÉTER », l’exclure des totaux, indiquer leur nombre et l’ajouter aux anomalies. Ne jamais estimer.',
  learningPoint: 'Une tâche planifiée s’exécute sans vous : elle doit savoir échouer proprement, c’est-à-dire signaler plutôt qu’inventer.',
}

/* -------------------------------------------------------------------------- */
/* Leçons                                                                      */
/* -------------------------------------------------------------------------- */

const lesson1Body = `## 1. Définitions

- **Mode manuel** : une personne lance la demande.
- **Tâche planifiée** : Claude exécute un prompt à une heure ou une récurrence donnée (ex. chaque vendredi à 17 h).
- **Workflow événementiel** : un événement (nouvelle demande, statut modifié) déclenche le traitement.
- **Agent** : on donne un objectif ; le système choisit ses étapes et ses outils.

## 2. Comparer les quatre modes

| Mode | Déclencheur | Exemple NOVA | Contrôle humain |
|---|---|---|---|
| Manuel | Une personne | Préparer un devis à la demande | Élevé |
| Planifié | Une heure | Rapport NOVA le vendredi à 17 h | Moyen |
| Événementiel | Un événement | Nouvelle demande de devis reçue | Moyen |
| Agent | Un objectif | Analyser un dossier de bout en bout | Faible, à encadrer |

## 3. Règle de choix

1. Commencez **manuel** pour valider la qualité.
2. Passez en **planifié** quand le besoin est régulier et le format stable.
3. Passez en **événementiel** quand la réactivité compte.
4. N'utilisez un **agent** que pour des tâches ouvertes, avec des points de validation.

## 4. Exemple NOVA

Salma veut recevoir chaque semaine l'état des dossiers. Au début, Nadia lance le rapport à la main le vendredi. Une fois le format stabilisé, il devient une tâche planifiée. En revanche, la réaction à une nouvelle demande de devis relève plutôt d'un workflow événementiel.

## 5. Erreurs fréquentes

- Automatiser avant d'avoir validé la qualité en manuel.
- Choisir un agent « parce que c'est moderne » alors qu'un horaire fixe suffit.
- Oublier que le contrôle humain diminue à mesure que l'autonomie augmente.

## 6. Bonnes pratiques

- Partir du **déclencheur** réel du besoin.
- Garder une relecture humaine sur tout ce qui sort de l'entreprise.
- Planification, récurrences et limites : ${UI_VERIFY_NOTE}.
`

const lesson2Body = `## 1. Pourquoi le prompt d'une tâche planifiée est différent

Dans une conversation, vous corrigez en direct. À 17 h le vendredi, **personne n'est là pour répondre**. Le prompt doit donc être **autonome** : rôle, données, règles, format, cas d'erreur et garde-fous.

## 2. Les cinq éléments d'un prompt planifié fiable

1. **Rôle** : assistant de pilotage commercial.
2. **Données** : tableau des dossiers (client, offre, montant MAD HT, statut).
3. **Règles** : prix du catalogue, jamais d'invention, pas de données personnelles.
4. **Format** : résumé, tableau, totaux, anomalies, actions.
5. **Garde-fous** : brouillon, relecture humaine.

## 3. La semaine type NOVA

- Lundi à jeudi : les humains travaillent les dossiers et mettent à jour le suivi.
- Vendredi 16 h 30 : dernier contrôle des données.
- **Vendredi 17 h : tâche planifiée** (fuseau Africa/Casablanca).
- Vendredi 17 h 10 ou lundi : relecture et plan d'actions.

Expression indicative de récurrence : \`0 17 * * 5\` (minute, heure, jour du mois, mois, jour de semaine). Syntaxe réelle : ${UI_VERIFY_NOTE}.

## 4. Exemple NOVA

Les quatre dossiers de la semaine : D-101 Atlas (N02, 6 500), D-102 Rif (N03, 3 000), D-103 Océan (N01 + N04, 10 000) et D-104 Maroc Textile (sans offre ni montant). Total des dossiers chiffrés : **19 500 MAD HT**.

## 5. Erreurs fréquentes

- Prompt trop court (« Fais le rapport hebdo ») : format imprévisible.
- Aucun format de sortie : impossible de comparer d'une semaine à l'autre.
- Fuseau horaire oublié : le rapport part à la mauvaise heure.

## 6. Bonnes pratiques

- Un humain contrôle les données à 16 h 30.
- Le rapport est un **brouillon interne**, jamais un envoi automatique.
- Aucun téléphone, e-mail ou IBAN dans le rapport.
`

const lesson3Body = `## 1. Définition : échouer proprement

Une automatisation « échoue proprement » quand, face à une donnée absente ou incohérente, elle **signale** au lieu d'**inventer**. Un rapport faux mais bien présenté est plus dangereux qu'un rapport qui avoue ses lacunes.

## 2. Scénario : D-104 sans montant

Le dossier D-104 (Maroc Textile) n'a ni offre ni montant.

| | Sortie |
|---|---|
| **Mauvaise** | « Total pipeline : 24 000 MAD HT. D-104 : N01 4 500 (estimé). » |
| **Bonne** | « Total chiffré : 19 500 MAD HT. D-104 : offre et montant À COMPLÉTER. Anomalie signalée. » |

Cause : le prompt ne disait pas quoi faire si une donnée manque. Claude a donc proposé une estimation plausible (19 500 + 4 500 = 24 000).

## 3. Le correctif dans le prompt

« Si un montant ou une offre est absent, écrire À COMPLÉTER, l'exclure des totaux, indiquer leur nombre et l'ajouter aux anomalies. Ne jamais estimer. »

## 4. Exemple NOVA

Après l'incident, Salma ajoute cette règle au prompt et un contrôle humain à 16 h 30 le vendredi. Lors de la semaine suivante, D-104 apparaît en anomalie et Karim rappelle le client.

## 5. Erreurs fréquentes

- Croire qu'un total « plausible » est acceptable.
- Corriger le rapport à la main sans corriger le prompt.
- Ne jamais relire le rapport parce qu'il est « automatique ».

## 6. Bonnes pratiques

- Prévoir dans le prompt chaque cas d'erreur connu.
- Dire où signaler (section Anomalies) et ce qu'on exclut des totaux.
- Garder une relecture humaine avant toute diffusion.
`

const weakPlannedPrompt = `Chaque vendredi, fais un rapport sur les dossiers. Mets les montants et dis-moi si c'est bien. Envoie-le à toute l'équipe avec les coordonnées des clients pour faciliter le suivi.`

/* -------------------------------------------------------------------------- */
/* Module                                                                      */
/* -------------------------------------------------------------------------- */

export const module6: Module = {
  id: 'm6',
  slug: 'm6-taches-planifiees',
  title: 'Module 6 — Tâches planifiées : automatiser le rythme',
  durationMin: 35,
  objectives: [
    'Distinguer manuel, tâche planifiée, workflow événementiel et agent.',
    'Rédiger un prompt de tâche planifiée autonome (rôle, données, règles, format, garde-fous).',
    'Configurer le rapport hebdomadaire NOVA du vendredi à 17 h (jour, heure, fuseau).',
    'Prévoir le cas d’erreur d’un montant manquant : « À COMPLÉTER », jamais d’estimation.',
    'Maintenir une relecture humaine avant toute diffusion.',
  ],
  situation:
    "Chaque vendredi après-midi, Nadia Ouazzani rassemble à la main l'état des dossiers NOVA pour Salma Benjelloun : Atlas, Rif, Océan, Maroc Textile. L'exercice prend une heure et dépend de sa disponibilité. Karim propose de confier ce rapport à Claude, chaque vendredi à 17 h. Salma pose une condition : le jour où un montant manque, le rapport doit le signaler et non l'inventer, et personne ne doit le recevoir sans relecture.",
  lessons: [
    {
      id: 'm6-l1',
      title: 'Manuel, planifié, événementiel, agent : choisir le bon mode',
      durationMin: 8,
      body: lesson1Body,
      keyTerms: [
        { term: 'Tâche planifiée', definition: 'Prompt exécuté automatiquement à une heure ou une récurrence donnée.' },
        { term: 'Workflow événementiel', definition: 'Traitement déclenché par un événement (nouvelle demande, changement de statut).' },
        { term: 'Agent', definition: 'Système qui décide lui-même de ses étapes pour atteindre un objectif.' },
      ],
    },
    {
      id: 'm6-l2',
      title: 'Le rapport du vendredi 17 h : un prompt autonome',
      durationMin: 10,
      body: lesson2Body,
      keyTerms: [
        { term: 'Prompt autonome', definition: 'Prompt complet qui n’attend aucune réponse humaine pendant l’exécution.' },
        { term: 'Fuseau horaire', definition: 'Référence de l’heure de déclenchement (Africa/Casablanca).' },
        { term: 'Expression cron', definition: 'Notation compacte d’une récurrence (0 17 * * 5 = chaque vendredi à 17 h).' },
      ],
    },
    {
      id: 'm6-l3',
      title: 'Échouer proprement : le scénario du montant manquant',
      durationMin: 7,
      body: lesson3Body,
      keyTerms: [
        { term: 'À COMPLÉTER', definition: 'Marqueur imposé pour toute donnée absente, exclue des totaux et listée en anomalie.' },
        { term: 'Anomalie', definition: 'Information manquante ou incohérente à signaler dans le rapport.' },
      ],
    },
  ],
  demo: {
    title: 'Configurer et simuler le rapport du vendredi 17 h',
    prerequisites: [
      `Accès à Claude ; fonction de tâche planifiée si disponible (${UI_VERIFY_NOTE}).`,
      'À défaut, le simulateur de planificateur local du module (aucun appel à Claude).',
      'Le tableau des quatre dossiers D-101 à D-104.',
    ],
    steps: [
      {
        number: 1,
        title: 'Choisir la fréquence',
        instruction: `Sélectionnez « Chaque vendredi à 17 h » (expression indicative 0 17 * * 5 ; syntaxe réelle : ${UI_VERIFY_NOTE}).`,
        expected: 'Jour = vendredi, heure = 17 h 00.',
      },
      {
        number: 2,
        title: 'Fixer le fuseau',
        instruction: 'Vérifiez que le fuseau horaire est Africa/Casablanca.',
        expected: 'Le déclenchement correspond à 17 h heure du Maroc.',
      },
      {
        number: 3,
        title: 'Coller le prompt autonome',
        instruction: 'Collez le prompt du rapport NOVA (rôle, données, règles, format, garde-fous).',
        expected: 'Le prompt contient la règle « À COMPLÉTER » et l’interdiction d’envoi.',
      },
      {
        number: 4,
        title: 'Lancer les six contrôles',
        instruction: 'Validez : jour, heure, prompt autonome, données manquantes, pas d’envoi, pas de donnée personnelle.',
        expected: 'Six contrôles au vert ; sinon corrigez le point signalé.',
      },
      {
        number: 5,
        title: 'Simuler sur les quatre dossiers',
        instruction: 'Lancez la simulation sur D-101 à D-104.',
        expected: 'Total des dossiers chiffrés : 19 500 MAD HT (6 500 + 3 000 + 10 000) ; D-104 en anomalie « À COMPLÉTER ».',
      },
      {
        number: 6,
        title: 'Comparer avec la mauvaise sortie',
        instruction: 'Retirez la règle « À COMPLÉTER » du prompt et relancez ; comparez avec le total erroné de 24 000.',
        expected: 'Sans la règle, la ligne D-104 est estimée : le total devient faux. Remettez la règle.',
      },
    ],
    expectedResult:
      'Une tâche configurée chaque vendredi à 17 h (Africa/Casablanca), un rapport en six parties, un total de 19 500 MAD HT et le dossier D-104 signalé en anomalie, sans montant inventé.',
    varianceNote:
      "Les sorties d'un modèle de langage varient d'une exécution à l'autre : tournures, ordre des actions recommandées ou mise en forme peuvent différer. Contrôlez le total, les anomalies et la mention de relecture, pas le texte mot pour mot.",
  },
  exercises: [
    {
      id: 'm6-e1',
      kind: 'classify',
      title: 'Associer chaque tâche NOVA au bon mode',
      instructions: 'Rangez chaque situation dans le mode d’exécution le plus adapté : manuel, planifié, événementiel ou agent.',
      durationMin: 5,
      categories: [
        { id: 'manuel', label: 'Manuel' },
        { id: 'planifie', label: 'Planifié' },
        { id: 'evenement', label: 'Workflow événementiel' },
        { id: 'agent', label: 'Agent' },
      ],
      cards: [
        { id: 'c1', text: 'Chaque vendredi à 17 h, produire le rapport des dossiers NOVA.', correctCategoryId: 'planifie', explanation: 'Le déclencheur est une heure et une récurrence.' },
        { id: 'c2', text: 'Un consultant colle une demande d’Atlas et lance le skill preparer-devis-nova.', correctCategoryId: 'manuel', explanation: 'Une personne déclenche la demande, ce qui convient à une tâche rare ou sensible.' },
        { id: 'c3', text: 'Dès qu’une nouvelle demande de devis arrive, extraire les données et contrôler la complétude.', correctCategoryId: 'evenement', explanation: 'L’arrivée de la demande est l’événement déclencheur.' },
        { id: 'c4', text: 'Analyser en autonomie un dossier client, consulter plusieurs sources et proposer un plan de réponse.', correctCategoryId: 'agent', explanation: 'Objectif ouvert : le système choisit ses étapes et outils ; à encadrer par des validations.' },
        { id: 'c5', text: 'Chaque 1er du mois à 9 h, synthétiser le chiffre d’affaires du mois précédent.', correctCategoryId: 'planifie', explanation: 'Récurrence mensuelle à heure fixe.' },
        { id: 'c6', text: 'Rédiger à la demande une réponse à un client mécontent.', correctCategoryId: 'manuel', explanation: 'Situation sensible et ponctuelle : contrôle humain élevé.' },
        { id: 'c7', text: 'Quand le statut d’un dossier passe à « validé », préparer un brouillon de proposition.', correctCategoryId: 'evenement', explanation: 'Le changement de statut déclenche le traitement.' },
        { id: 'c8', text: 'Faire explorer à un système un répertoire de documents et décider seul quels outils utiliser pour répondre à une question complexe.', correctCategoryId: 'agent', explanation: 'Le chemin n’est pas défini à l’avance : c’est un agent.' },
      ],
      hints: [
        { id: 'm6-e1-h1', level: 1, text: 'Cherchez le déclencheur : une personne, une heure, un événement ou un objectif ?' },
        { id: 'm6-e1-h2', level: 2, text: 'Les mots « chaque », « à 17 h », « le 1er du mois » indiquent une tâche planifiée.' },
      ],
    },
    {
      id: 'm6-e2',
      kind: 'comparison-table',
      title: 'Lire le comparatif des modes et l’appliquer',
      instructions: 'Étudiez le tableau puis répondez aux questions d’application.',
      durationMin: 5,
      hints: [
        { id: 'm6-e2-h1', level: 1, text: 'Reliez chaque question à la colonne « Déclencheur » ou « Contrôle humain ».' },
      ],
      table: {
        id: 'm6-t1',
        caption: 'Quatre façons de faire travailler Claude',
        columns: ['Déclencheur', 'Avantage principal', 'Limite principale', 'Contrôle humain'],
        rows: [
          { id: 'r1', label: 'Manuel', cells: ['Une personne', 'Contrôle total, idéal pour tester', 'Dépend de la disponibilité', 'Élevé'] },
          { id: 'r2', label: 'Planifié', cells: ['Une heure ou une récurrence', 'Régularité, format stable', 'Prompt autonome indispensable', 'Moyen'] },
          { id: 'r3', label: 'Événementiel', cells: ['Un événement', 'Réactivité', 'Connecteurs et tests plus complexes', 'Moyen'] },
          { id: 'r4', label: 'Agent', cells: ['Un objectif', 'Flexibilité sur tâches ouvertes', 'Moins prévisible, plus difficile à auditer', 'Faible'] },
        ],
        footnote: `Disponibilité de chaque mode : ${UI_VERIFY_NOTE}.`,
      },
      questions: [
        { id: 'q1', prompt: 'Quel mode choisir pour une première version du rapport, dont le format n’est pas encore stable ?', answer: 'Le mode manuel : on valide la qualité avant d’automatiser.' },
        { id: 'q2', prompt: 'Pourquoi le prompt planifié doit-il être plus complet qu’un prompt de conversation ?', answer: 'Parce que personne n’est là pour répondre ou corriger pendant l’exécution.' },
        { id: 'q3', prompt: 'Quel mode exige les permissions les plus strictes et une validation humaine renforcée ?', answer: 'L’agent, car son chemin est décidé dynamiquement et il est moins prévisible.' },
      ],
    },
    {
      id: 'm6-e3',
      kind: 'file-edit',
      format: 'markdown',
      title: 'Rédiger le prompt autonome du rapport du vendredi',
      instructions:
        "Complétez le squelette pour obtenir un prompt de tâche planifiée autonome : rôle, données, règles (jamais d'invention, « À COMPLÉTER », catalogue des prix, aucune donnée personnelle, aucun envoi), format de sortie en 6 parties et mention finale.",
      durationMin: 10,
      starter: `# Tâche planifiée — Rapport hebdomadaire des dossiers NOVA

Fréquence : chaque vendredi à 17 h (Africa/Casablanca)

## Rôle
Tu es l'assistant de pilotage commercial de NOVA Conseil.

## Données
À compléter.

## Règles
À compléter.

## Format de sortie
1. Résumé
2. À compléter

## Mention finale
À compléter.
`,
      solution: `# Tâche planifiée — Rapport hebdomadaire des dossiers NOVA

Fréquence : chaque vendredi à 17 h (Africa/Casablanca)

${FRIDAY_REPORT_PROMPT}
`,
      checks: [
        { id: 'c1', description: 'Un titre de niveau 1', type: 'md-has-heading', value: '1', failMessage: 'Conservez un titre commençant par « # ».' },
        { id: 'c2', description: 'Fréquence vendredi 17 h', type: 'regex', value: '[Vv]endredi[^\\n]*17\\s?h', failMessage: 'Indiquez « chaque vendredi à 17 h ».' },
        { id: 'c3', description: 'Règle « À COMPLÉTER » pour une donnée absente', type: 'contains', value: 'À COMPLÉTER', failMessage: 'Imposez le marqueur « À COMPLÉTER » pour toute donnée absente.' },
        { id: 'c4', description: 'Interdiction d’inventer', type: 'regex', value: 'Ne (jamais|pas) (inventer|estimer)', failMessage: 'Ajoutez « Ne jamais inventer un montant ».' },
        { id: 'c5', description: 'Section Anomalies', type: 'regex', value: '[Aa]nomalies', failMessage: 'Ajoutez une section « Anomalies ».' },
        { id: 'c6', description: 'Aucun envoi automatique', type: 'regex', value: '(Ne pas envoyer|brouillon)', failMessage: 'Précisez que le rapport est un brouillon, sans envoi.' },
        { id: 'c7', description: 'Aucune donnée personnelle', type: 'regex', value: 'donn[ée]es personnelles', failMessage: 'Interdisez les données personnelles (téléphone, e-mail, IBAN).' },
        { id: 'c8', description: 'Mention de relecture', type: 'contains', value: 'à relire avant diffusion', failMessage: 'Terminez par « Rapport automatique — à relire avant diffusion. »' },
        { id: 'c9', description: 'Liste de format numérotée ou à puces', type: 'md-has-list', failMessage: 'Présentez le format de sortie sous forme de liste.' },
      ],
      hints: [
        { id: 'm6-e3-h1', level: 1, text: 'Imaginez que vous partez en vacances : qu’a-t-il fallu écrire pour que le rapport soit correct sans vous ?' },
        { id: 'm6-e3-h2', level: 2, text: 'Règle clé : « Si un montant ou une offre est absent, écrire À COMPLÉTER, l’exclure des totaux et l’ajouter aux anomalies. »' },
        { id: 'm6-e3-h3', level: 3, text: 'Format en 6 parties : résumé, tableau des dossiers, totaux par statut, anomalies, 5 actions maximum, mention finale « Rapport automatique — à relire avant diffusion. »' },
      ],
      assets: [
        {
          id: 'm6-a-dossiers',
          filename: 'dossiers_semaine.csv',
          kind: 'copyable-text',
          mimeType: 'text/csv',
          description: 'Tableau des quatre dossiers de la semaine, dont D-104 sans montant.',
          content: `id,client,offre,montant_mad_ht,statut,derniere_maj
D-101,Atlas Distribution,N02,6500,valide,Mardi
D-102,Rif Atelier,N03,3000,en_attente,Mercredi
D-103,Océan Services,N01 + N04,10000,envoye,Jeudi
D-104,Maroc Textile,,,en_attente,Lundi
`,
        },
      ],
    },
    {
      id: 'm6-e4',
      kind: 'audit',
      title: 'Auditer un prompt planifié fragile',
      instructions: 'Relevez les défauts du prompt ci-dessous avant de comparer à la version améliorée.',
      durationMin: 5,
      target: weakPlannedPrompt,
      criteria: [
        { id: 'a1', label: 'Rôle et données', question: 'Le prompt précise-t-il le rôle et la source de données ?', expectedFinding: 'Aucun rôle, aucune source de données : le prompt n’est pas autonome.' },
        { id: 'a2', label: 'Donnée absente', question: 'Dit-il quoi faire si un montant manque ?', expectedFinding: 'Non : Claude estimera et faussera le total (24 000 au lieu de 19 500).' },
        { id: 'a3', label: 'Format de sortie', question: 'Le format est-il défini ?', expectedFinding: 'Non : « dis-moi si c’est bien » est subjectif, la sortie variera chaque semaine.' },
        { id: 'a4', label: 'Envoi automatique', question: 'Le rapport est-il un brouillon ?', expectedFinding: 'Non : il est envoyé à toute l’équipe sans relecture.' },
        { id: 'a5', label: 'Données personnelles', question: 'Les données personnelles sont-elles protégées ?', expectedFinding: 'Non : il demande d’inclure les coordonnées des clients.' },
      ],
      improvedVersion: FRIDAY_REPORT_PROMPT,
      hints: [
        { id: 'm6-e4-h1', level: 1, text: 'Pour chaque phrase, demandez-vous : « que fera Claude si la donnée est absente ? »' },
        { id: 'm6-e4-h2', level: 2, text: 'Trois risques sont critiques : estimation d’un montant, envoi automatique, coordonnées clients dans le rapport.' },
      ],
    },
  ],
  quiz: [
    mcq(
      'm6-q1',
      'Quel mode d’exécution correspond au rapport produit chaque vendredi à 17 h ?',
      ['Manuel', 'Planifié', 'Événementiel', 'Agent autonome'],
      1,
      'Le déclencheur est une heure et une récurrence : c’est une tâche planifiée.',
    ),
    mcq(
      'm6-q2',
      'Pourquoi le prompt d’une tâche planifiée doit-il être plus complet qu’un prompt de conversation ?',
      [
        'Parce que Claude comprend moins bien le vendredi',
        'Parce que personne n’est là pour répondre aux questions ou corriger en direct',
        'Parce que les tâches planifiées ne supportent que des prompts longs',
        'Parce que le format est imposé par la plateforme',
      ],
      1,
      'Sans interaction, le prompt doit préciser rôle, données, règles, format et cas d’erreur.',
    ),
    mcq(
      'm6-q3',
      'Dans le dossier D-104, le montant est absent. Quel comportement est attendu dans le rapport ?',
      [
        'Estimer le montant avec l’offre la plus probable',
        'Supprimer le dossier du rapport',
        'Afficher « À COMPLÉTER », exclure la ligne des totaux et la lister dans les anomalies',
        'Mettre 0 MAD pour que le total reste cohérent',
      ],
      2,
      'Une donnée absente doit être signalée, jamais inventée ni masquée. Le total correct est 19 500 MAD HT.',
    ),
    mcq(
      'm6-q4',
      'Quelle situation justifie plutôt un workflow événementiel qu’une tâche planifiée ?',
      [
        'Une synthèse hebdomadaire',
        'Une réaction immédiate dès qu’une nouvelle demande de devis arrive',
        'Un bilan mensuel',
        'Un rappel de réunion le lundi',
      ],
      1,
      'Quand le délai de réaction compte, l’événement (arrivée de la demande) doit déclencher le traitement.',
    ),
    mcq(
      'm6-q5',
      'Quelle règle de sécurité est indispensable pour le rapport automatique ?',
      [
        'Diffuser le rapport directement aux clients',
        'Produire un brouillon relu par un responsable, sans données personnelles inutiles',
        'Inclure les coordonnées bancaires pour faciliter le suivi',
        'Désactiver la relecture pour gagner du temps',
      ],
      1,
      'Le rapport est un brouillon interne : relecture humaine et minimisation des données personnelles.',
    ),
  ],
  practicalMission: {
    id: 'm6-mission',
    title: 'Mettre en place le rapport du vendredi 17 h',
    prompt:
      "Rédigez le prompt autonome du rapport hebdomadaire NOVA et paramétrez-le (ou simulez-le) pour chaque vendredi à 17 h, fuseau Africa/Casablanca. Testez-le sur les quatre dossiers D-101 à D-104 : vérifiez que le total chiffré vaut 19 500 MAD HT et que D-104 est signalé « À COMPLÉTER ». Ajoutez ensuite un dossier fictif D-105 sans offre ni montant et vérifiez que le total ne change pas. Données fictives uniquement.",
    deliverables: [
      'Prompt de la tâche planifiée (rôle, données, règles, format, mention finale)',
      'Paramètres : jour, heure, fuseau, expression indicative',
      'Résultat de la simulation sur D-101 à D-105',
      'Une phrase décrivant le cas d’erreur couvert et la règle ajoutée',
    ],
    successCriteria: [
      'Le total des dossiers chiffrés est 19 500 MAD HT (6 500 + 3 000 + 10 000).',
      'D-104 et D-105 figurent en anomalies « À COMPLÉTER » et sont exclus des totaux.',
      'Le prompt interdit l’envoi automatique et les données personnelles.',
      'La fréquence est bien le vendredi à 17 h.',
    ],
    estimatedMin: 10,
    assets: [
      {
        id: 'm6-a-prompt',
        filename: 'rapport_vendredi_prompt.md',
        kind: 'copyable-text',
        mimeType: 'text/markdown',
        description: 'Prompt de référence du rapport hebdomadaire NOVA.',
        content: FRIDAY_REPORT_PROMPT,
      },
    ],
  },
  verification: {
    id: 'm6-rubric',
    title: 'Grille de vérification — Module 6',
    maxPoints: 15,
    passThreshold: 10,
    criteria: [
      criterion('r1', 'Choix du mode', 'Le mode est justifié par le déclencheur et le niveau de risque.', levels(
        'Aucun mode justifié.',
        'Mode cité sans justification.',
        'Mode justifié par le déclencheur seulement.',
        'Mode justifié par le déclencheur et le niveau de contrôle humain.',
      )),
      criterion('r2', 'Prompt autonome', 'Rôle, données, règles et format sont présents.', levels(
        'Prompt d’une phrase.',
        'Un ou deux éléments sur quatre.',
        'Trois éléments sur quatre.',
        'Rôle, données, règles et format de sortie complets.',
      )),
      criterion('r3', 'Données manquantes', 'La règle « À COMPLÉTER » et l’exclusion des totaux sont prévues.', levels(
        'Aucune gestion des données absentes.',
        'Signalement sans exclusion des totaux.',
        'Règle « À COMPLÉTER » sans section Anomalies.',
        'Règle, exclusion des totaux et section Anomalies.',
      )),
      criterion('r4', 'Planification', 'Jour, heure et fuseau sont corrects.', levels(
        'Aucun paramètre correct.',
        'Un paramètre sur trois correct.',
        'Deux paramètres sur trois corrects.',
        'Vendredi, 17 h, Africa/Casablanca.',
      )),
      criterion('r5', 'Sécurité et relecture', 'Brouillon, pas de données personnelles, relecture humaine.', levels(
        'Envoi automatique ou données personnelles présentes.',
        'Un garde-fou sur trois.',
        'Deux garde-fous sur trois.',
        'Trois garde-fous présents et mention de relecture.',
      )),
    ],
  },
  synthesis: {
    takeaways: [
      'Le mode d’exécution se choisit selon le déclencheur (personne, heure, événement, objectif) et le niveau de risque : on commence manuel, on automatise ensuite.',
      'Une tâche planifiée tourne sans vous : son prompt doit être autonome et prévoir les cas d’erreur (« À COMPLÉTER » plutôt qu’une estimation, total correct 19 500 MAD HT).',
      'Le rapport reste un brouillon interne : aucune donnée personnelle, aucun envoi automatique, relecture humaine avant diffusion.',
    ],
    nextModule: {
      id: 'm7',
      slug: 'm7-agents-workflows',
      title: 'Module 7 — Agents et workflows',
      href: '/modules/m7-agents-workflows',
      teaser: 'Une tâche à heure fixe, c’est un début ; apprenez à enchaîner plusieurs étapes dans un workflow en 9 étapes avec validation humaine.',
    },
  },
  instructorNotes: [
    {
      id: 'm6-n1',
      topic: 'Quatre modes (8 min)',
      text: 'Présenter le tableau de comparaison ; faire placer trois tâches NOVA dans la bonne catégorie. Message : « Commencez manuel, automatisez ensuite. »',
      timingMin: 8,
      pitfalls: [`Les fonctions de planification varient selon le compte : ${UI_VERIFY_NOTE}.`],
    },
    {
      id: 'm6-n2',
      topic: 'Rapport du vendredi 17 h (10 min)',
      text: 'Dérouler la timeline de la semaine et le prompt autonome. « Personne n’est là pour répondre à 17 h : le prompt doit tout prévoir. »',
      timingMin: 10,
    },
    {
      id: 'm6-n3',
      topic: 'Simulateur de planificateur (10 min)',
      text: 'Guider la configuration : vendredi, 17 h, Africa/Casablanca ; valider les 6 contrôles ; lancer la simulation. Total attendu : 19 500 MAD HT.',
      timingMin: 10,
      pitfalls: ['Erreur fréquente : oublier la règle « À COMPLÉTER ».', 'Participants qui accordent une valeur à D-104 : rappeler « ne jamais estimer ».'],
    },
    {
      id: 'm6-n4',
      topic: 'Scénario D-104 et quiz (7 min)',
      text: 'Comparer la mauvaise sortie (24 000 estimés) à la bonne (19 500 + anomalie). Lancer ensuite le quiz de 5 questions et annoncer le module 7.',
      timingMin: 7,
    },
    {
      id: 'm6-n5',
      topic: 'Plan B sans Claude',
      text: 'Utiliser le simulateur local seul, faire écrire à la main la tâche et la vérifier avec les 6 contrôles, projeter la bonne et la mauvaise sortie du scénario D-104.',
    },
  ],
  references: [
    { id: 'm6-ref1', label: 'Documentation Claude : tâches planifiées', note: `Disponibilité, plans et limites : ${UI_VERIFY_NOTE}.`, verifyUi: true },
    { id: 'm6-ref2', label: 'Notation cron (rappel)', note: 'minute heure jour-du-mois mois jour-de-semaine ; 0 17 * * 5 = vendredi 17 h. Syntaxe réelle selon l’outil.', verifyUi: true },
  ],
  assets: [
    {
      id: 'm6-asset-prompt',
      filename: 'rapport_vendredi_prompt.md',
      kind: 'copyable-text',
      mimeType: 'text/markdown',
      description: 'Prompt autonome du rapport hebdomadaire NOVA.',
      content: FRIDAY_REPORT_PROMPT,
    },
  ],
}

export default module6
