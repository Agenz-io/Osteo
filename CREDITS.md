# Crédits et licences

Site de démonstration : le cabinet, la praticienne, les coordonnées et les avis sont fictifs.

## Visuels générés pour le site

| Élément | Source | Licence |
|---|---|---|
| Schéma du corps (face, dos, nourrisson), zones, annotations | Dessiné en SVG pour ce projet, généré par `tools/body.py` | Propriété du projet |
| Pictos des publics (sport, grossesse, nourrisson, sédentaire) | Dessinés en SVG pour ce projet (`tools/body.py`) | Propriété du projet |
| Favicon | `assets/img/favicon.svg`, dessiné pour ce projet | Propriété du projet |

## Polices

| Police | Source | Auteur | Licence |
|---|---|---|---|
| Fraunces (sous-ensemble latin, axe « Soft » à 100) | https://fonts.google.com/specimen/Fraunces · https://github.com/undercasetype/Fraunces | The Fraunces Project Authors (Undercase Type) | SIL Open Font License 1.1, texte dans `assets/fonts/OFL-Fraunces.txt` |
| Source Sans 3 (sous-ensemble latin) | https://fonts.google.com/specimen/Source+Sans+3 · https://github.com/adobe-fonts/source-sans | Adobe | SIL Open Font License 1.1, texte dans `assets/fonts/OFL-SourceSans3.txt` |

Les fichiers `.woff2` ont été téléchargés depuis Google Fonts et sont servis par le site (aucun appel externe).

## Photos

Trois images fournies par le client le 23/11/2026, **générées par IA par ses soins**. Elles ne proviennent d'aucune banque d'images. Elles ont été ré-encodées en WebP (taille d'origine + version 704 px de large) sans autre retouche.

| Emplacement | Fichiers | Taille d'origine | Contenu | Source / auteur / licence |
|---|---|---|---|---|
| Section « La praticienne » | `assets/img/bassin.webp`, `bassin-704.webp` | 1122 × 1402 (4:5) | Eau calme d'une piscine vide, ligne d'eau bleue et blanche en diagonale. Aucune personne, aucune marque. | Fournie par le client, image générée par IA. **Outil et conditions d'utilisation à compléter par le client.** |
| Section « Déroulé d'une séance » | `assets/img/salle.webp`, `salle-704.webp` | 1448 × 1086 (4:3) | Salle de soin vide, table recouverte d'un drap blanc, tabouret en bois, lumière du jour. Aucune personne, aucune marque. | Fournie par le client, image générée par IA. **Outil et conditions d'utilisation à compléter par le client.** |
| Section « Le cabinet » | `assets/img/entree.webp`, `entree-704.webp` | 1122 × 1402 (4:5) | Entrée de plain-pied dans un immeuble en pierre claire, porte vitrée. Une plaque porte le nom du cabinet fictif « Cabinet Camille Roux, Ostéopathe ». Deux plantes en pot. Aucune personne, aucune marque réelle. | Fournie par le client, image générée par IA. **Outil et conditions d'utilisation à compléter par le client.** |

À compléter pour chaque image : nom de l'outil, date de génération, et clause des conditions d'utilisation de l'outil autorisant l'usage commercial.

### Prompts d'origine

Contraintes communes (en négatif) : *people, hands, faces, logos, brand, readable text, watermark, candles, pebbles, stones, bamboo, leaves, plants, beige, pastel gradient*.

1. **bassin** : *Top-down photograph of the still water surface of an empty indoor swimming pool, one lane rope crossing the frame diagonally, soft caustic light patterns on pale tiles below, calm cool blue tones from deep prussian blue to soft pool blue, no people, minimal composition with generous negative space, editorial photography, natural light, 35mm, fine film grain, portrait 4:5.*
2. **salle** : *Minimal, empty osteopathy treatment room, a simple treatment table covered with plain white linen, very light cool grey walls, soft daylight from a side window casting gentle shadows, a single wooden stool, nothing else in the room, calm cool palette with a hint of muted blue, architectural interior photography, eye level, 35mm, natural light, landscape 4:3.*
3. **entree** : *Street-level entrance of a small health practice in an old building of pale tuffeau limestone in Nantes, France, glass door flush with the pavement with no step, wide doorway, a small blank metal plaque without any text, soft morning light, quiet street, no people, no signage, documentary architectural photography, 35mm, portrait 4:5.*

## Bibliothèques

Aucune pour la version sans animation. GSAP et ScrollTrigger seront ajoutés à l'étape des animations (licence à noter ici).

## Références de design (non incluses dans le site)

Études de composition menées avec l'archive Inspo, voir `design/direction.md`. Aucun élément graphique de ces sites n'est repris.
