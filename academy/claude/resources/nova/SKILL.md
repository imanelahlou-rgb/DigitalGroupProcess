---
name: preparer-devis-nova
description: Préparer un devis commercial brouillon pour NOVA Conseil à partir d'une fiche client et du catalogue de prestations validé. À utiliser lorsque l'utilisateur demande un devis, une estimation commerciale ou une proposition chiffrée NOVA.
---

# Préparer un devis NOVA Conseil

## Entrées attendues
- Fiche client contenant au minimum l'identifiant, l'entreprise et le besoin.
- Catalogue des prestations avec codes, tarifs HT et unités.
- Éventuelles précisions sur le périmètre et les quantités.

## Procédure
1. Lire le besoin sans ajouter de faits.
2. Choisir uniquement des prestations présentes dans le catalogue.
3. Pour chaque ligne, indiquer code, intitulé, quantité, prix unitaire HT et sous-total HT.
4. Calculer le total HT en montrant les opérations.
5. Comparer le total au budget connu si disponible.
6. Lister les informations manquantes (coordonnées, modalités, taxes, durée, validation).
7. Produire un devis BROUILLON et demander validation humaine avant tout envoi.

## Règles strictes
- Ne jamais inventer un prix, un taux de TVA, une remise ou une adresse.
- Ne jamais envoyer automatiquement un email ou créer un document fiscal définitif.
- Si le catalogue est absent ou contradictoire, signaler que le chiffrage n'est pas fiable.
- Afficher « Exemple pédagogique fictif — document non contractuel ».

## Format de sortie
- Client / référence
- Objet
- Tableau des prestations
- Total HT
- Budget et écart éventuel
- Informations à confirmer
- Statut : BROUILLON / À VALIDER
