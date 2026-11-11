/* Taalkeuze voor de webinarpagina's: altijd één taal tegelijk (NL of EN).
   Volgorde: de keuze uit de NL | EN-schakelaar in de header (bewaard in deze browser), anders de taal van de browser
   (begint met "nl" is Nederlands, al het andere Engels). Zet data-taal en lang op <html>; de CSS in webinar.css
   verbergt de andere taal (.t-nl/.t-en, .s-nl/.s-en en de .wan-nl/.wan-en van webinar-wa-nummer.js).
   Laden als gewoon script in de <head>, zodat er geen flits van twee talen is. */
(function () {
  'use strict';
  var KEY = 'utama_taal';
  var TITELS = {
    nl: 'Stap 2: ontvang je link ook op WhatsApp | UTAMA webinar',
    en: 'Step 2: get your link on WhatsApp too | UTAMA webinar'
  };
  function bepaal() {
    var o = null;
    try { o = window.localStorage.getItem(KEY); } catch (e) {}
    if (o === 'nl' || o === 'en') return o;
    var l = (navigator.languages && navigator.languages[0]) || navigator.language || 'nl';
    return /^nl/i.test(l) ? 'nl' : 'en';
  }
  function zet(taal, bewaar) {
    var h = document.documentElement;
    h.setAttribute('data-taal', taal);
    h.setAttribute('lang', taal);
    if (bewaar) { try { window.localStorage.setItem(KEY, taal); } catch (e) {} }
    if (document.title && h.hasAttribute('data-taal-titel')) document.title = TITELS[taal];
    var knoppen = document.querySelectorAll('[data-zet-taal]');
    for (var i = 0; i < knoppen.length; i++) {
      knoppen[i].setAttribute('aria-pressed', knoppen[i].getAttribute('data-zet-taal') === taal ? 'true' : 'false');
    }
  }
  zet(bepaal(), false);
  function koppel() {
    zet(document.documentElement.getAttribute('data-taal') || bepaal(), false);
    var knoppen = document.querySelectorAll('[data-zet-taal]');
    for (var i = 0; i < knoppen.length; i++) {
      knoppen[i].addEventListener('click', function () { zet(this.getAttribute('data-zet-taal'), true); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', koppel);
  else koppel();
})();
