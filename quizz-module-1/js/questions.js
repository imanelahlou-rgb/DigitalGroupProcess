/* Quizz figé — module 1 « Modèles IA & Apprentissage » (20 questions).
   Source : quizz-module-1-modeles-ia-apprentissage.md — pas de question RAG. */
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
      text: "Que fait exactement un modèle mathématique d'IA ?",
      options: [
        { id: 'A', text: 'Il copie des réponses humaines stockées dans une base de données' },
        { id: 'B', text: 'Il applique une fonction mathématique paramétrée qui apprend des relations à partir de données pour produire une sortie' },
        { id: 'C', text: 'Il raisonne de façon logique comme un humain' },
        { id: 'D', text: 'Il consulte Internet en temps réel pour chaque réponse' },
      ],
      correctOptionId: 'B',
    },
    {
      id: 2,
      text: "Dans un réseau de neurones, quel est le rôle de la couche cachée ?",
      options: [
        { id: 'A', text: 'Elle reçoit les données brutes en entrée' },
        { id: 'B', text: 'Elle donne directement le résultat final' },
        { id: 'C', text: "Elle transforme progressivement l'information entre l'entrée et la sortie" },
        { id: 'D', text: "Elle stocke les données d'entraînement de façon permanente" },
      ],
      correctOptionId: 'C',
    },
    {
      id: 3,
      text: 'Parmi ces modèles, lequel est spécifiquement conçu pour un raisonnement approfondi (Large Reasoning Model) ?',
      options: [
        { id: 'A', text: 'SLM' },
        { id: 'B', text: 'LRM' },
        { id: 'C', text: 'VLM' },
        { id: 'D', text: 'Embedding Model' },
      ],
      correctOptionId: 'B',
    },
    {
      id: 4,
      text: "Lequel des éléments suivants n'est PAS une raison pour laquelle les LLMs sont devenus le point d'entrée des usages en entreprise ?",
      options: [
        { id: 'A', text: 'Le langage naturel comme interface' },
        { id: 'B', text: 'La polyvalence (un même modèle résume, rédige, répond)' },
        { id: 'C', text: "Leur capacité à garantir l'exactitude factuelle de chaque réponse" },
        { id: 'D', text: "L'intégration facile avec d'autres systèmes informatiques" },
      ],
      correctOptionId: 'C',
    },
    {
      id: 5,
      text: 'Quelle est une caractéristique correcte des modèles open-weight (Llama, Mistral, DeepSeek, Qwen) ?',
      options: [
        { id: 'A', text: 'Accès uniquement via API, zéro infrastructure à gérer' },
        { id: 'B', text: 'Poids et architecture confidentiels' },
        { id: 'C', text: 'Poids publiés, auto-hébergeables, avec possibilité de personnalisation en profondeur' },
        { id: 'D', text: 'Toujours plus performants que les modèles propriétaires sur tous les benchmarks' },
      ],
      correctOptionId: 'C',
    },
    {
      id: 6,
      text: "Même avec des données d'entraînement parfaites, un LLM peut halluciner. Pourquoi ?",
      options: [
        { id: 'A', text: 'Parce que le modèle choisit volontairement de mentir' },
        { id: 'B', text: "Parce que la sortie correspond à la probabilité la plus haute, ce qui crée une pression statistique qui n'est pas un défaut corrigible" },
        { id: 'C', text: 'Parce que les serveurs sont surchargés' },
        { id: 'D', text: "Parce que le modèle n'a pas accès à Internet" },
      ],
      correctOptionId: 'B',
    },
    {
      id: 7,
      text: "Dans l'apprentissage par renforcement, comment le modèle apprend-il ?",
      options: [
        { id: 'A', text: 'Il reçoit des exemples étiquetés avec la réponse attendue' },
        { id: 'B', text: 'Il cherche seul des régularités dans des données non étiquetées' },
        { id: 'C', text: 'Il apprend à privilégier les actions/réponses qui obtiennent une meilleure récompense' },
        { id: 'D', text: "Il copie directement les réponses d'un autre modèle" },
      ],
      correctOptionId: 'C',
    },
    {
      id: 8,
      text: 'Quel est le risque spécifiquement associé au Full Fine-Tuning (et non au PEFT) ?',
      options: [
        { id: 'A', text: 'Le catastrophic forgetting (perte de connaissances antérieures)' },
        { id: 'B', text: "L'impossibilité totale d'adapter le modèle" },
        { id: 'C', text: "L'absence de tout besoin en mémoire" },
        { id: 'D', text: 'Le risque de données obsolètes' },
      ],
      correctOptionId: 'A',
    },
    {
      id: 9,
      text: 'Quelle est la différence fondamentale entre LoRA et QLoRA ?',
      options: [
        { id: 'A', text: 'LoRA entraîne tous les paramètres, QLoRA aucun' },
        { id: 'B', text: "QLoRA quantifie le modèle de base (ex. en 4 bits) pour réduire la mémoire, tout en gelant les poids d'origine comme LoRA" },
        { id: 'C', text: 'LoRA est utilisé uniquement pour les modèles propriétaires' },
        { id: 'D', text: "QLoRA n'entraîne jamais de matrices supplémentaires" },
      ],
      correctOptionId: 'B',
    },
    {
      id: 10,
      text: 'Quel événement est cité comme déclencheur de la "révolution de l\'IA" dans l\'introduction ?',
      options: [
        { id: 'A', text: "Le lancement d'AlphaGo" },
        { id: 'B', text: "L'arrivée de ChatGPT" },
        { id: 'C', text: 'La sortie du premier smartphone' },
        { id: 'D', text: "La création d'Internet" },
      ],
      correctOptionId: 'B',
    },
    {
      id: 11,
      text: "Qu'est-ce qui caractérise l'apprentissage supervisé ?",
      options: [
        { id: 'A', text: 'Le modèle reçoit des données sans aucune réponse fournie' },
        { id: 'B', text: 'Le modèle reçoit des exemples accompagnés de la réponse attendue, appelée étiquette ou label' },
        { id: 'C', text: 'Le modèle apprend uniquement par essai-erreur avec des récompenses' },
        { id: 'D', text: "Le modèle n'a besoin d'aucune donnée pour apprendre" },
      ],
      correctOptionId: 'B',
    },
    {
      id: 12,
      text: "Qu'est-ce qui caractérise l'apprentissage non-supervisé ?",
      options: [
        { id: 'A', text: 'Le modèle reçoit des données sans réponse explicitement fournie et doit apprendre les structures présentes (régularités, ressemblances, relations)' },
        { id: 'B', text: 'Le modèle reçoit systématiquement une récompense pour chaque bonne réponse' },
        { id: 'C', text: 'Le modèle est entraîné uniquement sur des exemples étiquetés par des experts' },
        { id: 'D', text: 'Le modèle ne traite que des données numériques' },
      ],
      correctOptionId: 'A',
    },
    {
      id: 13,
      text: "Que donne le pré-entraînement d'un LLM, avant tout fine-tuning ?",
      options: [
        { id: 'A', text: 'Un modèle déjà spécialisé pour une tâche précise' },
        { id: 'B', text: "Un modèle généraliste qui sait manipuler le langage mais qui n'est pas spécialisé à une tâche particulière" },
        { id: 'C', text: 'Un modèle incapable de générer du texte' },
        { id: 'D', text: "Un modèle qui n'a plus besoin d'aucune donnée pour fonctionner" },
      ],
      correctOptionId: 'B',
    },
    {
      id: 14,
      text: 'Quelle est la différence de mécanisme entre les Adapters classiques et LoRA ?',
      options: [
        { id: 'A', text: 'Les Adapters ajoutent de petits modules entraînables entre certaines couches du modèle, tandis que LoRA entraîne de petites matrices de correction appliquées aux poids de certaines couches (poids d\'origine gelés dans les deux cas)' },
        { id: 'B', text: 'Les Adapters modifient tous les poids du modèle, LoRA n\'en modifie aucun' },
        { id: 'C', text: 'LoRA ajoute des modules externes au modèle, les Adapters entraînent des matrices de correction' },
        { id: 'D', text: 'Les deux techniques sont strictement identiques' },
      ],
      correctOptionId: 'A',
    },
    {
      id: 15,
      text: 'Quel est un avantage propre aux Adapters classiques (PEFT) ?',
      options: [
        { id: 'A', text: 'Ils permettent une adaptation plus profonde que le full fine-tuning' },
        { id: 'B', text: 'Un même modèle général peut utiliser plusieurs adapters interchangeables (traduction, synthèse, analyse de sentiments, etc.)' },
        { id: 'C', text: "Ils ne nécessitent aucune donnée d'entraînement" },
        { id: 'D', text: 'Ils suppriment totalement le risque de catastrophic forgetting du modèle de base' },
      ],
      correctOptionId: 'B',
    },
    {
      id: 16,
      text: 'Dans quel cas faut-il choisir le Full Fine-Tuning plutôt que LoRA ou QLoRA ?',
      options: [
        { id: 'A', text: "Quand on dispose de peu de données et d'un seul GPU grand public" },
        { id: 'B', text: "Quand le modèle ne possède pas réellement la capacité recherchée, que LoRA reste insuffisant, et qu'on dispose d'un très grand dataset, de plusieurs GPU et d'un budget important" },
        { id: 'C', text: "Quand on veut juste adapter légèrement le ton d'un modèle" },
        { id: 'D', text: 'Quand on veut éviter tout risque de catastrophic forgetting' },
      ],
      correctOptionId: 'B',
    },
    {
      id: 17,
      text: 'Quand LoRA est-il généralement le "premier choix" ?',
      options: [
        { id: 'A', text: 'Lorsque le modèle ne sait pas du tout accomplir la tâche visée' },
        { id: 'B', text: 'Lorsque le modèle sait déjà globalement accomplir la tâche, mais doit être spécialisé, mieux suivre des instructions ou adopter un comportement particulier' },
        { id: 'C', text: 'Lorsqu\'on veut remplacer entièrement les connaissances du modèle de base' },
        { id: 'D', text: "Uniquement lorsqu'on dispose d'un cluster de GPU professionnels" },
      ],
      correctOptionId: 'B',
    },
    {
      id: 18,
      text: 'Quand faut-il choisir QLoRA plutôt que LoRA ?',
      options: [
        { id: 'A', text: 'Lorsqu\'on veut un modèle plus précis que le full fine-tuning' },
        { id: 'B', text: "Lorsqu'on souhaite effectuer le même type d'adaptation qu'avec LoRA, mais que la mémoire GPU est insuffisante" },
        { id: 'C', text: "Lorsqu'on n'a aucune contrainte de mémoire ni de budget" },
        { id: 'D', text: 'Uniquement pour les modèles propriétaires accessibles par API' },
      ],
      correctOptionId: 'B',
    },
    {
      id: 19,
      text: 'Dans le processus commun de préparation des données pour le fine-tuning, que vise l\'étape de "nettoyage et validation" ?',
      options: [
        { id: 'A', text: 'La tokenisation du texte en exemples instruction-réponse' },
        { id: 'B', text: 'La suppression des doublons, des erreurs, et des données sensibles non autorisées' },
        { id: 'C', text: "La séparation des données en jeux d'entraînement, de validation et de test" },
        { id: 'D', text: 'La quantification des poids du modèle en 4 bits' },
      ],
      correctOptionId: 'B',
    },
    {
      id: 20,
      text: 'Comment définit-on un neurone artificiel ?',
      options: [
        { id: 'A', text: "Une copie exacte d'un neurone biologique humain" },
        { id: 'B', text: 'Une petite fonction mathématique qui applique des paramètres appris à plusieurs entrées' },
        { id: 'C', text: 'Une unité de stockage de données brutes sans aucun calcul' },
        { id: 'D', text: 'Un algorithme de recherche sur Internet intégré au modèle' },
      ],
      correctOptionId: 'B',
    },
  ];
});
