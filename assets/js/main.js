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

  /* --- 3. Horaires : ligne du jour et statut (heure de Paris) ---------- */
  (function hours() {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.hours tr[data-day]'));
    var status = document.querySelector('.open-status');
    if (!rows.length || !window.Intl) return;
    var parts = {};
    try {
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    } catch (e) { return; }
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    var now = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10);
    if (day < 0 || isNaN(now)) return;

    var DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    var byDay = {};
    rows.forEach(function (r) { byDay[r.getAttribute('data-day')] = r; });
    var toMin = function (s) { var m = /^(\d\d):(\d\d)$/.exec(s || ''); return m ? +m[1] * 60 + +m[2] : null; };
    var fmt = function (s) { var m = /^(\d\d):(\d\d)$/.exec(s); return (+m[1]) + ' h' + (m[2] === '00' ? '' : ' ' + m[2]); };

    var today = byDay[day];
    if (today) today.classList.add('is-today');
    if (!status) return;

    var open = today && toMin(today.getAttribute('data-open'));
    var close = today && toMin(today.getAttribute('data-close'));
    var text, isOpen = false;
    if (open !== null && close !== null && now >= open && now < close) {
      isOpen = true;
      text = 'Ouvert maintenant · ferme à ' + fmt(today.getAttribute('data-close'));
    } else if (open !== null && now < open) {
      text = 'Fermé · ouvre à ' + fmt(today.getAttribute('data-open'));
    } else {
      for (var i = 1; i <= 7; i++) {
        var d = (day + i) % 7;
        var r = byDay[d];
        if (r && r.getAttribute('data-open')) {
          text = 'Fermé · ouvre ' + (i === 1 ? 'demain' : DAYS[d]) + ' à ' + fmt(r.getAttribute('data-open'));
          break;
        }
      }
    }
    if (!text) return;
    status.textContent = text + ' ';
    var note = document.createElement('small');
    note.textContent = '(horaires fictifs)';
    status.appendChild(note);
    status.classList.toggle('is-open', isOpen);
    status.hidden = false;
  })();

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
