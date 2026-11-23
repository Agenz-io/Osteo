# Cabinet Camille Roux, ostéopathe D.O. à Nantes (site de démonstration)

Site vitrine **fictif** d'un cabinet d'ostéopathie : cabinet, praticienne, coordonnées et avis inventés.

Concept : « Le corps comme une carte ». Chaque motif de consultation allume une zone d'un schéma du corps en trait fin, fixe à côté de la colonne de lecture.

## Structure

```
index.html          page générée (ne pas modifier à la main)
src/index.html      gabarit de la page
tools/body.py       génère le schéma du corps, les zones et les pictos (SVG)
tools/build.py      assemble index.html (SVG, FAQ + JSON-LD, typographie française)
assets/css/         styles (fonts.css : @font-face auto-hébergées)
assets/js/main.js   bascule des zones du schéma au défilement
assets/fonts/       Fraunces, Source Sans 3 (SIL OFL)
design/             direction artistique, animations
CREDITS.md          sources et licences de chaque visuel
```

## Construire

```bash
python3 tools/build.py
```

Puis servir le dossier avec n'importe quel serveur statique (les polices ne se chargent pas en `file://`).
