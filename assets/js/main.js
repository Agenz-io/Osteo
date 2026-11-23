/* Cabinet Camille Roux · site de démonstration
   Comportements de base, sans animation.

   1. Le schéma fixe suit la lecture : chaque motif (ou public) porte
      data-zones ; quand il passe au milieu de l'écran, le schéma reçoit les
      mêmes zones et sa légende change. Bascule instantanée ici ; la version
      animée (animations.js) écoute l'évènement « schema:change ».
   2. FAQ : une seule question ouverte à la fois. */
(function () {
  'use strict';

  /* --- 1. Schéma -------------------------------------------------------- */
  var schema = document.querySelector('.schema');
  var blocks = Array.prototype.slice.call(document.querySelectorAll('.atlas [data-zones]'));
  var io = null;

  function captionFor(block) {
    var plate = block.querySelector('.plate');
    var title = block.querySelector('h2, h3');
    return {
      plate: plate ? plate.textContent.split('·')[0].trim() : '',
      title: title ? title.textContent.trim() : ''
    };
  }

  function activate(block) {
    if (!schema) return;
    var zones = block.getAttribute('data-zones');
    if (schema.getAttribute('data-zones') === zones) return;
    schema.setAttribute('data-zones', zones);
    var caption = schema.querySelector('.schema-caption');
    if (caption) {
      var c = captionFor(block);
      caption.textContent = '';
      var p = document.createElement('span');
      p.className = 'schema-plate';
      p.textContent = c.plate;
      caption.appendChild(p);
      caption.appendChild(document.createTextNode(' ' + c.title));
    }
    document.dispatchEvent(new CustomEvent('schema:change', { detail: { zones: zones, block: block } }));
  }

  function observe() {
    if (!schema || io || !('IntersectionObserver' in window)) return;
    // Ligne de déclenchement au milieu de l'écran.
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) activate(entry.target);
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    blocks.forEach(function (b) { io.observe(b); });
  }

  function disconnect() {
    if (io) { io.disconnect(); io = null; }
  }

  observe();

  // Utilisé par animations.js, qui remplace l'observateur par ScrollTrigger.
  window.Atlas = { schema: schema, blocks: blocks, activate: activate, observe: observe, disconnect: disconnect };

  /* --- 2. FAQ : une question ouverte à la fois ------------------------- */
  var faq = document.querySelector('.faq');
  if (faq) {
    faq.addEventListener('toggle', function (e) {
      var opened = e.target;
      if (!opened.open) return;
      faq.querySelectorAll('details[open]').forEach(function (d) {
        if (d !== opened) d.open = false;
      });
    }, true);
  }
})();
