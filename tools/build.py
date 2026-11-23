"""Assemble index.html à partir de src/index.html.

- injecte les SVG générés par tools/body.py (sprite, schéma, mini-schémas, pictos) ;
- génère la FAQ (HTML + JSON-LD FAQPage) depuis une source unique ;
- applique les espaces insécables de la typographie française dans le texte ;
- avec --preview DIR : écrit aussi une version pour l'aperçu Artifact (sans
  doctype/head, polices chargées depuis Google Fonts).

Usage : python3 tools/build.py [--preview DIR]
"""
import json
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import body  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

FAQ = [
    (
        "Est-ce que la séance fait mal ?",
        [
            "En principe, non. Les techniques sont choisies selon vous et selon votre douleur du jour. Une zone peut être sensible pendant certains gestes, et une fatigue ou des courbatures sont possibles pendant 24 à 48 heures.",
            "Vous pouvez m’arrêter à tout moment : je vous explique ce que je fais avant de le faire.",
        ],
    ),
    (
        "Combien de séances faut-il ?",
        [
            "Il n’y a pas de nombre fixe et je ne propose pas de forfait. Pour une gêne récente, nous faisons généralement le point après une à trois séances, espacées de deux à quatre semaines.",
            "Si rien n’évolue, je vous oriente vers votre médecin plutôt que de multiplier les séances.",
        ],
    ),
    (
        "Faut-il une ordonnance ?",
        [
            "Non. L’ostéopathe est consulté en accès direct : aucune ordonnance n’est nécessaire pour prendre rendez-vous. Certaines mutuelles demandent une prescription pour rembourser, vérifiez votre contrat.",
            "Seule exception : pour un nourrisson de moins de 6 mois, une attestation médicale est requise pour certaines manipulations (voir plus bas).",
        ],
    ),
    (
        "Que dois-je porter ?",
        [
            "Une tenue souple et des sous-vêtements dans lesquels vous êtes à l’aise. Je peux vous demander d’enlever un vêtement pour observer le dos ou le bassin, toujours avec votre accord. Un short et un débardeur conviennent très bien.",
            "Pour un bébé : un body, une couche de rechange et de quoi le nourrir.",
        ],
    ),
    (
        "Mon bébé a moins de 6 mois : que faut-il prévoir ?",
        [
            "Une attestation de votre médecin ou de votre pédiatre indiquant l’absence de contre-indication aux manipulations du crâne, de la face et de la colonne, comme le prévoit la réglementation. Apportez aussi le carnet de santé.",
            "La séance dure environ 45 minutes, au rythme du bébé : on peut s’arrêter pour une tétée ou un câlin.",
        ],
    ),
    (
        "Quand consulter plutôt un médecin ?",
        [
            "En cas de douleur brutale ou inhabituelle, de fièvre, après une chute ou un choc, si vous ressentez une perte de force, des fourmillements persistants ou des troubles urinaires. L’ostéopathie ne se substitue pas à une consultation médicale.",
            "En cas d’urgence, appelez le 15 ou le 112.",
        ],
    ),
]


def faq_html():
    out = []
    for i, (q, answers) in enumerate(FAQ, 1):
        paras = "".join(f"<p>{a}</p>" for a in answers)
        out.append(
            f'          <details class="faq-item" id="faq-{i}">\n'
            f"            <summary>{q}</summary>\n"
            f'            <div class="faq-a">{paras}</div>\n'
            f"          </details>"
        )
    return "\n".join(out)


def faq_jsonld():
    data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": " ".join(a)},
            }
            for q, a in FAQ
        ],
    }
    return json.dumps(data, ensure_ascii=False, indent=2)


NBSP, NNBSP = " ", " "


def french_spacing(text):
    text = re.sub(r" ([;!?»])", NNBSP + r"\1", text)
    text = re.sub(r" :(?=\s|<|$)", NBSP + ":", text)
    text = text.replace("« ", "«" + NBSP)
    text = re.sub(r"(\d) h (\d)", r"\1" + NBSP + "h" + NBSP + r"\2", text)
    text = re.sub(r"(\d) (€|h|min|ans|mois|cm|m)(?=[\s,.;:)<]|$)", r"\1" + NBSP + r"\2", text)
    text = re.sub(r"(\d) (\d{2}) (\d{2}) (\d{2}) (\d{2})", lambda m: NBSP.join(m.groups()), text)
    text = re.sub(r"N° ", "N°" + NBSP, text)
    return text


def typeset(html):
    """Applique french_spacing aux seuls nœuds texte (hors script/style)."""
    parts = re.split(r"(<[^>]+>)", html)
    out, skip = [], None
    for part in parts:
        if part.startswith("<"):
            m = re.match(r"<(/?)(script|style)\b", part, re.I)
            if m:
                skip = None if m.group(1) else m.group(2).lower()
            out.append(part)
        elif skip or not part.strip():
            out.append(part)
        else:
            out.append(french_spacing(part))
    return "".join(out)


def ruler(side, n=16):
    """Règle graduée de la feuille d'atlas (hero) : un trait tous les 1/n, lettre tous les 4."""
    marks = []
    for i in range(n + 1):
        y = i * 100 / n
        big = i % 4 == 0
        marks.append(f'<span class="tk{" big" if big else ""}" style="top:{y:.2f}%"></span>')
        if side == "left" and big and i < n:
            marks.append(f'<em class="tl" style="top:{y + 200 / n:.2f}%">{chr(65 + i // 4)}</em>')
    return f'<div class="ruler {side}">' + "".join(marks) + "</div>"


def render():
    src = (ROOT / "src/index.html").read_text(encoding="utf-8")
    src = typeset(src)  # avant l'injection : les SVG et le JSON-LD restent intacts
    src = src.replace("{{SPRITE}}", body.sprite())
    src = src.replace("{{SCHEMA}}", body.schema())
    src = src.replace("{{MINI_BABY}}", body.mini([], baby=True))
    src = src.replace("{{OVERVIEW}}", body.overview())
    src = re.sub(r"\{\{RULER:(left|right)\}\}", lambda m: ruler(m.group(1)), src)
    src = re.sub(r"\{\{MINI:([\w,]+)\}\}", lambda m: body.mini(m.group(1).split(",")), src)
    src = re.sub(r"\{\{PICTO:(\w+)\}\}", lambda m: body.picto(m.group(1)), src)
    src = src.replace("{{FAQ_HTML}}", typeset(faq_html()))
    src = src.replace("{{FAQ_JSONLD}}", faq_jsonld())
    leftover = re.findall(r"\{\{[^}]+\}\}", src)
    if leftover:
        raise SystemExit(f"Marqueurs non remplacés : {leftover}")
    return src


GOOGLE_FONTS = (
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    "family=Fraunces:opsz,wght,SOFT@9..144,300..500,100"
    '&family=Source+Sans+3:ital,wght@0,400..600;1,400&display=swap">'
)


def preview(html, out_dir):
    """Version Artifact : pas de doctype/html/head/body, polices Google Fonts."""
    out = Path(out_dir)
    if out.exists():
        shutil.rmtree(out)
    head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
    body_html = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
    keep = []
    keep.append("<title>Cabinet Camille Roux</title>")  # nom de l'aperçu (le <title> SEO reste dans index.html)
    keep.append('<meta name="claude:viewport-fit-sides" content="cover">')
    keep.append(re.search(r'<meta name="description"[^>]*>', head).group(0))
    keep.append(GOOGLE_FONTS)
    keep.append('<link rel="stylesheet" href="assets/css/style.css">')
    keep.append("<script>document.documentElement.classList.add('js');document.documentElement.classList.remove('no-js');</script>")
    keep += re.findall(r'<script type="application/ld\+json">.*?</script>', head, re.S)
    page = "\n".join(keep) + "\n" + body_html
    out.mkdir(parents=True)
    (out / "index.html").write_text(page, encoding="utf-8")
    for sub in ("assets/css", "assets/js", "assets/img", "assets/vendor"):
        if (ROOT / sub).exists():
            shutil.copytree(ROOT / sub, out / sub)
    print(f"aperçu écrit dans {out}")


if __name__ == "__main__":
    html = render()
    (ROOT / "index.html").write_text(html, encoding="utf-8")
    print("index.html écrit")
    if "--preview" in sys.argv:
        preview(html, sys.argv[sys.argv.index("--preview") + 1])
