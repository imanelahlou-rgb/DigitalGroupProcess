import type { Module } from '../types'
import { criterion, levels } from '../helpers'

const weakPrompt = 'Fais-moi une proposition pour Atlas Distribution.'

const strongPrompt = `# Rôle
Tu es consultant senior chez NOVA Conseil (cabinet fictif de conseil en organisation, Casablanca). Tu rédiges des propositions commerciales sobres et précises, en français, avec vouvoiement.

# Input
Client : Atlas Distribution (15 collaborateurs, prospect). Besoin exprimé : améliorer l'organisation documentaire. Budget : 12 000 MAD HT. Délai souhaité : sous deux mois. Offre de la grille NOVA : N02 Organisation documentaire (6 500 MAD HT, forfait).

# Étapes
1. Reformule le besoin en deux phrases.
2. Choisis l'offre adaptée dans la grille : N02 Organisation documentaire (6 500 MAD HT).
3. Indique l'objectif, le livrable et la durée de l'offre.
4. Indique le total HT, compare-le au budget de 12 000 MAD HT et calcule le reliquat.
5. Termine par les prochaines étapes.

# Expectation
Un document d'une page, prêt à être relu par Salma Benjelloun avant envoi, que la direction d'Atlas Distribution peut comprendre en moins de trois minutes. Le total attendu est de 6 500 MAD HT, soit un reliquat de 5 500 MAD HT.

# Narrowing
- Utilise uniquement l'offre et le prix fournis ; n'invente aucun autre tarif, délai, remise ou référence client.
- Maximum 250 mots, ton sobre, aucune formule promotionnelle.
- Si une information manque, pose-moi la question avant de rédiger.
- Format de sortie : Markdown, avec les titres « Contexte », « Offre », « Investissement », « Prochaines étapes ».`

const lesson1Body = `## 1. Définitions

- **Prompt** : l'instruction, le contexte et les contraintes que vous donnez à un modèle de langage pour obtenir une réponse.
- **Prompt engineering** : la pratique qui consiste à formuler, tester et améliorer ces instructions pour obtenir des résultats **fiables et réutilisables**. Ce n'est pas de la « magie » : c'est de la rédaction de consigne.
- **Contexte** : tout ce que le modèle « voit » pour répondre (votre message, les messages précédents, les documents fournis).

## 2. Explication approfondie

Un modèle de langage produit la suite la plus plausible d'un texte à partir de ce qu'on lui donne. Il ne **devine pas** ce que vous avez en tête. Plus la demande est vague, plus la réponse sera générique. Les guides de prompting publiés par les éditeurs de modèles convergent sur quelques principes :

1. **Être clair et direct** : dire ce que l'on veut, pas ce que l'on ne veut pas seulement.
2. **Donner le contexte** : pour qui, pourquoi, dans quelle situation.
3. **Préciser la forme attendue** : format, longueur, ton, langue.
4. **Fournir des exemples** quand le style compte.
5. **Itérer** : un premier résultat est un brouillon à améliorer, pas un produit fini.

Un prompt n'est pas une formule secrète. Un bon prompt est surtout un **bon brief** : celui que vous donneriez à un collègue compétent qui ne connaît pas votre dossier.

## 3. Exemple NOVA

Salma écrit à Claude : « ${weakPrompt} » La réponse est un texte générique : pas de prix, pas de ton adapté, des offres inventées. Ce n'est pas un défaut du modèle : le prompt ne contenait ni le besoin du client, ni la grille tarifaire, ni le format attendu.

## 4. Erreurs fréquentes

- Demander « un document » sans préciser public, longueur, ton.
- Attendre que le modèle connaisse vos prix, vos clients ou votre charte sans les lui fournir.
- Empiler des consignes contradictoires (« très détaillé mais court »).
- Prendre la première réponse pour définitive.
- Coller des **données confidentielles ou personnelles** sans règle claire de l'organisation.

## 5. Bonnes pratiques

- Écrivez comme pour un collègue : contexte, tâche, public, contraintes, format.
- Utilisez des **séparateurs** (titres, listes, balises) pour distinguer consignes et documents.
- Demandez à Claude de **poser des questions** si une information manque.
- Itérez : une consigne par message de correction (« raccourcis à 150 mots », « ajoute un tableau »).
- Relisez et vérifiez les faits : un texte fluide n'est pas forcément exact.
`

const lesson2Body = `## 1. Définition du cadre RISEN

**RISEN** est un **cadre mnémotechnique** de rédaction de prompts, diffusé par la communauté des praticiens. Ce n'est ni une norme, ni une méthode officielle d'un éditeur de modèles : c'est une checklist pour ne rien oublier. Les cinq lettres :

| Lettre | Signification | Question à se poser |
|---|---|---|
| **R** | **Role** (Rôle) | Qui Claude doit-il être pour cette tâche ? |
| **I** | **Input** (données et contexte fournis) | Quelles informations Claude doit-il utiliser ? |
| **S** | **Steps** (étapes) | Dans quel ordre faut-il procéder ? |
| **E** | **Expectation** (livrable attendu) | Quel livrable précis, pour qui, avec quel critère de réussite ? |
| **N** | **Narrowing** (limites) | Quelles contraintes, exclusions, format ? |

## 2. Explication approfondie

**R — Rôle.** Un rôle oriente le registre et le vocabulaire (« consultant senior », « relecteur juridique »). Il ne donne pas de compétences que le modèle n'a pas, et ne remplace pas une vérification par un expert.

**I — Input.** Ce sont les données et le contexte que vous fournissez : le client, le besoin, le budget, la grille de prix, le texte à traiter. Sans input, le modèle comble les trous en inventant ; avec un input précis, il travaille sur des faits.

**S — Steps (étapes).** Décomposer la tâche réduit les oublis, avec un verbe d'action par étape : « 1. reformule le besoin ; 2. choisis l'offre ; 3. compare le total au budget ». Utile pour les tâches multi-parties.

**E — Expectation (livrable attendu).** Décrire le livrable : sa nature, sa forme, son lecteur et son critère de réussite. Le même contenu n'est pas rédigé de la même façon pour une direction pressée ou pour une équipe technique.

**N — Narrowing (limites).** Longueur, ton, ce qu'il ne faut pas inventer, format de sortie, comportement en cas d'information manquante (« pose-moi la question »). C'est la lettre qui fait le plus gagner en fiabilité.

**Quand ne pas utiliser RISEN ?** Pour une question simple (« Reformule cette phrase »), un prompt court suffit. RISEN sert aux tâches qui comptent : livrables, analyses, contenus réutilisables.

## 3. Exemple NOVA : prompt faible versus prompt solide

**Prompt faible**

~~~
${weakPrompt}
~~~

Diagnostic : pas de rôle, pas de besoin, pas de prix, pas de format, pas de limites.

**Prompt RISEN**

~~~
${strongPrompt}
~~~

Le total attendu est de **6 500 MAD HT** (N02), soit un reliquat de **5 500 MAD HT** sur le budget de 12 000. Si la réponse indique un autre montant ou ajoute une offre non demandée, c'est à vous de le repérer : Claude peut se tromper en calcul ou reformuler une donnée.

## 4. Erreurs fréquentes

- Remplir le rôle (« Tu es un expert ») et négliger les limites : le rôle seul ne fait pas la qualité.
- Oublier l'**expectation** (livrable attendu) : le texte est correct mais inutilisable pour le lecteur visé.
- Écrire des étapes trop nombreuses ou contradictoires.
- Négliger l'**input** : sans données fournies, le modèle comble les trous en inventant.
- Croire que RISEN est obligatoire ou « officiel ».

## 5. Bonnes pratiques

- Gardez un **gabarit RISEN** dans vos notes et adaptez-le : supprimez ce qui est inutile.
- Mettez les **données de référence** (prix, noms) dans le prompt, et dites de **ne rien inventer** au-delà.
- Demandez en fin de prompt : « Liste les hypothèses que tu as faites. »
- Testez le prompt sur deux cas différents avant de le réutiliser.
- Conservez les prompts qui marchent dans une bibliothèque d'équipe (voir module 4).
`

const lesson3Body = `## 1. Définition : auditer un prompt

**Auditer un prompt**, c'est le relire avec une grille pour repérer ce qui manque, ce qui est ambigu et ce qui est risqué, **avant** de l'envoyer. Cela évite des itérations inutiles.

## 2. Explication approfondie : la grille d'audit en cinq contrôles

1. **R** — Le rôle est-il utile et réaliste ?
2. **I** — L'input est-il fourni : contexte, données, prix, budget ?
3. **S** — Les étapes sont-elles claires quand la tâche est complexe ?
4. **E** — Le livrable attendu et son lecteur sont-ils nommés ?
5. **N** — Les limites / narrowing (longueur, ton, interdits, format, cas d'information manquante) sont-elles posées ?

Ajoutez deux contrôles transverses : **confidentialité** (pas de données sensibles non autorisées) et **vérifiabilité** (peut-on contrôler la réponse ? les chiffres sont-ils fournis ?).

## 3. Exemple NOVA

Karim audite le prompt suivant, écrit par un stagiaire : « Écris un mail à Rif Atelier pour proposer nos services d'IA et dis que c'est pas cher. »

- R : absent.
- I : « nos services d'IA » est trop vague ; ni le besoin (formation IA), ni le budget, ni l'offre N03 Atelier IA initiation (3 000 MAD HT) ne sont fournis.
- S : sans objet pour un mail court, mais l'ordre des idées n'est pas défini.
- E : pas de livrable précis, pas de destinataire, pas de but (obtenir un rendez-vous ?).
- N : « pas cher » est subjectif et risque de produire des promesses non maîtrisées ; aucune limite de longueur ni de ton.
- Confidentialité : rappeler de ne **jamais** coller de données personnelles ou de coordonnées réelles dans le prompt.

## 4. Erreurs fréquentes

- Auditer seulement la forme (orthographe) et pas l'intention.
- Corriger un prompt sans le tester.
- Réécrire entièrement alors qu'un ajout de limites suffisait.
- Ignorer la question des données sensibles.

## 5. Bonnes pratiques

- Comparez toujours **avant / après** sur la même tâche pour mesurer le gain.
- Documentez en une ligne ce qui a changé et pourquoi.
- Si le résultat reste décevant, changez **une chose à la fois** (rôle, données, limites).
- Faites relire un prompt important par un collègue : un regard extérieur repère les ambiguïtés.
- Les fonctions de Claude pour conserver ou réutiliser des prompts varient (à vérifier selon compte et version).
`

export const module2: Module = {
  id: 'm2',
  slug: 'm2-prompt-risen',
  title: 'Module 2 — Prompt engineering et cadre RISEN',
  durationMin: 45,
  objectives: [
    'Définir un prompt et le prompt engineering sans mythifier la pratique.',
    'Appliquer les cinq composantes du cadre RISEN (Role, Input, Steps, Expectation, Narrowing).',
    'Distinguer un prompt faible d’un prompt solide à partir d’un cas NOVA.',
    'Auditer un prompt avec une grille et le réécrire.',
    'Itérer et vérifier la réponse de Claude plutôt que l’accepter telle quelle.',
  ],
  situation:
    "Salma Benjelloun demande à Claude de rédiger une proposition pour Atlas Distribution (organisation documentaire, budget 12 000 MAD HT) et obtient un texte générique, sans prix ni structure. Karim El Idrissi constate que chaque collaborateur rédige ses demandes à sa manière, avec des résultats très inégaux. NOVA souhaite un cadre simple, partagé et réutilisable pour formuler ses demandes. L'équipe adopte RISEN comme aide-mémoire, sans le considérer comme une règle absolue.",
  lessons: [
    {
      id: 'm2-l1',
      title: 'Prompt et prompt engineering : poser les bases',
      durationMin: 10,
      body: lesson1Body,
      keyTerms: [
        { term: 'Prompt', definition: "Consigne et contexte fournis à un modèle de langage." },
        { term: 'Prompt engineering', definition: "Pratique d'écriture, de test et d'amélioration des consignes." },
        { term: 'Contexte', definition: 'Ensemble des informations visibles par le modèle pour répondre.' },
      ],
    },
    {
      id: 'm2-l2',
      title: 'Le cadre RISEN : Role, Input, Steps, Expectation, Narrowing',
      durationMin: 20,
      body: lesson2Body,
      keyTerms: [
        { term: 'RISEN', definition: 'Aide-mémoire de rédaction de prompts : Role (rôle), Input (données fournies), Steps (étapes), Expectation (livrable attendu), Narrowing (limites).' },
        { term: 'Narrowing (limites)', definition: "Contraintes de longueur, de ton, d'exclusion et de format de sortie." },
      ],
    },
    {
      id: 'm2-l3',
      title: 'Auditer et améliorer un prompt',
      durationMin: 10,
      body: lesson3Body,
    },
  ],
  demo: {
    title: 'Du prompt faible au prompt RISEN : mesurer la différence',
    prerequisites: [
      'Accès à Claude (disponibilité des fonctions : à vérifier selon compte et version).',
      'Les informations du cas Atlas Distribution (N02 Organisation documentaire 6 500 MAD HT, budget 12 000 MAD HT).',
    ],
    steps: [
      {
        number: 1,
        title: 'Envoyer le prompt faible',
        instruction: `Dans une conversation neuve, envoyez : « ${weakPrompt} »`,
        expected: 'Réponse générique : pas de prix, offres inventées ou questions sans cadre.',
      },
      {
        number: 2,
        title: 'Noter les manques',
        instruction: 'Listez en trois points ce qui rend la réponse inutilisable (prix, ton, format, offres).',
        expected: 'Une liste de trois défauts, à relier aux lettres R, I, S, E, N.',
      },
      {
        number: 3,
        title: 'Envoyer le prompt RISEN',
        instruction: 'Dans une nouvelle conversation, collez le prompt RISEN de la leçon 2 (role, input, steps, expectation, narrowing).',
        expected: 'Un document structuré avec les rubriques demandées et l’offre N02.',
      },
      {
        number: 4,
        title: 'Vérifier les chiffres',
        instruction: 'Contrôlez le prix (N02 = 6 500 MAD HT), le total (6 500 MAD HT) et le reliquat sur le budget de 12 000 (5 500 MAD HT).',
        expected: 'Les montants correspondent ; sinon, demandez une correction explicite.',
      },
      {
        number: 5,
        title: 'Itérer une fois',
        instruction: "Demandez : « Raccourcis à 150 mots et ajoute une phrase d'ouverture plus directe. »",
        expected: 'Une version plus courte qui conserve les chiffres.',
      },
    ],
    expectedResult:
      "Deux réponses comparables sur la même demande : l'une générique, l'autre structurée, chiffrée et utilisable après relecture.",
    varianceNote:
      "Les réponses de Claude ne seront pas identiques à celles décrites : longueur, choix de mots et structure peuvent varier, même avec le même prompt. Ce qui compte : la présence des éléments demandés, l'exactitude des prix, le respect des limites et la qualité globale après votre relecture.",
  },
  exercises: [
    {
      id: 'm2-e1',
      kind: 'audit',
      title: 'Auditer un prompt faible avec la grille RISEN',
      instructions:
        "Lisez le prompt ci-dessous et, pour chaque critère RISEN (Role, Input, Steps, Expectation, Narrowing), indiquez ce qui manque ou pose problème. Ajoutez un contrôle de confidentialité. Terminez en réécrivant le prompt.",
      durationMin: 12,
      target:
        "Écris un mail à Rif Atelier pour proposer nos services d'IA et dis que c'est pas cher.",
      criteria: [
        { id: 'a-r', label: 'R — Rôle', question: 'Un rôle est-il défini ?', expectedFinding: 'Aucun rôle. Ajouter par exemple : consultant senior NOVA Conseil, ton sobre, vouvoiement.' },
        { id: 'a-i', label: 'I — Input', question: 'Les données fournies (besoin, budget, offre) sont-elles explicites ?', expectedFinding: "« Nos services d'IA » est vague : fournir le besoin (formation IA), le budget de Rif Atelier (2 500 MAD HT) et l'offre N03 Atelier IA initiation (3 000 MAD HT)." },
        { id: 'a-s', label: 'S — Steps (étapes)', question: "L'ordre des idées du mail est-il défini ?", expectedFinding: "Non. Proposer : accroche, besoin, offre, prix, appel à l'action." },
        { id: 'a-e', label: 'E — Expectation', question: 'Le livrable attendu, son destinataire et son but sont-ils nommés ?', expectedFinding: "Non. Préciser le livrable (e-mail de moins de 150 mots), le destinataire (direction de Rif Atelier) et le but (obtenir un rendez-vous de 30 minutes)." },
        { id: 'a-n', label: 'N — Narrowing (limites)', question: 'Longueur, ton, interdits, format sont-ils posés ?', expectedFinding: "« Pas cher » est subjectif et non vérifiable. Poser : 150 mots maximum, aucun argument de prix non fourni, ne rien inventer." },
        { id: 'a-c', label: 'Confidentialité', question: 'Le prompt expose-t-il ou risque-t-il d’appeler des données sensibles ?', expectedFinding: 'Rappeler de ne coller aucune donnée personnelle ni coordonnée réelle dans le prompt ; utiliser uniquement des données fictives.' },
      ],
      improvedVersion: `# Rôle
Tu es consultant senior chez NOVA Conseil. Ton : sobre, professionnel, vouvoiement.

# Input
Client : Rif Atelier (8 collaborateurs, prospect). Besoin : formation IA. Budget : 2 500 MAD HT. Offre de la grille : N03 Atelier IA initiation (3 000 MAD HT la session, formation pratique de 3 heures).

# Étapes
1. Accroche en une phrase. 2. Rappel du besoin. 3. Présentation de l'offre N03 avec son prix HT et signalement de l'écart de 500 MAD avec le budget, sans remise. 4. Proposition d'un rendez-vous de 30 minutes.

# Expectation
Un e-mail de moins de 150 mots, relu par Salma Benjelloun avant envoi, qui vise l'obtention d'un rendez-vous avec la direction.

# Narrowing
150 mots maximum. N'invente aucune référence ni aucun tarif, aucune remise. N'argumente pas sur le « prix bas ». Aucune donnée personnelle réelle ne doit apparaître. Si une information manque, pose-moi la question.`,
      hints: [
        { id: 'm2-e1-h1', level: 1, text: 'Parcourez les lettres une à une : que contient le prompt pour chacune ?' },
        { id: 'm2-e1-h2', level: 2, text: '« Pas cher » est-il vérifiable ? Quelles données (offre, prix, budget) faut-il fournir ?' },
        { id: 'm2-e1-h3', level: 3, text: 'La réécriture doit fournir le besoin, le budget (2 500 MAD HT) et l’offre N03 (3 000 MAD HT), et fixer une longueur maximale.' },
      ],
    },
    {
      id: 'm2-e2',
      kind: 'file-edit',
      format: 'markdown',
      title: 'Compléter un gabarit RISEN',
      instructions:
        "Complétez le gabarit pour demander à Claude un brouillon de proposition N03 (Atelier IA initiation, 3 000 MAD HT la session) pour Rif Atelier, dont le budget est de 2 500 MAD HT. Les cinq rubriques doivent être renseignées.",
      durationMin: 8,
      starter: `# Rôle

# Input

# Étapes

# Expectation

# Narrowing
`,
      solution: `# Rôle
Tu es consultant senior chez NOVA Conseil, spécialiste de l'animation d'ateliers. Ton sobre, vouvoiement.

# Input
Client : Rif Atelier (8 collaborateurs, prospect). Besoin : formation IA. Budget : 2 500 MAD HT. Offre : N03 Atelier IA initiation, formation pratique de 3 heures, 3 000 MAD HT la session.

# Étapes
1. Rappelle le besoin du client. 2. Présente l'offre N03 et son prix HT. 3. Compare le prix au budget et calcule l'écart (500 MAD, soit 20 %). 4. Propose les prochaines étapes sans remise.

# Expectation
Un brouillon de proposition d'une page, que Salma Benjelloun peut valider avant envoi au client, avec le statut « ALERTE_BUDGET ».

# Narrowing
Maximum 250 mots. N'invente aucun chiffre ni aucune remise. Format Markdown avec titres. Si une information manque, pose la question avant de rédiger.
`,
      checks: [
        { id: 'c1', description: 'Les cinq rubriques sont présentes', type: 'regex', value: '# Rôle[\\s\\S]*# Input[\\s\\S]*# Étapes[\\s\\S]*# Expectation[\\s\\S]*# Narrowing', failMessage: 'Conservez les cinq titres dans l’ordre.' },
        { id: 'c2', description: 'Le prix N03 est mentionné', type: 'regex', value: '3\\s?000\\s?MAD\\s?HT', failMessage: 'Citez le prix N03 : 3 000 MAD HT.' },
        { id: 'c3', description: 'Une limite de longueur est posée', type: 'regex', value: '([Mm]aximum|[Mm]ax\\.?|[Aa]u plus)\\s*\\d+\\s*mots', failMessage: 'Ajoutez une limite de longueur en mots.' },
        { id: 'c4', description: 'Consigne sur les informations manquantes', type: 'regex', value: '([Pp]ose|[Dd]emande)[^\\n]*(question|préc)', failMessage: 'Indiquez quoi faire si une information manque.' },
      ],
      hints: [
        { id: 'm2-e2-h1', level: 1, text: 'Chaque rubrique doit contenir au moins une phrase.' },
        { id: 'm2-e2-h2', level: 2, text: 'Dans « Narrowing », pensez à : longueur, interdits, format, information manquante.' },
        { id: 'm2-e2-h3', level: 3, text: 'Exemple de limite : « Maximum 250 mots. N’invente aucun chiffre. Si une information manque, pose la question. »' },
      ],
    },
  ],
  quiz: [
    {
      id: 'm2-q1',
      prompt: 'Que signifie RISEN ?',
      choices: [
        { id: 'a', label: 'Role (rôle), Input (données fournies), Steps (étapes), Expectation (livrable attendu), Narrowing (limites)' },
        { id: 'b', label: 'Résultat, Instruction, Source, Évaluation, Notation' },
        { id: 'c', label: 'Rôle, Information, Style, Exemple, Niveau' },
        { id: 'd', label: 'Raisonnement, Intention, Structure, Entrée, Normes' },
      ],
      correctId: 'a',
      explanation: 'RISEN est un aide-mémoire : Role, Input, Steps, Expectation, Narrowing.',
    },
    {
      id: 'm2-q2',
      prompt: 'RISEN est-il une méthode officielle imposée par Anthropic ?',
      choices: [
        { id: 'a', label: 'Oui, c’est la méthode officielle de Claude.' },
        { id: 'b', label: 'Oui, mais seulement dans les versions payantes.' },
        { id: 'c', label: 'Non, c’est un cadre mnémotechnique utile, sans statut officiel.' },
        { id: 'd', label: 'Non, et il est déconseillé dans tous les cas.' },
      ],
      correctId: 'c',
      explanation: 'RISEN est un outil de rédaction parmi d’autres. Il aide à structurer, sans valeur de norme ni de certification.',
    },
    {
      id: 'm2-q3',
      prompt: 'Quelle composante RISEN permet de poser une longueur maximale et un format de sortie ?',
      choices: [
        { id: 'a', label: 'Rôle' },
        { id: 'b', label: 'Étapes' },
        { id: 'c', label: 'Expectation' },
        { id: 'd', label: 'Narrowing (limites)' },
      ],
      correctId: 'd',
      explanation: 'La lettre N regroupe les contraintes : longueur, ton, exclusions, format et traitement des informations manquantes.',
    },
    {
      id: 'm2-q4',
      prompt: 'Pourquoi le prompt « Fais-moi une proposition pour Atlas Distribution » est-il faible ?',
      choices: [
        { id: 'a', label: 'Il est trop court pour être envoyé.' },
        { id: 'b', label: 'Il ne fournit ni besoin, ni offres, ni prix, ni format, ni limites.' },
        { id: 'c', label: 'Il utilise le vouvoiement.' },
        { id: 'd', label: 'Il cite un client réel.' },
      ],
      correctId: 'b',
      explanation: 'Sans contexte ni données, le modèle comble les trous de façon générique ou invente des éléments.',
    },
    {
      id: 'm2-q5',
      prompt: 'Un prompt RISEN pour Océan Services demande N01 Diagnostic digital (4 500 MAD HT) et N04 Cartographie de processus (5 500 MAD HT). Claude répond avec un total de 9 500 MAD HT. Que faites-vous ?',
      choices: [
        { id: 'a', label: 'Vous acceptez le total, le modèle a suivi le format.' },
        { id: 'b', label: 'Vous recalculez : 4 500 + 5 500 = 10 000 MAD HT, et vous demandez la correction.' },
        { id: 'c', label: 'Vous supprimez le total du document.' },
        { id: 'd', label: 'Vous changez les prix pour qu’ils correspondent à 9 500.' },
      ],
      correctId: 'b',
      explanation: 'La vérification des chiffres relève de l’utilisateur. Un texte fluide n’est pas garanti exact.',
    },
    {
      id: 'm2-q6',
      prompt: 'Quelle pratique est la plus prudente avant de coller des informations dans un prompt ?',
      choices: [
        { id: 'a', label: 'Coller tout le dossier client pour donner du contexte.' },
        { id: 'b', label: 'Ne fournir que les informations nécessaires et exclure toute donnée sensible non autorisée.' },
        { id: 'c', label: 'Ajouter « ceci est confidentiel » en début de message.' },
        { id: 'd', label: 'Demander à Claude de décider ce qui est confidentiel.' },
      ],
      correctId: 'b',
      explanation: 'Principe de minimisation : on partage le strict nécessaire et on respecte les règles de l’organisation. Une mention « confidentiel » ne protège pas une donnée.',
    },
  ],
  practicalMission: {
    id: 'm2-mission',
    title: 'Réécrire et tester un prompt de proposition',
    prompt:
      "Partez du prompt faible « Fais-moi une proposition pour Atlas Distribution. ». Réécrivez-le selon RISEN pour obtenir une proposition d'une page pour Atlas Distribution : besoin d'organisation documentaire, offre N02 (6 500 MAD HT), budget de 12 000 MAD HT. Testez les deux versions dans deux conversations distinctes, comparez les résultats en trois points, puis réalisez une itération de correction. Rédigez enfin une note de trois lignes sur ce que vous changeriez encore.",
    deliverables: [
      'Prompt faible (original) et prompt RISEN (réécrit)',
      'Les deux réponses de Claude (copie)',
      'Tableau de comparaison en trois points',
      'Version corrigée après une itération',
      'Note de trois lignes sur les améliorations restantes',
    ],
    successCriteria: [
      'Les cinq blocs Role, Input, Steps, Expectation, Narrowing sont identifiables dans le prompt réécrit.',
      'Le prix N02 (6 500 MAD HT), le total et le reliquat de 5 500 MAD HT sont exacts dans la version finale.',
      'Le prompt pose au moins une limite de longueur et une consigne en cas d’information manquante.',
      'La comparaison identifie des différences concrètes (et non « c’est mieux »).',
      'Aucune donnée sensible ou réelle n’est utilisée.',
    ],
    estimatedMin: 15,
  },
  verification: {
    id: 'm2-rubric',
    title: 'Grille de vérification — Module 2',
    maxPoints: 15,
    passThreshold: 10,
    criteria: [
      criterion('r1', 'Couverture RISEN', 'Les cinq composantes sont présentes et utiles.', levels(
        'Moins de deux composantes.',
        'Deux ou trois composantes.',
        'Quatre composantes ou cinq composantes superficielles.',
        'Cinq composantes pertinentes et précises.',
      )),
      criterion('r2', 'Exactitude des données NOVA', 'Prix, codes et total sont corrects.', levels(
        'Prix absents ou erronés.',
        'Prix partiellement correct.',
        'Prix correct, total ou reliquat absent ou erroné.',
        'Prix, total (6 500 MAD HT) et reliquat (5 500 MAD HT) corrects.',
      )),
      criterion('r3', 'Qualité des limites', 'Longueur, format, interdits, information manquante.', levels(
        'Aucune limite.',
        'Une limite.',
        'Deux limites.',
        'Trois limites ou plus, dont le traitement des informations manquantes.',
      )),
      criterion('r4', 'Analyse comparative', 'La comparaison est concrète et argumentée.', levels(
        'Pas de comparaison.',
        'Comparaison générale (« meilleur »).',
        'Deux différences concrètes.',
        'Trois différences concrètes reliées à RISEN.',
      )),
      criterion('r5', 'Esprit critique', 'Vérification, itération et prudence sur les données.', levels(
        'Aucune vérification ni itération.',
        'Une itération sans vérification.',
        'Vérification des chiffres et une itération.',
        'Vérification, itération et mention de la confidentialité des données.',
      )),
    ],
  },
  synthesis: {
    takeaways: [
      'Un bon prompt est un bon brief : contexte, données, public, format et limites.',
      "RISEN (Role, Input, Steps, Expectation, Narrowing) est un aide-mémoire pratique, pas une norme ; adaptez-le à la tâche.",
      "Auditez, testez, itérez et vérifiez : les chiffres et les faits restent de votre responsabilité, et les données sensibles n'ont pas leur place dans un prompt non autorisé.",
    ],
    nextModule: {
      id: 'm3',
      slug: 'm3-design-identite-visuelle',
      title: 'Module 3 — Design : identité visuelle, logo et charte',
      href: '/modules/m3-design-identite-visuelle',
      teaser: 'Appliquez le brief structuré à un autre domaine : définir une direction visuelle pour NOVA.',
    },
  },
  instructorNotes: [
    {
      id: 'm2-n1',
      topic: 'Ouverture',
      text: "Faire écrire un prompt de proposition à chaque participant en une minute, sans consigne. Garder trois exemples anonymisés pour l'audit en groupe.",
      timingMin: 5,
    },
    {
      id: 'm2-n2',
      topic: 'Positionnement de RISEN',
      text: "Insister sur le fait que RISEN est un cadre mnémotechnique communautaire. Citer d'autres cadres si les participants en connaissent ; l'important est la discipline de brief, pas l'acronyme.",
      pitfalls: ['Ne pas présenter RISEN comme une méthode officielle ou certifiée.'],
    },
    {
      id: 'm2-n3',
      topic: 'Démonstration et variance',
      text: "Lancer deux fois le prompt RISEN pour montrer que les réponses diffèrent. Utiliser la différence pour justifier la relecture et la vérification du total (6 500 MAD HT) et du reliquat (5 500 MAD HT).",
      timingMin: 10,
    },
    {
      id: 'm2-n4',
      topic: 'Données sensibles',
      text: "Rappeler les règles de l'organisation sur les données personnelles. N'utiliser que les cas fictifs NOVA (Atlas Distribution, Rif Atelier, Océan Services).",
      pitfalls: ['Ne jamais utiliser de données réelles de clients dans les exercices.'],
    },
    {
      id: 'm2-n5',
      topic: 'Durée',
      text: "Ce module est le plus dense (45 min). Si le temps manque, réduire la démo et faire de l'exercice de gabarit RISEN un travail à terminer en autonomie.",
    },
  ],
  references: [
    { id: 'm2-ref1', label: "Guides de prompting publiés par les éditeurs de modèles (documentation officielle)", note: "Consulter la documentation à jour du fournisseur utilisé.", verifyUi: true },
    { id: 'm2-ref2', label: 'RISEN — cadre mnémotechnique communautaire', note: 'Source non officielle ; à utiliser comme aide-mémoire.' },
  ],
}
