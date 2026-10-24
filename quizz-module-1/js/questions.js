/* Quizz figé — module 1 « Modèles IA & Apprentissage ».
   Source : quizz-module-1-modeles-ia-apprentissage.md */
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
      text: "Selon le support, que fait exactement un modèle mathématique d'IA ?",
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
      text: "Lequel des éléments suivants n'est PAS cité dans le support comme raison pour laquelle les LLMs sont devenus le point d'entrée des usages en entreprise ?",
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
      text: 'Quelle est une caractéristique correcte des modèles open-weight (Llama, Mistral, DeepSeek, Qwen) selon le support ?',
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
      text: "Le support affirme que même avec des données d'entraînement parfaites, un LLM peut halluciner. Pourquoi ?",
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
      text: 'Selon le support, dans quel cas faut-il privilégier le RAG plutôt que le fine-tuning ?',
      options: [
        { id: 'A', text: 'Quand on veut un comportement stable et figé' },
        { id: 'B', text: 'Quand les informations sont récentes, privées, volumineuses ou régulièrement mises à jour' },
        { id: 'C', text: "Quand on dispose d'un budget illimité pour l'entraînement" },
        { id: 'D', text: 'Quand on veut éviter toute complexité technique' },
      ],
      correctOptionId: 'B',
    },
  ];
});
