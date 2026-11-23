/* Cabinet Camille Roux · animations (GSAP + ScrollTrigger)
   Deux mécaniques de scroll, lentes et douces (voir design/animations.md) :
     1. le schéma du corps fixe : la zone s'éclaire et s'annote ;
     2. la timeline « Déroulé d'une séance » se dessine au défilement.
   Desktop : version complète. Mobile : version allégée (pas de schéma fixe,
   mini-schémas qui s'éclairent une fois, timeline simplifiée).
   prefers-reduced-motion : aucune animation, le site reste dans son état
   statique complet (main.js gère seul la bascule des zones). */
(function () {
  'use strict';

  if (!window.gsap || !window.ScrollTrigger || !window.Atlas) return;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  var root = document.documentElement;
  var EASE = 'sine.inOut';      // respiration : aucune accélération brusque
  var EASE_OUT = 'sine.out';
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------------
     Mécanique 1 · schéma du corps fixe (desktop)
     --------------------------------------------------------------------- */
  function atlas() {
    var Atlas = window.Atlas;
    var schema = Atlas.schema;
    if (!schema) return function () {};

    var adult = $('.view-adult', schema);
    var baby = $('.view-baby', schema);
    var caption = $('.schema-caption', schema);
    var zones = $$('.zone', schema);
    var outlines = $$('.fig .b-line', schema);
    var details = $$('.fig .b-detail', schema);
    var drawn = false;          // le tracé d'ouverture a-t-il eu lieu ?
    var current = null;         // zones actuellement affichées

    // Longueur des traits d'annotation et des contours (unités du dessin).
    function prepStroke(el) {
      var len = el.getTotalLength ? el.getTotalLength() : 0;
      // trait de longueur len, espace plus long : aucun résidu visible au repos
      // +2 : les extrémités arrondies ne laissent aucun point visible au repos
      gsap.set(el, { strokeDasharray: len + ' ' + (len + 6), strokeDashoffset: len + 2 });
      el._len = len;
    }
    $$('.z-leader', schema).forEach(prepStroke);

    function wanted(name, list) {
      if (list === 'all') return name !== 'genoux' && name !== 'bebe';
      return (' ' + list + ' ').indexOf(' ' + name + ' ') > -1;
    }

    // Une zone s'allume : forme, puis trait d'annotation, puis repère et libellé.
    function zoneIn(z, delay) {
      var shapes = $$('.z-shape', z);
      var leaders = $$('.z-leader', z);
      var pins = $$('.z-pin', z);
      var texts = $$('text', z);
      gsap.killTweensOf([z].concat(shapes, leaders, pins, texts));
      gsap.set(z, { autoAlpha: 1 });
      var tl = gsap.timeline({ delay: delay || 0, defaults: { ease: EASE } });
      // courbes de niveau : du centre vers l'extérieur, comme une onde
      tl.fromTo(shapes, { opacity: 0 }, { opacity: 1, duration: 0.9, stagger: { each: 0.07, from: 'end' } }, 0)
        .fromTo(leaders, { strokeDashoffset: function (i, el) { return el._len; } },
          { strokeDashoffset: 0, duration: 0.9 }, 0.25)
        .fromTo(pins, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' },
          { opacity: 1, scale: 1, duration: 0.6, ease: EASE_OUT }, 0.85)
        .fromTo(texts, {
          opacity: 0,
          // le libellé glisse de 4 px depuis le trait (idée « marginal »)
          x: function (i, el) { return el.getAttribute('text-anchor') === 'end' ? 4 : -4; }
        }, { opacity: 1, x: 0, duration: 0.8, stagger: 0.08 }, 0.75);
    }

    // Une zone s'éteint : simple fondu, sans mouvement.
    function zoneOut(z) {
      gsap.killTweensOf(z);
      gsap.to(z, { autoAlpha: 0, duration: 0.6, ease: EASE });
    }

    function render(list, opts) {
      opts = opts || {};
      var isBaby = wanted('bebe', list);
      gsap.to(adult, { autoAlpha: isBaby ? 0 : 1, duration: 0.9, ease: EASE, overwrite: 'auto' });
      gsap.to(baby, { autoAlpha: isBaby ? 1 : 0, duration: 0.9, ease: EASE, overwrite: 'auto' });
      var order = 0;
      zones.forEach(function (z) {
        var name = z.getAttribute('data-z');
        var on = wanted(name, list);
        var was = current !== null && wanted(name, current);
        if (on && !was) zoneIn(z, (opts.delay || 0) + (opts.stagger ? order++ * opts.stagger : 0));
        else if (!on && was) zoneOut(z);
        else if (!on) gsap.set(z, { autoAlpha: 0 });
      });
      current = list;
    }

    function captionIn() {
      if (!caption) return;
      gsap.fromTo(caption, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE, overwrite: 'auto' });
    }

    // Ouverture : la silhouette se dessine une fois, puis la carte s'allume
    // de la tête aux hanches.
    function draw() {
      if (drawn) return;
      drawn = true;
      outlines.forEach(prepStroke);
      gsap.set(details, { opacity: 0 });
      // les deux moitiés d'une figure se tracent ensemble, du crâne vers les pieds
      gsap.to(outlines, { strokeDashoffset: 0, duration: 2.6, ease: EASE, stagger: function (i) { return Math.floor(i / 2) * 0.3; } });
      gsap.to(details, { opacity: 0.38, duration: 1.2, ease: EASE, delay: 1.8 });
      var list = schema.getAttribute('data-zones') || 'all';
      current = '';
      render(list, { delay: 1.6, stagger: list === 'all' ? 0.18 : 0 });
    }

    // État initial : contours masqués jusqu'à l'arrivée sur l'atlas.
    gsap.set(zones, { autoAlpha: 0 });
    gsap.set(baby, { autoAlpha: 0 });
    outlines.forEach(prepStroke);

    function onChange(e) {
      if (!drawn) return;   // le tracé d'ouverture affichera l'état courant
      render(e.detail.zones);
      captionIn();
    }
    document.addEventListener('schema:change', onChange);

    // Déclencheurs ScrollTrigger (remplacent l'IntersectionObserver de main.js).
    Atlas.disconnect();
    Atlas.blocks.forEach(function (block) {
      ScrollTrigger.create({
        trigger: block,
        start: 'top center',
        end: 'bottom center',
        onToggle: function (self) { if (self.isActive) Atlas.activate(block); }
      });
    });
    ScrollTrigger.create({ trigger: '.atlas', start: 'top 75%', once: true, onEnter: draw });

    return function () {
      document.removeEventListener('schema:change', onChange);
      Atlas.observe();
    };
  }

  /* Mobile : chaque mini-schéma s'éclaire une seule fois, sans annotation. */
  function minis() {
    $$('.mini-fig').forEach(function (fig) {
      var shapes = $$('.z-shape', fig);
      gsap.fromTo(shapes, { opacity: 0 }, {
        opacity: 1, duration: 1, ease: EASE,
        scrollTrigger: { trigger: fig, start: 'top 85%', once: true }
      });
    });
    return function () {};
  }

  /* ---------------------------------------------------------------------
     Mécanique 2 · timeline « Déroulé d'une séance »
     --------------------------------------------------------------------- */
  function timeline(full) {
    var wrap = $('.timeline-wrap');
    if (!wrap) return function () {};
    var line = $('.timeline-line', wrap);
    var steps = $$('.step', wrap);

    // Le trait se dessine au rythme du défilement, avec un léger retard (scrub).
    gsap.fromTo(line, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top 72%', end: 'bottom 62%', scrub: full ? 1.4 : 0.8 }
    });

    steps.forEach(function (step) {
      var dot = $('.step-dot', step);
      var fill = $('.step-fill', step);
      var body = $$('.step-time, h3, p', step);
      var tl = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: step, start: 'top 66%', toggleActions: 'play none none reverse' }
      });
      tl.fromTo(dot, { borderColor: 'rgba(246, 248, 249, 0.3)' }, { borderColor: 'rgba(246, 248, 249, 1)', duration: 0.6 }, 0)
        .fromTo(fill, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: EASE_OUT }, 0.1);
      // Desktop : l'étape à venir reste lisible mais en retrait (jamais masquée).
      if (full) tl.fromTo(body, { opacity: 0.45 }, { opacity: 1, duration: 0.9, stagger: 0.06 }, 0);
    });
    return function () {};
  }

  /* Hero : le filet de la légende se trace depuis le centre, une fois. */
  function hero() {
    var rule = $('.legend-rule');
    if (rule) gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.8, ease: EASE, delay: 0.4 });
    // la feuille d'atlas se met en place : règles tracées de haut en bas, repères de coupe en fondu
    var rulers = $$('.sheet .ruler');
    if (rulers.length) gsap.fromTo(rulers, { scaleY: 0 }, { scaleY: 1, duration: 2, ease: EASE, delay: 0.2 });
    var crops = $$('.sheet .crop, .sheet-title');
    if (crops.length) gsap.fromTo(crops, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: EASE, delay: 0.9, stagger: 0.08 });
    return function () {};
  }

  /* ---------------------------------------------------------------------
     Pack A « Atlas tracé » : mouvements d'accompagnement (pas de mécanique
     majeure). Tout se joue une seule fois, à l'arrivée de l'élément, et part
     d'un état déjà presque lisible (opacité 0,2).
     --------------------------------------------------------------------- */
  var ONCE = function (trigger, start) { return { trigger: trigger, start: start || 'top 85%', once: true }; };

  // Mesure un trait SVG et le masque pour pouvoir le tracer.
  function hideStroke(el) {
    var len = el.getTotalLength ? el.getTotalLength() : 0;
    el._len = len;
    gsap.set(el, { strokeDasharray: len + ' ' + (len + 6), strokeDashoffset: len + 2 });
  }

  /* Ouverture des sections : filet de l'en-tête tracé, titre puis texte. */
  function sections(full) {
    var lift = full ? 12 : 0;   // mobile : fondu seul
    var units = $$('.intro, .planche, .public, .sec-head, .split-text, .rdv-text, #motifs > .section-title, #publics > .section-title');
    units.forEach(function (u) {
      var group = u.matches('.section-title') ? [u].concat(u.nextElementSibling && u.nextElementSibling.matches('.section-lede') ? [u.nextElementSibling] : []) : null;
      var plates = group ? [] : $$('.plate', u);
      var nums = group ? [] : $$(':scope > .plate-num', u);
      var heads = group ? [u] : $$(':scope > h2, :scope > h3', u);
      var paras = group ? group.slice(1) : $$(':scope > p:not(.plate)', u);
      var tl = gsap.timeline({ defaults: { ease: EASE }, scrollTrigger: ONCE(u) });
      // numéro de planche géant : simple fondu avec une légère montée (décoratif)
      if (nums.length) tl.fromTo(nums, { opacity: 0, y: lift * 1.5 }, { opacity: 1, y: 0, duration: 1.4 }, 0);
      if (plates.length) tl.fromTo(plates, { '--draw': 0 }, { '--draw': 1, duration: 1.3 }, nums.length ? 0.3 : 0);
      if (heads.length) tl.fromTo(heads, { opacity: 0.2, y: lift }, { opacity: 1, y: 0, duration: 1 }, 0.15);
      if (paras.length) tl.fromTo(paras, { opacity: 0.2, y: lift ? 8 : 0 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.3);
    });
    return function () {};
  }

  /* Tableaux et listes : les filets se tracent ligne par ligne. */
  function ruled() {
    [['.facts', 'li'], ['.contact', ':scope > div'], ['.faq', '.faq-item']].forEach(function (pair) {
      $$(pair[0]).forEach(function (g) {
        var rows = $$(pair[1], g);
        if (!rows.length) return;
        gsap.fromTo(rows, { '--draw': 0 }, {
          '--draw': 1, duration: 1, ease: EASE, stagger: 0.12, scrollTrigger: ONCE(g, 'top 88%')
        });
      });
    });

    // Tarifs : les grands chiffres montent doucement, l'un après l'autre.
    var prices = $$('.price dd');
    if (prices.length) {
      gsap.fromTo(prices, { opacity: 0.2, y: 16 }, {
        opacity: 1, y: 0, duration: 1.2, ease: EASE, stagger: 0.18, scrollTrigger: ONCE('.prices')
      });
    }
    // Parcours de la praticienne : les années apparaissent en suivant.
    var years = $$('.years > div');
    if (years.length) {
      gsap.fromTo(years, { opacity: 0.2 }, { opacity: 1, duration: 0.9, ease: EASE, stagger: 0.12, scrollTrigger: ONCE('.years', 'top 90%') });
    }

    // Avis : le trait bleu se dessine de haut en bas, puis la citation.
    $$('.review').forEach(function (r) {
      var tl = gsap.timeline({ defaults: { ease: EASE }, scrollTrigger: ONCE(r) });
      tl.fromTo(r, { '--draw': 0 }, { '--draw': 1, duration: 1.2 }, 0)
        .fromTo($$('blockquote', r), { opacity: 0.2 }, { opacity: 1, duration: 1 }, 0.3)
        .fromTo($$('figcaption', r), { opacity: 0.2 }, { opacity: 1, duration: 0.8 }, 0.6);
    });
    return function () {};
  }

  /* Pictos des publics : tracés trait par trait, comme la silhouette. */
  function pictos() {
    $$('.picto').forEach(function (svg) {
      var strokes = $$('path, circle, rect', svg);
      strokes.forEach(hideStroke);
      gsap.to(strokes, {
        strokeDashoffset: 0, duration: 1.4, ease: EASE, stagger: 0.1, scrollTrigger: ONCE(svg, 'top 90%')
      });
    });
    return function () {};
  }

  /* Photos : la ligne d'eau. Desktop : l'image se découvre de haut en bas
     derrière une ligne bleue (masque, aucune mise à l'échelle) ; le bassin
     glisse de 3 % dans son cadre. Mobile : simple fondu. */
  function photos(full) {
    $$('.photo').forEach(function (fig) {
      var frame = $('.photo-frame', fig);
      var img = $('img', fig);
      var line = $('.waterline', fig);
      var rule = $('.cap-rule', fig);
      var cap = $('figcaption', fig);
      var tl = gsap.timeline({ defaults: { ease: EASE }, scrollTrigger: ONCE(fig, 'top 82%') });
      if (full) {
        tl.fromTo(img, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6 }, 0)
          .fromTo(line, { top: '0%', opacity: 1 }, { top: '100%', duration: 1.6 }, 0)
          .to(line, { opacity: 0, duration: 0.5 }, 1.35);
        if (frame && frame.hasAttribute('data-drift')) {
          tl.fromTo(img, { yPercent: -3 }, { yPercent: 0, duration: 1.9, ease: EASE_OUT }, 0);
        }
      } else {
        tl.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0);
      }
      tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1 }, full ? 1 : 0.4)
        .fromTo(cap, { opacity: 0.2 }, { opacity: 1, duration: 0.8 }, full ? 1.3 : 0.7);
    });
    return function () {};
  }

  /* Barre de progression sous l'en-tête : l'échelle de la carte. */
  function progress() {
    var bar = $('.progress');
    if (bar) {
      gsap.fromTo(bar, { scaleX: 0 }, {
        scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.4 }
      });
    }
    return function () {};
  }

  /* Navigation : un soulignement glisse vers la section en cours (desktop). */
  function navIndicator() {
    var nav = $('.nav');
    var ind = $('.nav-indicator');
    if (!nav || !ind) return function () {};
    var links = $$('.nav a');
    var active = [];
    var current = null;

    function place(link, instant) {
      if (!link) {
        gsap.to(ind, { opacity: 0, duration: instant ? 0 : 0.5, ease: EASE, overwrite: 'auto' });
        return;
      }
      var n = nav.getBoundingClientRect();
      var r = link.getBoundingClientRect();
      gsap.to(ind, {
        x: r.left - n.left, width: r.width, opacity: 1,
        duration: instant ? 0 : 0.8, ease: EASE, overwrite: 'auto'
      });
    }
    function update() {
      var link = active.length ? active[active.length - 1] : null;
      if (link === current) return;
      links.forEach(function (l) { l.removeAttribute('aria-current'); });
      if (link) link.setAttribute('aria-current', 'true');
      current = link;
      place(link);
    }
    links.forEach(function (link) {
      var section = link.hash && document.querySelector(link.hash);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section, start: 'top 45%', end: 'bottom 45%',
        onToggle: function (self) {
          var i = active.indexOf(link);
          if (self.isActive && i < 0) active.push(link);
          if (!self.isActive && i > -1) active.splice(i, 1);
          update();
        }
      });
    });
    function onRefresh() { if (current) place(current, true); }
    ScrollTrigger.addEventListener('refresh', onRefresh);
    return function () {
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      links.forEach(function (l) { l.removeAttribute('aria-current'); });
    };
  }

  /* ---------------------------------------------------------------------
     Répartition selon l'écran et les préférences
     --------------------------------------------------------------------- */
  var mm = gsap.matchMedia();
  mm.add({
    desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
    mobile: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)'
  }, function (ctx) {
    var c = ctx.conditions;
    root.classList.add('motion');
    var cleanups = [hero(), timeline(c.desktop), sections(c.desktop), ruled(), pictos(), photos(c.desktop), progress()];
    if (c.desktop) cleanups.push(atlas(), navIndicator());
    if (c.mobile) cleanups.push(minis());
    return function () {
      cleanups.forEach(function (fn) { fn(); });
      root.classList.remove('motion');
    };
  });
})();
