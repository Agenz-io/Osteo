# Direction retenue : A « Planche d'atlas »

Concept : **le corps comme une carte**. Le site se lit comme une planche anatomique : chaque motif de consultation est une « planche » numérotée, le schéma fixe porte ses annotations dans la marge, et le hero se termine par une légende de carte.

Choisie parmi deux propositions (A « Planche d'atlas », B « Carnet de séance »).

## Références Inspo

Recherche : `recommend` (« healthcare minimal, clinic, calm editorial, therapist, wellness premium »), deux `search_screens`, puis `get_screen` sur les cinq références ci-dessous. On reprend leur composition, pas leur style.

| Référence | Ce qu'on en retient | Où |
|---|---|---|
| Alma · Science (alma.food/science) | Une seule colonne étroite, titre serif court, texte en colonne | Hero |
| Gwern (gwern.net) | Document long, notes en marge reliées au texte | Annotations du schéma, notes de marge des sections |
| Menkind · Haarverlies (menkind.co) | Calme clinique, filets fins, liste courte de faits | Listes « Ce que vous pouvez ressentir », tarifs, horaires |
| Function · About (functionhealth.com) | (direction B) italique de couleur | Non retenu |
| Goodside (goodside.studio) | (direction B) petit dessin comme ponctuation | Non retenu |

## Jetons

| Rôle | Valeur |
|---|---|
| Papier blanc d'eau | `#F6F8F9` |
| Encre, bleu de Prusse (texte, traits, boutons) | `#1B3A55` · 11,1:1 sur le papier |
| Bleu bassin (zones, repères, formes uniquement) | `#548FB9` · 3,3:1 sur le papier |
| Titres | Fraunces Light, axe « Soft » à 100, tailles optiques |
| Texte | Source Sans 3, 18 px, interligne 1,7 |

Les nuances (texte secondaire, filets, voile des zones) sont des mélanges de ces deux couleurs avec le papier.

## Grille

- **Hero** : colonne unique de 34 rem, centrée, beaucoup de vide ; légende de carte en pied.
- **Atlas** (lecture, motifs, publics) : colonne de lecture de 38 rem à gauche, schéma fixe à droite, séparé par un filet vertical.
- **Pages** (praticienne, séance, tarifs, avis, cabinet, FAQ, rendez-vous) : même grille ; la colonne de droite porte les notes de marge et les photos.
- **Mobile** : une colonne ; le schéma n'est plus fixe, un petit schéma statique ouvre chaque motif.
- Rythme vertical : `clamp(6rem, 12vw, 10rem)` entre les sections.

## Ordre des sections

1. Hero : « Chaque tension a une adresse. »
2. Planche 00 · Lire la carte (cadre : complémentaire de la médecine)
3. Planches 01 à 06 : mâchoire, nuque, épaules, dos, ventre, bassin (de la tête aux hanches)
4. Publics : sportifs, grossesse, nourrissons, sédentaires (même schéma, plusieurs zones ; silhouette de nourrisson pour les bébés)
5. La praticienne
6. Déroulé d'une séance (timeline)
7. Tarifs et remboursement
8. Avis (fictifs)
9. Le cabinet (adresse, horaires, accès, accessibilité)
10. FAQ
11. Rendez-vous et contact
