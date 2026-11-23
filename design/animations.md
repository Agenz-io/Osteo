# Animations

GSAP 3.13.0 + ScrollTrigger (`assets/vendor/`), code dans `assets/js/animations.js`.

Principe : **apaiser, pas impressionner**. Mouvements lents (0,6 à 2,6 s), courbes `sine.inOut` / `sine.out` (aucun rebond, aucune accélération brusque), fondus plutôt que déplacements, déplacements de 4 px au plus. Le site est complet sans animation : rien n'est masqué en attendant un déclencheur, sauf le tracé de la silhouette qui précède l'arrivée sur l'atlas.

Deux mécaniques de scroll seulement, celles du brief :

1. le schéma du corps fixe, dont la zone s'éclaire et s'annote ;
2. la timeline « Déroulé d'une séance », qui se dessine au défilement.

Aucun scroll horizontal, aucune section épinglée de cartes, aucun carrousel, aucun texte révélé mot à mot, aucune image qui grandit, aucun défilement doux forcé.

## Recherche Inspo

- `find_reference_components` (index complet, 68 archétypes). L'index ne contient **aucun composant dédié** aux illustrations fixes, aux surlignages liés au scroll, aux timelines verticales ni au tracé de chemins SVG. On a donc retenu les archétypes dont le **mouvement** se transpose à nos deux mécaniques.
- `get_reference_jsx` sur quatre d'entre eux : `nav/marginal`, `pricing/toggle`, `faq/accordion`, `features/numbered-triplet`.
- On reprend l'idée du mouvement (déclencheur, rythme, courbe, chorégraphie), jamais le code : ces composants sont en React et Tailwind, le site est en HTML et GSAP.

## Idées retenues

| # | Idée | Source Inspo | Ce qu'on en reprend | Où sur le site |
|---|---|---|---|---|
| 1 | Un repère fixe qui accompagne la lecture | `nav/marginal`, « vertical index… stays put while the page scrolls » (`lg:sticky`) | Le principe d'un élément en marge, immobile, qui reflète la section lue au lieu de bouger avec elle | Schéma du corps, fixe dans la colonne de droite (desktop). Déclencheur : chaque motif ou public franchit le milieu de l'écran (`start: 'top center'`, `end: 'bottom center'`) |
| 2 | Le libellé glisse de 4 px pour guider l'œil sans changer de couleur | `nav/marginal`, « hover slides the label 4px right so the eye can track without a colour change » | Le décalage de 4 px, transposé du survol à l'apparition : le libellé glisse de 4 px depuis le trait d'annotation (vers la gauche pour les libellés de gauche, vers la droite pour ceux de droite), 0,8 s, `sine.inOut` | Annotations du schéma (« dos · haut et bas du dos »…) |
| 3 | Couper le mouvement avant d'en ajouter : un simple fondu d'opacité | `pricing/toggle`, « no number animation (per "cut motion before adding it") – just a clean opacity swap » | Une zone qui s'éteint se fond sans bouger (0,6 s) ; le passage adulte ↔ nourrisson est un fondu enchaîné (0,9 s) ; la légende sous le schéma réapparaît en fondu avec 4 px de montée (0,8 s) | Schéma : changement de zone, bascule vers la silhouette du nourrisson, légende « Planche 0X » |
| 4 | Une étape se lit grâce à son filet | `features/numbered-triplet`, étapes marquées par un filet (`border-t-2`), « reads like a process diagram without a diagram » | Le filet porte le processus : le trait vertical se dessine au rythme du défilement (`scrub: 1.4`, retard doux), et chaque étape « s'allume » quand le trait l'atteint : point rempli (0,8 s, `sine.out`), texte de l'étape qui passe de 45 % à 100 % d'opacité. Il ne disparaît jamais. Retour arrière réversible. | Timeline « Déroulé d'une séance » : échange → tests → traitement → conseils |
| 5 | Le + qui pivote, une seule question ouverte | `faq/accordion`, « "+" rotates on open… single open at a time » | Rotation de 45° du + (0,6 s, courbe sinusoïdale en CSS) ; ouvrir une question referme les autres. Micro-interaction au clic, pas une mécanique de scroll | FAQ |

### Idées sans source Inspo directe

Pour le tracé de chemins SVG, l'index n'offre rien. Ces gestes sont propres au projet, déduits du concept de carte qui se dessine :

| Idée | Où | Détail |
|---|---|---|
| La silhouette se trace une fois | Arrivée sur l'atlas (`start: 'top 75%'`, `once`) | Les deux moitiés de chaque contour partent ensemble du sommet du crâne (2,6 s, `sine.inOut`), la vue de dos suit avec 0,3 s de décalage ; les détails (clavicules, omoplates, colonne) apparaissent ensuite en fondu |
| La carte s'allume de la tête aux hanches | Planche 00 « Lire la carte » | Après le tracé, les six zones s'éclairent dans l'ordre anatomique, à 0,18 s d'intervalle |
| Le trait d'annotation se dessine | À chaque changement de zone | Forme de la zone (1,1 s), puis trait d'annotation tracé (0,9 s), puis repère (0,6 s), puis libellé (idée 2) |
| Le filet de la légende se trace | Hero, au chargement | Filet de la légende tracé depuis le centre (1,8 s). Le texte du hero, lui, n'est jamais animé |

## Desktop, mobile, mouvement réduit

| Contexte | Comportement |
|---|---|
| Desktop ≥ 1024 px | Tout ce qui précède |
| Mobile < 1024 px (version allégée) | Pas de schéma fixe : chaque mini-schéma en tête de motif éclaire sa zone une seule fois (1 s). La timeline garde son trait et ses points, mais le texte des étapes n'est pas atténué. Pas de tracé de silhouette ni d'annotation |
| `prefers-reduced-motion: reduce` | Aucune animation GSAP (la classe `.motion` n'est pas posée) ; les transitions CSS sont neutralisées. Le schéma bascule instantanément (`main.js`), la timeline est entièrement tracée |
| Sans JavaScript | Schéma en vue d'ensemble, toutes les zones visibles ; tout le contenu est lisible |

`gsap.matchMedia()` gère le passage d'un contexte à l'autre (redimensionnement, changement de préférence) et annule proprement les animations du contexte quitté.
