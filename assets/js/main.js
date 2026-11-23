/* Cabinet Camille Roux · site de démonstration
   Version sans animation : le schéma fixe suit la lecture.
   Chaque motif (ou public) porte data-zones ; quand il passe au centre de
   l'écran, le schéma reçoit les mêmes zones et sa légende change. */
(function () {
  'use strict';

  var schema = document.querySelector('.schema');
  if (!schema) return;
  var caption = schema.querySelector('.schema-caption');
  var blocks = Array.prototype.slice.call(document.querySelectorAll('.atlas [data-zones]'));

  function captionFor(block) {
    var plate = block.querySelector('.plate');
    var title = block.querySelector('h2, h3');
    var label = plate ? plate.textContent.split('·')[0].trim() : '';
    return { plate: label, title: title ? title.textContent.trim() : '' };
  }

  function activate(block) {
    var zones = block.getAttribute('data-zones');
    if (schema.getAttribute('data-zones') === zones) return;
    schema.setAttribute('data-zones', zones);
    if (caption) {
      var c = captionFor(block);
      caption.innerHTML = '';
      var p = document.createElement('span');
      p.className = 'schema-plate';
      p.textContent = c.plate;
      caption.appendChild(p);
      caption.appendChild(document.createTextNode(' ' + c.title));
    }
    document.dispatchEvent(new CustomEvent('schema:change', { detail: { zones: zones, block: block } }));
  }

  if (!('IntersectionObserver' in window)) return;

  // Ligne de déclenchement au milieu de l'écran.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) activate(entry.target);
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

  blocks.forEach(function (b) { io.observe(b); });
})();
