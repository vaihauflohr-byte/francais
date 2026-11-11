# Français au collège — francais.ka-ilei.com

Site d'entraînement en français pour les classes de Mme Flohr (Collège Tinomana Ebb de Teva I Uta) : 6e 1, 5e 3, 4e AUTEA, 4e OMURI, 3e RANGIROA.
Il fonctionne comme le site SI : un code par élève, des exercices notés qui changent à chaque essai, les écrits vérifiés par l'IA, une grille de notes pour la prof.
Il est **indépendant du site SI** : pas de lien entre les deux, ses données sont dans un schéma à part (« fr ») du même projet Supabase.

## Pour les élèves (index.html)

- Choisir sa classe, écrire son prénom et son code (carte donnée par la prof).
- Par domaine : **Grammaire**, **Conjugaison**, **Orthographe**, **Vocabulaire**, **Lire et comprendre**, **Écrire**.
- Chaque série : 10 questions en trois paliers (Je découvre, Je m'entraîne, Je vais plus loin), 2 points chacune, note sur 20, correction expliquée.
- La couleur suit le barème de la prof : 0–7 rouge, 8–11 jaune, 12–16 vert clair, 17–20 vert foncé.
- « La phrase du jour » : toucher un mot pour voir sa classe et sa fonction.
- Hors réseau (iPads), on peut continuer : les notes partent toutes seules quand le réseau revient.

## Pour la prof (prof.html)

- **Résultats** : grille élèves × exercices (meilleure note, dernière ou moyenne), détail de chaque essai (réponses, textes, avis de l'IA), export CSV (Excel, Pronote).
- **Élèves et codes** : coller la liste des prénoms → comptes créés, cartes à imprimer. Les codes ne sont gardés que chiffrés : les imprimer tout de suite. « Nouveau code » en cas d'oubli ; « pause » ou suppression d'un compte.
- **Exercices ouverts** : ouvrir ou fermer chaque exercice, classe par classe.
- **Aperçu élève** : voir le site comme un élève d'un niveau (rien n'est enregistré).
- **Réglages** : ajouter une collègue (elle crée d'abord son compte sur la page de connexion), ajouter ou masquer une classe.

## Contenu

| Domaine | Notions |
|---|---|
| Grammaire | verbe conjugué, sujet, classes grammaticales (méthode DNB et gestes du grammairien), fonctions, propositions |
| Conjugaison | conjuguer (53 verbes, tous les temps du programme, contrôlés avec verbecc), reconnaître le temps et le mode |
| Orthographe | homophones grammaticaux, accords (GN, sujet-verbe, participe passé), -é/-er/-ez/-ait |
| Vocabulaire | formation des mots (comme le contrôle de langue de la classe), sens des mots, mots de la séquence (récits, héros et hoplite, théâtre, autobiographie et image) |
| Lire et comprendre | un texte par niveau (6e légende de Hina, 5e Ulysse et le Cyclope, 4e Molière « Au voleur ! », 3e récit d'enfance), QCM, citations à toucher dans le texte, réponse rédigée R-E-P vérifiée par l'IA |
| Écrire | réécriture (corrigée mot à mot, −0,5 par erreur) ; rédactions vérifiées par l'IA : 6e monstre, 5e combat du héros, 4e scène de comédie et avis argumenté, 3e sujets du brevet (imagination, réflexion) |

Les textes de Molière sont dans le domaine public ; les autres textes sont écrits pour l'entraînement. Aucun sujet d'examen n'est recopié.

## Données et vie privée

- Gardé pour chaque élève : prénom, classe, code **chiffré**, résultats. Rien d'autre (ni nom de famille, ni e-mail).
- Aucune table n'est lisible avec la clé publique : les élèves passent par des fonctions qui demandent leur jeton de session ; les profs lisent les données une fois connectés.
- IA : seul le **texte** (consigne, texte étudié, critères, réponse de l'élève) part vers Claude (Anthropic), par la fonction `corriger-francais`. Jamais de nom, de prénom ni de classe. Au plus 30 vérifications par élève et par jour. Le site l'indique aux élèves.
- La clé de l'API Claude est seulement dans les secrets Supabase (`ANTHROPIC_API_KEY`), jamais dans le site.

## Installation (une fois)

1. **Supabase** (projet du site SI) › SQL Editor : coller `supabase/fr.sql`, Run (le script peut être rejoué sans risque). Les profs du site SI deviennent profs ici.
2. Project Settings › Data API › **Exposed schemas** : ajouter `fr`.
3. Edge Functions › Deploy a new function › Via Editor : nom `corriger-francais`, coller `supabase/functions/corriger-francais/index.ts`, Deploy. Elle utilise le secret `ANTHROPIC_API_KEY` déjà créé pour le site SI. « Verify JWT » peut rester activé : le site envoie la clé publique `anon` (config.js, `iaJeton`). Le désactiver permet en plus la vérification par l'IA dans l'aperçu prof.
4. **GitHub** : dépôt `francais` (public), réglages › Pages : branche `main`, dossier racine ; domaine `francais.ka-ilei.com`, puis « Enforce HTTPS ».
5. **OVH** › zone DNS de ka-ilei.com : CNAME `francais` → `vaihauflohr-byte.github.io.`

## Pour modifier le contenu

- Les exercices sont dans `contenu/` (un fichier par domaine). Chaque notion : `FR.notion({ id, domaine, niveaux, titre, resume, fiche, gen })`.
- Vérifications avant d'envoyer : `node outils/tester_series.js 200` (toutes les séries, toutes les questions) et `node outils/tester_lectures.js` (citations, points). `node outils/apercu_questions.js g-classes 4e 12` affiche des questions pour les relire.
- Après une modification, changer `VERSION` dans `sw.js` pour que les iPads prennent la nouvelle version.
- Mode démonstration (sans base) : vider `supabaseUrl` dans `config.js`.
