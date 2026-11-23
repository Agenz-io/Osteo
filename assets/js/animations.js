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
      gsap.set(el, { strokeDasharray: len + ' ' + (len + 4), strokeDashoffset: len });
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
      tl.fromTo(shapes, { opacity: 0 }, { opacity: 1, duration: 1.1 }, 0)
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
      tl.fromTo(dot, { borderColor: 'rgba(27, 58, 85, 0.3)' }, { borderColor: 'rgba(27, 58, 85, 1)', duration: 0.6 }, 0)
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
    return function () {};
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
    var cleanups = [hero(), timeline(c.desktop)];
    if (c.desktop) cleanups.push(atlas());
    if (c.mobile) cleanups.push(minis());
    return function () {
      cleanups.forEach(function (fn) { fn(); });
      root.classList.remove('motion');
    };
  });
})();
