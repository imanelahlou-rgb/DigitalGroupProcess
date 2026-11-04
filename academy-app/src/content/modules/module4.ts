import type { ComparisonTable, Module } from '../types'
import { criterion, levels } from '../helpers'
import { NOVA_SERVICES_CSV } from '../nova'

/* -------------------------------------------------------------------------- */
/* Tableau comparatif (source unique, réutilisé dans la leçon et l'exercice)  */
/* -------------------------------------------------------------------------- */

const comparisonTable: ComparisonTable = {
  id: 'm4-table',
  caption: 'Sept notions à distinguer pour gérer le contexte de Claude',
  columns: ['Notion', 'Ce que c’est', 'Portée', 'Durée de vie', 'Exemple NOVA', 'Point de vigilance'],
  rows: [
    {
      id: 'conversation',
      label: 'Conversation',
      cells: [
        'Conversation',
        'Un fil de messages avec Claude, où chaque échange s’ajoute au contexte.',
        'Cette conversation seulement.',
        'Tant que la conversation existe ; limitée par la taille de contexte.',
        'Demande ponctuelle : « Reformule ce mail à Rif Atelier ».',
        'Une nouvelle conversation ne reprend pas automatiquement l’historique d’une autre (sauf fonction de mémoire, à vérifier selon compte et version).',
      ],
    },
    {
      id: 'project',
      label: 'Projet',
      cells: [
        'Projet',
        'Un espace de travail regroupant des conversations, des instructions et des documents sur un même sujet.',
        'Toutes les conversations du projet.',
        'Persistante tant que le projet existe.',
        'Projet « Propositions commerciales NOVA ».',
        'Disponibilité et fonctionnement : à vérifier selon compte et version.',
      ],
    },
    {
      id: 'instructions',
      label: 'Instructions de projet',
      cells: [
        'Instructions de projet',
        'Consignes permanentes appliquées aux conversations du projet : rôle, ton, règles, format.',
        'Toutes les conversations du projet.',
        'Persistantes jusqu’à modification.',
        'Vouvoiement, ton sobre, ne jamais inventer de prix, citer les prix en MAD HT.',
        'Des instructions trop longues ou contradictoires dégradent la qualité ; les relire régulièrement.',
      ],
    },
    {
      id: 'knowledge',
      label: 'Connaissances du projet',
      cells: [
        'Connaissances du projet',
        'Documents ajoutés au projet (grilles, guides, modèles) que Claude peut consulter.',
        'Toutes les conversations du projet.',
        'Persistantes jusqu’au retrait du document.',
        'Grille tarifaire N01 à N05 au format CSV.',
        'Limites de taille et de formats : à vérifier selon compte et version. Ne pas y déposer de données sensibles non autorisées.',
      ],
    },
    {
      id: 'memory',
      label: 'Mémoire',
      cells: [
        'Mémoire',
        'Fonction qui peut retenir certaines informations utiles d’une conversation à l’autre.',
        'Selon le réglage : compte ou projet (à vérifier).',
        'Persistante jusqu’à suppression ou désactivation.',
        'Préférence de présentation : « réponses courtes, titres en gras ».',
        'Disponibilité, portée et contrôle de l’utilisateur : à vérifier selon compte et version. Ne pas y déposer d’informations sensibles.',
      ],
    },
    {
      id: 'claudemd',
      label: 'CLAUDE.md',
      cells: [
        'CLAUDE.md',
        'Fichier Markdown placé dans un dépôt de travail, lu par l’outil de développement Claude Code pour charger des consignes permanentes.',
        'Le dossier ou dépôt concerné.',
        'Persistante tant que le fichier existe (versionné avec le code).',
        'Règles de rédaction et de structure d’un dépôt de documentation NOVA.',
        'Concerne Claude Code, pas l’interface de conversation classique ; fonctionnement à vérifier selon la version.',
      ],
    },
    {
      id: 'skill',
      label: 'Skill',
      cells: [
        'Skill',
        'Dossier de consignes réutilisables (fichier SKILL.md et ressources) que Claude peut charger lorsqu’une tâche correspond.',
        'Selon l’installation : compte, projet ou poste (à vérifier).',
        'Persistante jusqu’au retrait du skill.',
        'Procédure « Rédiger une offre NOVA » avec gabarit et règles de calcul.',
        'Disponibilité et mode d’installation : à vérifier selon compte et version. Ne pas installer de skill de provenance inconnue.',
      ],
    },
  ],
  footnote:
    'Les noms et emplacements des fonctions peuvent évoluer : toute mention d’interface est « à vérifier selon compte et version ».',
}

function tableToMarkdown(t: ComparisonTable): string {
  const head = `| ${t.columns.join(' | ')} |`
  const sep = `|${t.columns.map(() => '---').join('|')}|`
  const rows = t.rows.map((r) => `| ${r.cells.join(' | ')} |`)
  return [head, sep, ...rows].join('\n')
}

/* -------------------------------------------------------------------------- */
/* Instructions de projet copiables                                            */
/* -------------------------------------------------------------------------- */

const projectInstructions = `# Rôle
Tu es l'assistant de rédaction commerciale de NOVA Conseil (cabinet fictif de conseil en organisation et transformation digitale, Casablanca).

# Règles permanentes
1. Réponds en français professionnel et sobre, avec vouvoiement.
2. N'utilise que les offres et prix de la grille tarifaire fournie dans les connaissances du projet. N'invente jamais d'offre, de prix, de délai ou de référence client.
3. Exprime tous les prix en MAD HT. Précise « HT » à chaque montant.
4. Si une information est manquante ou ambiguë, pose une question avant de rédiger.
5. Ne traite aucune donnée personnelle ni donnée de santé. Si l'utilisateur en fournit, demande de les retirer.

# Format par défaut
- Markdown, avec les titres : Contexte, Offre, Investissement, Prochaines étapes.
- 250 mots maximum, sauf demande contraire.
- Termine par une ligne « Points à vérifier » listant les hypothèses faites.

# Grille de référence
N01 Diagnostic digital — 4 500 MAD HT
N02 Organisation documentaire — 6 500 MAD HT
N03 Atelier IA initiation — 3 000 MAD HT
N04 Cartographie de processus — 5 500 MAD HT
N05 Accompagnement automatisation — 9 000 MAD HT
`

/* -------------------------------------------------------------------------- */
/* Leçons                                                                      */
/* -------------------------------------------------------------------------- */

const lesson1Body = `## 1. Pourquoi parler de contexte ?

Dans les modules précédents, vous avez écrit des prompts complets. Réécrire à chaque fois le rôle, le ton, les prix et les règles est long et source d'oublis. Les fonctions de **projet** et de **mémoire** servent à conserver le contexte utile **ailleurs que dans votre message**.

## 2. Définitions

- **Contexte** : tout ce que Claude peut « voir » au moment de répondre : votre message, l'historique de la conversation, et, selon les fonctions utilisées, des instructions et documents persistants.
- **Conversation** : un fil de messages ; son contenu constitue le contexte de ce fil.
- **Projet** : un espace regroupant conversations, instructions et connaissances autour d'un sujet.
- **Instructions de projet** : consignes permanentes, appliquées dans le projet.
- **Connaissances du projet** : documents que Claude peut consulter dans le projet.
- **Mémoire** : fonction de rétention d'informations entre conversations.
- **CLAUDE.md** : fichier de consignes permanentes pour l'outil Claude Code, rangé dans un dépôt.
- **Skill** : dossier de consignes et ressources réutilisables, chargé quand la tâche s'y prête.

Toutes ces fonctions sont **dépendantes du compte et de la version** : « à vérifier selon compte et version ».

## 3. Explication approfondie : comparer les sept notions

${tableToMarkdown(comparisonTable)}

${comparisonTable.footnote}

### Trois idées à retenir

1. **Une fenêtre de contexte est limitée.** Plus on y met de texte, plus la qualité et la focalisation peuvent diminuer ; on cherche donc à n'y mettre que l'utile.
2. **Persistant ne veut pas dire fiable.** Une instruction de projet n'est pas une règle infaillible : Claude peut se tromper ou la suivre imparfaitement. La relecture reste nécessaire.
3. **Chaque couche a son rôle.** Les règles stables vont dans les instructions ; les documents de référence dans les connaissances ; la demande du moment dans la conversation.

## 4. Exemple NOVA

Pour préparer des propositions, NOVA crée un projet « Propositions commerciales ». Les **instructions** fixent le ton et la règle « n'invente aucun prix ». La **grille tarifaire CSV** est déposée dans les **connaissances**. À chaque nouvelle conversation (une par client), Salma n'écrit plus que la demande : « Rédige l'offre N02 (6 500 MAD HT) pour Atlas Distribution ».

## 5. Erreurs fréquentes

- Tout mettre dans les instructions, y compris des documents longs qui devraient être des connaissances.
- Supposer que Claude « se souvient » d'une conversation passée sans que la mémoire soit active.
- Déposer des données personnelles, des contrats ou des informations sensibles sans autorisation.
- Confondre CLAUDE.md (Claude Code) avec les instructions de projet (interface de conversation).
- Ne jamais relire ni mettre à jour les instructions.

## 6. Bonnes pratiques

- **Séparez** les règles stables (instructions), les références (connaissances) et la demande (conversation).
- Versionnez vos documents : nommez la grille « nova_tarifs_2026.csv » et retirez l'ancienne version.
- Testez le projet avec deux ou trois demandes types avant de le partager.
- Limitez les informations stockées au strict nécessaire.
`

const lesson2Body = `## 1. Définition : des instructions de projet efficaces

Les **instructions de projet** sont un petit « règlement intérieur » pour Claude dans le projet : qui il est, comment il répond, ce qu'il ne doit pas faire. Elles s'écrivent comme un prompt RISEN (module 2), mais pour des règles **durables**.

## 2. Explication approfondie

### Ce qui va dans les instructions
- Rôle et public.
- Langue, ton, niveau de formalité.
- Règles de fiabilité (ne rien inventer, citer la source, poser des questions).
- Format de sortie par défaut.
- Interdits (données sensibles, promesses).

### Ce qui va dans les connaissances
- Grilles de prix, modèles de documents, glossaires, fiches de procédures.
- Tout document que l'on veut **réutiliser sans le recoller**.

### Ce qui reste dans la conversation
- La demande du moment, les données spécifiques au client, les corrections.

### Un gabarit copiable pour NOVA

~~~
${projectInstructions}
~~~

Ce texte est fourni dans les ressources du module, prêt à copier. L'emplacement exact où le coller dans l'interface dépend du compte et de la version (« à vérifier selon compte et version »).

## 3. Exemple NOVA

Karim crée le projet, colle les instructions ci-dessus, dépose le fichier \`nova_tarifs.csv\` (grille N01 à N05) dans les connaissances et teste :

- *« Rédige l'offre N03 pour Rif Atelier. »* → réponse structurée avec 3 000 MAD HT.
- *« Rédige l'offre N06. »* → Claude doit signaler que cette offre n'existe pas dans la grille (comportement à vérifier ; ne pas supposer).
- *« Voici le dossier médical d'un patient… »* → Claude doit refuser de traiter la donnée sensible et inviter à la retirer.

Ces tests permettent de mesurer le respect des règles.

## 4. Erreurs fréquentes

- Instructions de 3 pages, contradictoires ou obsolètes.
- Règles formulées de manière négative uniquement (« ne fais pas ça ») sans dire quoi faire.
- Absence de test après modification.
- Confiance aveugle : une règle ne garantit pas son application à 100 %.

## 5. Bonnes pratiques

- Une idée par ligne, numérotées pour pouvoir les citer.
- Une **date de dernière mise à jour** en bas des instructions.
- Une seule personne responsable de la mise à jour dans l'équipe.
- Après chaque changement de la grille tarifaire, mettre à jour le fichier de connaissances **et** le texte des instructions s'il cite des prix.
- Garder une copie des instructions hors de Claude (document partagé), pour pouvoir les restaurer.
`

const lesson3Body = `## 1. Mémoire, CLAUDE.md, Skills : ne pas tout mélanger

### Mémoire
Selon l'interface, une fonction de **mémoire** peut retenir des préférences ou des faits d'une conversation à l'autre. Sa disponibilité, sa portée (compte ou projet) et les contrôles offerts à l'utilisateur sont **à vérifier selon compte et version**. Utilisez-la pour des préférences **non sensibles** (format, ton), jamais pour des données confidentielles.

### CLAUDE.md
Fichier Markdown utilisé par **Claude Code**, outil destiné au développement, qui lit au démarrage les consignes d'un dossier. Il s'agit de règles permanentes liées à un **dépôt de travail** (conventions, commandes, structure). Il n'a pas de rôle direct dans l'interface de conversation classique.

### Skill
Un **skill** est un dossier de consignes (avec un fichier de description) et éventuellement de ressources, que Claude peut charger quand une tâche s'y prête. Exemple : « Rédiger une offre NOVA » avec gabarit et règles. Disponibilité et installation : **à vérifier selon compte et version**.

## 2. Explication approfondie : comment choisir ?

| Si vous voulez… | Pensez à… |
|---|---|
| Poser une question ponctuelle | Une conversation |
| Réutiliser des règles dans tout un sujet | Les instructions de projet |
| Réutiliser des documents de référence | Les connaissances du projet |
| Retenir des préférences durables non sensibles | La mémoire (si disponible) |
| Donner des règles à Claude Code dans un dépôt | Un fichier CLAUDE.md |
| Packager une procédure réutilisable | Un skill (si disponible) |

## 3. Exemple NOVA

Nadia range les éléments ainsi :

- « Toujours vouvoyer » → **instructions de projet**.
- « Grille tarifaire N01 à N05 » → **connaissances du projet**.
- « Mon format préféré : réponses courtes » → **mémoire** (si activée, et uniquement pour une préférence).
- « Règles de nommage des fichiers du dépôt documentation » → **CLAUDE.md** (si l'équipe utilise Claude Code).
- « Procédure de rédaction d'une offre avec calcul du total » → **skill** (si disponible).
- « Reformule ce paragraphe » → **conversation**.

## 4. Erreurs fréquentes

- Mettre dans la mémoire des informations qui devraient être dans des connaissances versionnées.
- Croire que la mémoire remplace des instructions rigoureuses.
- Installer un skill ou un fichier de consignes provenant d'une source inconnue : il peut contenir des instructions indésirables.
- Mélanger des consignes contradictoires entre les différentes couches.

## 5. Bonnes pratiques

- Donnez une **source de vérité** à chaque information (un seul endroit à jour).
- Auditez régulièrement ce que contiennent les instructions, les connaissances et la mémoire.
- Rédigez une **politique d'équipe** : qui peut modifier quoi, quelles données sont interdites.
- Rappelez qu'aucune de ces fonctions ne dispense de relire les productions de Claude.
- La mention « à vérifier selon compte et version » vaut pour toute capture d'écran ou procédure d'interface.
`

/* -------------------------------------------------------------------------- */
/* Module                                                                      */
/* -------------------------------------------------------------------------- */

export const module4: Module = {
  id: 'm4',
  slug: 'm4-projets-memoire-contexte',
  title: 'Module 4 — Projets, mémoire et contexte',
  durationMin: 40,
  objectives: [
    'Distinguer conversation, projet, instructions, connaissances, mémoire, CLAUDE.md et skill.',
    'Rédiger des instructions de projet claires et testables pour NOVA.',
    'Classer des informations dans la bonne couche de contexte.',
    "Mesurer l'effet de chaque couche de contexte sur une réponse (simulateur).",
    'Appliquer des règles de prudence sur les données stockées.',
  ],
  situation:
    "NOVA Conseil rédige plusieurs propositions par semaine et chaque collaborateur recolle à la main le ton, les règles et la grille tarifaire dans Claude. Des erreurs de prix apparaissent : un devis N04 affichait 5 000 au lieu de 5 500 MAD HT. Salma Benjelloun veut que les règles et la grille soient définies une fois, au même endroit, et que chacun n'écrive plus que la demande du moment. L'équipe doit donc comprendre ce que font réellement un projet, des instructions, des connaissances et la mémoire.",
  lessons: [
    {
      id: 'm4-l1',
      title: 'Les couches de contexte : conversation, projet, mémoire et au-delà',
      durationMin: 15,
      body: lesson1Body,
      keyTerms: [
        { term: 'Contexte', definition: 'Ensemble des informations visibles par Claude au moment de répondre.' },
        { term: 'Projet', definition: 'Espace regroupant conversations, instructions et connaissances.' },
        { term: 'CLAUDE.md', definition: "Fichier de consignes permanentes lu par Claude Code." },
        { term: 'Skill', definition: 'Dossier de consignes et ressources réutilisables.' },
      ],
    },
    {
      id: 'm4-l2',
      title: 'Écrire les instructions et organiser les connaissances d’un projet',
      durationMin: 15,
      body: lesson2Body,
    },
    {
      id: 'm4-l3',
      title: 'Mémoire, CLAUDE.md et skills : choisir la bonne couche',
      durationMin: 10,
      body: lesson3Body,
    },
  ],
  demo: {
    title: 'Créer un projet « Propositions NOVA » et tester son contexte',
    prerequisites: [
      'Accès à Claude avec la fonction de projets (disponibilité : à vérifier selon compte et version).',
      'Le texte d’instructions de projet NOVA (ressource du module).',
      'Le fichier nova_tarifs.csv (ressource du module).',
    ],
    steps: [
      {
        number: 1,
        title: 'Créer le projet',
        instruction: 'Créez un projet nommé « Propositions NOVA » (libellés et emplacement du bouton : à vérifier selon compte et version).',
        expected: 'Un espace de projet vide s’ouvre.',
      },
      {
        number: 2,
        title: 'Ajouter les instructions',
        instruction: 'Copiez le texte d’instructions NOVA fourni et collez-le dans le champ des instructions du projet.',
        expected: 'Les instructions sont enregistrées et visibles dans les paramètres du projet.',
      },
      {
        number: 3,
        title: 'Ajouter la connaissance',
        instruction: 'Ajoutez le fichier nova_tarifs.csv dans les connaissances du projet.',
        expected: 'Le fichier apparaît dans la liste des connaissances.',
      },
      {
        number: 4,
        title: 'Tester avec une demande courte',
        instruction: 'Dans une conversation du projet, demandez : « Rédige l’offre N02 pour Atlas Distribution. »',
        expected: 'Une offre structurée selon le format par défaut, avec 6 500 MAD HT.',
      },
      {
        number: 5,
        title: 'Tester une limite',
        instruction: 'Demandez : « Rédige l’offre N06 pour Atlas Distribution. »',
        expected: 'Claude signale que cette offre ne figure pas dans la grille ; vous notez le comportement observé.',
      },
      {
        number: 6,
        title: 'Comparer hors projet',
        instruction: 'Dans une conversation sans projet, posez la même demande N02.',
        expected: 'Réponse plus générique ou demandes de précisions, car ni instructions ni grille ne sont disponibles.',
      },
    ],
    expectedResult:
      "Une démonstration de la différence entre une demande sans contexte persistant et la même demande dans un projet disposant d'instructions et de connaissances.",
    varianceNote:
      "L'interface, les libellés et même la disponibilité des projets varient (à vérifier selon compte et version). Les réponses de Claude varient aussi d'une exécution à l'autre : vérifiez le contenu (prix N02 = 6 500 MAD HT), pas l'identité mot pour mot avec l'exemple.",
  },
  exercises: [
    {
      id: 'm4-e1',
      kind: 'comparison-table',
      title: 'Lire et appliquer le tableau comparatif',
      instructions:
        "Étudiez le tableau des sept notions, puis répondez aux trois questions d'application. Chaque réponse doit citer la notion et la raison du choix.",
      durationMin: 8,
      table: comparisonTable,
      questions: [
        {
          id: 'q1',
          prompt: "La grille tarifaire NOVA change chaque année. Où la placer pour qu'elle serve à toutes les conversations d'un projet ?",
          answer: 'Dans les connaissances du projet, sous forme de fichier versionné (ex. nova_tarifs_2026.csv), et non dans la mémoire.',
        },
        {
          id: 'q2',
          prompt: "Une règle de ton (« vouvoiement, sobre ») doit s'appliquer dans toutes les conversations d'un projet. Où l'écrire ?",
          answer: "Dans les instructions de projet.",
        },
        {
          id: 'q3',
          prompt: 'Une équipe technique de NOVA utilise Claude Code sur un dépôt de documentation. Où placer ses conventions de rédaction ?',
          answer: 'Dans un fichier CLAUDE.md à la racine du dépôt (si Claude Code est utilisé ; à vérifier selon la version).',
        },
      ],
      hints: [
        { id: 'm4-e1-h1', level: 1, text: 'Cherchez la colonne « Portée » : qui voit l’information ?' },
        { id: 'm4-e1-h2', level: 2, text: 'Un document de référence → connaissances. Une règle permanente → instructions.' },
        { id: 'm4-e1-h3', level: 3, text: 'CLAUDE.md concerne Claude Code, pas l’interface de conversation classique.' },
      ],
    },
    {
      id: 'm4-e2',
      kind: 'classify',
      title: 'Classer dix éléments dans la bonne couche',
      instructions:
        'Pour chaque carte, choisissez la couche de contexte la plus adaptée. Une explication est affichée après chaque réponse.',
      durationMin: 8,
      categories: [
        { id: 'conversation', label: 'Conversation' },
        { id: 'instructions', label: 'Instructions de projet' },
        { id: 'knowledge', label: 'Connaissances du projet' },
        { id: 'memory', label: 'Mémoire' },
        { id: 'claudemd', label: 'CLAUDE.md' },
        { id: 'skill', label: 'Skill' },
      ],
      cards: [
        { id: 'k1', text: 'La grille tarifaire N01 à N05 au format CSV', correctCategoryId: 'knowledge', explanation: 'Document de référence réutilisable : connaissances du projet.' },
        { id: 'k2', text: '« Réponds toujours en français, avec vouvoiement. »', correctCategoryId: 'instructions', explanation: 'Règle permanente applicable à toutes les conversations du projet.' },
        { id: 'k3', text: "« Reformule ce paragraphe pour qu'il soit plus court. »", correctCategoryId: 'conversation', explanation: 'Demande ponctuelle : reste dans la conversation.' },
        { id: 'k4', text: 'Préférence durable : « je préfère des réponses courtes en puces »', correctCategoryId: 'memory', explanation: 'Préférence non sensible, adaptée à la mémoire (si disponible, à vérifier selon compte et version).' },
        { id: 'k5', text: 'Conventions de nommage des fichiers du dépôt de documentation NOVA, pour Claude Code', correctCategoryId: 'claudemd', explanation: 'Consignes permanentes liées à un dépôt de travail : CLAUDE.md.' },
        { id: 'k6', text: 'Procédure réutilisable « Rédiger une offre NOVA » avec gabarit et règles de calcul du total', correctCategoryId: 'skill', explanation: 'Procédure packagée et réutilisable : skill (si disponible).' },
        { id: 'k7', text: 'Gabarit de proposition commerciale NOVA au format Markdown', correctCategoryId: 'knowledge', explanation: 'Document modèle à consulter : connaissances du projet.' },
        { id: 'k8', text: '« N’invente jamais de prix : utilise uniquement la grille fournie. »', correctCategoryId: 'instructions', explanation: 'Règle de fiabilité permanente : instructions de projet.' },
        { id: 'k9', text: 'Les chiffres du client Atlas Distribution collés pour une analyse unique aujourd’hui', correctCategoryId: 'conversation', explanation: 'Donnée spécifique et ponctuelle : conversation, et seulement si autorisée.' },
        { id: 'k10', text: 'Liste des termes métiers NOVA avec leur définition', correctCategoryId: 'knowledge', explanation: 'Glossaire de référence : connaissances du projet.' },
      ],
      hints: [
        { id: 'm4-e2-h1', level: 1, text: 'Demandez-vous : est-ce une règle, un document ou une demande ponctuelle ?' },
        { id: 'm4-e2-h2', level: 2, text: 'Les règles → instructions ; les documents → connaissances ; la demande → conversation.' },
        { id: 'm4-e2-h3', level: 3, text: 'CLAUDE.md : seulement pour Claude Code. Skill : procédure packagée.' },
      ],
    },
    {
      id: 'm4-e3',
      kind: 'context-simulator',
      title: 'Simulateur de contexte : que change chaque couche ?',
      instructions:
        'Activez ou désactivez les quatre couches ci-dessous puis observez la réponse simulée à la même demande. Notez en trois lignes ce que chaque couche apporte.',
      durationMin: 8,
      userRequest: 'Rédige l’offre N02 pour Atlas Distribution.',
      disclaimer:
        "Simulation pédagogique statique : les réponses ci-dessous sont écrites à l'avance et illustrent des effets plausibles. Elles ne proviennent pas d'un appel à Claude. Les résultats réels varient selon compte, version et exécution. Règle d'affichage : on retient la combinaison de couches la plus complète parmi celles actives.",
      layers: [
        { id: 'conversation', label: 'Historique de la conversation', description: 'Messages précédents du même fil.', sample: 'Plus tôt dans ce fil : « Atlas Distribution cherche à améliorer son organisation documentaire. »' },
        { id: 'instructions', label: 'Instructions de projet', description: 'Règles permanentes de ton, de format et de fiabilité.', sample: 'Vouvoiement, ton sobre, prix en MAD HT, ne rien inventer, 250 mots maximum, titres imposés.' },
        { id: 'knowledge', label: 'Connaissances du projet', description: 'Grille tarifaire CSV déposée dans le projet.', sample: 'N02, Organisation documentaire, 5 jours, 6 500 MAD HT.' },
        { id: 'memory', label: 'Mémoire', description: 'Préférence non sensible retenue.', sample: 'Préférence : réponses courtes, présentées avec des puces.' },
      ],
      outcomes: [
        {
          requires: [],
          quality: 1,
          response:
            "Voici une proposition type pour Atlas Distribution : nous proposons une organisation documentaire, pour un tarif de 8 000 dirhams.",
          commentary:
            "Aucun cadre : le prix est inventé, le ton est quelconque et rien ne signale l'absence de source. Cas typique de réponse non fiable.",
        },
        {
          requires: ['instructions'],
          quality: 2,
          response:
            "Pour établir l'offre N02, je dois confirmer son prix, car aucune grille n'est disponible dans ce contexte. Pouvez-vous me la communiquer ?",
          commentary:
            'Les instructions imposent de ne pas inventer : Claude demande l’information. Fiable, mais incomplet.',
        },
        {
          requires: ['knowledge'],
          quality: 3,
          response:
            'Offre N02 — Organisation documentaire : 5 jours, 6 500 MAD HT. Nous structurons vos dossiers et créons des modèles de documents.',
          commentary:
            'Le prix est correct grâce à la grille, mais la structure et le ton ne sont pas imposés : résultat inégal.',
        },
        {
          requires: ['memory'],
          quality: 2,
          response:
            '- Offre : organisation documentaire.\n- Prix : à confirmer.\n- Durée : à confirmer.',
          commentary:
            'La préférence de forme est respectée, mais sans grille ni règles, les informations clés manquent.',
        },
        {
          requires: ['instructions', 'knowledge'],
          quality: 4,
          response:
            '**Contexte** — Atlas Distribution souhaite améliorer son organisation documentaire.\n\n**Offre** — N02 Organisation documentaire, 5 jours : structuration des dossiers et modèles de documents.\n\n**Investissement** — 6 500 MAD HT.\n\n**Prochaines étapes** — Validation du périmètre, puis planification.\n\n**Points à vérifier** — Périmètre exact des dossiers à structurer.',
          commentary:
            'Format imposé, prix exact, hypothèses signalées. Le contexte client reste générique faute d’historique.',
        },
        {
          requires: ['instructions', 'knowledge', 'memory'],
          quality: 4,
          response:
            '**Contexte** — Améliorer l’organisation documentaire.\n\n**Offre**\n- N02 Organisation documentaire\n- 5 jours\n\n**Investissement** — 6 500 MAD HT.\n\n**Prochaines étapes**\n- Valider le périmètre\n- Planifier l’intervention\n\n**Points à vérifier** — Périmètre exact.',
          commentary:
            'Même fiabilité, présentation en puces conforme à la préférence retenue. La mémoire améliore la forme, pas la justesse des chiffres.',
        },
        {
          requires: ['conversation', 'instructions', 'knowledge'],
          quality: 5,
          response:
            '**Contexte** — Atlas Distribution souhaite structurer ses dossiers et ses modèles de documents.\n\n**Offre** — N02 Organisation documentaire, 5 jours : structuration des dossiers clients et fournisseurs et modèles de documents.\n\n**Investissement** — 6 500 MAD HT.\n\n**Prochaines étapes** — Atelier de validation du périmètre, puis planification.\n\n**Points à vérifier** — Liste des types de documents concernés.',
          commentary:
            "Combinaison la plus complète : règles, données exactes et contexte client. La relecture humaine reste nécessaire.",
        },
      ],
      hints: [
        { id: 'm4-e3-h1', level: 1, text: 'Activez les couches une par une et comparez la qualité affichée.' },
        { id: 'm4-e3-h2', level: 2, text: 'Quelle couche garantit le prix exact ? Laquelle impose le format ?' },
        { id: 'm4-e3-h3', level: 3, text: 'Les connaissances apportent les données, les instructions apportent les règles, la mémoire améliore surtout la forme.' },
      ],
    },
  ],
  quiz: [
    {
      id: 'm4-q1',
      prompt: 'Où placer la grille tarifaire NOVA pour qu’elle soit consultable dans toutes les conversations d’un projet ?',
      choices: [
        { id: 'a', label: 'Dans les connaissances du projet.' },
        { id: 'b', label: 'Dans un CLAUDE.md.' },
        { id: 'c', label: 'Dans chaque message, en la recollant.' },
        { id: 'd', label: 'Nulle part : Claude connaît nos tarifs.' },
      ],
      correctId: 'a',
      explanation: 'Les connaissances du projet servent aux documents de référence. Claude ne connaît pas les tarifs de NOVA sans qu’on les lui fournisse.',
    },
    {
      id: 'm4-q2',
      prompt: 'Quelle affirmation sur CLAUDE.md est correcte ?',
      choices: [
        { id: 'a', label: 'C’est le champ d’instructions de n’importe quel projet de l’interface de conversation.' },
        { id: 'b', label: 'C’est un fichier Markdown lu par l’outil Claude Code pour charger des consignes permanentes d’un dépôt.' },
        { id: 'c', label: 'C’est la mémoire du compte, modifiable seulement par Anthropic.' },
        { id: 'd', label: 'C’est un format de document PDF.' },
      ],
      correctId: 'b',
      explanation: 'CLAUDE.md concerne Claude Code et un dépôt de travail. Son fonctionnement est à vérifier selon la version utilisée.',
    },
    {
      id: 'm4-q3',
      prompt: 'Quelle règle de prudence s’applique à la mémoire et aux connaissances ?',
      choices: [
        { id: 'a', label: 'Y mettre tout ce qui peut servir un jour, y compris les données de clients.' },
        { id: 'b', label: 'Y mettre uniquement des informations utiles et autorisées, sans données sensibles.' },
        { id: 'c', label: 'Ne jamais les relire, car elles sont infaillibles.' },
        { id: 'd', label: 'Les partager avec l’extérieur pour vérification.' },
      ],
      correctId: 'b',
      explanation: 'Principe de minimisation : on conserve le strict nécessaire, on respecte les règles internes, et on relit régulièrement.',
    },
    {
      id: 'm4-q4',
      prompt: 'Une instruction de projet dit « n’invente jamais de prix ». Que peut-on en conclure ?',
      choices: [
        { id: 'a', label: 'Claude ne se trompera plus jamais sur un prix.' },
        { id: 'b', label: 'La règle réduit le risque, mais le résultat doit être vérifié.' },
        { id: 'c', label: 'La vérification devient inutile.' },
        { id: 'd', label: 'La règle remplace la grille tarifaire.' },
      ],
      correctId: 'b',
      explanation: 'Une instruction oriente le comportement sans le garantir. Les prix (ex. N04 à 5 500 MAD HT) doivent être contrôlés.',
    },
    {
      id: 'm4-q5',
      prompt: 'Vous voulez que Claude retienne une préférence durable et non sensible (par exemple le format de réponse). Quelle fonction est la plus adaptée, si elle est disponible ?',
      choices: [
        { id: 'a', label: 'La mémoire (à vérifier selon compte et version).' },
        { id: 'b', label: 'Le fichier CSV de connaissances.' },
        { id: 'c', label: 'Le fichier .bat.' },
        { id: 'd', label: 'Le logo de l’entreprise.' },
      ],
      correctId: 'a',
      explanation: 'La mémoire est destinée aux préférences durables. Sa disponibilité et ses contrôles sont à vérifier selon compte et version.',
    },
  ],
  practicalMission: {
    id: 'm4-mission',
    title: 'Projet « Propositions NOVA » : instructions, connaissances, tests',
    prompt:
      "Créez (ou simulez sur papier si la fonction n'est pas disponible : à vérifier selon compte et version) un projet « Propositions NOVA ». Adaptez les instructions fournies, préparez la liste des documents de connaissances, puis testez trois demandes : une demande standard (N03 pour Rif Atelier), une demande hors cadre (offre N06) et une demande contenant une donnée sensible fictive. Consignez les résultats dans un tableau et proposez deux améliorations des instructions. Enfin, classez huit éléments de votre propre activité dans les sept couches du tableau comparatif.",
    deliverables: [
      'Texte final des instructions de projet (version adaptée)',
      'Liste des documents de connaissances avec nom de fichier et version',
      'Tableau de trois tests : demande, résultat observé, conforme ou non',
      'Deux améliorations proposées aux instructions',
      'Classement de huit éléments dans les couches de contexte',
    ],
    successCriteria: [
      'Les instructions contiennent rôle, règles de fiabilité, format et interdit sur les données sensibles.',
      'Les prix cités (N03 = 3 000 MAD HT, etc.) sont exacts et proviennent de la grille.',
      'Les trois tests sont documentés avec le résultat réellement observé.',
      'Le classement des huit éléments est justifié.',
      'Aucune donnée réelle ou sensible n’est utilisée.',
    ],
    estimatedMin: 10,
    assets: [
      {
        id: 'm4-a-instructions',
        filename: 'instructions_projet_nova.txt',
        kind: 'copyable-text',
        mimeType: 'text/plain',
        description: 'Instructions de projet NOVA, à copier puis adapter.',
        content: projectInstructions,
      },
      {
        id: 'm4-a-csv',
        filename: 'nova_tarifs.csv',
        kind: 'copyable-text',
        mimeType: 'text/csv',
        description: 'Grille tarifaire NOVA à déposer dans les connaissances du projet.',
        content: NOVA_SERVICES_CSV,
      },
    ],
  },
  verification: {
    id: 'm4-rubric',
    title: 'Grille de vérification — Module 4',
    maxPoints: 15,
    passThreshold: 10,
    criteria: [
      criterion('r1', 'Qualité des instructions', 'Rôle, règles, format, interdits, informations manquantes.', levels(
        'Instructions absentes ou vagues.',
        'Une ou deux composantes.',
        'Trois composantes.',
        'Quatre composantes ou plus, claires et testables.',
      )),
      criterion('r2', 'Organisation des connaissances', 'Les bons documents sont versionnés et au bon endroit.', levels(
        'Aucune liste.',
        'Liste sans version ni nom de fichier.',
        'Liste avec noms de fichiers.',
        'Liste avec noms, versions et responsable de mise à jour.',
      )),
      criterion('r3', 'Tests documentés', 'Trois tests avec résultats observés.', levels(
        'Aucun test.',
        'Un test.',
        'Deux tests documentés.',
        'Trois tests documentés, dont un cas hors cadre et un cas de donnée sensible.',
      )),
      criterion('r4', 'Classification des couches', 'Classement des éléments dans les bonnes couches.', levels(
        'Plus de cinq erreurs.',
        'Trois à cinq erreurs.',
        'Une ou deux erreurs.',
        'Aucune erreur, avec justification.',
      )),
      criterion('r5', 'Prudence et esprit critique', 'Données sensibles, mise en garde « à vérifier », relecture.', levels(
        'Aucune prudence.',
        'Une précaution mentionnée.',
        'Deux précautions mentionnées.',
        'Trois précautions ou plus, intégrées dans les instructions.',
      )),
    ],
  },
  synthesis: {
    takeaways: [
      "Chaque couche de contexte a un rôle : conversation pour le ponctuel, instructions pour les règles, connaissances pour les documents, mémoire pour les préférences non sensibles, CLAUDE.md pour Claude Code, skill pour une procédure packagée.",
      "Les instructions et connaissances orientent Claude sans garantir l'exactitude : les prix et les faits (N01 Diagnostic digital 4 500, N02 Organisation documentaire 6 500, N03 Atelier IA initiation 3 000, N04 Cartographie de processus 5 500, N05 Accompagnement automatisation 9 000 MAD HT) se vérifient toujours.",
      "Minimisez les données conservées, vérifiez les fonctions disponibles (à vérifier selon compte et version) et désignez un responsable de la mise à jour des instructions et des documents.",
    ],
    nextModule: {
      id: 'm5',
      slug: 'm5-skills',
      title: 'Module 5 — Skills : transformer une méthode en compétence réutilisable',
      href: '/modules/m5-skills',
      teaser: 'Vous savez cadrer le contexte ; transformez maintenant une méthode éprouvée en skill réutilisable.',
    },
  },
  instructorNotes: [
    {
      id: 'm4-n1',
      topic: 'Prudence sur l’interface',
      text: "Les libellés et la disponibilité des projets, de la mémoire et des skills varient selon le compte et la version. Préparez une démo de repli (captures préparées ou simulation) et annoncez clairement « à vérifier selon compte et version ».",
      timingMin: 3,
      pitfalls: ['Ne pas promettre qu’une fonction sera visible chez tous les participants.'],
    },
    {
      id: 'm4-n2',
      topic: 'Simulateur de contexte',
      text: "Le simulateur est statique. Faites deviner la réponse avant de l'afficher. Insistez : la mémoire améliore surtout la forme ; les connaissances apportent les données ; les instructions apportent les règles.",
      timingMin: 8,
    },
    {
      id: 'm4-n3',
      topic: 'Données sensibles',
      text: 'Faites énoncer la politique : quelles données ne vont jamais dans un projet, des connaissances ou la mémoire. Utiliser uniquement des cas fictifs (Rif Atelier, par exemple, sans coordonnées réelles).',
      pitfalls: ['Éviter toute démonstration avec des données de clients réels.'],
    },
    {
      id: 'm4-n4',
      topic: 'CLAUDE.md et skills',
      text: "Public non technique : ne pas s'y attarder. Expliquer en deux minutes le principe (consignes permanentes dans un fichier) et renvoyer vers les équipes techniques. Aucune installation de skill de source inconnue en séance.",
      timingMin: 5,
    },
    {
      id: 'm4-n5',
      topic: 'Positionnement',
      text: "Rappeler que la formation DPG Academy n'est pas une certification Anthropic et que NOVA Conseil est une entreprise fictive.",
    },
  ],
  references: [
    { id: 'm4-ref1', label: 'Aide en ligne de Claude : projets et mémoire', note: "Consulter la documentation à jour ; fonctions à vérifier selon compte et version.", verifyUi: true },
    { id: 'm4-ref2', label: 'Documentation de Claude Code : fichier CLAUDE.md', note: 'Consulter la documentation à jour de l’outil utilisé.', verifyUi: true },
  ],
  assets: [
    {
      id: 'm4-a-table-md',
      filename: 'tableau_comparatif_contexte.md',
      kind: 'copyable-text',
      mimeType: 'text/markdown',
      description: 'Tableau comparatif des sept notions, au format Markdown.',
      content: tableToMarkdown(comparisonTable),
    },
  ],
}
