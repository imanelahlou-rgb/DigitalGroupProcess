import type { Module } from '../types'
import { criterion, levels } from '../helpers'
import { NOVA_SERVICES_CSV, NOVA_SERVICES_JSON } from '../nova'

const lesson1Body = `## 1. Pourquoi parler de formats avant de parler d'IA ?

Claude lit, produit et transforme des **fichiers**. Si vous ne savez pas distinguer un fichier de données d'un fichier de présentation, vous risquez de demander le mauvais livrable, ou de ne pas savoir le réutiliser. Ce module pose le vocabulaire minimal.

## 2. Définitions

- **Fichier** : un ensemble d'informations enregistré sous un nom, avec une **extension** (ex. \`.csv\`) qui indique à l'ordinateur comment l'ouvrir.
- **Format** : la manière dont l'information est *organisée* à l'intérieur du fichier (texte brut, tableau, arborescence de clés, mise en page fixe…).
- **Présentation** : la manière dont l'information est *affichée* à l'écran ou à l'impression (couleurs, polices, mise en page). Un même contenu peut avoir plusieurs présentations.
- **Exécutable** : un fichier qui contient des instructions que l'ordinateur **exécute** (ex. \`.bat\`). Ouvrir un exécutable n'est pas lire un document : cela déclenche des actions.

## 3. Explication approfondie : trois familles

| Famille | Question à se poser | Exemples |
|---|---|---|
| **Format de contenu / de données** | « Quelle information et comment est-elle structurée ? » | \`.txt\`, \`.md\`, \`.json\`, \`.csv\`, \`.yaml\` |
| **Format de présentation** | « Comment est-elle affichée ? » | \`.html\` (structure de page), \`.css\` (style), \`.pdf\` (mise en page figée) |
| **Format exécutable** | « Que va faire l'ordinateur ? » | \`.bat\` (script Windows) |

Deux points importants :

1. **Le contenu et la présentation peuvent être séparés.** Dans une page web, le \`.html\` porte la structure et le texte, le \`.css\` porte l'apparence. Changer la charte ne devrait pas obliger à réécrire le texte.
2. **L'extension n'est qu'une étiquette.** Renommer un fichier \`.csv\` en \`.pdf\` ne le transforme pas en PDF. Le format réel est déterminé par le contenu.

## 4. Exemple NOVA

NOVA Conseil conserve sa grille tarifaire dans un tableur. Pour préparer une proposition à Atlas Distribution, Salma demande à Claude trois sorties à partir de la même information :

- un **CSV** pour l'importer dans le tableur ;
- un **JSON** pour l'outil interne de devis ;
- un **Markdown** pour la section « Tarifs » d'une proposition.

Le contenu est identique (grille NOVA : N01 à 4 500 MAD HT, N03 à 3 000 MAD HT, etc.), seule l'organisation change. Elle demande ensuite un **PDF** pour l'envoi au client : c'est une présentation figée, pas un fichier à retravailler.

## 5. Erreurs fréquentes

- Confondre **format** (comment c'est organisé) et **présentation** (comment c'est affiché).
- Envoyer un PDF à un collègue qui doit *modifier* les données : préférer un format de données.
- Ouvrir un fichier \`.bat\` reçu d'une source inconnue : c'est un exécutable, il peut modifier ou supprimer des fichiers.
- Croire qu'un fichier est « sûr » parce qu'il a une extension familière.

## 6. Bonnes pratiques

- Avant de demander un livrable à Claude, répondez à trois questions : **Qui va l'utiliser ? Faut-il le modifier ? Sera-t-il lu par un humain ou une machine ?**
- Nommez les fichiers de façon explicite et stable : \`nova_tarifs_2026.csv\`.
- Ne lancez jamais un exécutable que vous n'avez pas relu ou dont vous ne maîtrisez pas la provenance.
- Conservez le fichier de données source et générez les présentations à partir de lui.
`

const lesson2Body = `## 1. Panorama des neuf formats du module

### Formats de contenu et de données

- **\`.txt\` — texte brut.** Aucun style, aucune structure imposée. Universel, mais pauvre.
- **\`.md\` — Markdown.** Texte brut avec une syntaxe légère (\`#\` pour un titre, \`-\` pour une liste, \`**gras**\`). Lisible tel quel, convertible en HTML. Format naturel des réponses de Claude.
- **\`.json\` — JSON.** Données structurées en paires clé/valeur et listes. Strict : guillemets doubles obligatoires, pas de virgule finale. Idéal pour les échanges entre outils.
- **\`.csv\` — valeurs séparées par des virgules** (ou points-virgules). Un tableau : une ligne = un enregistrement, la première ligne = les en-têtes. Attention au séparateur et à l'encodage (UTF-8) pour les accents.
- **\`.yaml\` — YAML.** Données structurées par **indentation**, plus lisibles que le JSON pour de la configuration. Très sensible aux espaces (pas de tabulations).

### Formats de présentation

- **\`.html\` — HTML.** Langage de structure des pages web : titres, paragraphes, tableaux, liens.
- **\`.css\` — CSS.** Feuille de style qui décrit l'apparence (couleurs, polices, marges) d'un document HTML.
- **\`.pdf\` — PDF.** Document à mise en page figée, fait pour être lu ou imprimé, pas pour être retravaillé.

### Format exécutable

- **\`.bat\` — script par lots Windows.** Liste de commandes exécutées par Windows. À manipuler avec prudence.

## 2. Exemples minimaux

Markdown :

~~~
# Offre N03
- Durée : 3 heures (formation pratique)
- Prix : 3 000 MAD HT
~~~

JSON :

~~~
{ "code": "N03", "nom": "Atelier IA initiation", "prix": 3000 }
~~~

CSV :

~~~
code,service,prix_mad_ht
N03,Atelier IA initiation,3000
~~~

YAML :

~~~
code: N03
nom: Atelier IA initiation
prix: 3000
~~~

## 3. Exemple NOVA : quel format pour quel besoin ?

| Besoin chez NOVA | Format adapté | Pourquoi |
|---|---|---|
| Notes de réunion rapides | \`.md\` ou \`.txt\` | Rapide, lisible partout |
| Grille tarifaire à importer dans le tableur | \`.csv\` | Tableau simple, compatible tableur |
| Échange avec l'outil de devis | \`.json\` | Structure stricte, lisible par une machine |
| Réglages d'un modèle de document | \`.yaml\` | Configuration lisible |
| Proposition envoyée à Atlas Distribution | \`.pdf\` | Mise en page figée, non modifiable par erreur |
| Page « Offres » du site de NOVA | \`.html\` + \`.css\` | Structure + apparence séparées |
| Sauvegarde nocturne d'un dossier | \`.bat\` | Script exécuté par Windows |

## 4. Erreurs fréquentes

- **JSON invalide** : guillemets simples, virgule après le dernier élément, clé sans guillemets.
- **CSV mal séparé** : un texte contenant une virgule (« Cartographie de processus, version 2 ») coupe la colonne si le champ n'est pas entouré de guillemets.
- **YAML indenté avec des tabulations** : le fichier devient illisible pour l'outil.
- **Accents illisibles** dans un CSV : problème d'encodage (enregistrer en UTF-8).
- **Demander un PDF « modifiable »** : un PDF se regénère, il ne se retravaille pas facilement.

## 5. Bonnes pratiques avec Claude

- Précisez le format de sortie **dans votre demande** : « Donne-moi un CSV avec les colonnes code, service, duree_jours, prix_mad_ht ».
- **Vérifiez** la sortie : un JSON généré doit être validé avant usage (un validateur en ligne ou votre éditeur le fait).
- Pour un PDF ou une page web, demandez d'abord le **contenu en Markdown**, validez-le, puis la mise en forme.
- Ne faites pas confiance à une extension seule : ouvrez le fichier et contrôlez-le.
- Demander la création ou le téléchargement de fichiers dépend de l'interface (« à vérifier selon compte et version »). À défaut, copiez le texte généré dans un fichier que vous nommez vous-même.
`

const lesson3Body = `## 1. Définition : le bon format est une décision de conception

Choisir un format, c'est arbitrer entre **lisibilité humaine**, **rigueur pour la machine** et **durabilité**. Il n'existe pas de « meilleur » format dans l'absolu.

## 2. Explication approfondie : une grille de choix en trois questions

1. **Le lecteur est-il une personne ou un programme ?** Personne : \`.md\`, \`.pdf\`, \`.html\`. Programme : \`.json\`, \`.csv\`, \`.yaml\`.
2. **Le contenu doit-il être modifié par la suite ?** Oui : format source (\`.md\`, \`.csv\`, \`.json\`). Non : \`.pdf\`.
3. **Y a-t-il un risque ?** Si le fichier déclenche des actions (\`.bat\`), il exige une relecture et une provenance sûre.

## 3. Exemple NOVA

Karim prépare le compte rendu d'un atelier N03 (3 000 MAD HT) pour Rif Atelier. Il demande à Claude :

1. un **résumé en Markdown** (pour relecture et corrections) ;
2. un **tableau CSV** des cas d'usage priorisés (pour le suivi) ;
3. après validation uniquement, une **version PDF** (pour envoi).

Chaque format a un rôle, et le PDF n'arrive qu'en dernier, une fois le contenu stabilisé.

## 4. Erreurs fréquentes

- Produire le PDF en premier, puis devoir tout régénérer à chaque correction.
- Mélanger plusieurs formats dans une même réponse sans les séparer clairement.
- Ne pas indiquer à Claude le **public** et l'**usage** du fichier.

## 5. Bonnes pratiques

- Écrivez dans votre demande : *le format, la structure attendue (colonnes, clés, sections), le public, l'usage*.
- Demandez un **exemple de deux lignes** avant de générer un fichier complet.
- Relisez toujours la sortie : un modèle de langage peut produire un fichier syntaxiquement correct mais factuellement erroné.
- Aucun format n'est un gage de qualité : la validation humaine reste nécessaire.
`

export const module1: Module = {
  id: 'm1',
  slug: 'm1-formats-de-fichiers',
  title: 'Module 1 — Formats de fichiers : lire, produire, choisir',
  durationMin: 35,
  objectives: [
    'Distinguer un format de contenu, une présentation et un exécutable.',
    'Reconnaître le rôle de neuf extensions courantes : txt, md, json, csv, yaml, pdf, html, css, bat.',
    'Corriger de petites erreurs de syntaxe en Markdown, JSON et CSV.',
    'Formuler à Claude une demande précise de format de sortie.',
    'Choisir le format adapté à un usage donné chez NOVA Conseil.',
  ],
  situation:
    "NOVA Conseil prépare une proposition pour Atlas Distribution et doit réutiliser la même grille tarifaire dans trois contextes : le tableur, l'outil de devis et le document envoyé au client. Salma Benjelloun constate que les collègues échangent des fichiers dans des formats variés, sans règle commune. Un fichier de données a déjà été envoyé en PDF alors qu'il devait être modifié. Karim propose de s'appuyer sur Claude pour produire et convertir les contenus, mais il faut d'abord que chacun sache distinguer et nommer les formats.",
  lessons: [
    {
      id: 'm1-l1',
      title: 'Format, présentation, exécutable : poser le vocabulaire',
      durationMin: 10,
      body: lesson1Body,
      keyTerms: [
        { term: 'Extension', definition: "Suffixe du nom de fichier (ex. .csv) qui indique le format attendu." },
        { term: 'Format', definition: "Manière dont l'information est organisée dans le fichier." },
        { term: 'Présentation', definition: "Manière dont l'information est affichée ou imprimée." },
        { term: 'Exécutable', definition: "Fichier dont les instructions sont exécutées par l'ordinateur." },
      ],
    },
    {
      id: 'm1-l2',
      title: 'Panorama des neuf formats : txt, md, json, csv, yaml, pdf, html, css, bat',
      durationMin: 15,
      body: lesson2Body,
      keyTerms: [
        { term: 'Markdown', definition: 'Syntaxe légère de mise en forme de texte, convertible en HTML.' },
        { term: 'JSON', definition: 'Format de données en clés/valeurs, strict sur la syntaxe.' },
        { term: 'CSV', definition: 'Tableau en texte, une ligne par enregistrement.' },
        { term: 'YAML', definition: "Format de données structuré par indentation." },
      ],
    },
    {
      id: 'm1-l3',
      title: 'Choisir le format adapté et le demander à Claude',
      durationMin: 5,
      body: lesson3Body,
    },
  ],
  demo: {
    title: 'Une même information en trois formats',
    prerequisites: [
      'Accès à Claude (interface web ou application ; disponibilité des fonctions : à vérifier selon compte et version).',
      'Un éditeur de texte simple (Bloc-notes ou équivalent).',
    ],
    steps: [
      {
        number: 1,
        title: 'Fournir la source',
        instruction:
          "Collez dans Claude la grille tarifaire NOVA (cinq lignes : N01 4 500, N02 6 500, N03 3 000, N04 5 500, N05 9 000 MAD HT) sous forme de texte libre.",
        expected: 'Claude confirme avoir lu cinq services avec leur prix.',
      },
      {
        number: 2,
        title: 'Demander un CSV',
        instruction:
          "Demandez : « Transforme cette grille en CSV avec les colonnes code, service, duree_jours, prix_mad_ht. Réponds uniquement avec le CSV. »",
        expected: 'Un tableau de 6 lignes (en-tête + 5), séparé par des virgules.',
      },
      {
        number: 3,
        title: 'Demander un JSON',
        instruction:
          "Demandez : « Donne le même contenu en JSON valide, avec une liste « services ». »",
        expected: 'Un objet JSON avec cinq éléments, guillemets doubles, sans virgule finale.',
      },
      {
        number: 4,
        title: 'Demander un Markdown',
        instruction: "Demandez : « Présente le même contenu en tableau Markdown pour une proposition commerciale. »",
        expected: 'Un tableau Markdown avec en-têtes et cinq lignes.',
      },
      {
        number: 5,
        title: 'Vérifier',
        instruction:
          "Copiez chaque sortie dans un fichier (.csv, .json, .md). Contrôlez les cinq prix et validez le JSON dans votre éditeur.",
        expected: 'Les prix correspondent exactement à la grille NOVA ; le JSON s’ouvre sans erreur.',
      },
    ],
    expectedResult:
      'Trois fichiers (CSV, JSON, Markdown) contenant la même information, chacun adapté à un usage différent, avec les prix NOVA exacts.',
    varianceNote:
      "Les réponses d'un modèle de langage varient d'une exécution à l'autre : l'ordre des colonnes, les noms de clés ou la mise en forme peuvent différer. L'essentiel est de vérifier le contenu (prix, codes) et la validité syntaxique, pas de reproduire mot pour mot l'exemple.",
  },
  exercises: [
    {
      id: 'm1-e1',
      kind: 'file-edit',
      format: 'markdown',
      title: 'Structurer une note en Markdown',
      instructions:
        "La note ci-dessous est un texte brut. Transformez-la en Markdown : un titre de niveau 1, deux titres de niveau 2, une liste à puces pour les offres, et le prix N03 en gras.",
      durationMin: 5,
      starter: `Note de réunion Rif Atelier
Participants : Salma, Karim
Offres discutees
N03 Atelier IA initiation 3000 MAD HT
N01 Diagnostic de maturite digitale 4500 MAD HT
Prochaines etapes
Envoyer la proposition sous 48 h`,
      solution: `# Note de réunion — Rif Atelier

Participants : Salma, Karim

## Offres discutées

- N03 — Atelier IA initiation : **3 000 MAD HT**
- N01 — Diagnostic digital : 4 500 MAD HT

## Prochaines étapes

- Envoyer la proposition sous 48 h
`,
      checks: [
        { id: 'c1', description: 'Un titre de niveau 1', type: 'md-has-heading', value: '1', failMessage: 'Ajoutez un titre commençant par « # ».' },
        { id: 'c2', description: 'Au moins deux titres de niveau 2', type: 'regex', value: '(^|\\n)## [^\\n]+[\\s\\S]*\\n## [^\\n]+', failMessage: 'Ajoutez deux titres commençant par « ## ».' },
        { id: 'c3', description: 'Une liste à puces', type: 'md-has-list', failMessage: 'Ajoutez au moins une liste avec « - ».' },
        { id: 'c4', description: 'Prix N03 en gras', type: 'regex', value: '\\*\\*[^*]*3\\s?000[^*]*\\*\\*', failMessage: 'Entourez le prix N03 de « ** ».' },
      ],
      hints: [
        { id: 'm1-e1-h1', level: 1, text: 'Un titre de niveau 1 commence par « # » suivi d’une espace.' },
        { id: 'm1-e1-h2', level: 2, text: 'Les titres de niveau 2 commencent par « ## ». Les puces par « - ».' },
        { id: 'm1-e1-h3', level: 3, text: 'Exemple : « - N03 — Atelier IA initiation : **3 000 MAD HT** ».' },
      ],
    },
    {
      id: 'm1-e2',
      kind: 'file-edit',
      format: 'json',
      title: 'Corriger un JSON invalide',
      instructions:
        "Le JSON ci-dessous contient trois erreurs de syntaxe. Corrigez-le pour qu'il devienne valide et qu'il contienne les clés « code », « nom » et « prix » pour chaque service.",
      durationMin: 5,
      starter: `{
  'entreprise': "NOVA Conseil",
  "services": [
    { "code": "N01", "nom": "Diagnostic digital", "prix": 4500 },
    { "code": "N03", "nom": "Atelier IA initiation", "prix": 3000, },
  ]
}`,
      solution: `{
  "entreprise": "NOVA Conseil",
  "services": [
    { "code": "N01", "nom": "Diagnostic digital", "prix": 4500 },
    { "code": "N03", "nom": "Atelier IA initiation", "prix": 3000 }
  ]
}`,
      checks: [
        { id: 'c1', description: 'JSON syntaxiquement valide', type: 'json-valid', failMessage: 'Cherchez les guillemets simples et les virgules finales.' },
        { id: 'c2', description: 'Clés présentes : entreprise, services', type: 'json-has-keys', value: ['entreprise', 'services'], failMessage: 'Les clés doivent être entourées de guillemets doubles.' },
        { id: 'c3', description: 'Prix N03 inchangé à 3000', type: 'regex', value: '"prix"\\s*:\\s*3000\\b', failMessage: 'Ne modifiez pas les prix.' },
      ],
      hints: [
        { id: 'm1-e2-h1', level: 1, text: 'JSON n’accepte que les guillemets doubles.' },
        { id: 'm1-e2-h2', level: 2, text: 'Aucune virgule n’est permise après le dernier élément d’une liste ou d’un objet.' },
        { id: 'm1-e2-h3', level: 3, text: 'Trois corrections : clé « entreprise » en guillemets doubles, virgule après 3000 à supprimer, virgule après le dernier objet à supprimer.' },
      ],
    },
    {
      id: 'm1-e3',
      kind: 'file-edit',
      format: 'csv',
      title: 'Compléter et fiabiliser un CSV',
      instructions:
        "Complétez ce CSV avec les services N04 et N05 (prix exacts de la grille NOVA) et mettez entre guillemets les champs contenant une virgule. Conservez quatre colonnes.",
      durationMin: 5,
      starter: `code,service,duree_jours,prix_mad_ht
N01,Diagnostic digital,3,4500
N02,Organisation documentaire, version détaillée,5,6500
N03,Atelier IA initiation,0.5,3000`,
      solution: `code,service,duree_jours,prix_mad_ht
N01,Diagnostic digital,3,4500
N02,"Organisation documentaire, version détaillée",5,6500
N03,Atelier IA initiation,0.5,3000
N04,Cartographie de processus,4,5500
N05,Accompagnement automatisation,8,9000
`,
      checks: [
        { id: 'c1', description: 'Colonnes attendues', type: 'csv-columns', value: ['code', 'service', 'duree_jours', 'prix_mad_ht'], failMessage: "L'en-tête doit comporter quatre colonnes." },
        { id: 'c2', description: 'Cinq lignes de données', type: 'csv-min-rows', value: 5, failMessage: 'Ajoutez N04 et N05.' },
        { id: 'c3', description: 'Prix N04 = 5500', type: 'regex', value: 'N04,[^\\n]*,5500', failMessage: 'Le prix de N04 est 5500 MAD HT.' },
        { id: 'c4', description: 'Prix N05 = 9000', type: 'regex', value: 'N05,[^\\n]*,9000', failMessage: 'Le prix de N05 est 9000 MAD HT.' },
        { id: 'c5', description: 'Champ avec virgule entre guillemets', type: 'contains', value: '"Organisation documentaire, version détaillée"', failMessage: 'Entourez le champ de guillemets doubles.' },
      ],
      hints: [
        { id: 'm1-e3-h1', level: 1, text: 'Une virgule dans un champ crée une colonne de trop.' },
        { id: 'm1-e3-h2', level: 2, text: 'Entourez le champ concerné de guillemets doubles.' },
        { id: 'm1-e3-h3', level: 3, text: 'N04 = Cartographie de processus, 4 jours, 5500 ; N05 = Accompagnement automatisation, 8 jours, 9000.' },
      ],
      assets: [
        {
          id: 'm1-a-csv',
          filename: 'nova_tarifs.csv',
          kind: 'copyable-text',
          mimeType: 'text/csv',
          description: 'Grille tarifaire NOVA de référence (CSV).',
          content: NOVA_SERVICES_CSV,
        },
      ],
    },
    {
      id: 'm1-e4',
      kind: 'matching',
      title: 'Associer sept extensions à leur rôle',
      instructions:
        'Associez chaque extension à son rôle principal, puis rangez-la dans la bonne famille : données, présentation ou exécutable.',
      durationMin: 5,
      pairs: [
        { id: 'p1', left: '.md', right: 'Texte avec syntaxe légère de mise en forme (titres, listes, gras)', category: 'texte', feedback: 'Markdown : lisible tel quel et convertible en HTML.' },
        { id: 'p2', left: '.json', right: 'Données structurées en clés/valeurs, syntaxe stricte', category: 'données', feedback: 'JSON : très utilisé pour échanger entre outils.' },
        { id: 'p3', left: '.csv', right: 'Tableau en texte : une ligne par enregistrement', category: 'données', feedback: 'CSV : attention au séparateur et à l’encodage UTF-8.' },
        { id: 'p4', left: '.yaml', right: 'Données ou configuration structurées par indentation', category: 'configuration', feedback: 'YAML : sensible aux espaces, pas de tabulations.' },
        { id: 'p5', left: '.pdf', right: 'Document à mise en page figée, destiné à la lecture ou à l’impression', category: 'document', feedback: 'PDF : présentation figée, peu adaptée à la modification.' },
        { id: 'p6', left: '.html', right: 'Structure et contenu d’une page web', category: 'présentation', feedback: 'HTML : structure ; son apparence est décrite par le CSS.' },
        { id: 'p7', left: '.bat', right: 'Script Windows dont les commandes sont exécutées par le système', category: 'exécutable', feedback: 'BAT : exécutable, ne jamais lancer sans relecture.' },
      ],
      hints: [
        { id: 'm1-e4-h1', level: 1, text: 'Une seule extension de la liste est un exécutable.' },
        { id: 'm1-e4-h2', level: 2, text: 'JSON, CSV et YAML sont des formats de données ; PDF et HTML relèvent de la présentation/du document.' },
        { id: 'm1-e4-h3', level: 3, text: 'Le .md est du texte formaté ; le .yaml sert surtout à la configuration.' },
      ],
    },
  ],
  quiz: [
    {
      id: 'm1-q1',
      prompt: 'Quelle affirmation distingue correctement format et présentation ?',
      choices: [
        { id: 'a', label: "Le format décrit l'organisation de l'information ; la présentation décrit son affichage." },
        { id: 'b', label: 'Le format est toujours le PDF ; la présentation est toujours le HTML.' },
        { id: 'c', label: "Il n'y a aucune différence, ce sont deux mots pour la même chose." },
        { id: 'd', label: "La présentation désigne uniquement le contenu d'un diaporama." },
      ],
      correctId: 'a',
      explanation:
        "Le format organise l'information (ex. clés/valeurs, tableau) ; la présentation en règle l'apparence (couleurs, polices, mise en page).",
    },
    {
      id: 'm1-q2',
      prompt: 'Parmi ces extensions, laquelle désigne un fichier exécutable sous Windows ?',
      choices: [
        { id: 'a', label: '.csv' },
        { id: 'b', label: '.css' },
        { id: 'c', label: '.yaml' },
        { id: 'd', label: '.bat' },
      ],
      correctId: 'd',
      explanation: 'Le .bat est un script par lots : ses commandes sont exécutées par Windows. Il exige prudence et relecture.',
    },
    {
      id: 'm1-q3',
      prompt: 'Quelle est l’erreur de syntaxe la plus fréquente dans un JSON généré ou écrit à la main ?',
      choices: [
        { id: 'a', label: 'Utiliser des guillemets doubles autour des clés.' },
        { id: 'b', label: 'Laisser une virgule après le dernier élément.' },
        { id: 'c', label: 'Écrire un nombre sans guillemets.' },
        { id: 'd', label: 'Utiliser des accolades pour un objet.' },
      ],
      correctId: 'b',
      explanation: 'La virgule finale est refusée par JSON. Guillemets doubles, nombres sans guillemets et accolades sont corrects.',
    },
    {
      id: 'm1-q4',
      prompt: 'NOVA doit envoyer une proposition que le client ne doit pas modifier par erreur. Quel format choisir pour l’envoi ?',
      choices: [
        { id: 'a', label: '.csv' },
        { id: 'b', label: '.pdf' },
        { id: 'c', label: '.json' },
        { id: 'd', label: '.bat' },
      ],
      correctId: 'b',
      explanation: 'Le PDF fige la mise en page. On conserve la version source (Markdown, document) pour les corrections.',
    },
    {
      id: 'm1-q5',
      prompt: 'Quel rôle joue un fichier .css par rapport à un fichier .html ?',
      choices: [
        { id: 'a', label: "Il stocke les données du tableau affiché." },
        { id: 'b', label: "Il décrit l'apparence (couleurs, polices, marges) de la page." },
        { id: 'c', label: 'Il exécute des scripts sur le poste de travail.' },
        { id: 'd', label: 'Il compresse les images de la page.' },
      ],
      correctId: 'b',
      explanation: 'Le HTML porte la structure et le contenu, le CSS en gère le style. Les séparer facilite le changement de charte.',
    },
    {
      id: 'm1-q6',
      prompt: 'Claude vous a généré un CSV de la grille tarifaire. Quelle est la meilleure pratique avant de l’utiliser ?',
      choices: [
        { id: 'a', label: "L'utiliser tel quel : un modèle ne se trompe pas sur des chiffres." },
        { id: 'b', label: "Vérifier les prix et le nombre de colonnes avant tout usage." },
        { id: 'c', label: 'Renommer le fichier en .pdf pour le sécuriser.' },
        { id: 'd', label: 'Le convertir en .bat pour automatiser son usage.' },
      ],
      correctId: 'b',
      explanation: 'Un modèle de langage peut produire une sortie bien formée mais inexacte. La vérification humaine des chiffres reste obligatoire.',
    },
  ],
  practicalMission: {
    id: 'm1-mission',
    title: 'Fiche tarifs NOVA en trois formats',
    prompt:
      "À partir de la grille tarifaire NOVA (N01 4 500, N02 6 500, N03 3 000, N04 5 500, N05 9 000 MAD HT), demandez à Claude de produire : (1) un CSV, (2) un JSON, (3) un tableau Markdown. Vérifiez chaque sortie, corrigez ce qui doit l'être, puis rédigez une courte note (5 lignes maximum) indiquant quel format vous recommanderiez pour chacun des usages suivants : tableur interne, outil de devis, proposition client.",
    deliverables: [
      'Fichier nova_tarifs.csv',
      'Fichier nova_tarifs.json',
      'Fichier nova_tarifs.md',
      'Note de recommandation (5 lignes maximum)',
      'Le ou les prompts utilisés',
    ],
    successCriteria: [
      'Les cinq prix correspondent exactement à la grille NOVA.',
      'Le CSV comporte des en-têtes cohérentes et cinq lignes de données.',
      'Le JSON est valide (ouverture sans erreur dans un éditeur ou un validateur).',
      'La note associe chaque usage à un format et justifie en une phrase.',
      'Le prompt indique le format, la structure attendue et le public.',
    ],
    estimatedMin: 10,
    assets: [
      {
        id: 'm1-a-json',
        filename: 'nova_tarifs_reference.json',
        kind: 'copyable-text',
        mimeType: 'application/json',
        description: 'Version JSON de référence pour contrôler vos résultats.',
        content: NOVA_SERVICES_JSON,
      },
    ],
  },
  verification: {
    id: 'm1-rubric',
    title: 'Grille de vérification — Module 1',
    maxPoints: 15,
    passThreshold: 10,
    criteria: [
      criterion('r1', 'Exactitude des données', 'Les prix et codes reprennent la grille NOVA.', levels(
        'Plusieurs erreurs de prix ou de codes.',
        'Une erreur de prix ou de code.',
        'Données exactes mais incomplètes (service manquant ou durée absente).',
        'Les cinq services et prix sont exacts.',
      )),
      criterion('r2', 'Validité syntaxique', 'Les fichiers respectent la syntaxe de leur format.', levels(
        'Aucun fichier valide.',
        'Un seul fichier valide.',
        'Deux fichiers valides sur trois.',
        'Les trois fichiers sont valides.',
      )),
      criterion('r3', 'Choix des formats', 'La note associe correctement usages et formats.', levels(
        'Aucune association pertinente.',
        'Une association pertinente sur trois.',
        'Deux associations pertinentes sur trois.',
        'Trois associations pertinentes et justifiées.',
      )),
      criterion('r4', 'Qualité du prompt', 'Le prompt précise format, structure, public.', levels(
        'Prompt vague (« fais un tableau »).',
        'Un seul élément précisé.',
        'Format et structure précisés.',
        'Format, structure et public précisés.',
      )),
      criterion('r5', 'Vérification critique', 'L’apprenant a contrôlé et corrigé la sortie.', levels(
        'Aucune vérification visible.',
        'Vérification mentionnée sans correction.',
        'Une erreur identifiée et corrigée.',
        'Contrôle systématique documenté (prix, syntaxe, colonnes).',
      )),
    ],
  },
  synthesis: {
    takeaways: [
      "Format, présentation et exécutable répondent à trois questions différentes : comment c'est organisé, comment c'est affiché, ce que cela déclenche.",
      'Choisissez le format selon le lecteur (humain ou machine), le besoin de modification et le niveau de risque ; le PDF se produit en dernier.',
      "Précisez toujours à Claude le format, la structure et l'usage, puis vérifiez la sortie : la syntaxe correcte ne garantit pas l'exactitude.",
    ],
    nextModule: {
      id: 'm2',
      slug: 'm2-prompt-risen',
      title: 'Module 2 — Prompt engineering et cadre RISEN',
      href: '/modules/m2-prompt-risen',
      teaser: 'Vous savez demander un format ; apprenez maintenant à structurer une demande complète avec RISEN.',
    },
  },
  instructorNotes: [
    {
      id: 'm1-n1',
      topic: 'Ouverture (5 min)',
      text: "Commencer par une question : « Quelle est la différence entre un fichier Word et un PDF ? ». Faire émerger la notion de format modifiable vs figé avant de définir le vocabulaire.",
      timingMin: 5,
    },
    {
      id: 'm1-n2',
      topic: 'Démonstration',
      text: "Réaliser la démo en direct et laisser volontairement apparaître une variation (ordre des colonnes, noms de clés). Utiliser la variation pour montrer l'intérêt de préciser la structure dans le prompt.",
      timingMin: 8,
      pitfalls: [
        "Ne pas promettre qu'un fichier puisse être téléchargé directement : l'interface varie (à vérifier selon compte et version).",
      ],
    },
    {
      id: 'm1-n3',
      topic: 'Sécurité du .bat',
      text: "Insister : on ne lance pas un exécutable inconnu. Montrer le contenu d'un .bat dans un éditeur de texte (sans l'exécuter) pour démystifier.",
      pitfalls: ["Éviter toute démonstration d'exécution sur le poste des participants."],
    },
    {
      id: 'm1-n4',
      topic: 'Positionnement',
      text: "Rappeler que l'atelier est une formation DPG Academy, sans lien de certification avec Anthropic. Les prix NOVA sont fictifs et exacts : N01 4 500, N02 6 500, N03 3 000, N04 5 500, N05 9 000 MAD HT.",
    },
  ],
  references: [
    { id: 'm1-ref1', label: 'Spécification Markdown (CommonMark)', url: 'https://commonmark.org/', note: 'Référence de la syntaxe Markdown.' },
    { id: 'm1-ref2', label: 'JSON — introduction officielle', url: 'https://www.json.org/json-fr.html' },
    { id: 'm1-ref3', label: 'Création de fichiers par Claude', note: 'Disponibilité et emplacement des fonctions : à vérifier selon compte et version.', verifyUi: true },
  ],
}
