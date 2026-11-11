/* Taal van de webinar-keten: altijd één taal tegelijk (NL of EN), en dezelfde taal op elke volgende pagina.
   Volgorde:
   1. Een pagina die zelf een taal heeft (data-taal-pagina="nl" of "en" op <html>, zoals de aanmeldpagina) legt die taal vast.
   2. Anders de vastgelegde taal: de keuze uit de NL | EN-schakelaar in de header, of de taal van de aanmeldpagina.
   3. Anders de taal van de browser (begint met "nl" is Nederlands, al het andere Engels).
   Zet data-taal en lang op <html>; de CSS in webinar.css verbergt de andere taal (.t-nl/.t-en, .s-nl/.s-en en de
   .wan-nl/.wan-en van webinar-wa-nummer.js). Per pagina een titel per taal via data-titel-nl en data-titel-en.
   Laden als gewoon script in de <head>, zodat er geen flits van twee talen is. */
(function () {
  'use strict';
  var KEY = 'utama_taal';
  function lees() {
    var o = null;
    try { o = window.localStorage.getItem(KEY); } catch (e) {}
    if (o !== 'nl' && o !== 'en') { try { o = window.sessionStorage.getItem(KEY); } catch (e) { o = null; } }
    return (o === 'nl' || o === 'en') ? o : null;
  }
  function schrijf(taal) {
    try { window.localStorage.setItem(KEY, taal); } catch (e) {}
    try { window.sessionStorage.setItem(KEY, taal); } catch (e) {}
  }
  function bepaal() {
    var pagina = document.documentElement.getAttribute('data-taal-pagina');
    if (pagina === 'nl' || pagina === 'en') { schrijf(pagina); return pagina; }
    var o = lees();
    if (o) return o;
    var l = (navigator.languages && navigator.languages[0]) || navigator.language || 'nl';
    return /^nl/i.test(l) ? 'nl' : 'en';
  }
  function zet(taal, bewaar) {
    var h = document.documentElement;
    h.setAttribute('data-taal', taal);
    h.setAttribute('lang', taal);
    if (bewaar) schrijf(taal);
    var titel = h.getAttribute('data-titel-' + taal);
    if (titel) document.title = titel;
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
