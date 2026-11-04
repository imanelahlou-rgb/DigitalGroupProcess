/**
 * Support formateur — DPG Academy « Atelier Claude »
 *
 * Déroulé minute par minute des 8 modules + pause de 20 minutes.
 *
 * Durées alignées sur les modules de src/content/modules :
 *   M1 35 min · M2 45 min · M3 35 min · M4 40 min  (= 155 min)
 *   Pause 20 min
 *   M5 50 min · M6 35 min · M7 45 min · M8 55 min (= 185 min)
 *   Total : 360 min (6 h), hors déjeuner.
 *
 * Les types ci-dessous sont locaux (non couverts par types.ts, qui décrit le contenu des modules).
 *
 * Prix NOVA (MAD HT) : N01 Diagnostic digital 4 500 · N02 Organisation documentaire 6 500 · N03 Atelier IA initiation 3 000 · N04 Cartographie de processus 5 500 · N05 Accompagnement automatisation 9 000.
 * Atlas Distribution = N02 = 6 500 (budget 12 000) · Rif Atelier = N03 = 3 000 (budget 2 500) · Océan Services = N01 + N04 = 10 000 (budget 11 000).
 * Toute fonctionnalité Claude citée : à vérifier selon compte et version.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SegmentKind = 'expose' | 'demo' | 'atelier' | 'quiz' | 'debrief' | 'transition' | 'pause' | 'evaluation';

export interface RundownSegment {
  /** Minute de début, relative au début du module (0 = début) */
  fromMin: number;
  /** Minute de fin, relative au début du module */
  toMin: number;
  kind: SegmentKind;
  title: string;
  /** Ce que fait le formateur */
  trainerAction: string;
  /** Ce que font les participants */
  learnerAction: string;
  /** Points à dire à l'oral */
  oralNotes: string[];
  /** Pièges, questions fréquentes, signaux d'alerte */
  watchOut?: string[];
}

export interface ModuleRundown {
  moduleNumber: number | null;
  id: string;
  title: string;
  durationMin: number;
  objective: string;
  materials: string[];
  segments: RundownSegment[];
  oralKeyMessages: string[];
  planBWithoutClaude: PlanB;
  safetyReminders: string[];
}

export interface PlanB {
  trigger: string;
  steps: string[];
  materialsNeeded: string[];
  timeImpact: string;
}

export interface SafetyReminder {
  id: string;
  title: string;
  message: string;
  whenToSay: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  startClock: string;
  endClock: string;
  durationMin: number;
  startOffsetMin: number;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const pad = (n: number): string => String(n).padStart(2, '0');

export function addMinutes(clock: string, minutes: number): string {
  const [h, m] = clock.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

/* -------------------------------------------------------------------------- */
/* Rappels de sécurité transverses                                            */
/* -------------------------------------------------------------------------- */

export const globalSafetyReminders: SafetyReminder[] = [
  {
    id: 's1',
    title: 'Données fictives uniquement',
    message:
      'Pendant la formation, n’utilisez aucune donnée client réelle : noms, montants, contrats, coordonnées. Les cas Atlas Distribution, Rif Atelier et Océan Services sont fictifs.',
    whenToSay: 'Ouverture de la journée, puis avant chaque atelier.',
  },
  {
    id: 's2',
    title: 'Pas de secrets dans les prompts',
    message: 'Ne collez jamais de mot de passe, de clé d’API, d’IBAN ni de pièce d’identité dans Claude ou dans un fichier de projet.',
    whenToSay: 'Modules 3, 4, 5 et 8.',
  },
  {
    id: 's3',
    title: 'L’IA prépare, l’humain décide',
    message: 'Aucun devis, e-mail ou rapport n’est envoyé sans relecture et validation d’un consultant.',
    whenToSay: 'Modules 5, 6, 7 et à la clôture.',
  },
  {
    id: 's4',
    title: 'Vérifier les chiffres',
    message: 'Les montants engagent DPG. Recalculez toujours : N01 Diagnostic digital 4 500, N02 Organisation documentaire 6 500, N03 Atelier IA initiation 3 000, N04 Cartographie de processus 5 500, N05 Accompagnement automatisation 9 000 MAD HT.',
    whenToSay: 'Modules 5 et 7.',
  },
  {
    id: 's5',
    title: 'Permissions minimales',
    message: 'Pour les connecteurs, MCP et Claude Code : lecture seule quand c’est possible, périmètre limité, permissions lues avant d’accepter.',
    whenToSay: 'Modules 7 et 8.',
  },
  {
    id: 's6',
    title: 'Pas de remise ni d’offre inventée',
    message: 'Un skill ou un prompt ne doit jamais fabriquer de remise, de promotion ou d’offre absente du catalogue.',
    whenToSay: 'Module 5, cas Rif.',
  },
  {
    id: 's7',
    title: 'Fonctionnalités variables',
    message:
      'Skills, tâches planifiées, MCP, projets et Claude Code dépendent du plan, du compte et de la version : à vérifier selon compte et version avant la session.',
    whenToSay: 'Veille de la session et à l’ouverture.',
  },
  {
    id: 's8',
    title: 'Confidentialité de l’écran',
    message: 'Vérifiez que les notifications, onglets et fichiers ouverts ne révèlent aucune information confidentielle lors du partage d’écran.',
    whenToSay: 'Avant toute démonstration.',
  },
];

/* -------------------------------------------------------------------------- */
/* Déroulé par module                                                         */
/* -------------------------------------------------------------------------- */

const m1: ModuleRundown = {
  moduleNumber: 1,
  id: 'm1',
  title: 'Formats de fichiers : lire, produire, choisir',
  durationMin: 35,
  objective: 'Distinguer format, présentation et exécutable, et savoir demander à Claude le bon format de sortie.',
  materials: ['Compte Claude pour chaque participant', 'Projecteur', 'Support module 1', 'Grille tarifaire NOVA (CSV, JSON)'],
  segments: [
    {
      fromMin: 0, toMin: 5, kind: 'expose', title: 'Accueil et cadre de la journée',
      trainerAction: 'Présenter le fil rouge (NOVA Conseil, Atlas Distribution, Rif Atelier, Océan Services), le plan de la journée et les règles : données fictives, validation humaine.',
      learnerAction: 'Écouter, vérifier l’accès à leur compte.',
      oralNotes: ['« Aujourd’hui, vous construisez un mini-système de bout en bout. »', 'Rappeler la règle : aucune donnée client réelle.'],
      watchOut: ['Comptes non fonctionnels : le signaler immédiatement pour basculer sur le plan B.'],
    },
    {
      fromMin: 5, toMin: 15, kind: 'expose', title: 'Format, présentation, exécutable',
      trainerAction: 'Poser la question « Quelle différence entre un Word et un PDF ? » puis définir les trois familles et passer en revue les neuf extensions.',
      learnerAction: 'Poser des questions, donner des exemples d’usage.',
      oralNotes: ['Le format organise l’information, la présentation l’affiche, l’exécutable agit.', 'Un .bat ne se lance jamais sans relecture.'],
    },
    {
      fromMin: 15, toMin: 25, kind: 'demo', title: 'Une même information en trois formats',
      trainerAction: 'Faire produire CSV, JSON et Markdown à partir de la grille N01 à N05 ; laisser apparaître une variation de sortie.',
      learnerAction: 'Reproduire et vérifier les cinq prix.',
      oralNotes: ['Les prix : N01 Diagnostic digital 4 500, N02 Organisation documentaire 6 500, N03 Atelier IA initiation 3 000, N04 Cartographie de processus 5 500, N05 Accompagnement automatisation 9 000 MAD HT.', 'Utiliser la variation pour montrer l’intérêt de préciser la structure.'],
      watchOut: ['Ne pas promettre le téléchargement direct de fichiers : à vérifier selon compte et version.'],
    },
    {
      fromMin: 25, toMin: 32, kind: 'atelier', title: 'Exercices : Markdown, JSON, CSV',
      trainerAction: 'Circuler pendant les trois corrections de fichiers.',
      learnerAction: 'Corriger un JSON invalide, compléter un CSV, structurer une note.',
      oralNotes: ['Virgule finale et guillemets simples : les deux pièges du JSON.'],
    },
    {
      fromMin: 32, toMin: 35, kind: 'transition', title: 'Quiz et transition',
      trainerAction: 'Lancer le quiz ; annoncer le module 2.',
      learnerAction: 'Répondre au quiz.',
      oralNotes: ['Annoncer : « Maintenant, on apprend à structurer une demande complète avec RISEN. »'],
    },
  ],
  oralKeyMessages: ['Choisir le format selon le lecteur, la modification et le risque.', 'Toujours vérifier la sortie.'],
  planBWithoutClaude: {
    trigger: 'Aucun accès à Claude (panne, réseau, comptes).',
    steps: ['Projeter des sorties CSV, JSON et Markdown préparées', 'Faire repérer les erreurs de syntaxe glissées volontairement', 'Faire rédiger à la main la demande de format'],
    materialsNeeded: ['Captures d’écran (PDF)', 'Fichiers d’exemple avec erreurs'],
    timeImpact: 'Aucun : durée identique.',
  },
  safetyReminders: ['Données fictives uniquement', 'Ne jamais ouvrir un exécutable inconnu'],
}

const m2: ModuleRundown = {
  moduleNumber: 2,
  id: 'm2',
  title: 'Prompt engineering et cadre RISEN',
  durationMin: 45,
  objective: 'Construire un prompt en cinq blocs : Role (rôle), Input (données fournies), Steps (étapes), Expectation (livrable attendu), Narrowing (limites).',
  materials: ['Support module 2', 'Fiche RISEN', 'Prompt faible à auditer'],
  segments: [
    {
      fromMin: 0, toMin: 10, kind: 'expose', title: 'Le cadre RISEN',
      trainerAction: 'Présenter les cinq blocs R-I-S-E-N (Role, Input, Steps, Expectation, Narrowing) avec un exemple de demande de devis pour Atlas Distribution.',
      learnerAction: 'Prendre des notes.',
      oralNotes: ['Le Narrowing (limites) évite la plupart des dérives.', 'Plus l’input (données fournies) est précis, meilleure est la réponse.'],
    },
    {
      fromMin: 10, toMin: 30, kind: 'atelier', title: 'Atelier : compléter un gabarit RISEN',
      trainerAction: 'Faire écrire un prompt RISEN pour une demande type Atlas Distribution (organisation documentaire : N02 = 6 500, budget 12 000).',
      learnerAction: 'Rédiger, tester, comparer avec un binôme.',
      oralNotes: ['Dans le Narrowing (limites) : pas de remise, HT, validation humaine.'],
      watchOut: ['Participants qui acceptent un total faux : insister sur le recalcul.'],
    },
    {
      fromMin: 30, toMin: 40, kind: 'atelier', title: 'Auditer un prompt faible',
      trainerAction: 'Faire appliquer la grille RISEN à un prompt vague et le réécrire.',
      learnerAction: 'Relever les blocs manquants, proposer une version améliorée.',
      oralNotes: ['Un prompt qui marche une fois doit pouvoir devenir un skill (module 5).'],
    },
    {
      fromMin: 40, toMin: 45, kind: 'debrief', title: 'Debrief et quiz',
      trainerAction: 'Passer en revue les prompts avec la grille des cinq blocs ; lancer le quiz ; annoncer le module 3.',
      learnerAction: 'Auto-évaluer son prompt.',
      oralNotes: ['RISEN = structure reproductible.'],
    },
  ],
  oralKeyMessages: ['RISEN = structure reproductible : Role, Input, Steps, Expectation, Narrowing.', 'Le Narrowing (limites) protège.'],
  planBWithoutClaude: {
    trigger: 'Pas d’accès à Claude.',
    steps: ['Atelier papier : rédaction du prompt RISEN', 'Échange croisé entre binômes : critique avec la grille', 'Le formateur projette une réponse pré-générée à comparer'],
    materialsNeeded: ['Fiche RISEN imprimée', 'Réponse pré-générée'],
    timeImpact: 'Aucun.',
  },
  safetyReminders: ['Pas de secrets dans les prompts', 'Limites explicites'],
}

const m3: ModuleRundown = {
  moduleNumber: 3,
  id: 'm3',
  title: 'Design : identité visuelle, logo et charte graphique',
  durationMin: 35,
  objective: 'Distinguer identité, logo et charte, rédiger un brief de design et comparer trois directions de marque.',
  materials: ['Support module 3', 'Trois directions de marque NOVA (statiques)', 'Constructeur de brief'],
  segments: [
    {
      fromMin: 0, toMin: 8, kind: 'expose', title: 'Identité, logo, charte : trois notions',
      trainerAction: 'Définir chaque notion avec un exemple NOVA ; montrer un brief faible et un brief solide.',
      learnerAction: 'Observer et commenter.',
      oralNotes: ['Un brief précis fait gagner des itérations.'],
    },
    {
      fromMin: 8, toMin: 20, kind: 'atelier', title: 'Atelier : brief de design',
      trainerAction: 'Guider le constructeur de brief pour une page de synthèse de proposition.',
      learnerAction: 'Remplir les champs et vérifier la sortie.',
      oralNotes: ['Mettre « Brouillon — à valider » sur tout document généré.'],
    },
    {
      fromMin: 20, toMin: 30, kind: 'atelier', title: 'Comparer trois directions de marque',
      trainerAction: 'Faire comparer les trois directions sur des critères explicites avant de choisir.',
      learnerAction: 'Justifier un choix selon la cible et les risques.',
      oralNotes: ['Aucune direction n’est « la bonne » dans l’absolu.', 'Vérifier les licences de polices et les contrastes.'],
    },
    {
      fromMin: 30, toMin: 35, kind: 'debrief', title: 'Debrief et quiz',
      trainerAction: 'Relever les critères de choix ; lancer le quiz ; annoncer le module 4.',
      learnerAction: 'Partager un choix et sa justification.',
      oralNotes: ['Le design sert la décision.'],
    },
  ],
  oralKeyMessages: ['Le design sert la décision.', 'Comparer avant de choisir.'],
  planBWithoutClaude: {
    trigger: 'Pas d’accès à Claude.',
    steps: ['Maquette sur papier de la page de synthèse', 'Fiches imprimées des trois directions', 'Brief rédigé à la main'],
    materialsNeeded: ['Gabarit papier de page', 'Fiches des trois directions'],
    timeImpact: 'Aucun.',
  },
  safetyReminders: ['Aucune donnée client réelle dans les briefs', 'Droits des polices et images à vérifier'],
}

const m4: ModuleRundown = {
  moduleNumber: 4,
  id: 'm4',
  title: 'Projets, mémoire et contexte',
  durationMin: 40,
  objective: 'Choisir la bonne couche de contexte et organiser le travail dans un projet Claude.',
  materials: ['Support module 4', 'Catalogue NOVA fictif (fichier)', 'Modèle de proposition fictif', 'Simulateur de contexte'],
  segments: [
    {
      fromMin: 0, toMin: 10, kind: 'expose', title: 'Les couches de contexte',
      trainerAction: 'Présenter conversation, projet, mémoire, CLAUDE.md et skill, et leur rôle respectif.',
      learnerAction: 'Observer des exemples.',
      oralNotes: ['Chaque couche a un rôle ; les prix se vérifient toujours.'],
    },
    {
      fromMin: 10, toMin: 22, kind: 'atelier', title: 'Atelier : instructions et connaissances d’un projet',
      trainerAction: 'Montrer instructions de projet et fichiers de connaissances.',
      learnerAction: 'Créer le projet « NOVA — Propositions », y ajouter le catalogue.',
      oralNotes: ['Les instructions s’appliquent à toutes les conversations du projet. Disponibilité : à vérifier selon compte et version.'],
      watchOut: ['Ne pas importer de données clients réelles.'],
    },
    {
      fromMin: 22, toMin: 32, kind: 'atelier', title: 'Classer et simuler les couches',
      trainerAction: 'Faire classer dix éléments dans la bonne couche puis utiliser le simulateur de contexte.',
      learnerAction: 'Classer, observer la qualité de réponse selon les couches actives.',
      oralNotes: ['Le simulateur est statique : il illustre, il ne remplace pas un test réel.'],
    },
    {
      fromMin: 32, toMin: 40, kind: 'transition', title: 'Synthèse avant la pause',
      trainerAction: 'Résumer quatre modules ; lancer le quiz ; annoncer la pause de 20 minutes.',
      learnerAction: 'Poser leurs questions.',
      oralNotes: ['« Après la pause : on passe de l’usage à l’automatisation. »'],
    },
  ],
  oralKeyMessages: ['Un projet centralise contexte et connaissances.', 'Minimiser les données conservées.'],
  planBWithoutClaude: {
    trigger: 'Pas d’accès à Claude ou projets indisponibles.',
    steps: ['Dossier partagé avec catalogue et modèle (simule le projet)', 'Faire rédiger les instructions de projet sur une feuille', 'Classement des couches sur cartes imprimées'],
    materialsNeeded: ['Catalogue imprimé', 'Cartes de classement'],
    timeImpact: 'Aucun.',
  },
  safetyReminders: ['Aucune donnée client réelle dans les projets', 'Fonctionnalité Projets : à vérifier selon compte et version'],
}

const pause: ModuleRundown = {
  moduleNumber: null,
  id: 'pause',
  title: 'Pause',
  durationMin: 20,
  objective: 'Récupérer et préparer la seconde partie.',
  materials: ['Boissons', 'Liste de contrôle formateur'],
  segments: [
    {
      fromMin: 0, toMin: 3, kind: 'pause', title: 'Lancement de la pause',
      trainerAction: 'Annoncer l’heure exacte de reprise.',
      learnerAction: 'Sortir de la salle.',
      oralNotes: ['« Reprise à l’heure précise ; le module 5 est le plus dense. »'],
    },
    {
      fromMin: 3, toMin: 15, kind: 'pause', title: 'Pause libre',
      trainerAction: 'Préparer en parallèle : ouvrir le skill preparer-devis-nova, vérifier le simulateur, tester la connexion Claude. Répondre aux questions individuelles.',
      learnerAction: 'Pause.',
      oralNotes: [],
      watchOut: ['Vérifier que les skills sont activables sur au moins un compte : à vérifier selon compte et version.'],
    },
    {
      fromMin: 15, toMin: 20, kind: 'transition', title: 'Retour en salle',
      trainerAction: 'Accueillir, afficher la page d’accueil du module 5.',
      learnerAction: 'S’installer, ouvrir Claude.',
      oralNotes: ['Rappeler : on reste sur des données fictives.'],
    },
  ],
  oralKeyMessages: [],
  planBWithoutClaude: {
    trigger: 'Panne détectée pendant la pause.',
    steps: ['Décider avant la reprise de basculer en plan B pour le module concerné', 'Imprimer les sorties pré-générées des 5 cas'],
    materialsNeeded: ['Dossier plan B imprimé'],
    timeImpact: 'Aucun.',
  },
  safetyReminders: ['Verrouiller les écrans partagés', 'Fermer les notifications confidentielles'],
};

const m5: ModuleRundown = {
  moduleNumber: 5,
  id: 'm5',
  title: 'Skills',
  durationMin: 50,
  objective: 'Transformer une méthode en skill réutilisable et le tester sur 5 cas limites.',
  materials: [
    'Fichier SKILL.md preparer-devis-nova',
    'Fichier SKILL.md rediger-proposition-nova (optionnel)',
    'Éditeur de skill et simulateur à 5 cas',
    'Tableau des 5 cas : Atlas Distribution, Rif Atelier, Océan Services, incomplet, contradictoire',
  ],
  segments: [
    {
      fromMin: 0, toMin: 3, kind: 'transition', title: 'Ouverture du module',
      trainerAction: 'Rappeler le lien avec RISEN : un prompt qui marche devient un skill.',
      learnerAction: 'Écouter.',
      oralNotes: ['« Un prompt est une phrase ; un skill est une compétence d’équipe. »'],
    },
    {
      fromMin: 3, toMin: 8, kind: 'expose', title: 'Qu’est-ce qu’un skill ?',
      trainerAction: 'Définir : dossier + SKILL.md, activation via la description.',
      learnerAction: 'Écouter, questionner.',
      oralNotes: ['La description dit quoi faire ET quand l’utiliser.', 'Disponibilité : à vérifier selon compte et version.'],
    },
    {
      fromMin: 8, toMin: 18, kind: 'expose', title: 'Anatomie du SKILL.md',
      trainerAction: 'Montrer frontmatter YAML puis les 6 sections.',
      learnerAction: 'Suivre dans l’éditeur.',
      oralNotes: ['Frontmatter entre deux lignes de trois tirets.', 'name en kebab-case, identique au dossier.'],
      watchOut: ['Erreur fréquente : description trop vague ou sans déclencheur.'],
    },
    {
      fromMin: 18, toMin: 30, kind: 'demo', title: 'Lecture guidée de preparer-devis-nova',
      trainerAction: 'Parcourir le catalogue, la procédure en 6 étapes, les 4 statuts et les garde-fous.',
      learnerAction: 'Repérer dans le fichier chaque règle citée.',
      oralNotes: [
        'Prix exacts : N01 Diagnostic digital 4 500, N02 Organisation documentaire 6 500, N03 Atelier IA initiation 3 000, N04 Cartographie de processus 5 500, N05 Accompagnement automatisation 9 000 MAD HT.',
        'Atlas Distribution (organisation documentaire) : N02 = 6 500 dans 12 000, reliquat 5 500.',
        'Rif Atelier (formation IA) : N03 = 3 000 pour 2 500, +500 soit +20 %, aucune remise.',
        'Océan Services (diagnostic + cartographie) : N01 + N04 = 10 000 MAD HT dans 11 000, reliquat 1 000.',
      ],
    },
    {
      fromMin: 30, toMin: 45, kind: 'atelier', title: 'Atelier : tester sur 5 cas',
      trainerAction: 'Circuler, faire comparer sorties et attendus ; aider à corriger une ligne du skill.',
      learnerAction: 'Coller chaque demande, noter statut, total et mention de validation humaine.',
      oralNotes: ['Un skill se juge sur ses cas limites.', 'Cas incomplet : l’absence de total est le bon résultat.'],
      watchOut: ['Claude propose une remise pour Rif : corriger le skill, pas seulement la réponse.', 'Claude devine un budget pour le cas incomplet.'],
    },
    {
      fromMin: 45, toMin: 50, kind: 'quiz', title: 'Quiz (6 questions) et clôture',
      trainerAction: 'Lancer le quiz et corriger les erreurs fréquentes. Annoncer le module 6.',
      learnerAction: 'Répondre au quiz.',
      oralNotes: ['Option : rediger-proposition-nova pour les plus rapides, après validation du devis.'],
    },
  ],
  oralKeyMessages: [
    'Un skill industrialise la méthode.',
    'La description déclenche l’activation.',
    'Pas de remise inventée ; validation humaine toujours.',
  ],
  planBWithoutClaude: {
    trigger: 'Skills indisponibles sur le compte ou Claude inaccessible.',
    steps: [
      'Projeter le SKILL.md et le lire par blocs',
      'Distribuer les 5 demandes imprimées et les sorties attendues',
      'Faire jouer le rôle de « Claude » en binôme : l’un applique la procédure du skill, l’autre contrôle avec la checklist',
      'Utiliser l’éditeur pour la validation (8 contrôles) sans exécution IA',
    ],
    materialsNeeded: ['5 cas imprimés', 'SKILL.md imprimé', 'Checklist des 8 contrôles'],
    timeImpact: 'Atelier de 15 min conservé ; remplacer les appels IA par la simulation humaine.',
  },
  safetyReminders: [
    'Aucune remise ni offre inventée',
    'Validation humaine avant envoi',
    'Pas de données clients réelles dans le skill',
  ],
};

const m6: ModuleRundown = {
  moduleNumber: 6,
  id: 'm6',
  title: 'Tâches planifiées',
  durationMin: 35,
  objective: 'Distinguer les modes d’exécution et configurer le rapport du vendredi 17 h.',
  materials: ['Prompt du rapport NOVA', 'Simulateur de planificateur', 'Scénario D-104 (montant incomplet)'],
  segments: [
    {
      fromMin: 0, toMin: 8, kind: 'expose', title: 'Manuel, planifié, événementiel, agent',
      trainerAction: 'Présenter le tableau de comparaison ; faire placer 3 tâches DPG dans la bonne catégorie.',
      learnerAction: 'Classer des tâches.',
      oralNotes: ['Commencer manuel, automatiser ensuite.', 'Fonctionnalités de planification : à vérifier selon compte et version.'],
    },
    {
      fromMin: 8, toMin: 18, kind: 'expose', title: 'Le rapport du vendredi 17 h',
      trainerAction: 'Dérouler la timeline de la semaine et le prompt autonome.',
      learnerAction: 'Repérer rôle, données, règles, format, garde-fous.',
      oralNotes: ['Personne n’est là pour répondre à 17 h : le prompt doit tout prévoir.'],
    },
    {
      fromMin: 18, toMin: 28, kind: 'atelier', title: 'Simulateur de planificateur',
      trainerAction: 'Guider la configuration : vendredi, 17 h, Africa/Casablanca ; valider les 6 contrôles.',
      learnerAction: 'Configurer, lancer la simulation sur 4 dossiers.',
      oralNotes: ['Total attendu : 19 500 MAD HT (6 500 + 3 000 + 10 000).'],
      watchOut: ['Erreur fréquente : oublier la règle « À COMPLÉTER ».'],
    },
    {
      fromMin: 28, toMin: 32, kind: 'debrief', title: 'Scénario d’erreur : D-104 sans montant',
      trainerAction: 'Comparer mauvaise sortie (24 000 estimés) et bonne sortie (19 500 + anomalie).',
      learnerAction: 'Formuler le correctif du prompt.',
      oralNotes: ['Une automatisation doit échouer proprement.'],
    },
    {
      fromMin: 32, toMin: 35, kind: 'quiz', title: 'Quiz (5 questions)',
      trainerAction: 'Lancer le quiz, annoncer le module 7.',
      learnerAction: 'Répondre.',
      oralNotes: ['Prochaine étape : enchaîner plusieurs étapes dans un workflow.'],
    },
  ],
  oralKeyMessages: ['Prompt autonome = prompt complet.', 'Donnée absente = signalée, jamais estimée.', 'Relecture humaine avant diffusion.'],
  planBWithoutClaude: {
    trigger: 'Planification indisponible ou pas d’accès à Claude.',
    steps: [
      'Utiliser le simulateur local seul (aucun appel à Claude)',
      'Faire écrire à la main la tâche et la faire vérifier avec la liste des 6 contrôles',
      'Projeter la bonne et la mauvaise sortie du scénario D-104',
    ],
    materialsNeeded: ['Simulateur local', 'Fiche scénario D-104'],
    timeImpact: 'Aucun : le simulateur ne dépend pas de Claude.',
  },
  safetyReminders: ['Brouillon uniquement, pas d’envoi automatique', 'Aucune donnée personnelle dans le rapport'],
};

const m7: ModuleRundown = {
  moduleNumber: 7,
  id: 'm7',
  title: 'Agents et workflows',
  durationMin: 45,
  objective: 'Maîtriser le vocabulaire et concevoir le workflow NOVA en 9 étapes avec validation humaine.',
  materials: ['Diagramme interactif du workflow', 'Simulateur à 5 dossiers', 'Cartes à classer (12 + 8)', 'Fiche de conception de workflow (HITL)'],
  segments: [
    {
      fromMin: 0, toMin: 10, kind: 'expose', title: 'Vocabulaire : skill, outil, projet, workflow, planifié, agent',
      trainerAction: 'Définir LLM, outil, agent, workflow, orchestration, MCP, HITL avec une analogie chacun.',
      learnerAction: 'Reformuler un terme avec leurs mots.',
      oralNotes: ['Workflow = chemin prévu ; agent = chemin décidé par l’IA.', 'MCP connecte, il ne sécurise pas à lui seul. Disponibilité : à vérifier selon compte et version.'],
      watchOut: ['Confusion fréquente agent / workflow : insister sur l’ordre des étapes.'],
    },
    {
      fromMin: 10, toMin: 22, kind: 'demo', title: 'Le workflow NOVA en 9 étapes',
      trainerAction: 'Parcourir le diagramme, cliquer chaque nœud : entrée, sortie, risque, garde-fou.',
      learnerAction: 'Suivre et noter un risque par étape.',
      oralNotes: ['Étape 3 : sortie anticipée si budget absent.', 'Étape 6 : calcul par un outil, pas par le modèle.', 'Étape 8 : validation humaine avant l’envoi.'],
    },
    {
      fromMin: 22, toMin: 35, kind: 'atelier', title: 'Simulateur : 5 dossiers',
      trainerAction: 'Faire prédire le chemin avant de lancer ; débriefer chaque arrêt.',
      learnerAction: 'Prédire, simuler, comparer.',
      oralNotes: [
        'Atlas Distribution : 9 étapes, N02 6 500, reliquat 5 500.',
        'Rif : alerte +500 (+20 %) ; l’humain décide.',
        'Océan Services : N01 + N04 = 10 000 (budget 11 000, reliquat 1 000).',
        'Maroc Textile : arrêt à l’étape 3.',
        'Casa Santé Plus : arrêt à l’étape 4, N05 9 000 contre 4 000.',
      ],
    },
    {
      fromMin: 35, toMin: 41, kind: 'atelier', title: 'Cartes à classer et fiche de workflow',
      trainerAction: 'Lancer le tri des 12 cartes (skill, agent, outil, projet, workflow, tâche planifiée) puis la fiche de conception avec le point de validation humaine.',
      learnerAction: 'Classer, remplir la fiche, justifier l’approbation humaine en 3 à 5 phrases.',
      oralNotes: ['Réponse attendue : responsabilité, risque d’erreur, contexte, traçabilité.'],
    },
    {
      fromMin: 41, toMin: 45, kind: 'quiz', title: 'Quiz (6 questions) et transition',
      trainerAction: 'Lancer le quiz ; annoncer le module final.',
      learnerAction: 'Répondre.',
      oralNotes: ['« Dernier module : on assemble tout dans le défi Océan Services. »'],
    },
  ],
  oralKeyMessages: ['Autonomie minimale suffisante.', 'Un contrôle déterministe double l’IA pour les chiffres.', 'L’humain valide avant l’irréversible.'],
  planBWithoutClaude: {
    trigger: 'Pas d’accès à Claude.',
    steps: [
      'Le diagramme et le simulateur fonctionnent sans Claude : les utiliser normalement',
      'Faire jouer les 9 étapes en rôles (client, extracteur, contrôleur, rédacteur, consultant)',
      'Cartes à classer imprimées',
    ],
    materialsNeeded: ['Diagramme imprimé A3', 'Cartes imprimées', 'Cartes de rôles'],
    timeImpact: 'Aucun.',
  },
  safetyReminders: ['Permissions minimales', 'Validation humaine avant envoi', 'Pas de remise automatique'],
};

const m8: ModuleRundown = {
  moduleNumber: 8,
  id: 'm8',
  title: 'Claude Code et défi final Océan Services',
  durationMin: 55,
  objective: 'Découvrir Claude Code puis réaliser le défi final noté sur 100 points.',
  materials: ['CLAUDE.md d’exemple', 'Prompt de démo Claude Code', 'Fiche du défi (10 étapes)', 'Barème 100 points', 'Checklist sécurité'],
  segments: [
    {
      fromMin: 0, toMin: 8, kind: 'expose', title: 'Claude Code : principes et précautions',
      trainerAction: 'Présenter l’outil, le périmètre, les permissions.',
      learnerAction: 'Écouter.',
      oralNotes: ['Claude Code agit sur vos fichiers : prudence renforcée.', 'Installation et plans : à vérifier selon compte et version.'],
    },
    {
      fromMin: 8, toMin: 16, kind: 'expose', title: 'CLAUDE.md : la mémoire du projet',
      trainerAction: 'Commenter l’exemple : catalogue, commandes, règles, sécurité.',
      learnerAction: 'Repérer une règle vérifiable.',
      oralNotes: ['Aucun secret dans CLAUDE.md.'],
    },
    {
      fromMin: 16, toMin: 25, kind: 'demo', title: 'Démo : calculateur de devis NOVA',
      trainerAction: 'Lancer le prompt : demander le plan, valider, observer permissions et tests.',
      learnerAction: 'Observer et noter les 5 cas : Atlas Distribution, Rif Atelier, Océan Services, budget absent, code inconnu.',
      oralNotes: ['Lisez la demande de permission à voix haute.', 'Océan Services : 10 000 (budget 11 000) ; Rif Atelier : écart 500.'],
      watchOut: ['Ne jamais lancer la démo dans un dossier contenant des données réelles.', 'Si la démo échoue : plan B immédiat, ne pas déboguer en public plus de 2 minutes.'],
    },
    {
      fromMin: 25, toMin: 50, kind: 'evaluation', title: 'Défi final Océan Services (10 étapes)',
      trainerAction: 'Lancer le chrono ; circuler ; noter avec la grille de 100 points. Aider après 3 minutes de blocage.',
      learnerAction: 'Réaliser les 10 étapes : formats, RISEN, design, projet, skill (rédaction et test), tâche planifiée, workflow, code, sécurité.',
      oralNotes: [
        'Océan Services = N01 Diagnostic digital 4 500 + N04 Cartographie de processus 5 500 = 10 000 MAD HT (budget 11 000).',
        'Rappel du barème : 80 maîtrise, 60 acquis.',
        'Rappel : aucune remise, aucune donnée réelle, validation humaine.',
      ],
      watchOut: ['Participants qui passent trop de temps sur le design : recentrer sur skill et workflow (35 points).', 'Participants qui ajoutent des remises : rappeler la règle.'],
    },
    {
      fromMin: 50, toMin: 55, kind: 'debrief', title: 'Restitution, quiz et clôture',
      trainerAction: 'Restitutions de 2 minutes, quiz de 4 questions, remise des retours individuels.',
      learnerAction: 'Présenter, répondre au quiz.',
      oralNotes: ['Trois principes : l’IA prépare, l’humain décide ; cas limites ; sécurité dès la conception.', 'Attestation : modalités à confirmer par DPG.'],
    },
  ],
  oralKeyMessages: ['L’IA prépare, l’humain décide.', 'Cas limites avant mise en production.', 'Sécurité dès la conception.'],
  planBWithoutClaude: {
    trigger: 'Claude ou Claude Code inaccessible.',
    steps: [
      'Démo Claude Code : projeter les fichiers attendus et la sortie de tests pré-enregistrée (ou vidéo courte préparée)',
      'Défi : travail sur papier ou éditeur de texte avec les modèles fournis (RISEN, SKILL.md, tableau de workflow)',
      'Notation : évaluer la qualité des livrables écrits ; pour les étapes sans exécution, noter la conception (barème identique)',
      'Si seul Claude Code est indisponible : générer le code via la conversation Claude et le présenter',
    ],
    materialsNeeded: ['Vidéo ou captures de la démo', 'Gabarits imprimés', 'Barème imprimé'],
    timeImpact: 'Aucun ; prévoir 5 minutes de plus en restitution si le défi se fait sur papier.',
  },
  safetyReminders: [
    'Dossier de test dédié, sans données réelles',
    'Lire chaque permission',
    'Aucune clé d’API dans CLAUDE.md',
    'Vérifier les montants avant restitution',
  ],
};

/* -------------------------------------------------------------------------- */
/* Export principal                                                           */
/* -------------------------------------------------------------------------- */

/** Ordre de la journée : M1-M4, pause de 20 min, M5-M8. */
export const instructorRundown: ModuleRundown[] = [m1, m2, m3, m4, pause, m5, m6, m7, m8];

export const totalDurationMin: number = instructorRundown.reduce((sum, m) => sum + m.durationMin, 0); // 360

/** Construit l'agenda de la journée avec des heures réelles. */
export function buildAgenda(startClock = '09:00'): AgendaItem[] {
  let offset = 0;
  return instructorRundown.map((m) => {
    const item: AgendaItem = {
      id: m.id,
      title: m.moduleNumber ? `Module ${m.moduleNumber} — ${m.title}` : m.title,
      startClock: addMinutes(startClock, offset),
      endClock: addMinutes(startClock, offset + m.durationMin),
      durationMin: m.durationMin,
      startOffsetMin: offset,
    };
    offset += m.durationMin;
    return item;
  });
}

/** Vérifie que les segments d'un module couvrent exactement sa durée, sans trou ni chevauchement. */
export function validateRundown(rundown: ModuleRundown): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  let cursor = 0;
  for (const s of rundown.segments) {
    if (s.fromMin !== cursor) issues.push(`${rundown.id} : trou ou chevauchement à ${cursor} min (segment « ${s.title} »).`);
    cursor = s.toMin;
  }
  if (cursor !== rundown.durationMin) issues.push(`${rundown.id} : segments couvrent ${cursor} min au lieu de ${rundown.durationMin}.`);
  return { ok: issues.length === 0, issues };
}

/* -------------------------------------------------------------------------- */
/* Notes orales globales                                                      */
/* -------------------------------------------------------------------------- */

export const openingScript: string[] = [
  'Bienvenue à l’Atelier Claude de DPG Academy. Aujourd’hui, nous construisons ensemble, de bout en bout, un petit système de préparation de devis.',
  'Fil rouge : le catalogue NOVA, cinq offres de N01 à N05, et trois clients fictifs : Atlas Distribution, Rif Atelier et Océan Services.',
  'Trois règles : données fictives uniquement, validation humaine avant tout envoi, vérification systématique des chiffres.',
  'Certaines fonctionnalités dépendent de votre compte et de votre version : à vérifier selon compte et version. Si quelque chose ne marche pas chez vous, je vous donne une alternative immédiatement.',
];

export const closingScript: string[] = [
  'Résumons la journée en trois phrases : l’IA prépare, l’humain décide ; un système fiable se juge sur ses cas limites ; la sécurité se conçoit dès le départ.',
  'Vous repartez avec un skill de devis, un prompt de rapport hebdomadaire, un workflow en 9 étapes et un calculateur testé.',
  'Prochaine étape : appliquer sur 3 cas réels anonymisés, avec un responsable, avant de passer à plus grande échelle.',
];

/** Plan B global : bascule rapide si Claude est inaccessible pour toute la salle. */
export const globalPlanB: PlanB = {
  trigger: 'Claude indisponible pour tout le groupe (panne, réseau, comptes non activés).',
  steps: [
    'Annoncer calmement la bascule : « Nous passons en mode simulation, le contenu pédagogique reste identique. »',
    'Utiliser les simulateurs locaux (skill, planificateur, workflow), qui ne dépendent pas de Claude.',
    'Projeter les sorties pré-générées des cas Atlas Distribution, Rif Atelier, Océan Services, incomplet et contradictoire.',
    'Faire travailler les participants en binômes : l’un applique la procédure du skill à la main, l’autre contrôle avec la checklist.',
    'Pour le défi final : livrables sur papier ou éditeur, notés avec le même barème de 100 points.',
    'Remettre en fin de journée un accès aux modèles pour refaire les manipulations avec Claude.',
  ],
  materialsNeeded: [
    'Dossier plan B imprimé et en PDF',
    'Captures et vidéo courte des démos',
    'Sorties pré-générées des 5 cas',
    'Gabarits RISEN, SKILL.md, workflow',
    'Barème imprimé',
  ],
  timeImpact: 'Neutre pour les modules 1 à 7 ; prévoir 5 minutes supplémentaires de restitution au module 8.',
};

export const preSessionChecklist: string[] = [
  'Tester un compte Claude : conversation, projets, skills, tâches planifiées, Claude Code (à vérifier selon compte et version).',
  'Préparer le skill preparer-devis-nova et les 5 demandes de test.',
  'Vérifier que le catalogue est exact : N01 Diagnostic digital 4 500, N02 Organisation documentaire 6 500, N03 Atelier IA initiation 3 000, N04 Cartographie de processus 5 500, N05 Accompagnement automatisation 9 000 MAD HT.',
  'Imprimer ou exporter le dossier plan B.',
  'Fermer notifications, e-mails et onglets confidentiels avant le partage d’écran.',
  'Préparer un dossier de test vide pour la démo Claude Code, sans données réelles.',
  'Prévoir la pause de 20 minutes entre les modules 4 et 5.',
];
