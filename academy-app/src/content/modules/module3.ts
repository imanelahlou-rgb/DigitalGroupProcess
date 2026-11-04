import type { Module } from '../types'
import { criterion, levels } from '../helpers'
import { NOVA_BRAND_DIRECTIONS } from '../nova'

const artifactsDisclaimer =
  "Avertissement : Claude peut proposer des aperçus visuels (par exemple du HTML, du SVG ou des composants affichés dans un panneau dédié, parfois appelé « Artifacts »). La disponibilité, le nom et le fonctionnement de cette fonction sont à vérifier selon compte et version. Ces aperçus sont des **pistes de travail** : ils ne remplacent ni un designer, ni une vérification juridique (droit des marques, licences de polices et d'images), ni un contrôle d'accessibilité. Aucune originalité ni disponibilité d'un nom ou d'un logo n'est garantie."

const lesson1Body = `## 1. Définitions : trois notions à ne pas confondre

- **Identité visuelle** : l'ensemble des signes visuels qui rendent une organisation reconnaissable : logo, couleurs, typographies, style d'images, mise en page, ton graphique. C'est le **système** complet.
- **Logo** : un **élément** de cette identité : le signe (symbole, texte stylisé, ou les deux) qui désigne l'organisation.
- **Charte graphique** : le **document de règles** qui explique comment utiliser l'identité : tailles minimales, zones de protection, codes couleurs (HEX, RVB, CMJN), polices autorisées, exemples corrects et incorrects.

Le logo est une pièce, l'identité est le système, la charte est le mode d'emploi.

## 2. Explication approfondie

| Notion | Nature | Question à laquelle elle répond | Exemple chez NOVA |
|---|---|---|---|
| Identité visuelle | Système de signes | « À quoi reconnaît-on NOVA ? » | Couleurs, polices, style des schémas, ton |
| Logo | Élément | « Quel signe désigne NOVA ? » | Un monogramme « N » et le nom en toutes lettres |
| Charte graphique | Document de règles | « Comment l'utiliser correctement ? » | Document de 6 pages : couleurs, polices, marges, interdits |

Trois principes guident une bonne identité :

1. **Cohérence** : mêmes codes sur le site, les devis, les présentations, la signature d'e-mail.
2. **Lisibilité** : contraste suffisant entre texte et fond, tailles de texte raisonnables, pas de décoration au détriment du sens.
3. **Adéquation** : l'identité doit refléter la **stratégie** (cible, positionnement, valeurs) et non les goûts personnels.

Un point d'attention : une identité repose sur des **choix de couleurs, de polices et d'images dont les droits d'usage** doivent être vérifiés. Une police n'est pas librement utilisable partout, et une image trouvée en ligne n'est pas automatiquement libre de droits.

## 3. Exemple NOVA

NOVA Conseil utilise un logo texte réalisé à la hâte, des couleurs différentes selon les documents et deux polices sans règle. Nadia Ouazzani le constate en préparant la proposition pour Atlas Distribution : le devis (N02 Organisation documentaire à 6 500 MAD HT, pour un budget de 12 000 MAD HT) a l'air d'être issu d'une autre entreprise que le site. Le problème n'est pas le logo seul : c'est l'absence de **système** (identité) et de **règles** (charte).

## 4. Erreurs fréquentes

- Dire « refaire la charte » quand on veut en réalité « refaire le logo ».
- Choisir des couleurs sans vérifier le **contraste** du texte.
- Utiliser une police sans en contrôler la licence.
- Multiplier les couleurs et les polices : plus de trois polices ou cinq couleurs d'usage courant nuit à la cohérence.
- Partir des goûts du dirigeant au lieu du public cible.

## 5. Bonnes pratiques

- Commencez par la **stratégie** (qui, pour qui, quelle promesse) avant l'esthétique.
- Définissez une palette courte : 1 couleur principale, 1 à 2 secondaires, 1 à 2 neutres.
- Limitez-vous à deux familles typographiques, en précisant leur licence.
- Documentez les règles dans une charte courte, même d'une page au départ.
- Faites relire l'identité par quelqu'un qui représente la cible.
`

const lesson2Body = `## 1. Définition : le brief de design

Un **brief de design** est le document de cadrage qui explique **pourquoi, pour qui et dans quelles limites** une identité est créée. C'est le même principe que RISEN (module 2) : une consigne claire donne de meilleurs résultats, humains ou automatisés.

> ${artifactsDisclaimer}

## 2. Explication approfondie : les huit rubriques d'un brief

1. **Présentation** de l'organisation et de son activité.
2. **Cibles** : qui doit se sentir concerné, avec quelles attentes.
3. **Positionnement et valeurs** : ce que l'organisation veut incarner.
4. **Ton** : sobre, chaleureux, direct…
5. **Références et anti-références** : ce qu'on aime, ce qu'on refuse.
6. **Contraintes** : usages (site, PDF, signature d'e-mail), couleurs imposées ou interdites, accessibilité.
7. **Livrables attendus** : pistes de direction, palette, polices, règles d'usage.
8. **Critères de choix** : comment on comparera les propositions.

### Utiliser Claude dans la démarche

Claude peut vous aider à :
- **reformuler** un brief et repérer les rubriques manquantes ;
- **proposer plusieurs directions** décrites en texte (palette, polices, ton, mots-clés) ;
- **générer un aperçu** de page ou de palette en HTML ou SVG, si l'interface le permet (à vérifier selon compte et version) ;
- **rédiger** une première version de charte en Markdown.

Claude **ne peut pas** :
- garantir qu'un nom ou un logo est disponible ou libre de droits ;
- vérifier seul les licences de polices ou d'images ;
- remplacer le jugement d'un designer sur la qualité finale d'un logo ;
- connaître vos contraintes si vous ne les lui donnez pas.

## 3. Exemple NOVA

Nadia remplit le brief : activité de conseil en organisation, cibles (PME industrielles et logistiques), valeurs (rigueur, clarté, accompagnement), ton sobre, anti-référence : « pas de visuels d'IA futuristes ou de robots ». Elle demande à Claude trois directions. Les directions proposées (sobre institutionnelle, clarté technique, chaleur humaine) sont ensuite **comparées** selon cinq critères : cohérence avec les valeurs, lisibilité, différenciation, déclinabilité, risques.

## 4. Erreurs fréquentes

- Demander « un logo moderne » sans brief.
- Accepter la première proposition générée sans la comparer à d'autres.
- Prendre un aperçu HTML ou SVG généré pour un **logo final** exploitable.
- Oublier de contrôler le contraste et la licence des polices.
- Copier une marque existante : risque juridique et de confusion.

## 5. Bonnes pratiques

- Demandez **trois directions contrastées**, pas trois variantes d'une même idée.
- Imposez une **grille de comparaison** avant de choisir.
- Faites valider le choix final par un professionnel du design et vérifier les droits d'usage.
- Conservez le brief : il servira aussi pour les futures déclinaisons.
- Rappelez-vous que les aperçus sont des maquettes de travail.
`

const lesson3Body = `## 1. Définition : comparer des directions

Une **direction de marque** est une proposition cohérente (palette, typographie, ton, mots-clés) qui exprime une certaine promesse. Comparer, c'est confronter ces directions à des **critères** posés à l'avance.

## 2. Explication approfondie : cinq critères de comparaison

| Critère | Question |
|---|---|
| Adéquation aux valeurs | La direction exprime-t-elle rigueur, clarté, accompagnement ? |
| Lisibilité et accessibilité | Les contrastes et les tailles sont-ils suffisants ? |
| Différenciation | Se distingue-t-elle des cabinets concurrents ? |
| Déclinabilité | Fonctionne-t-elle sur le site, un PDF, une signature d'e-mail ? |
| Risques | Qu'est-ce qui pourrait mal passer (image, coûts, droits) ? |

Notez chaque direction de 1 à 5 par critère, en **justifiant par une phrase**. Une note sans justification est une opinion.

## 3. Les trois directions pour NOVA (statiques)

${NOVA_BRAND_DIRECTIONS.map(
  (d) =>
    `**${d.name}** — « ${d.tagline} »  
Palette : ${d.palette.map((p) => `${p.name} ${p.hex}`).join(', ')}.  
Ton : ${d.tone}  
Pertinente pour : ${d.bestFor}`,
).join('\n\n')}

Ces directions sont des **pistes pédagogiques**, figées dans ce module. Elles ne constituent ni un logo, ni une charte définitive.

## 4. Erreurs fréquentes

- Comparer sur la base de « j'aime / je n'aime pas » sans critères.
- Oublier la cible : le goût de l'équipe n'est pas celui du client.
- Négliger l'impression en noir et blanc ou en petite taille.
- Choisir une direction sans vérifier les polices proposées.

## 5. Bonnes pratiques

- Fixez les critères **avant** de regarder les propositions.
- Faites noter par deux personnes indépendantes, puis discutez les écarts.
- Testez la direction retenue sur trois supports : page web, PDF de devis (par exemple N01 à 4 500 MAD HT), signature d'e-mail.
- Documentez la décision et ses limites : ce qui reste à valider (licences, contrastes, avis d'un designer).
`

export const module3: Module = {
  id: 'm3',
  slug: 'm3-design-identite-visuelle',
  title: 'Module 3 — Design : identité visuelle, logo et charte graphique',
  durationMin: 35,
  objectives: [
    "Distinguer identité visuelle, logo et charte graphique.",
    "Rédiger un brief de design structuré en huit rubriques.",
    "Utiliser Claude pour explorer des directions, en connaissant ses limites (aperçus, droits, qualité finale).",
    "Comparer trois directions de marque avec une grille de critères.",
  ],
  situation:
    "Les documents de NOVA Conseil n'ont pas d'apparence commune : le devis envoyé à Atlas Distribution ne ressemble pas au site. Nadia Ouazzani doit proposer une direction visuelle sans budget d'agence à ce stade. Salma Benjelloun accepte d'explorer des pistes avec Claude, à condition que le résultat soit présenté comme une **piste de travail** à faire valider par un designer. L'objectif est un brief clair et trois directions comparables.",
  lessons: [
    {
      id: 'm3-l1',
      title: 'Identité visuelle, logo, charte graphique : trois notions distinctes',
      durationMin: 10,
      body: lesson1Body,
      keyTerms: [
        { term: 'Identité visuelle', definition: "Système complet de signes visuels qui rend une organisation reconnaissable." },
        { term: 'Logo', definition: "Signe qui désigne l'organisation ; un élément de l'identité." },
        { term: 'Charte graphique', definition: "Document de règles d'utilisation de l'identité." },
      ],
    },
    {
      id: 'm3-l2',
      title: 'Écrire un brief de design et travailler avec Claude',
      durationMin: 15,
      body: lesson2Body,
      keyTerms: [
        { term: 'Brief de design', definition: "Document de cadrage : contexte, cibles, valeurs, ton, contraintes, livrables." },
        { term: 'Aperçu (Artifacts)', definition: "Visualisation générée par Claude ; disponibilité à vérifier selon compte et version." },
      ],
    },
    {
      id: 'm3-l3',
      title: 'Comparer trois directions de marque pour NOVA',
      durationMin: 10,
      body: lesson3Body,
    },
  ],
  demo: {
    title: 'Du brief à trois directions de marque',
    prerequisites: [
      'Accès à Claude (disponibilité des aperçus visuels : à vérifier selon compte et version).',
      'Le brief NOVA rempli dans l’exercice « Constructeur de brief ».',
    ],
    steps: [
      {
        number: 1,
        title: 'Coller le brief',
        instruction: 'Collez le brief NOVA (activité, cibles, valeurs, ton, anti-références, usages) dans une nouvelle conversation.',
        expected: 'Claude reformule le brief et peut signaler des rubriques manquantes.',
      },
      {
        number: 2,
        title: 'Demander trois directions contrastées',
        instruction:
          "Demandez : « Propose trois directions de marque contrastées pour NOVA. Pour chacune : nom, palette (codes HEX), polices, ton, trois mots-clés, forces et risques. Présente en tableau Markdown. »",
        expected: 'Un tableau de trois directions, avec palettes en HEX et risques.',
      },
      {
        number: 3,
        title: 'Demander un aperçu (facultatif)',
        instruction:
          "Si votre interface le permet (à vérifier selon compte et version), demandez un aperçu HTML simple d'une page d'accueil dans la direction « Clarté technique ». Sinon, passez à l'étape 4.",
        expected: 'Un aperçu ou un extrait de code ; considéré comme une maquette de travail.',
      },
      {
        number: 4,
        title: 'Évaluer avec une grille',
        instruction: 'Notez chaque direction de 1 à 5 sur cinq critères : valeurs, lisibilité, différenciation, déclinabilité, risques.',
        expected: 'Un tableau de notes justifiées par une phrase.',
      },
      {
        number: 5,
        title: 'Lister les vérifications restantes',
        instruction: 'Demandez à Claude la liste de ce qui doit être vérifié par un humain avant adoption (licences, contrastes, avis d’un designer).',
        expected: 'Une liste de points de contrôle ; vous la complétez avec les règles de NOVA.',
      },
    ],
    expectedResult:
      "Un brief validé, trois directions comparées avec une grille de critères, et une liste de vérifications à mener avant toute adoption.",
    varianceNote:
      "Les directions, couleurs et formulations proposées par Claude changeront d'une exécution à l'autre ; les aperçus visuels peuvent aussi différer ou ne pas être disponibles. Utilisez les exemples du module comme référence de structure, pas comme résultat attendu à l'identique.",
  },
  exercises: [
    {
      id: 'm3-e1',
      kind: 'brief-builder',
      title: 'Constructeur de brief de design',
      instructions:
        "Renseignez les rubriques ci-dessous pour NOVA Conseil. Le gabarit assemble ensuite un brief prêt à être collé dans Claude. Les champs marqués d'un astérisque sont obligatoires.",
      durationMin: 10,
      fields: [
        { id: 'presentation', label: 'Présentation de l’organisation *', placeholder: 'Activité, taille, localisation…', helper: 'Deux ou trois phrases factuelles.', required: true, example: "NOVA Conseil, cabinet fictif de conseil en organisation et transformation digitale, 12 collaborateurs, Casablanca." },
        { id: 'cibles', label: 'Cibles *', placeholder: 'Qui doit être séduit ?', helper: 'Secteur, taille, rôle des décideurs.', required: true, example: 'Dirigeants de PME industrielles, logistiques et de services.' },
        { id: 'valeurs', label: 'Positionnement et valeurs *', placeholder: 'Trois valeurs maximum', helper: 'Choisissez peu de valeurs, mais claires.', required: true, example: 'Rigueur, clarté, accompagnement.' },
        { id: 'ton', label: 'Ton *', placeholder: 'Sobre, chaleureux, direct…', helper: 'Un adjectif ne suffit pas : ajoutez un exemple de formulation.', required: true, example: 'Sobre et précis, vouvoiement, phrases courtes.' },
        { id: 'references', label: 'Références et anti-références', placeholder: 'Ce que vous aimez / refusez', helper: 'Les anti-références sont très utiles.', required: false, example: "Aimé : mise en page aérée, schémas clairs. Refusé : robots, néons, stock photos d'IA." },
        { id: 'contraintes', label: 'Contraintes *', placeholder: 'Usages, couleurs, accessibilité', helper: 'Citez les supports : site, devis PDF, signature d’e-mail, présentation.', required: true, example: 'Site, devis PDF, signature d’e-mail ; contraste de texte lisible ; pas de rouge vif.' },
        { id: 'livrables', label: 'Livrables attendus *', placeholder: 'Que doit produire Claude ?', helper: 'Pistes, palette, polices, règles d’usage…', required: true, example: 'Trois directions contrastées avec palette HEX, polices, ton, forces et risques.' },
        { id: 'criteres', label: 'Critères de choix', placeholder: 'Comment comparerez-vous ?', helper: 'Fixez-les avant de voir les propositions.', required: false, example: 'Adéquation aux valeurs, lisibilité, différenciation, déclinabilité, risques.' },
      ],
      outputTemplate: `# Brief de design — {{presentation}}

## Contexte
{{presentation}}

## Cibles
{{cibles}}

## Positionnement et valeurs
{{valeurs}}

## Ton
{{ton}}

## Références et anti-références
{{references}}

## Contraintes
{{contraintes}}

## Livrables attendus
{{livrables}}

## Critères de choix
{{criteres}}

## Précisions pour Claude
- Réponds en français.
- Ne garantis ni disponibilité de nom, ni droit d'usage des polices ou images.
- Signale ce qui doit être vérifié par un humain.
`,
      hints: [
        { id: 'm3-e1-h1', level: 1, text: 'Commencez par les cibles : tout le reste en découle.' },
        { id: 'm3-e1-h2', level: 2, text: 'Les anti-références évitent beaucoup d’itérations inutiles.' },
        { id: 'm3-e1-h3', level: 3, text: 'Pour le ton, ajoutez un exemple de phrase que NOVA pourrait écrire.' },
      ],
    },
    {
      id: 'm3-e2',
      kind: 'direction-compare',
      title: 'Comparer trois directions de marque NOVA',
      instructions:
        "Consultez les trois directions statiques. Notez chacune de 1 à 5 sur les cinq critères, justifiez chaque note en une phrase, puis désignez la direction recommandée pour NOVA et les points à vérifier avant adoption.",
      durationMin: 10,
      directions: [...NOVA_BRAND_DIRECTIONS],
      comparisonCriteria: [
        'Adéquation aux valeurs (rigueur, clarté, accompagnement)',
        'Lisibilité et accessibilité (contrastes, tailles)',
        'Différenciation face aux cabinets concurrents',
        'Déclinabilité (site, PDF, signature d’e-mail)',
        'Risques (image, droits, coûts)',
      ],
      hints: [
        { id: 'm3-e2-h1', level: 1, text: 'Pensez à la cible : PME industrielles et logistiques.' },
        { id: 'm3-e2-h2', level: 2, text: 'Vérifiez le contraste texte/fond : par exemple terracotta sur crème pour les petits textes.' },
        { id: 'm3-e2-h3', level: 3, text: 'Aucune direction n’est « la bonne » : l’important est la justification par critères.' },
      ],
    },
  ],
  quiz: [
    {
      id: 'm3-q1',
      prompt: 'Quelle définition correspond à la charte graphique ?',
      choices: [
        { id: 'a', label: "Le signe qui désigne l'organisation (symbole ou texte stylisé)." },
        { id: 'b', label: "Le document de règles qui explique comment utiliser l'identité visuelle." },
        { id: 'c', label: "L'ensemble des campagnes publicitaires de l'année." },
        { id: 'd', label: 'Le fichier de logo au format PDF.' },
      ],
      correctId: 'b',
      explanation: "La charte est le mode d'emploi : couleurs, polices, tailles minimales, usages corrects et incorrects. Le logo n'en est qu'un élément.",
    },
    {
      id: 'm3-q2',
      prompt: 'Que peut-on dire des aperçus visuels générés par Claude (type Artifacts) ?',
      choices: [
        { id: 'a', label: 'Ce sont des logos définitifs, prêts pour le dépôt de marque.' },
        { id: 'b', label: 'Ils garantissent que les polices et images sont libres de droits.' },
        { id: 'c', label: 'Ce sont des pistes de travail ; disponibilité à vérifier selon compte et version.' },
        { id: 'd', label: 'Ils remplacent la validation par un designer.' },
      ],
      correctId: 'c',
      explanation: "Ces aperçus aident à explorer. Droits d'usage, originalité, accessibilité et qualité finale doivent être vérifiés par des humains.",
    },
    {
      id: 'm3-q3',
      prompt: "Quelle rubrique est indispensable dans un brief de design avant de demander des propositions ?",
      choices: [
        { id: 'a', label: 'Le nom du modèle de langage utilisé.' },
        { id: 'b', label: 'Les cibles et les valeurs de l’organisation.' },
        { id: 'c', label: 'Le budget publicitaire annuel.' },
        { id: 'd', label: 'La liste complète des clients.' },
      ],
      correctId: 'b',
      explanation: "Sans cibles ni valeurs, l'identité reflète des goûts personnels plutôt qu'une stratégie.",
    },
    {
      id: 'm3-q4',
      prompt: "Pour NOVA, la direction « Chaleur humaine » (terracotta sur crème) présente un point d'attention. Lequel ?",
      choices: [
        { id: 'a', label: "Les contrastes des petits textes sont à contrôler." },
        { id: 'b', label: "Elle est interdite pour une entreprise de conseil." },
        { id: 'c', label: "Elle ne peut pas être imprimée." },
        { id: 'd', label: 'Elle suppose forcément un logo animé.' },
      ],
      correctId: 'a',
      explanation: "Un terracotta clair sur un fond crème peut offrir un contraste insuffisant pour du texte courant. Il faut le mesurer avec un outil de contraste.",
    },
  ],
  practicalMission: {
    id: 'm3-mission',
    title: 'Brief de design et recommandation de direction',
    prompt:
      "Complétez le brief de design NOVA avec le constructeur, puis utilisez Claude pour obtenir trois directions contrastées. Comparez-les avec la grille de cinq critères (notes de 1 à 5 justifiées). Recommandez une direction pour NOVA et rédigez une mini-charte d'une page en Markdown (palette, deux polices, ton, trois règles d'usage). Terminez par la liste des vérifications humaines nécessaires avant adoption (licences, contrastes, avis d'un designer).",
    deliverables: [
      'Brief de design complet (huit rubriques)',
      'Tableau de comparaison des trois directions (notes justifiées)',
      'Recommandation motivée (5 lignes maximum)',
      "Mini-charte d'une page en Markdown",
      'Liste des vérifications humaines avant adoption',
    ],
    successCriteria: [
      'Le brief contient cibles, valeurs, ton, anti-références, contraintes et livrables.',
      'Les trois directions sont réellement contrastées.',
      'Chaque note est justifiée par une phrase.',
      "La mini-charte distingue identité, logo et charte, sans présenter un aperçu comme un logo final.",
      "Les limites (droits, contraste, avis d'un designer) sont explicitement mentionnées.",
    ],
    estimatedMin: 10,
  },
  verification: {
    id: 'm3-rubric',
    title: 'Grille de vérification — Module 3',
    maxPoints: 15,
    passThreshold: 10,
    criteria: [
      criterion('r1', 'Qualité du brief', 'Le brief couvre les rubriques essentielles.', levels(
        'Brief absent ou réduit à une phrase.',
        'Moins de cinq rubriques.',
        'Cinq à sept rubriques.',
        'Huit rubriques précises, avec anti-références.',
      )),
      criterion('r2', 'Distinction des notions', 'Identité, logo et charte sont employés correctement.', levels(
        'Notions confondues.',
        'Une notion correcte sur trois.',
        'Deux notions correctes sur trois.',
        'Trois notions correctes et illustrées.',
      )),
      criterion('r3', 'Comparaison des directions', 'Grille de critères appliquée avec justifications.', levels(
        'Aucune grille.',
        'Notes sans justification.',
        'Notes justifiées sur une partie des critères.',
        'Notes justifiées pour tous les critères et toutes les directions.',
      )),
      criterion('r4', 'Prudence sur les limites de Claude', 'Mention des droits, contrastes, validation humaine.', levels(
        'Aucune mention.',
        'Une limite mentionnée.',
        'Deux limites mentionnées.',
        'Trois limites ou plus, avec action de vérification.',
      )),
      criterion('r5', 'Mini-charte', 'Palette, polices, ton, règles d’usage cohérents avec la direction retenue.', levels(
        'Absente.',
        'Incomplète (un seul élément).',
        'Complète mais peu cohérente avec la direction.',
        'Complète, cohérente et concise.',
      )),
    ],
  },
  synthesis: {
    takeaways: [
      "L'identité visuelle est le système, le logo en est un élément, la charte graphique est le document de règles.",
      "Un brief clair (cibles, valeurs, ton, contraintes, livrables) conditionne la qualité des directions proposées par Claude.",
      "Les aperçus de Claude sont des pistes de travail (disponibilité à vérifier selon compte et version) : droits d'usage, contrastes et validation par un designer restent à votre charge.",
    ],
    nextModule: {
      id: 'm4',
      slug: 'm4-projets-memoire-contexte',
      title: 'Module 4 — Projets, mémoire et contexte',
      href: '/modules/m4-projets-memoire-contexte',
      teaser: 'Conservez le brief et les règles de NOVA dans un projet pour ne plus les répéter à chaque conversation.',
    },
  },
  instructorNotes: [
    {
      id: 'm3-n1',
      topic: 'Disclaimer Artifacts',
      text: "Lire le disclaimer à voix haute au début de la leçon 2. Insister : aperçu ≠ logo final ; disponibilité de la fonction variable (à vérifier selon compte et version). Prévoir un plan B sans aperçu : tableau Markdown des directions.",
      timingMin: 3,
      pitfalls: ["Ne pas promettre que l'aperçu visuel sera disponible pour tous les participants."],
    },
    {
      id: 'm3-n2',
      topic: 'Brief builder',
      text: "Faire remplir le brief en binômes. Un binôme joue la direction de NOVA, l'autre le prestataire. Relever les rubriques les plus difficiles (souvent le ton et les anti-références).",
      timingMin: 10,
    },
    {
      id: 'm3-n3',
      topic: 'Directions statiques',
      text: "Les trois directions sont fournies dans le module ; elles ne sont pas générées en direct. Les participants comparent sans relancer Claude, afin de travailler sur l'évaluation plutôt que sur la production.",
    },
    {
      id: 'm3-n4',
      topic: 'Aspects juridiques',
      text: "Rappeler brièvement le droit des marques, les licences de polices et d'images. Il ne s'agit pas de conseil juridique : orienter vers un professionnel pour toute décision.",
      pitfalls: ["Ne pas présenter une quelconque garantie d'originalité d'un nom ou logo généré."],
    },
  ],
  references: [
    { id: 'm3-ref1', label: 'WCAG — critères de contraste', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/', note: 'Référence générale sur l’accessibilité des contenus web.' },
    { id: 'm3-ref2', label: 'Fonction d’aperçu visuel de Claude (Artifacts)', note: 'Disponibilité et fonctionnement : à vérifier selon compte et version.', verifyUi: true },
  ],
}
