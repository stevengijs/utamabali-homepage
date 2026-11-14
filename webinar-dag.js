/* webinar-dag.js
   Datum en dag van het webinar op de aanmeldpagina en de bedankpagina, altijd in Nederlandse tijd.

   Bron: data-webinar-start op <html>, bijvoorbeeld data-webinar-start="2026-11-15T13:00:00+01:00".
   Bij een nieuw webinar hoeft alleen die ene waarde te veranderen. De pagina's tonen dan vanzelf de nieuwe
   dag, datum en tijd en de tekst "overmorgen", "morgen" of "vandaag" vlak ervoor (Steven, 14 november 2026).

   Op de lander: dag en datum zonder "overmorgen/morgen/vandaag" zolang het webinar verder weg is.
   Op de bedankpagina: de zinnen met "zondag" (NL en EN) worden vervangen door de juiste dag.
   De tekst in de HTML blijft de terugval als dit script niet draait; die tekst hoort bij het webinar van
   15 november 2026 en wordt hier op vaste zinnen herkend. Een nieuw webinar met een andere tekst in de HTML
   vraagt dus ook om de zinnen in ZINNEN_NL en ZINNEN_EN hieronder.
   De deuren gaan open 15 minuten voor de start. De duur ("60 minuten"), de metabeschrijving en de aftelklok (data-target) staan nog op eigen plekken.

   Voorbeeld bekijken: ?dagtest=2026-11-13T12:00:00Z achter het adres bootst een andere dag na. */
(function(){
  var NL_DAG = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
  var NL_MND = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
  var NL_DAGK = ['zo','ma','di','wo','do','vr','za'];
  var NL_MNDK = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  var EN_DAG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var EN_MND = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function delen(dt){
    var p = new Intl.DateTimeFormat('en-US', {timeZone:'Europe/Amsterdam', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false}).formatToParts(dt), o = {};
    p.forEach(function(x){ o[x.type] = x.value; });
    if(o.hour === '24') o.hour = '00';
    return {y:+o.year, m:+o.month, d:+o.day, uur:o.hour, min:o.minute};
  }
  function dagnr(x){ return Date.UTC(x.y, x.m - 1, x.d) / 86400000; }
  function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

  function vervangTekst(needle, nieuw){
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n, aantal = 0;
    while((n = w.nextNode())){
      var pe = n.parentNode && n.parentNode.nodeName;
      if(pe === 'SCRIPT' || pe === 'STYLE' || pe === 'NOSCRIPT') continue;
      if(n.nodeValue.indexOf(needle) > -1){ n.nodeValue = n.nodeValue.split(needle).join(nieuw); aantal++; }
    }
    return aantal;
  }
  function q(sel){ return document.querySelector(sel); }

  window.utamaWebinarDag = function(nu){
    try{
      var start = document.documentElement.getAttribute('data-webinar-start');
      if(!start){ var cd = q('#countdown'); start = cd && cd.getAttribute('data-target'); }
      var doel = new Date(start); if(!start || isNaN(doel)) return null;
      var t = delen(doel), vandaag = delen(nu || new Date());
      var diff = Math.round(dagnr(t) - dagnr(vandaag));
      var wk = new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay();
      var tijd = t.uur + ':' + t.min;
      var dt = delen(new Date(doel.getTime() - 15 * 60000)), deur = dt.uur + ':' + dt.min;

      /* Nederlands */
      var rel = diff === 2 ? 'overmorgen' : diff === 1 ? 'morgen' : diff === 0 ? 'vandaag' : null;
      var wd = NL_DAG[wk], mnd = NL_MND[t.m - 1];
      var dat = wd + ' ' + t.d + ' ' + mnd;
      var W = rel || wd;
      var datKop = rel ? cap(rel) + ', ' + dat : cap(dat);
      var datKort = rel ? cap(rel) : cap(NL_DAGK[wk]) + ' ' + t.d + ' ' + NL_MNDK[t.m - 1];

      /* English */
      var relEn = diff === 2 ? 'the day after tomorrow' : diff === 1 ? 'tomorrow' : diff === 0 ? 'today' : null;
      var WD = EN_DAG[wk], MND = EN_MND[t.m - 1];
      var datEn = WD + ' ' + t.d + ' ' + MND;
      var datKopEn = relEn ? cap(relEn) + ', ' + datEn : datEn;

      var el, n = 0;

      /* Lander */
      if((el = q('.live-badge')) && el.lastChild) el.lastChild.textContent = rel ? cap(rel) + ' · live webinar' : 'Live webinar';
      if((el = q('.gate-when')) && el.firstChild) el.firstChild.textContent = rel ? datKop : 'Gratis · ' + cap(dat);
      if((el = q('.when-time'))) el.textContent = tijd + ' uur';
      if((el = q('.chip-day'))) el.textContent = datKop;
      if((el = q('.chip-time'))) el.textContent = tijd + ' NL-tijd';
      ['.nb-sub', '.nw-short'].forEach(function(sel){
        var e = q(sel); if(!e) return;
        var s = e.textContent.split(' · '); if(s.length < 3) return;
        s[0] = datKort; s[1] = tijd; e.textContent = s.join(' · ');
      });
      if((el = q('.nw-long'))){
        var sl = el.textContent.split(' · ');
        if(sl.length >= 3){ sl[0] = datKop; sl[1] = tijd + ' uur'; el.textContent = sl.join(' · '); }
      }
      if((el = q('.cd-when')) && el.firstChild) el.firstChild.textContent = datKop + ' om ' + tijd + ' uur ';
      [].forEach.call(document.querySelectorAll('details p'), function(p){
        if(/^60 minuten, .+? om \d{1,2}:\d{2} uur Nederlandse tijd/.test(p.textContent)){
          p.textContent = p.textContent.replace(/^60 minuten, .+? om \d{1,2}:\d{2} uur/, '60 minuten, ' + dat + ' om ' + tijd + ' uur').replace(/open om \d{1,2}:\d{2} uur/, 'open om ' + deur + ' uur');
        }
      });

      n += vervangTekst('Deuren open om 12:45 uur', 'Deuren open om ' + deur + ' uur');
      n += vervangTekst('Inloggen kan vanaf 12:45 uur', 'Inloggen kan vanaf ' + deur + ' uur');
      n += vervangTekst('log in from 12:45', 'log in from ' + deur);

      /* Bedankpagina, Nederlands */
      n += vervangTekst('Aanstaande zondag 15 november om 13:00 uur', (rel ? cap(rel) + ', ' + dat + ', om ' : 'Aanstaande ' + dat + ' om ') + tijd + ' uur');
      n += vervangTekst('Drie dingen voor zondag.', 'Drie dingen voor ' + W + '.');
      n += vervangTekst('Zondag 15 november, 13:00 uur, reken op', datKop + ', ' + tijd + ' uur, reken op');
      n += vervangTekst('Waar wil jij zondag echt antwoord op?', 'Waar wil jij ' + W + ' echt antwoord op?');
      n += vervangTekst('krijg je zondag.', 'krijg je ' + W + '.');
      n += vervangTekst('Zondag laten we zien', cap(W) + ' laten we zien');
      n += vervangTekst('leggen we zondag uit', 'leggen we ' + W + ' uit');
      n += vervangTekst('We leggen zondag de hoofdlijnen uit', 'We leggen ' + W + ' de hoofdlijnen uit');
      n += vervangTekst('Tot zondag.', diff === 0 ? 'Tot straks.' : 'Tot ' + W + '.');
      n += vervangTekst('Zondag loop ik de 7 stappen', cap(W) + ' loop ik de 7 stappen');

      /* Bedankpagina, English */
      n += vervangTekst('This Sunday, 15 November at 13:00 Dutch time', (relEn ? cap(relEn) + ', ' + datEn + ', at ' : 'This ' + WD + ', ' + t.d + ' ' + MND + ' at ') + tijd + ' Dutch time');
      n += vervangTekst('Three things for Sunday.', 'Three things for ' + (relEn || WD) + '.');
      n += vervangTekst('Sunday 15 November, 13:00 Dutch time, allow', datKopEn + ', ' + tijd + ' Dutch time, allow');
      n += vervangTekst('a real answer to on Sunday?', relEn ? 'a real answer to ' + relEn + '?' : 'a real answer to on ' + WD + '?');
      n += vervangTekst('full answers on Sunday.', relEn ? 'full answers ' + relEn + '.' : 'full answers on ' + WD + '.');
      n += vervangTekst('On Sunday we show', relEn ? cap(relEn) + ' we show' : 'On ' + WD + ' we show');
      n += vervangTekst('We explain on Sunday how', relEn ? 'We explain ' + relEn + ' how' : 'We explain on ' + WD + ' how');
      n += vervangTekst('On Sunday we explain the main lines', relEn ? cap(relEn) + ' we explain the main lines' : 'On ' + WD + ' we explain the main lines');
      n += vervangTekst('See you Sunday.', diff === 0 ? 'See you soon.' : 'See you ' + (relEn || WD) + '.');
      n += vervangTekst('On Sunday I walk you through', relEn ? cap(relEn) + ' I walk you through' : 'On ' + WD + ' I walk you through');

      /* Vooraf ingevulde WhatsApp-berichten op de bedankpagina */
      [].forEach.call(document.querySelectorAll('a[href*="wa.me"]'), function(a){
        var h = a.getAttribute('href');
        h = h.split(encodeURIComponent('zondag 15 november')).join(encodeURIComponent(dat))
             .split(encodeURIComponent('Sunday 15 November')).join(encodeURIComponent(datEn))
             .split(encodeURIComponent('van 15 november')).join(encodeURIComponent('van ' + t.d + ' ' + mnd))
             .split(encodeURIComponent('of 15 November')).join(encodeURIComponent('of ' + t.d + ' ' + MND));
        a.setAttribute('href', h);
      });

      try{ window.dispatchEvent(new Event('resize')); }catch(e){}
      return {rel: rel, dag: dat, tijd: tijd, zinnen: n};
    }catch(e){ return null; }
  };

  /* Voorbeeld bekijken: voeg ?dagtest=2026-11-13T12:00:00Z toe aan het adres om een andere dag na te bootsen. */
  var m = /[?&]dagtest=([^&]+)/.exec(window.location.search), nuTest = m ? new Date(decodeURIComponent(m[1])) : null;
  if(!window.__utamaDagTest) window.utamaWebinarDag(nuTest && !isNaN(nuTest) ? nuTest : null);
})();
