"""Visuels du schéma du corps, générés en SVG (trait fin, style unique).

- silhouette adulte (vue de face et vue de dos) décrite par une demi-silhouette
  mise en miroir puis lissée (Catmull-Rom -> Bézier) ;
- silhouette de nourrisson (allongé, vu de dessus) ;
- zones (mâchoire, nuque, épaules, dos, ventre, bassin, genoux, crâne) ;
- annotations reliées par un trait fin, à la manière d'une planche d'atlas ;
- pictos des publics.

Module importé par tools/build.py ; `python3 tools/body.py` affiche le sprite.
"""

CX = 60  # axe d'une figure adulte (repère local : 120 × 430)

# Demi-contour droit, du sommet du crâne à l'entrejambe (x = écart à l'axe, y).
HALF = [
    (0, 6), (11, 9), (17.5, 20), (18, 33), (16.5, 45), (13, 54), (8.5, 60),
    (7.5, 66), (8, 72),                                  # cou
    (19, 77), (32, 82),                                  # trapèze -> épaule
    (39.5, 90), (42, 103),                               # deltoïde
    (43, 122), (44.5, 142),                              # bras
    (46.5, 166), (48.5, 188),                            # avant-bras
    (50.5, 200), (51, 212), (47.5, 220), (43.5, 214),    # main
    (42, 198), (38.5, 170), (35.5, 146), (33, 124), (30.5, 104),  # bord interne du bras
    (29, 118), (27.5, 136), (25.5, 154),                 # flanc -> taille
    (28, 172), (31.5, 190), (32, 206),                   # hanche
    (30, 226), (27, 254), (23.5, 282),                   # cuisse
    (21.5, 300), (22.5, 318),                            # genou
    (21.5, 344), (17.5, 374), (14, 396),                 # mollet -> cheville
    (15.5, 406), (19, 414), (6, 416),                    # pied
    (5.5, 404), (6.5, 380), (8.5, 346),                  # jambe, bord interne
    (8, 314), (7.5, 296), (6.5, 262), (4, 228), (0, 214),  # genou -> entrejambe
]


def _f(v):
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


def catmull_closed(pts):
    n = len(pts)
    d = [f"M{_f(pts[0][0])} {_f(pts[0][1])}"]
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f"C{_f(c1[0])} {_f(c1[1])} {_f(c2[0])} {_f(c2[1])} {_f(p2[0])} {_f(p2[1])}")
    return "".join(d) + "Z"


def catmull_open(pts):
    d = [f"M{_f(pts[0][0])} {_f(pts[0][1])}"]
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < len(pts) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f"C{_f(c1[0])} {_f(c1[1])} {_f(c2[0])} {_f(c2[1])} {_f(p2[0])} {_f(p2[1])}")
    return "".join(d)


def mirror_closed(half, cx=CX):
    right = [(cx + x, y) for x, y in half]
    left = [(cx - x, y) for x, y in reversed(half[1:-1])]
    return catmull_closed(right + left)


def sym(pts, cx=CX):
    return [catmull_open([(cx + x, y) for x, y in pts]), catmull_open([(cx - x, y) for x, y in pts])]


OUTLINE = mirror_closed(HALF)
CLAVICLES = sym([(3, 80), (12, 79), (24, 82)])
SCAPULAE = sym([(8, 94), (17, 92), (24, 100), (19, 118), (10, 112)])
SPINE = catmull_open([(CX, 70), (CX, 120), (CX, 170), (CX, 205)])
ILIAC = sym([(3, 200), (14, 196), (24, 205)])

# Nourrisson allongé, vu de dessus (repère local : 120 × 430, centré vers y = 210)
# Emmailloté : tête, lange en cocon, deux plis croisés et le bord du lange sous le menton.
BABY_BODY = mirror_closed([(0, 167), (13, 169), (23, 180), (27, 205), (25.5, 238), (19, 262), (9, 274), (0, 276)])
BABY_FOLDS = [
    catmull_open([(36, 186), (50, 200), (68, 212), (86, 222)]),
    catmull_open([(85, 192), (70, 214), (55, 234), (41, 250)]),
    catmull_open([(44, 172), (52, 177), (60, 178), (68, 177), (76, 172)]),
]


def path(d, cls):
    return f'<path class="{cls}" d="{d}"/>'


def sprite():
    front = "".join(path(d, "b-detail") for d in CLAVICLES)
    back = "".join(path(d, "b-detail") for d in SCAPULAE + ILIAC) + path(SPINE, "b-detail b-spine")
    baby = (
        '<circle class="b-line" cx="60" cy="146" r="21"/>'
        + path(BABY_BODY, "b-line")
        + "".join(path(d, "b-detail") for d in BABY_FOLDS)
    )
    return (
        '<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false"><defs>'
        f'<symbol id="fig-front" viewBox="0 0 120 430">{path(OUTLINE, "b-line")}{front}'
        '<circle class="b-detail" cx="60" cy="164" r="0.9"/></symbol>'
        f'<symbol id="fig-back" viewBox="0 0 120 430">{path(OUTLINE, "b-line")}{back}</symbol>'
        f'<symbol id="fig-baby" viewBox="0 0 120 430">{baby}</symbol>'
        "</defs></svg>"
    )


# --- Zones -------------------------------------------------------------------
# Repère du schéma : viewBox 0 0 400 470 ; face en (70, 10), dos en (210, 10).
FRONT_X, BACK_X, TOP = 70, 210, 10

E = lambda cx, cy, rx, ry: (cx, cy, rx, ry)  # noqa: E731

ZONES = {
    # nom: (vues, ellipses en repère local, ancre de l'annotation (vue, x, y), libellé, précision)
    "machoire": (["front"], [E(60, 53, 14, 8)], ("front", 46, 55), "mâchoire", "serrage la nuit"),
    "nuque": (["back"], [E(60, 68, 10, 9)], ("back", 69, 70), "nuque", "raideur, écrans"),
    "epaules": (["front", "back"], [E(27, 102, 10, 13), E(93, 102, 10, 13)], ("back", 103, 99), "épaules", "bras, omoplates"),
    "dos": (["back"], [E(60, 138, 21, 40)], ("back", 81, 140), "dos", "haut et bas du dos"),
    "ventre": (["front"], [E(60, 166, 19, 19)], ("front", 41, 168), "ventre", "inconfort, souffle"),
    "bassin": (["front", "back"], [E(60, 200, 27, 14)], ("back", 87, 202), "bassin", "hanches, sacrum"),
    "genoux": (["front"], [E(45, 305, 9, 12), E(75, 305, 9, 12)], ("front", 36, 305), "genoux", "course, sauts"),
}

ORIGIN = {"front": FRONT_X, "back": BACK_X}


def ellipse(cx, cy, rx, ry, ox, oy=TOP, cls="z-shape"):
    return f'<ellipse class="{cls}" cx="{_f(cx + ox)}" cy="{_f(cy + oy)}" rx="{rx}" ry="{ry}"/>'


def zone_shapes(name):
    views, shapes, *_ = ZONES[name]
    return "".join(ellipse(*s, ORIGIN[v]) for v in views for s in shapes)


def annotation(name):
    _, _, (view, ax, ay), label, sub = ZONES[name]
    gx, gy = ax + ORIGIN[view], ay + TOP
    if view == "front":
        tx, anchor, lx = 60, "end", 63
    else:
        tx, anchor, lx = 340, "start", 337
    ty = gy - 8
    return (
        f'<g class="z-ann">'
        f'<path class="z-leader" d="M{_f(gx)} {_f(gy)}L{_f(lx)} {_f(ty)}"/>'
        f'<circle class="z-pin" cx="{_f(gx)}" cy="{_f(gy)}" r="1.6"/>'
        f'<text class="z-label" x="{tx}" y="{_f(ty - 2)}" text-anchor="{anchor}">{label}</text>'
        f'<text class="z-sub" x="{tx}" y="{_f(ty + 8)}" text-anchor="{anchor}">{sub}</text>'
        f"</g>"
    )


def schema():
    """Grand schéma fixe (desktop)."""
    zones = "".join(
        f'<g class="zone" data-z="{n}">{zone_shapes(n)}{annotation(n)}</g>' for n in ZONES
    )
    baby_zones = (
        '<g class="zone" data-z="bebe">'
        '<ellipse class="z-shape" cx="200" cy="156" rx="25" ry="25"/>'
        '<ellipse class="z-shape" cx="200" cy="190" rx="17" ry="9"/>'
        '<g class="z-ann"><path class="z-leader" d="M224 148L268 132"/>'
        '<circle class="z-pin" cx="224" cy="148" r="1.6"/>'
        '<text class="z-label" x="272" y="130">crâne</text>'
        '<text class="z-sub" x="272" y="140">forme, confort</text></g>'
        '<g class="z-ann"><path class="z-leader" d="M184 192L132 206"/>'
        '<circle class="z-pin" cx="184" cy="192" r="1.6"/>'
        '<text class="z-label" x="128" y="204" text-anchor="end">nuque</text>'
        '<text class="z-sub" x="128" y="214" text-anchor="end">tête tournée d’un côté</text></g>'
        "</g>"
    )
    return (
        '<svg class="schema-svg" viewBox="0 0 400 470" role="img" aria-labelledby="schema-title">'
        '<title id="schema-title">Schéma du corps, vue de face et vue de dos</title>'
        '<g class="view-adult">'
        f'<use href="#fig-front" x="{FRONT_X}" y="{TOP}" width="120" height="430"/>'
        f'<use href="#fig-back" x="{BACK_X}" y="{TOP}" width="120" height="430"/>'
        f'<text class="v-label" x="{FRONT_X + 60}" y="462" text-anchor="middle">face</text>'
        f'<text class="v-label" x="{BACK_X + 60}" y="462" text-anchor="middle">dos</text>'
        f"{zones}</g>"
        '<g class="view-baby">'
        '<use href="#fig-baby" x="140" y="10" width="120" height="430"/>'
        '<text class="v-label" x="200" y="316" text-anchor="middle">nourrisson, vu de dessus</text>'
        f"{baby_zones}</g>"
        "</svg>"
    )


def mini(names, baby=False):
    """Petit schéma statique placé en tête de chaque motif (mobile)."""
    if baby:
        return (
            '<svg class="mini" viewBox="140 125 120 170" aria-hidden="true" focusable="false">'
            '<use href="#fig-baby" x="140" y="10" width="120" height="430"/>'
            '<ellipse class="z-shape" cx="200" cy="156" rx="25" ry="25"/>'
            '<ellipse class="z-shape" cx="200" cy="190" rx="17" ry="9"/></svg>'
        )
    shapes = "".join(zone_shapes(n) for n in names)
    return (
        '<svg class="mini" viewBox="60 0 280 450" aria-hidden="true" focusable="false">'
        f'<use href="#fig-front" x="{FRONT_X}" y="{TOP}" width="120" height="430"/>'
        f'<use href="#fig-back" x="{BACK_X}" y="{TOP}" width="120" height="430"/>'
        f"{shapes}</svg>"
    )


# --- Pictos des publics (48 × 48, même trait) ----------------------------------
PICTOS = {
    "sport": (
        '<circle cx="31" cy="14" r="4"/>'
        '<path d="M7 25C14 17 23 15 33 21L40 26"/>'
        '<path d="M19 19L26 27"/>'
        '<path d="M5 34c3-2.5 6-2.5 9 0s6 2.5 9 0 6-2.5 9 0 6 2.5 9 0"/>'
        '<path d="M9 41c3-2.5 6-2.5 9 0s6 2.5 9 0 6-2.5 9 0"/>'
    ),
    "grossesse": (
        '<circle cx="21" cy="8.5" r="4"/>'
        '<path d="M20 13.5C16.5 20 16 28 18.5 35L19 44"/>'
        '<path d="M19.5 18C33 19.5 37 33 22 37"/>'
        '<path d="M19 22.5C22 25 25 26 28 25.5"/>'
        '<path d="M19 44h7"/>'
    ),
    "nourrisson": (
        '<circle cx="24" cy="10.5" r="6"/>'
        '<path d="M24 18C18.5 18 16.6 23 16.8 30.5C17 37.5 20 42.5 24 42.5S31 37.5 31.2 30.5C31.4 23 29.5 18 24 18Z"/>'
        '<path d="M18.2 24.5L30.5 32.5M30.4 25L19.5 37.5"/>'
    ),
    "sedentaire": (
        '<rect x="25" y="9" width="18" height="12.5" rx="1"/>'
        '<path d="M34 21.5V26M30 26h8"/>'
        '<circle cx="13" cy="12" r="3.6"/>'
        '<path d="M13 16.5C11.5 22 12 27 14 30H23V40"/>'
        '<path d="M14 21.5L22 24"/>'
        '<path d="M8 32h12M10 32v10M18 32v10"/>'
    ),
}


def picto(name):
    return (
        '<svg class="picto" viewBox="0 0 48 48" aria-hidden="true" focusable="false">'
        f"{PICTOS[name]}</svg>"
    )


if __name__ == "__main__":
    print(sprite())
    print(schema())
