/* Quizz figé — module 1 « Modèles IA & Apprentissage » (20 questions).
   Source : quizz-module-1-modeles-ia-apprentissage.md — pas de question RAG.
   Bonnes réponses réparties : 5×A, 5×B, 5×C, 5×D (ordre volontairement équilibré). */
(function (root, factory) {
  const questions = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = questions;
  }
  root.MODULE1_QUESTIONS = questions;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  return [
    {
      id: 1,
      text: "Que recouvre exactement l'intelligence artificielle ?",
      options: [
        { id: 'A', text: 'Une machine capable de ressentir des émotions comme un humain' },
        { id: 'B', text: "Un ensemble de techniques permettant à une machine d'exécuter des tâches qui nécessitent habituellement certaines capacités cognitives humaines (reconnaissance, prédiction, génération)" },
        { id: 'C', text: 'Un programme qui suit uniquement des règles fixes écrites à l\'avance sans aucune donnée' },
        { id: 'D', text: 'Un système qui remplace entièrement le jugement humain dans toutes les décisions' },
      ],
      correctOptionId: 'B',
    },
    {
      id: 2,
      text: 'Dans un réseau de neurones multicouche, comment est déterminée la sortie finale ?',
      options: [
        { id: 'A', text: 'Elle est choisie aléatoirement parmi toutes les couches' },
        { id: 'B', text: "Elle est fixée manuellement avant l'entraînement" },
        { id: 'C', text: "Elle ignore les couches cachées et dépend uniquement de l'entrée" },
        { id: 'D', text: 'Elle correspond à la probabilité la plus haute calculée par le réseau' },
      ],
      correctOptionId: 'D',
    },
    {
      id: 3,
      text: 'Lequel de ces modèles sert à transformer du texte en représentations vectorielles plutôt qu\'à générer du texte ?',
      options: [
        { id: 'A', text: 'Embedding Model' },
        { id: 'B', text: 'LLM' },
        { id: 'C', text: 'SLM' },
        { id: 'D', text: 'Speech Model' },
      ],
      correctOptionId: 'A',
    },
    {
      id: 4,
      text: "Parmi les raisons suivantes, laquelle justifie le choix des LLM comme point d'entrée technique plutôt que des modèles strictement spécialisés par tâche ?",
      options: [
        { id: 'A', text: 'Les LLM nécessitent une infrastructure dédiée différente pour chaque usage' },
        { id: 'B', text: 'Les LLM sont uniquement capables de traiter un seul type de tâche à la fois' },
        { id: 'C', text: "Un même LLM peut résumer, rédiger et répondre à des questions sans changer d'architecture (polyvalence)" },
        { id: 'D', text: 'Les LLM sont gratuits contrairement aux modèles spécialisés' },
      ],
      correctOptionId: 'C',
    },
    {
      id: 5,
      text: 'Un cabinet veut garder ses données strictement en interne tout en personnalisant profondément un modèle. Quel type d\'architecture correspond le mieux à ce besoin ?',
      options: [
        { id: 'A', text: 'Propriétaire/API uniquement (ex. GPT, Claude, Gemini)' },
        { id: 'B', text: 'Open-weight (ex. Llama, Mistral), auto-hébergé' },
        { id: 'C', text: "Un modèle qui n'existe que sous forme d'API sans aucun contrôle sur les poids" },
        { id: 'D', text: 'Un embedding model seul, sans LLM' },
      ],
      correctOptionId: 'B',
    },
    {
      id: 6,
      text: 'Un LLM répond avec assurance à une question sur un événement survenu après sa date d\'entraînement, en inventant des détails plausibles mais faux. Quelle limite illustre le mieux cette situation ?',
      options: [
        { id: 'A', text: "L'hallucination combinée à l'absence de données récentes dans son entraînement" },
        { id: 'B', text: 'Le manque de polyvalence du modèle' },
        { id: 'C', text: 'Un problème de quantification des paramètres' },
        { id: 'D', text: "Un défaut d'intégration avec d'autres systèmes" },
      ],
      correctOptionId: 'A',
    },
    {
      id: 7,
      text: 'Un modèle reçoit un grand corpus de texte brut, sans aucune étiquette, et doit en extraire seul les régularités entre les mots. De quel type d\'apprentissage s\'agit-il ?',
      options: [
        { id: 'A', text: 'Apprentissage supervisé' },
        { id: 'B', text: 'Apprentissage par renforcement' },
        { id: 'C', text: 'Apprentissage par transfert' },
        { id: 'D', text: 'Apprentissage non-supervisé' },
      ],
      correctOptionId: 'D',
    },
    {
      id: 8,
      text: 'Un modèle pré-entraîné sait manipuler le langage de façon générale mais échoue à respecter un format JSON strict demandé par une entreprise. Quelle étape permettrait de corriger spécifiquement ce comportement ?',
      options: [
        { id: 'A', text: 'Revenir au pré-entraînement avec plus de données générales' },
        { id: 'B', text: 'Changer uniquement la taille du modèle' },
        { id: 'C', text: 'Le fine-tuning sur un jeu de données spécialisé incluant ce format' },
        { id: 'D', text: "Ajouter une couche d'entrée supplémentaire" },
      ],
      correctOptionId: 'C',
    },
    {
      id: 9,
      text: 'Une équipe dispose d\'un très grand dataset, de plusieurs GPU et d\'un budget important, et le modèle ne possède pas du tout la capacité recherchée malgré un essai avec LoRA. Quelle approche correspond le mieux à ce cas ?',
      options: [
        { id: 'A', text: 'QLoRA uniquement' },
        { id: 'B', text: 'Full Fine-Tuning' },
        { id: 'C', text: 'Adapters classiques' },
        { id: 'D', text: "Aucun entraînement supplémentaire n'est nécessaire" },
      ],
      correctOptionId: 'B',
    },
    {
      id: 10,
      text: 'Pourquoi une entreprise choisirait-elle des Adapters plutôt qu\'un full fine-tuning pour gérer plusieurs spécialisations (RH, juridique, commercial) autour d\'un même LLM ?',
      options: [
        { id: 'A', text: 'Parce qu\'un même modèle général peut utiliser différents adapters interchangeables à moindre coût' },
        { id: 'B', text: 'Parce que les Adapters offrent une adaptation plus profonde que le full fine-tuning' },
        { id: 'C', text: 'Parce que les Adapters suppriment tout besoin de données d\'entraînement' },
        { id: 'D', text: 'Parce que les Adapters remplacent entièrement les poids d\'origine du modèle' },
      ],
      correctOptionId: 'A',
    },
    {
      id: 11,
      text: 'Un modèle sait déjà globalement effectuer la tâche demandée, mais doit être spécialisé et mieux suivre les instructions d\'une entreprise. Quelle technique de fine-tuning est généralement recommandée en premier dans ce cas ?',
      options: [
        { id: 'A', text: 'Full Fine-Tuning' },
        { id: 'B', text: "Aucune technique n'est nécessaire" },
        { id: 'C', text: 'Pré-entraînement from scratch' },
        { id: 'D', text: 'LoRA' },
      ],
      correctOptionId: 'D',
    },
    {
      id: 12,
      text: 'Une PME veut adapter un modèle 7B sur un seul GPU grand public, avec une mémoire limitée, en utilisant la même logique que LoRA. Quelle technique correspond le mieux à cette contrainte ?',
      options: [
        { id: 'A', text: 'Full Fine-Tuning' },
        { id: 'B', text: 'Adapters classiques' },
        { id: 'C', text: 'QLoRA' },
        { id: 'D', text: 'LoRA sans quantification' },
      ],
      correctOptionId: 'C',
    },
    {
      id: 13,
      text: "Quelle étape du processus commun de préparation des données consiste à diviser le corpus en sous-ensembles indépendants destinés à l'entraînement, à la validation et au test ?",
      options: [
        { id: 'A', text: 'Le nettoyage et la validation' },
        { id: 'B', text: 'La séparation des jeux de données' },
        { id: 'C', text: 'La collecte des données' },
        { id: 'D', text: 'La structuration et la tokenisation' },
      ],
      correctOptionId: 'B',
    },
    {
      id: 14,
      text: 'Quelle affirmation décrit le mieux la relation entre un neurone artificiel et une couche d\'un réseau de neurones ?',
      options: [
        { id: 'A', text: 'Une couche est composée de nombreux neurones artificiels, chacun étant une petite fonction mathématique appliquant des paramètres appris à plusieurs entrées' },
        { id: 'B', text: 'Une couche est un type particulier de neurone artificiel isolé' },
        { id: 'C', text: 'Un neurone artificiel contient plusieurs couches en son sein' },
        { id: 'D', text: "Il n'existe aucune relation entre neurone et couche dans un réseau de neurones" },
      ],
      correctOptionId: 'A',
    },
    {
      id: 15,
      text: 'Pourquoi le catastrophic forgetting est-il un risque associé au full fine-tuning, mais limité par les techniques PEFT comme LoRA ou les Adapters ?',
      options: [
        { id: 'A', text: "Parce que le full fine-tuning n'utilise aucune donnée d'entraînement" },
        { id: 'B', text: 'Parce que PEFT entraîne systématiquement plus de paramètres que le full fine-tuning' },
        { id: 'C', text: "Parce que le catastrophic forgetting n'existe que pour les modèles open-weight" },
        { id: 'D', text: "Parce que le full fine-tuning modifie l'ensemble des paramètres du modèle, alors que PEFT gèle l'essentiel des poids d'origine et n'entraîne qu'une petite partie" },
      ],
      correctOptionId: 'D',
    },
    {
      id: 16,
      text: 'Quel est un inconvénient propre aux modèles open-weight par rapport aux modèles propriétaires de pointe ?',
      options: [
        { id: 'A', text: 'Ils imposent toujours une architecture confidentielle' },
        { id: 'B', text: 'Ils ne peuvent jamais être personnalisés' },
        { id: 'C', text: 'Ils présentent parfois un écart de performance par rapport aux modèles propriétaires sur certains benchmarks' },
        { id: 'D', text: 'Ils nécessitent obligatoirement un accès API payant' },
      ],
      correctOptionId: 'C',
    },
    {
      id: 17,
      text: "Quelle est la conséquence directe du fait qu'un LLM génère la suite de texte la plus probable plutôt que de vérifier des faits ?",
      options: [
        { id: 'A', text: 'Il refuse systématiquement de répondre aux questions incertaines' },
        { id: 'B', text: 'Il peut produire une réponse fluide et confiante qui soit pourtant fausse' },
        { id: 'C', text: 'Il devient incapable de générer du texte cohérent' },
        { id: 'D', text: 'Il vérifie automatiquement chaque affirmation sur Internet avant de répondre' },
      ],
      correctOptionId: 'B',
    },
    {
      id: 18,
      text: 'Un VLM (Vision Language Model) se distingue principalement d\'un LLM classique par quelle capacité ?',
      options: [
        { id: 'A', text: 'Sa capacité à traiter conjointement des images et du texte' },
        { id: 'B', text: "Sa capacité à traiter uniquement de l'audio" },
        { id: 'C', text: 'Sa capacité à fonctionner sans aucun entraînement préalable' },
        { id: 'D', text: 'Sa capacité à remplacer les bases de données vectorielles' },
      ],
      correctOptionId: 'A',
    },
    {
      id: 19,
      text: "Un modèle de jeu apprend à choisir ses coups en maximisant une récompense reçue à la fin de chaque partie, sans qu'aucune réponse correcte ne lui soit indiquée à l'avance. Quel type d'apprentissage cela illustre-t-il ?",
      options: [
        { id: 'A', text: 'Apprentissage supervisé' },
        { id: 'B', text: 'Apprentissage non-supervisé' },
        { id: 'C', text: 'Apprentissage par transfert' },
        { id: 'D', text: 'Apprentissage par renforcement' },
      ],
      correctOptionId: 'D',
    },
    {
      id: 20,
      text: 'Lequel de ces cas d\'usage correspond le mieux à un scénario où le full fine-tuning est justifié plutôt que LoRA ?',
      options: [
        { id: 'A', text: "Adopter le ton d'une marque pour des emails commerciaux" },
        { id: 'B', text: 'Générer des réponses au format JSON pour un service client' },
        { id: 'C', text: 'Adapter profondément un modèle anglophone à une langue qu\'il maîtrise très mal' },
        { id: 'D', text: "Suivre des procédures internes simples d'une entreprise" },
      ],
      correctOptionId: 'C',
    },
  ];
});
