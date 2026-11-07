# DPG Academy — Dossier de référence pour intégration (Modules 1 & 2)

Ce document regroupe **tout** ce dont Cursor a besoin pour coder l'intégration des Modules 1 et 2 dans le site existant de l'Academy DPG : la spécification de design (gabarit global produit via Claude Design), le contenu intégral rédigé des deux modules, et les règles d'intégration attendues.

---

## A. Identité de marque & design tokens

Positionnement : **« luxe sobre »**. Fond sombre, accents or, typographie serif légère pour les titres, sans-serif pour le corps/l'UI.

### Polices

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Inter:wght@300;400;500&display=swap">
```

- Titres (`h1`–`h3`, citations de prompt) → **Cormorant Garamond**, graisse **300** (Light), classe utilitaire `.dpg-serif`
- Corps de texte / UI / navigation → **Inter**, graisses **300 / 400 / 500**

### Variables CSS (`:root`)

```css
:root{
  --dpg-bg:#0A0A0A;
  --dpg-surface:#141414;
  --dpg-surface-warm:#17130E;
  --dpg-gold:#B8860B;
  --dpg-gold-accent:#C9A84C;
  --dpg-gold-light:#E8C87A;
  --dpg-cream:#F5F0E8;
  --dpg-cream-muted:rgba(245,240,232,0.62);
  --dpg-cream-faint:rgba(245,240,232,0.4);
  --dpg-hairline:rgba(201,168,76,0.22);
  --dpg-hairline-soft:rgba(245,240,232,0.1);
}
body{ margin:0; background:var(--dpg-bg); color:var(--dpg-cream); font-family:'Inter',system-ui,sans-serif; -webkit-font-smoothing:antialiased; }
a{ color:var(--dpg-cream); text-decoration:none; }
::selection{ background:var(--dpg-gold); color:#0A0A0A; }
```

### Classes utilitaires globales

| Classe | Usage |
|---|---|
| `.dpg-serif` | Cormorant Garamond, weight 300 — tous les titres et citations |
| `.dpg-eyebrow` | Inter 500, 11px, letter-spacing 0.16em, uppercase, couleur `--dpg-gold-light` — labels/suréléments ("Concept", "Exercice", "Gabarit design system"…) |
| `.dpg-nav-link` / `.dpg-nav-link.is-active` | liens de navigation, 14px, `--dpg-cream-muted` → `--dpg-gold-light` au hover/actif |
| `.dpg-section-index` | numéro de section en gold ("01", "02"…), Inter 500 12px |
| `.dpg-sommaire-link` / `.is-active` | liens de la table des matières latérale (sidebar "Sommaire") |
| `.dpg-btn-outline` | bouton contour or, Inter 500 13px, radius 2px, hover fond or translucide |
| `.dpg-input` | champ de saisie sombre, radius 2px, focus bordure gold-accent |
| `table.dpg-token-table` + `.dpg-token-cell` | tableau de résultats/tokens, en-têtes en gold-light uppercase, cellules de valeur en gold-light |

### Media query mobile (`max-width: 760px`)

```css
@media (max-width: 760px){
  .dpg-header{ padding-inline:28px !important; }
  .dpg-header-nav{ display:none !important; }
  .dpg-row-wrap{ flex-direction:column !important; }
  .dpg-section-pad{ padding-inline:28px !important; }
}
```
→ sur mobile : padding horizontal réduit (64px → 28px) sur header et sections, nav horizontale masquée (prévoir un menu mobile si besoin), toute rangée flex (`.dpg-row-wrap`, ex. contenu + sidebar sommaire) passe en colonne.

---

## B. Composants du gabarit global (ordre et anatomie)

Le gabarit (maquette Claude Design "DPG Academy — Gabarit global") définit **7 blocs réutilisables**, communs à tous les modules (pas un gabarit par module) :

### 01 · `.dpg-header` — en-tête / navigation principale
- Barre fixe en haut : logo "DPG" (serif 25px) + séparateur vertical + libellé "Academy" (eyebrow), nav principale (Modules / Ressources / Progression), et à droite un indicateur de progression : libellé "Module {{étape}}" + barre de progression fine (2px, fond `--dpg-hairline-soft`, remplissage `--dpg-gold-accent` en largeur `{{progressPct}}`).
- Variable dynamique : `progress` (0–100%), paramétrable par leçon/étape (ex. valeur par défaut 37% = étape 3/8).
- Border-bottom 1px `--dpg-hairline-soft`.

### 02 · `.dpg-module-structure` — structure de page d'un module
- Fil d'Ariane (breadcrumb) : `Academy / Module X — <titre> / Leçon Y`, séparateurs "/" en gold-light.
- Titre de leçon en `.dpg-serif` 34px + sous-titre descriptif 14px en `--dpg-cream-muted`.
- Layout en 2 colonnes (`.dpg-row-wrap`, empile en mobile) :
  - **Sidebar "Sommaire"** (240px fixe) : liste de liens `.dpg-sommaire-link`, puce ronde pleine en gold-light sur le lien actif, puce transparente sinon.
  - **Contenu principal** (flex-grow) : paragraphes de contenu + bloc "visuel à intégrer" (placeholder encadré, à remplacer par un vrai schéma/illustration).

### 03 · `.dpg-lesson-card` — carte de leçon / bloc de contenu standard
- Carte avec bordure fine + fond `--dpg-surface`, padding 44px.
- Colonne texte (eyebrow "Concept" + titre serif 26px + paragraphe descriptif) + colonne visuel (placeholder encadré).
- Usage : présenter une notion isolée (ex. "la mémoire de Claude", "le fichier", "le format"…).

### 04 · `.dpg-exercise-block` — bloc d'exercice interactif
- Carte `--dpg-surface`, eyebrow "Exercice" + question en `.dpg-serif` 22px.
- Ligne de saisie : label + `.dpg-input` + bouton `.dpg-btn-outline` ("Vérifier").
- Deux cartes d'état de validation (`.dpg-row-wrap`, côte à côte / empilées en mobile) :
  - **✓ correct** : fond `--dpg-surface-warm`, bordure `--dpg-hairline`, icône cercle+coche SVG en gold-light, texte "Exact. …".
  - **✗ incorrect** : fond `--dpg-surface`, bordure `--dpg-hairline-soft`, icône cercle+croix SVG en gris translucide, texte "Pas tout à fait. …".
- Usage : exercices de vérification (Module 2) et prompts du fil rouge (Module 1) où l'apprenant compare sa réponse à la solution.

### 05 · `.dpg-demo-block` — bloc démo / exemple de prompt
- Fond `--dpg-surface-warm`, bordure supérieure 2px `--dpg-gold-accent` (accent horizontal).
- Eyebrow "Exemple de prompt" + citation en `.dpg-serif` italique 19px (le prompt lui-même, entre guillemets français « … ») + explication courte en dessous.
- Usage : afficher chaque prompt RISEN du Module 1 (ou tout exemple de prompt).

### 06 · `.dpg-result-table` — résultat structuré / tableau de données
- Légende courte au-dessus (13px, `--dpg-cream-faint`).
- Tableau `.dpg-token-table` dans un conteneur bordé avec scroll horizontal (`overflow-x:auto`).
- Usage direct pour le Module 2 : tableau des tokens par format (CSV/PDF/TXT/MD/JSON), tableau de comparaison PDF texte vs direct, tableau de résultats de l'exercice de vérification.

### 07 · `.dpg-footer` — pied de page
- Logo "DPG Academy" à gauche, liens (Mentions légales / Contact / digitalprocessgrp.com) au centre/droite, copyright "© Digital Process Group" à droite.
- Border-top 1px `--dpg-hairline-soft`.

### Marquage de section (répété dans toute la maquette)
Chaque bloc, dans la maquette, est introduit par un repère `<span class="dpg-section-index">0X</span>` + `<span class="dpg-eyebrow">…</span>` nommant le composant (ex. "01 · En-tête & navigation — .dpg-header"). **Ces repères sont des annotations de maquette pour l'intégration, pas du contenu final** : ils ne doivent pas apparaître sur le site livré, sauf si on souhaite les garder en mode "storybook" interne.

### Container global
`max-width: 1200px`, centré (`margin:0 auto`), padding horizontal section de `64px` (réduit à `28px` en mobile via `.dpg-section-pad`).

---

## C. Architecture du site attendue

- **Un seul gabarit global** (layout + design system ci-dessus), pas un gabarit par module : chaque module/leçon réutilise les mêmes composants 01→07, seul le contenu central change.
- Pages/sections à créer :
  1. **Module 1 — Découverte de Claude**
     - Intro du module
     - 5 notions (une `.dpg-lesson-card` ou suite de sections par notion : Projets, Artefacts, Tâches planifiées, Design, Skills)
     - Bloc mémoire (mémoire de projet vs mémoire de conversation, prompt récap, quand ouvrir une nouvelle conversation)
     - Exercice fil rouge (3 prompts RISEN), avec tableau de synthèse des 3 étapes + un `.dpg-demo-block` par prompt
     - Conclusion de l'exercice
  2. **Module 2 — Formats & coût IA**
     - 01 — Quatre notions (fichier / format / présentation / exécutable) + tableau de synthèse
     - 02 — Coût en tokens selon le format (tableau NOVA Conseil, explications par format, idée reçue, pourquoi JSON malgré le coût, attention à la validité)
     - 03 — Le piège du PDF (situation A / situation B, doc Anthropic, tableau comparatif, quelle méthode choisir)
     - 04 — Exercice de vérification (étapes 1 à 6, tableau de résultats à compléter, critères de réussite, conclusion du module)
- Navigation : header global avec nav "Modules / Ressources / Progression" + indicateur de progression dynamique (étape courante / total, barre de %).
- Sommaire latéral (`.dpg-sommaire-link`) par leçon/section du module en cours, avec lien actif en surbrillance au scroll (scrollspy) ou à la navigation.
- Module 3 : **abandonné pour l'instant**, ne pas créer de placeholder visible dans la nav tant qu'il n'est pas prêt (ou le laisser grisé/"à venir" si la nav existante le prévoit déjà).

---

## D. Contenu intégral — Module 1 : Découverte de Claude

> Rédaction finale, à intégrer telle quelle (reformulations mineures interdites sauf demande explicite). Les prompts RISEN doivent être affichés via le composant `.dpg-demo-block`, avec les éléments Role / Input / Steps / Expectation / Narrowing visuellement identifiables (ex. en gras ou en gold-light) à l'intérieur de la citation.

### Module 1 — Découverte de Claude

Ce module a un seul objectif : comprendre l'interface de Claude avant de s'en servir. Un outil mal compris est un outil mal exploité — on tape des prompts dans une simple fenêtre de conversation sans savoir qu'il existe des espaces de travail persistants, des livrables éditables, des automatisations programmées, un canevas visuel et une couche de personnalisation réutilisable.

Ce module passe en revue les 5 notions fondamentales de l'interface, explique comment fonctionne la mémoire de Claude, puis applique tout cela à un cas concret : monter, étape par étape, son propre cabinet de conseil en IA.

### Les 5 notions de l'interface Claude

Cinq briques composent l'espace de travail Claude. Elles se combinent : un Projet héberge des conversations, qui produisent des Artefacts, qui peuvent être régénérés automatiquement par une Tâche planifiée, mise en forme visuellement dans Design, le tout piloté par des Skills réutilisables.

#### 1. Les Projets

Un Projet est un espace de travail persistant : un conteneur qui regroupe des conversations, des fichiers de référence, des instructions personnalisées et une mémoire partagée, tous propres à un même sujet.

Ce qui change concrètement par rapport à une conversation isolée : tout ce qu'on dépose dans un Projet (un brief de marque, un catalogue d'offres, le CV d'un associé) reste disponible pour **toutes** les conversations futures ouvertes dans ce Projet. On ne répète plus le contexte à chaque nouvelle discussion — Claude le connaît déjà.

**À quoi ça sert :**
- Isoler un client, un dossier ou une activité dans son propre espace, avec ses propres règles
- Donner des instructions permanentes (ton, format, contraintes) qui s'appliquent à toutes les conversations du Projet
- Conserver des documents de référence consultables à tout moment, sans les rejoindre à chaque fois

**Cas cabinet :** un Projet "Digital Process Group" qui contient le brand brief, le catalogue des offres, les gabarits de devis. Chaque nouvelle conversation ouverte dans ce Projet — rédiger un post LinkedIn, préparer une proposition commerciale — part déjà de cette base, sans réexpliquer qui est le cabinet ni quelles sont ses couleurs de marque.

#### 2. Les Artefacts

Un Artefact est un livrable que Claude construit en dehors du fil de conversation : un document, une présentation, un tableur, un design visuel, un tableau de bord. Il vit sur sa propre page, avec son propre lien, modifiable et partageable indépendamment de la discussion qui l'a fait naître.

La différence avec une simple réponse dans le chat est fondamentale : une réponse de chat se lit une fois puis se perd dans le fil ; un Artefact est un objet qu'on retrouve, qu'on modifie, qu'on partage avec quelqu'un d'autre, qui garde son historique de versions.

**À quoi ça sert :**
- Produire un livrable final (document, présentation, visuel) qui doit survivre à la conversation
- Itérer dessus sans tout régénérer : on demande une modification, l'Artefact se met à jour à la même adresse
- Partager le résultat avec un tiers via un simple lien, sans exporter de fichier

**Cas cabinet :** générer le one-pager de positionnement du cabinet comme Artefact Design, ou le catalogue des 3 offres comme Artefact Doc — un objet qu'on peut ensuite envoyer à un prospect ou réviser la semaine suivante sans repartir de zéro.

#### 3. Les Tâches planifiées

Une Tâche planifiée permet à Claude de s'exécuter seul, à intervalle régulier (chaque jour, chaque semaine) ou à une date précise, sans qu'on ait besoin d'être présent pour déclencher la demande. Chaque exécution part d'une session neuve, effectue le travail défini, puis livre le résultat — en général sous forme de document ou de notification.

**À quoi ça sert :**
- Automatiser une veille, un suivi ou un rapport récurrent qu'on devrait sinon penser à demander chaque fois
- Garantir une régularité (le même jour, la même heure) sans dépendre de la mémoire humaine
- Déléguer une routine entière pour se concentrer sur ce qui demande un vrai jugement

**Cas cabinet :** une veille hebdomadaire programmée chaque lundi matin, qui va chercher les cas d'usage IA sectoriels récents et livre une synthèse prête à partager — sans qu'on ait à s'en souvenir soi-même.

#### 4. Design

Design est un canevas visuel : un espace où Claude construit des maquettes, pages, visuels ou mises en page sur un artboard, plutôt qu'une simple page de code HTML décrite en mots. C'est l'outil pour tout ce qui se juge d'abord à l'œil.

**À quoi ça sert :**
- Produire des maquettes de site, d'écrans d'application, d'affiches ou de visuels réseaux sociaux
- Itérer visuellement : ajuster une couleur, une typographie, une disposition, sans tout redécrire
- Obtenir un rendu fidèle à l'identité de marque avant de passer à l'intégration technique

**Cas cabinet :** construire la maquette du site vitrine ou du one-pager de positionnement du cabinet, dans les couleurs et la typographie de la marque — un visuel qu'on peut ensuite transmettre à un outil de développement pour l'intégrer réellement au site.

#### 5. Skills (personnalisation)

Une Skill est un ensemble d'instructions packagé et réutilisable, qui apprend à Claude à exécuter une tâche récurrente exactement selon une méthode définie une bonne fois pour toutes. C'est la couche de personnalisation : au lieu de retaper les mêmes consignes à chaque fois, on les enregistre une fois sous forme de Skill, puis on les invoque par leur nom — ou Claude les déclenche de lui-même quand la situation s'y prête.

**À quoi ça sert :**
- Standardiser une tâche répétitive (générer un devis, rédiger dans un ton précis, produire un format de document toujours identique)
- Garantir la cohérence : la méthode ne varie pas d'une fois à l'autre
- Combiner avec une Tâche planifiée pour automatiser entièrement une routine (la Skill définit *comment* faire, la Tâche planifiée définit *quand*)

**Cas cabinet :** une Skill "rédiger une offre commerciale DPG" qui applique toujours le même ton de marque, la même structure et les mêmes couleurs — invoquée à chaque nouvelle proposition, ou automatiquement par la veille hebdomadaire programmée.

### La mémoire dans Claude

Une fois les 5 notions posées, une question se pose naturellement : qu'est-ce que Claude retient, et pendant combien de temps ? Il existe deux mémoires de nature très différente — les confondre est la source de la plupart des frustrations des débutants.

#### Mémoire de projet

C'est la mémoire durable, attachée au Projet lui-même plutôt qu'à une seule conversation. Elle se construit progressivement : chaque document déposé, chaque fait établi dans une conversation du Projet devient disponible pour toutes les conversations futures ouvertes dans ce même Projet.

Trois propriétés à retenir :
- **Elle persiste** : fermer une conversation ne l'efface pas, elle reste attachée au Projet
- **Elle est partagée** : toute nouvelle conversation démarrée dans le Projet en hérite immédiatement, sans rien redemander
- **Elle est cumulative** : elle s'enrichit au fil des échanges, sans qu'on ait besoin de la mettre à jour manuellement à chaque fois

C'est elle qui permet, par exemple, qu'un Projet "cabinet de conseil" se souvienne du positionnement de marque, des 3 offres et du ton éditorial, conversation après conversation, des semaines plus tard.

#### Mémoire de conversation

À l'intérieur d'un même fil de discussion, le contexte s'accumule tour après tour : chaque message, chaque réponse, chaque fichier partagé reste visible par Claude pour la suite de cet échange précis. C'est ce qui permet de dire "continue" ou "raccourcis-le" sans tout réexpliquer.

Mais cette mémoire-là est différente de la mémoire de Projet sur un point essentiel : elle est **limitée à ce seul fil**. Elle ne persiste pas automatiquement ailleurs, et surtout elle n'est pas extensible à l'infini. Plus une conversation s'allonge, plus le volume d'échanges à garder en tête grossit — avec deux conséquences concrètes : les réponses deviennent plus lentes à produire, et le fil peut "diluer" une instruction donnée beaucoup plus tôt, qui finit par se perdre dans la masse.

#### Pourquoi faire un prompt récap

Dans une conversation qui s'allonge — une session de travail longue sur un même dossier — il devient utile de demander régulièrement à Claude un **prompt récap** : un résumé court des décisions prises, de l'état actuel du travail et des points encore ouverts.

Deux bénéfices concrets :
- **Un ancrage compact** : plutôt que de remonter tout le fil pour se rappeler où on en est, on dispose d'un résumé condensé à relire en quelques secondes
- **Une base saine pour la suite** : ce récap peut ensuite servir de point de départ si l'on décide de poursuivre dans une nouvelle conversation (voir ci-dessous), sans perdre le fil du travail accompli

En pratique, il suffit de demander : *"Fais-moi un récapitulatif de ce qu'on a décidé jusqu'ici et de ce qui reste à faire."*

#### Quand ouvrir une nouvelle conversation

Lorsqu'une conversation devient très longue, certains signes ne trompent pas : les réponses ralentissent, le fil devient difficile à suivre, une consigne donnée au tout début semble "oubliée". C'est le signal qu'il est temps d'arrêter d'empiler et de repartir sur un fil neuf.

La bonne méthode n'est pas de perdre ce qui a été construit, mais de :
1. Demander un **prompt récap** (voir ci-dessus) dans la conversation actuelle
2. Ouvrir une **nouvelle conversation**, à l'intérieur du **même Projet**
3. Coller ce récap en ouverture de la nouvelle conversation pour repartir avec l'essentiel, sans le poids de tout l'historique

Ceci montre tout l'intérêt de travailler dans un Projet plutôt que dans une conversation isolée : même si une conversation sature et qu'on en ouvre une nouvelle, la mémoire de Projet (documents, contexte durable) reste intacte et continue d'alimenter la suite — seul le fil de discussion ponctuel change.

### Exercice — Créer son cabinet de conseil avec Claude

Mise en pratique directe des notions vues plus haut : en 3 prompts, structurés selon le framework **RISEN** (Role, Input, Steps, Expectation, Narrowing), on pose les fondations d'un cabinet de conseil en IA — un Projet qui le structure, un Artefact qui l'habille visuellement, une Skill qui automatise sa veille.

Chaque étape mobilise une notion différente — c'est volontaire : l'exercice sert aussi à sentir, en les utilisant l'une après l'autre, ce qui distingue un Projet, un Artefact/Design et une Skill.

| Étape | Notion mobilisée | Résultat obtenu |
|---|---|---|
| 1 | Projet | Le cabinet structuré en 3 pôles, mémoire durable activée |
| 2 | Artefact / Design | Le one-pager de positionnement, visuel et réutilisable |
| 3 | Skill / Tâche planifiée | La veille hebdomadaire sectorielle, automatisée |

#### Étape 1 — Créer le Projet du cabinet

On commence par créer un **Projet** : c'est le socle qui portera la mémoire durable de tout ce qui suivra.

> **Prompt à utiliser (créer un nouveau Projet, puis coller ceci dans sa première conversation) :**
>
> *« Je veux structurer un cabinet de conseil en intelligence artificielle. Agis comme un consultant senior en stratégie de cabinets de conseil (**Role**). Voici les informations de base : le cabinet s'organise autour de 3 pôles — Formation IA (initiation, prompt engineering, systèmes agentiques), Conseil en IA (accompagnement stratégique, audit de maturité IA) et Ingénierie IA (développement d'automatisations et de systèmes agentiques sur mesure) (**Input**). Procède en 4 étapes (**Steps**) : 1) propose une structure claire qui articule les 3 pôles entre eux et explique leur complémentarité commerciale, 2) identifie pour chaque pôle 2 à 3 offres concrètes, 3) propose un modèle de tarification cohérent pour chaque pôle, 4) rédige une phrase de positionnement unique qui couvre les 3 pôles. Le résultat attendu est une structure prête à devenir la mémoire de référence du cabinet dans ce Projet — synthétique, actionnable, pas un essai théorique (**Expectation**). Limite-toi à une page maximum, pas de jargon de conseil creux, reste concret et orienté client final (**Narrowing**). »*

Une fois la réponse obtenue, on la garde directement dans ce Projet : c'est elle qui deviendra la mémoire de référence que toutes les conversations futures du cabinet pourront consulter.

#### Étape 2 — Produire le one-pager de positionnement (Artefact / Design)

Dans la même conversation — ou une nouvelle, toujours dans ce Projet — on demande maintenant un livrable visuel concret, en s'appuyant sur ce que le Projet sait déjà du cabinet.

> **Prompt à utiliser :**
>
> *« Agis comme un directeur artistique spécialisé en identité de marque pour cabinets de conseil haut de gamme (**Role**). Appuie-toi sur la structure du cabinet définie juste avant dans ce Projet — les 3 pôles, les offres, la phrase de positionnement (**Input**). Construis un one-pager de positionnement en Design : 1) un en-tête avec le nom du cabinet et la phrase de positionnement, 2) une présentation synthétique des 3 pôles avec leurs offres phares, 3) un bloc "pourquoi nous" avec 3 arguments de différenciation, 4) un bloc contact (**Steps**). Le résultat doit être un Artefact visuel, prêt à être montré à un prospect ou intégré ensuite à un site — pas un simple texte dans le chat (**Expectation**). Reste sur un registre sobre et premium : pas de superlatifs marketing, pas de mot "révolution" ou "disruption", une mise en page aérée (**Narrowing**). »*

Le résultat est un Artefact : il garde son propre lien, on peut y revenir, le modifier, le partager — sans jamais retaper le brief.

#### Étape 3 — Automatiser la veille hebdomadaire (Skill / Tâche planifiée)

Dernière étape : transformer une bonne pratique manuelle (chercher des cas d'usage sectoriels) en routine automatique, grâce à une Skill pilotée par une Tâche planifiée.

> **Prompt à utiliser :**
>
> *« Agis comme un veilleur spécialisé en cas d'usage IA appliqués aux secteurs d'activité des clients du cabinet (**Role**). Le cabinet cible les secteurs définis dans sa structure — industrie, logistique, services, éducation, finance (**Input**). Chaque semaine : 1) identifie 3 à 5 cas d'usage IA récents et concrets dans ces secteurs, 2) pour chacun, résume en 2 phrases le problème résolu et la technologie utilisée, 3) classe-les par pôle du cabinet (Formation / Conseil / Ingénierie) auquel ils pourraient le mieux servir d'exemple client (**Steps**). Le résultat attendu est une synthèse courte, prête à être réutilisée telle quelle dans un post LinkedIn ou une relance commerciale — pas une revue de presse exhaustive (**Expectation**). Exclu toute source non vérifiable ou plus vieille qu'un an ; une seule page ; aucun cas d'usage dupliqué d'une semaine à l'autre (**Narrowing**). »*

On enregistre ces instructions comme **Skill**, puis on la programme via une **Tâche planifiée** hebdomadaire (par exemple chaque lundi matin) : la veille arrive désormais sans qu'on ait à y repenser.

#### À la fin de l'exercice

En 3 prompts, le cabinet dispose de :
- un **Projet** qui porte en mémoire sa structure, ses offres et son positionnement — disponible pour toute conversation future, sans jamais le réexpliquer
- un **Artefact Design** présentable, modifiable et partageable : le one-pager de positionnement
- une **Skill** automatisée par une **Tâche planifiée**, qui livre chaque semaine une veille sectorielle prête à l'emploi

La suite logique — approfondie dans un prochain module — consiste à enrichir ce même Projet avec des Skills et Tâches planifiées supplémentaires, appliquées aux vrais livrables du cabinet.

---

## E. Contenu intégral — Module 2 : Formats & coût IA

> Page entièrement neuve dans le nouveau design (ce n'est pas une révision d'une ancienne page). Rédaction finale ChatGPT, à intégrer telle quelle.

### 01 — Quatre notions à clarifier d'abord

#### Fichier, format, présentation et exécutable : quatre notions différentes

Avant de comparer les coûts, il faut distinguer quatre notions souvent confondues.

**1. Le fichier : ce que l'on transmet**

Un fichier est un ensemble de données enregistré sur un support numérique. Il peut contenir du texte, des chiffres, des images, du son ou d'autres informations.

**Exemple :** `tarifs_nova.csv` est un fichier contenant les prix des prestations d'un cabinet de conseil.

Un fichier possède généralement un nom et une extension. L'extension donne une indication sur son format, sans suffire à garantir sa structure réelle.

**2. Le format : comment les données sont organisées**

Le format définit la manière dont les informations sont représentées et organisées dans un fichier. Un même ensemble de données peut être enregistré en `.txt`, `.md`, `.csv`, `.json` ou `.pdf`. Le contenu métier reste identique. En revanche, sa représentation change.

**Exemple :** une grille tarifaire peut être représentée par des lignes de texte, un tableau CSV, un tableau Markdown ou une liste d'objets JSON.

Ces représentations ne nécessitent pas forcément le même nombre de tokens pour transmettre les mêmes informations.

**3. La présentation : ce que l'on voit**

La présentation correspond à l'apparence visuelle des informations. Elle comprend notamment les couleurs, les polices, les alignements, les espacements et la disposition des éléments. Il faut distinguer la présentation de la structure des données.

**Exemple :** un tableau avec des bordures bleues et un tableau sans bordures peuvent contenir exactement les mêmes informations. Changer uniquement leur apparence dans un logiciel ne change pas nécessairement le texte envoyé au LLM. En revanche, si la présentation nécessite du balisage supplémentaire, des images ou une mise en page complexe à traiter, elle peut avoir un effet sur le coût.

**À retenir :** un LLM ne facture pas directement la beauté d'un document. Il traite des tokens issus du contenu et, selon le mode utilisé, des éléments visuels.

**4. L'exécutable : ce qui réalise une action**

Un exécutable est un programme, ou un fichier pouvant être exécuté dans un environnement approprié, pour réaliser des opérations. Il ne sert pas simplement à conserver des informations. Il contient des instructions destinées à être exécutées.

**Exemples :**
- Un fichier `.csv` contient une grille tarifaire.
- Un fichier `.json` contient des données structurées.
- Un programme `.exe` peut ouvrir une application et effectuer des opérations.

Un fichier JSON peut être lu par un programme, mais il n'est pas lui-même un programme exécutable. De même, demander à Claude d'analyser du code n'est pas la même chose que faire exécuter ce code.

**Synthèse — Les quatre notions**

| Notion | Question à se poser |
|---|---|
| Fichier | Quel élément numérique est transmis ? |
| Format | Comment les informations sont-elles représentées ? |
| Présentation | Comment apparaissent-elles à l'écran ? |
| Exécutable | Quelles instructions peuvent être exécutées ? |

**Idée essentielle :** pour comprendre le coût d'une interaction avec un LLM, il faut examiner ce qui est réellement transmis et traité, et non uniquement ce qui apparaît à l'écran.

### 02 — Le coût en tokens selon le format

#### Un même contenu, des coûts différents

Un modèle de langage ne mesure pas directement la longueur d'un document en pages ou en caractères. Il traite des unités appelées **tokens**. Un token peut correspondre à un mot entier, une partie de mot, un nombre ou un signe de ponctuation. Le découpage dépend du tokenizer utilisé par le modèle.

Dans une API de LLM, le volume de tokens traités intervient dans le calcul du coût. Les tokens d'entrée et les tokens de sortie peuvent avoir des tarifs différents. Plus un fichier nécessite de tokens d'entrée, plus son traitement peut coûter cher, à conditions tarifaires identiques.

**Exemple : la grille tarifaire NOVA Conseil**

Prenons une même grille tarifaire fictive, enregistrée sous cinq représentations. Le contenu métier est identique dans chaque version. Le nombre de tokens a été mesuré avec le tokenizer `o200k_base`.

| Représentation | Tokens mesurés |
|---|---:|
| CSV | 59 |
| Texte extrait d'un PDF | 61 |
| TXT | 74 |
| Markdown | 89 |
| JSON | 168 |

*Légende : comptage fourni pour les cinq représentations de la grille NOVA Conseil, selon l'encodage o200k_base. Ces chiffres concernent le contenu textuel testé, et non le coût complet d'une requête API Claude.*

**Comment interpréter ces résultats ?**

**Le CSV : 59 tokens** — Le CSV est compact pour représenter des données tabulaires. Les informations sont organisées en lignes et en colonnes, sans répétition systématique des noms de champs à chaque ligne. Il convient particulièrement aux listes, aux tableaux de prix et aux jeux de données réguliers.

**Le PDF avec texte extrait : 61 tokens** — Ici, on ne mesure pas le fichier PDF original. On mesure uniquement le texte qui en a été extrait avant son envoi au tokenizer. Le résultat est proche du CSV parce que cette extraction produit une représentation textuelle relativement compacte.

**Le TXT : 74 tokens** — Le texte brut contient peu de balisage imposé par le format. Cependant, le nombre de tokens dépend de la façon dont les informations sont rédigées. Des phrases complètes peuvent être plus longues qu'une représentation tabulaire.

**Le Markdown : 89 tokens** — Le Markdown utilise des caractères pour représenter des titres, des listes et des tableaux. Il permet de structurer un document tout en restant lisible sous forme de texte. Dans cet exemple, il consomme plus de tokens que le TXT. Cela ne signifie pas qu'il sera toujours plus coûteux.

**Le JSON : 168 tokens** — Le JSON représente les données à l'aide de clés et de valeurs. Dans une liste d'objets, les noms des champs sont généralement répétés pour chaque objet. Cette répétition explique une part importante de l'écart observé. Pour la grille NOVA Conseil, le JSON consomme environ 2,85 fois autant de tokens que le CSV.

**Une idée reçue à corriger**

**Le Markdown n'est pas automatiquement moins coûteux que le texte brut.** Il n'existe pas de classement universel des formats selon leur consommation de tokens. Le coût dépend :
- du contenu exact ;
- de la façon dont les données sont représentées ;
- du tokenizer utilisé ;
- du traitement appliqué au fichier avant son arrivée dans le modèle.

Dans notre exemple, le CSV est le plus compact. Le JSON est le plus long. Mais cet ordre peut changer avec un autre contenu ou une autre représentation.

**Pourquoi utiliser JSON s'il consomme plus de tokens ?**

Parce que le nombre de tokens n'est pas le seul critère. Lorsqu'une réponse doit être utilisée par un programme, **la fiabilité de la structure devient essentielle**. Le JSON permet de représenter explicitement les champs, leurs valeurs et leurs relations. Un système peut imposer un schéma précisant :
- les champs obligatoires ;
- les types de données attendus ;
- les valeurs autorisées ;
- les relations entre les objets.

Avec des mécanismes comme les sorties structurées et le *function calling*, un LLM peut produire des données destinées à être contrôlées puis exploitées automatiquement. Le JSON n'est donc pas choisi parce qu'il consomme moins de tokens. Il est choisi parce qu'il convient à des échanges de données structurés entre logiciels.

**Attention à la validité des données**

Un JSON mal formé peut provoquer une erreur de lecture et interrompre un traitement automatique. Un CSV mal formé peut également provoquer une erreur ou décaler des colonnes. Un Markdown incorrect peut modifier la façon dont les informations sont interprétées. La différence réside surtout dans la possibilité d'imposer un schéma précis et de valider les données avant leur utilisation.

**À retenir :**

Pour transmettre un tableau simple, le CSV peut être un choix économique. Pour transmettre un document structuré destiné à être lu par un humain et un LLM, le Markdown peut être pratique. Pour faire communiquer un LLM avec un programme, le JSON accompagné d'une validation de schéma est souvent préférable.

**Le format le plus compact n'est pas nécessairement le format le plus adapté.**

### 03 — Le piège du PDF

#### Deux façons de traiter un PDF, deux coûts très différents

Le PDF est largement utilisé dans les entreprises. Il permet de conserver une présentation stable : pages, tableaux, graphiques, images, polices et disposition des éléments. Mais lorsqu'on envoie un PDF à un LLM, il faut distinguer deux situations.

**Situation A — Le texte est extrait avant l'envoi**

Le document est d'abord traité par un outil d'extraction de texte. Seul le contenu textuel obtenu est ensuite transmis au modèle. Dans notre exemple NOVA Conseil, ce texte représente **61 tokens** avec le tokenizer utilisé. Le coût peut donc être proche de celui d'un simple fichier TXT.

Cependant, cette méthode peut perdre certaines informations :
- les images ;
- les graphiques ;
- les relations visuelles entre des éléments ;
- une partie de la structure des tableaux.

L'extraction peut également produire des erreurs d'ordre de lecture ou supprimer des informations importantes.

**Conclusion :** extraire le texte d'un PDF peut réduire le coût, à condition que les informations nécessaires soient correctement préservées.

**Situation B — Le PDF est envoyé directement à Claude**

Avec le traitement visuel des PDF dans l'API Claude, le fonctionnement est différent. Le système extrait le texte du document et convertit chaque page en image. Claude peut ainsi analyser à la fois le contenu textuel et les éléments visuels. Cette capacité est utile pour comprendre des graphiques, des tableaux complexes ou des documents dont la mise en page porte une information importante. Mais elle augmente le nombre de tokens traités.

**Ce qu'indique la documentation Anthropic**

Anthropic indique qu'une page PDF utilise généralement **1 500 à 3 000 tokens pour sa partie textuelle**, selon la densité de son contenu. À cela s'ajoute le coût du traitement visuel des pages converties en images. Il faut donc éviter d'interpréter cette fourchette comme un coût total fixe par page. Le nombre réel de tokens dépend du document et de son traitement.

**Comparaison des deux situations**

| Méthode | Traitement | Conséquence |
|---|---|---|
| Texte extrait du PDF | Texte uniquement | Coût potentiellement faible, perte possible d'informations visuelles |
| PDF envoyé directement | Texte et images des pages | Coût potentiellement plus élevé, accès aux éléments visuels |

*Légende : la comparaison porte sur le mode de traitement. Les 61 tokens de l'exemple NOVA Conseil ne correspondent pas au coût d'un PDF envoyé directement à Claude.*

**Quelle méthode choisir ?**

- **Si le document contient essentiellement du texte :** il peut être pertinent d'extraire le texte et de vérifier son intégrité avant de le transmettre au modèle.
- **Si le document contient des graphiques ou des informations visuelles importantes :** il peut être préférable de transmettre directement le PDF pour conserver l'accès à ces éléments.
- **Si le document est composé de tableaux simples :** une extraction contrôlée vers CSV peut être utile, notamment pour réaliser des calculs ou automatiser un traitement.

**Point de vigilance**

Dire qu'un PDF ne coûte que 61 tokens serait incorrect. Cela confondrait le coût du texte extrait avec le coût du traitement du fichier PDF original.

**À retenir : un PDF contenant peu de texte peut néanmoins entraîner un coût important lorsqu'il est traité visuellement.**

Avant de choisir un mode de transmission, il faut identifier les informations dont le LLM a réellement besoin.

### 04 — Exercice de vérification

#### Tester cinq formats avec un même contenu

**Objectif de l'exercice**

Cet exercice permet de vérifier deux éléments :
1. Le nombre de tokens consommés selon le format.
2. La qualité et l'exactitude des réponses produites par le LLM.

L'objectif n'est pas de désigner un format gagnant à l'avance. Il s'agit de comparer des résultats mesurés et de comprendre les écarts observés.

**Étape 1 — Préparer les fichiers**

Utiliser la grille tarifaire fictive NOVA Conseil. Créer cinq versions contenant exactement les mêmes données : `tarifs.txt`, `tarifs.md`, `tarifs.json`, `tarifs.csv`, `tarifs.pdf`.

Vérifier que les prestations, les prix, les unités et les conditions tarifaires sont identiques. Aucune information métier ne doit être ajoutée ou supprimée entre les versions.

**Étape 2 — Définir les questions de vérification**

Préparer des questions dont la réponse est connue à l'avance.

- **Question A — Extraction :** « Quel est le tarif de la prestation X ? »
- **Question B — Comparaison :** « Quelle est la prestation la moins chère ? »
- **Question C — Calcul :** « Quel est le montant total de deux prestations X et d'une prestation Y ? »
- **Question D — Vérification des données :** « Indique les prestations présentes dans le document et leurs tarifs. N'ajoute aucune information absente du fichier. »

Remplacer X et Y par les prestations figurant réellement dans la grille. Préparer les réponses attendues avant d'interroger le modèle.

**Étape 3 — Mesurer les tokens**

Mesurer le contenu textuel de chaque format avec le même tokenizer. Reporter les résultats dans un premier tableau. Utiliser ensuite le même modèle Claude et la même instruction pour chaque test. Pour l'essai API, relever si possible le nombre réel de tokens d'entrée communiqué par le service.

**Attention :** le comptage local avec `o200k_base` n'est pas nécessairement identique au comptage effectué par Claude. Il faut présenter ces deux mesures séparément.

Pour le PDF, comparer également : la version texte extrait ; le PDF envoyé directement, avec son traitement visuel.

**Étape 4 — Vérifier les réponses**

Envoyer les mêmes questions, dans le même ordre, pour chaque format. Effectuer chaque test dans une nouvelle conversation, ou avec un contexte API indépendant. Ne pas donner au modèle les réponses précédemment obtenues. Comparer chaque réponse avec les valeurs de référence.

Pour chaque critère, attribuer :
- **✓ Conforme** : la réponse respecte entièrement le résultat attendu.
- **✗ Non conforme** : la réponse contient une erreur, une omission ou une information inventée.

Une réponse plausible n'est pas nécessairement exacte. Une réponse bien présentée n'est pas nécessairement correcte.

**Étape 5 — Compléter le tableau de vérification**

| Format | Tokens de référence | Réponse exacte | Données complètes |
|---|---:|:---:|:---:|
| CSV | 59 | À tester | À tester |
| PDF — texte extrait | 61 | À tester | À tester |
| TXT | 74 | À tester | À tester |
| Markdown | 89 | À tester | À tester |
| JSON | 168 | À tester | À tester |
| PDF — fichier direct | À mesurer | À tester | À tester |

*Légende : les valeurs de référence concernent le contenu textuel mesuré avec o200k_base. Les colonnes de qualité doivent être complétées à partir des réponses réelles du LLM. Aucun résultat de qualité ne doit être considéré comme acquis avant le test.*

**Étape 6 — Interpréter les résultats**

1. **Quel format consomme le moins de tokens ?** Comparer les mesures obtenues et identifier l'écart entre les représentations.
2. **Le format le plus compact fournit-il toujours la réponse la plus exacte ?** Observer les résultats sans supposer qu'un nombre réduit de tokens améliore automatiquement la qualité.
3. **Le JSON apporte-t-il un avantage ?** Examiner sa capacité à conserver des champs explicites et à produire une structure exploitable par un programme.
4. **Que se passe-t-il lorsque le PDF est envoyé directement ?** Comparer le coût et la qualité obtenus avec ceux du texte préalablement extrait.
5. **Quel format choisir pour un traitement répété ?** Prendre en compte le nombre de tokens, la qualité des réponses et les contraintes de l'automatisation.

**Critères de réussite**

L'exercice est validé si l'apprenant est capable :
- de distinguer le format du contenu et de sa présentation ;
- d'expliquer les écarts de tokens observés ;
- de comprendre pourquoi Markdown n'est pas systématiquement moins coûteux que TXT ;
- d'expliquer l'intérêt du JSON dans une automatisation ;
- de distinguer un PDF transmis directement de son texte extrait ;
- d'évaluer une réponse sur son exactitude, et pas seulement sur son apparence ;
- de justifier le choix d'un format selon les besoins du traitement.

**Conclusion du module**

**Choisir un format pour un LLM consiste à trouver un équilibre entre trois exigences :**

- **Le coût** — Combien de tokens sont nécessaires pour traiter les informations ?
- **La qualité** — Le modèle peut-il retrouver, comprendre et utiliser correctement les données ?
- **La fiabilité** — Les résultats peuvent-ils être vérifiés et exploités par un système automatique ?

Un format compact peut réduire le coût. Un format structuré peut faciliter le contrôle des données. Un format visuel peut préserver des informations que le texte seul ne permet pas de représenter. Le bon choix dépend donc de la tâche à réaliser.

**Principe final : transmettre au LLM les informations nécessaires, dans une représentation adaptée à leur traitement, en mesurant à la fois le coût et l'exactitude du résultat.**

---

## F. Mapping contenu → composants du gabarit

| Contenu | Composant |
|---|---|
| Intro de module (Module 1 §1, Module 2 chapeau) | Bandeau d'intro (eyebrow + `h1` serif + chapeau) sous le header, avant la première section |
| Chaque notion isolée (5 notions M1, 4 notions M2) | `.dpg-lesson-card` (ou enchaînement de cartes) |
| Bloc mémoire (mémoire projet / conversation / prompt récap / nouvelle conversation) | Suite de `.dpg-lesson-card`, une par sous-thème, dans `.dpg-module-structure` avec sommaire latéral mis à jour |
| Les 3 prompts RISEN (Module 1) | `.dpg-demo-block`, un par prompt, avec le texte intégral du prompt et les 5 repères RISEN mis en évidence |
| Tableau de synthèse des 3 étapes (M1) | `.dpg-result-table` |
| Tableaux de synthèse/comparaison (M2 : 4 notions, tokens NOVA Conseil, comparaison PDF, résultats de l'exercice) | `.dpg-result-table` |
| Exercice "quel format pour X" / vérification ✓/✗ (M2 §04) | `.dpg-exercise-block` (saisie + bouton Vérifier + cartes d'état ✓/✗) |
| Chaque leçon/page | `.dpg-module-structure` (breadcrumb + titre + sommaire + contenu) comme conteneur général |
| Pied de page | `.dpg-footer`, identique sur toutes les pages |

Remplacer chaque placeholder `[ Visuel — … à intégrer ]` par une illustration réelle si disponible ; sinon conserver un encart neutre de même style (bordure fine, pas de contenu décoratif superflu) plutôt que de le supprimer, pour garder l'équilibre visuel des sections à deux colonnes.

---

## G. Notes d'intégration pour Cursor

1. **Un seul design system, deux pages de contenu.** Ne pas dupliquer le CSS par module : extraire les tokens et classes de la section A/B dans une feuille de style globale (ou des tokens Tailwind/CSS-in-JS si le site existant utilise déjà un framework), partagée par le header, le footer et les deux modules.
2. **Respecter l'ordre des blocs** tel que listé en section B pour la structure de chaque leçon : breadcrumb → titre/sous-titre → sommaire + contenu → cartes/exercices/démos selon le besoin de la section → tableau si données chiffrées → footer global en bas de page (une seule fois, pas par section).
3. **Barre de progression** : calculer dynamiquement `progress` (étape courante / nombre total d'étapes du parcours Module 1 + Module 2) plutôt que la valeur statique de démo (37%).
4. **Sommaire latéral** : générer automatiquement la liste des sous-sections de la leçon affichée (ancre + scrollspy ou simple navigation au clic), avec l'état `is-active` reflétant la section visible/sélectionnée.
5. **Accessibilité** : conserver les attributs déjà présents dans la maquette (`aria-label` sur les nav, `role="img"` + `aria-label` sur la barre de progression, `aria-hidden="true"` sur les séparateurs/icônes décoratives) et vérifier le contraste texte/fond sur `--dpg-cream-faint` (texte peu contrasté, à réserver aux légendes et métadonnées, jamais au contenu principal).
6. **Responsive** : au strict minimum reproduire la media query à 760px (section A) ; prévoir en plus un menu mobile pour remplacer la nav masquée (`.dpg-header-nav{display:none}`) si le site a besoin d'une navigation mobile fonctionnelle (hamburger ou équivalent) — ce point n'est pas spécifié dans la maquette et reste à la discrétion de l'intégration.
7. **Exercice interactif (`.dpg-exercise-block`)** : pour le Module 2 (exercice de vérification ✓/✗) et pour les mini-exercices du Module 1, le bouton "Vérifier" peut rester volontairement simple (affichage statique des deux cartes d'état en guise d'exemple pédagogique) ou être relié à une vraie logique de comparaison texte si on veut une vérification automatique — à trancher selon le temps disponible ; en l'absence de logique dynamique, afficher les deux cartes (✓ et ✗) à titre d'exemples pédagogiques plutôt que de masquer l'une des deux.
8. **Ne pas intégrer les repères d'annotation de maquette** ("01 · dpg-header — en-tête…") dans le rendu final destiné aux apprenants : ce sont des commentaires de design à l'usage de l'intégration, pas du contenu de l'Academy.
9. **Module 3** : laisser la structure de navigation prête à accueillir un futur module (si la nav affiche une liste de modules), mais ne pas créer de page ni de contenu Module 3 pour l'instant.
10. **Déploiement** : push sur GitHub déclenche le déploiement Vercel existant — aucune configuration de build supplémentaire n'est attendue au-delà de l'intégration du nouveau design system et des deux pages de contenu.
