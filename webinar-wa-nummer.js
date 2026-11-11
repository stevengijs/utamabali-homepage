/* Webinar: het WhatsApp-nummer ná de aanmelding.
   Steven, 11 november 2026: de aanmeldpagina vraagt alleen nog voornaam en e-mail (dat gaf veel meer
   aanmeldingen, maar zonder nummer). Op de bedankpagina vragen we het nummer alsnog, voor de herinnering
   en de persoonlijke link op WhatsApp. Eén bestand voor elke webinarlander en bedankpagina.

   AANMELDPAGINA (elke pagina zonder [data-wa-nummer]): zodra WebinarGeek de inschrijving heeft aangemaakt
   (POST .../subscriptions gelukt) onthoudt dit script het e-mailadres en de utm-tags in deze browser.
   BEDANKPAGINA (een element met data-wa-nummer): toont daar het formulier. E-mailadres en utm-tags zitten als
   verborgen velden in het formulier; is het e-mailadres onbekend (ander toestel), dan vraagt het formulier het
   er zelf bij. Versturen roept de databasefunctie webinar_whatsapp_toevoegen aan (migratie 20261111150000):
   die zet het nummer op de aanmelding, het contact en het broadcast-contact, alleen waar nog geen nummer staat.

   Laden als gewoon script in de <head>, niet defer of async: de fetch-hook moet er hangen voordat het
   WebinarGeek-formulier laadt. Geen e-mailadres in een URL: t.js haalt "email" uit opgeslagen adressen,
   en het hoort er niet in. */
(function () {
  'use strict';

  var API = 'https://gcpachivrwalsneuvlsa.supabase.co/rest/v1/rpc/webinar_whatsapp_toevoegen';
  var KEY = 'sb_publishable_P6qb3M4xQnPJGZkM-WFWdg_E9swz7Zn';
  var OPSLAG = 'utama_webinar_aanmelding';
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  /* Gelijk aan het venster in de database: het nummer komt op een aanmelding van de laatste twee dagen. */
  var HOUDBAAR = 2 * 24 * 3600 * 1000;
  var MAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  /* ---------- opslag: localStorage en sessionStorage, allebei in try/catch ---------- */
  function lees() {
    var s = null;
    try { s = window.localStorage.getItem(OPSLAG); } catch (e) {}
    if (!s) { try { s = window.sessionStorage.getItem(OPSLAG); } catch (e) {} }
    if (!s) return null;
    try {
      var o = JSON.parse(s);
      if (!o || typeof o !== 'object' || !o.t || Date.now() - o.t > HOUDBAAR) return null;
      return o;
    } catch (e) { return null; }
  }
  function schrijf(o) {
    var s = JSON.stringify(o);
    try { window.localStorage.setItem(OPSLAG, s); } catch (e) {}
    try { window.sessionStorage.setItem(OPSLAG, s); } catch (e) {}
  }
  function utmUitAdres() {
    var u = {};
    try {
      var q = new URLSearchParams(window.location.search);
      UTM.forEach(function (k) { var v = q.get(k); if (v) u[k] = v.slice(0, 200); });
    } catch (e) {}
    return u;
  }

  /* ---------- aanmeldpagina: het e-mailadres uit de inschrijving halen ---------- */
  function zoekEmail(x, diepte) {
    if (!x || typeof x !== 'object' || diepte > 3) return '';
    var k, v, uit;
    for (k in x) {
      if (!Object.prototype.hasOwnProperty.call(x, k)) continue;
      v = x[k];
      if (typeof v === 'string' && /^e-?mail(adres)?$/i.test(k) && MAIL.test(v.trim())) return v.trim();
    }
    for (k in x) {
      if (!Object.prototype.hasOwnProperty.call(x, k)) continue;
      v = x[k];
      if (v && typeof v === 'object') { uit = zoekEmail(v, diepte + 1); if (uit) return uit; }
    }
    return '';
  }
  function emailUitParams(p) {
    var gevonden = '';
    p.forEach(function (v, k) {
      if (!gevonden && typeof v === 'string' && /(^|[\[\]_.-])e-?mail(adres)?(\]|$)/i.test(k) && MAIL.test(v.trim())) gevonden = v.trim();
    });
    return gevonden;
  }
  function emailUitBody(body) {
    try {
      if (!body) return '';
      if (typeof body === 'string') {
        var t = body.replace(/^\s+/, '');
        if (t.charAt(0) === '{' || t.charAt(0) === '[') return zoekEmail(JSON.parse(t), 0);
        return emailUitParams(new URLSearchParams(body));
      }
      if (typeof FormData !== 'undefined' && body instanceof FormData) return emailUitParams(body);
      if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return emailUitParams(body);
    } catch (e) {}
    return '';
  }
  /* Vangnet: het ingevulde veld in het formulier zelf (WebinarGeek zet het in een shadow root). */
  function emailUitFormulier() {
    try {
      var els = document.querySelectorAll('[id$="_webinargeek"]');
      for (var i = 0; i < els.length; i++) {
        var sr = els[i].shadowRoot;
        var inv = sr && sr.querySelector('input[type="email"], input[name="email"]');
        if (inv && MAIL.test((inv.value || '').trim())) return inv.value.trim();
      }
    } catch (e) {}
    return '';
  }
  function onthoud(email) {
    if (!email || !MAIL.test(email)) return;
    schrijf({ email: email.toLowerCase(), utm: utmUitAdres(), t: Date.now() });
  }
  function isInschrijving(url, method) {
    return /webinargeek\.com/.test(url) && /\/subscriptions(\?|$)/.test(url) && String(method || 'GET').toUpperCase() === 'POST';
  }
  function volgInschrijving() {
    if (!window.fetch || window.__utamaWaNummerFetch) return;
    window.__utamaWaNummerFetch = true;
    var vorige = window.fetch;
    window.fetch = function (input, init) {
      var url = '', method = 'GET', volg = false, email = '', kopie = null;
      try {
        url = typeof input === 'string' ? input : (input && input.url) || '';
        method = (init && init.method) || (input && input.method) || 'GET';
        volg = isInschrijving(String(url), method);
        if (volg) {
          email = emailUitBody(init && init.body) || emailUitFormulier();
          /* Zit de body in een Request-object, dan moet de kopie er zijn voordat fetch hem opeet. */
          if (!email && typeof Request !== 'undefined' && input instanceof Request) kopie = input.clone();
        }
      } catch (e) {}
      var p = vorige.apply(this, arguments);
      if (!volg) return p;
      return p.then(function (r) {
        try {
          if (r && r.ok) {
            if (email) {
              onthoud(email);
            } else {
              /* Asynchroon vangnet: eerst de gekopieerde request, dan het antwoord van WebinarGeek. */
              (kopie ? kopie.text().then(emailUitBody) : Promise.resolve('')).then(function (e1) {
                if (e1) return onthoud(e1);
                return r.clone().json().then(function (j) { onthoud(zoekEmail(j, 0)); });
              }).catch(function () {});
            }
          }
        } catch (e) {}
        return r;
      });
    };
  }

  /* ---------- bedankpagina: het formulier ---------- */
  var STIJL =
    '.wan-card [hidden]{display:none !important}' +
    '.wan-card{max-width:640px;margin:26px auto 0;background:var(--paper,#FEFBF6);border:1px solid var(--line,#E7DECD);border-radius:var(--radius,14px);padding:26px;text-align:left;box-shadow:var(--shadow,none)}' +
    '.wan-kop{display:flex;gap:14px;align-items:flex-start}' +
    '.wan-icoon{flex:none;width:44px;height:44px;border-radius:50%;background:#25D366;color:#fff;display:inline-flex;align-items:center;justify-content:center}' +
    '.wan-card .wan-kop h2{font-size:21px;line-height:1.2;margin:0 0 6px;color:var(--ink,#17140F)}' +
    '.wan-card .wan-kop p{margin:0;max-width:none;font-size:15px;line-height:1.55;color:var(--muted,#5B564C)}' +
    '.wan-form{margin-top:18px}' +
    '.wan-rij{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}' +
    '.wan-veld{flex:1 1 230px;min-width:0;margin:0}' +
    '.wan-veld + .wan-veld{margin-top:0}' +
    '.wan-mail{margin-bottom:12px}' +
    '.wan-veld label{display:block;font-size:13.5px;font-weight:700;margin:0 0 6px;color:var(--ink,#17140F)}' +
    '.wan-veld input{display:block;width:100%;margin:0;font:inherit;font-size:16px;line-height:1.3;padding:14px 14px;border:1.5px solid var(--line,#E7DECD);border-radius:var(--radius-btn,8px);background:#fff;color:var(--ink,#17140F);-webkit-appearance:none;appearance:none}' +
    '.wan-veld input:focus{outline:2px solid #099a0b;outline-offset:1px;border-color:#099a0b}' +
    '.wan-veld input.wan-mis{border-color:#B3261E}' +
    '.wan-card .wan-knop{flex:0 0 auto;justify-content:center;background:#099a0b;color:#fff;font-size:16px;font-weight:700;padding:0 22px;min-height:54px;margin-top:28px;border-radius:var(--radius-btn,8px)}' +
    '.wan-card .wan-knop[disabled]{opacity:.65;cursor:default}' +
    '.wan-card .wan-noot{margin:10px 0 0;max-width:none;font-size:12.5px;line-height:1.45;color:var(--muted,#5B564C)}' +
    '.wan-card .wan-status{margin:8px 0 0;max-width:none;min-height:0;font-size:13.5px;line-height:1.45;font-weight:600;color:#B3261E}' +
    '.wan-card .wan-status:empty{display:none}' +
    '.wan-klaar{display:flex;gap:12px;align-items:flex-start;margin-top:16px;background:#EAF6EE;border:1px solid #BFE3CB;border-radius:10px;padding:14px 16px;color:var(--ink,#17140F);font-size:15px;line-height:1.5}' +
    '.wan-klaar:focus{outline:none}' +
    '.wan-card .wan-geenmail{margin:0;font-size:15px;line-height:1.55;color:var(--muted,#5B564C)}' +
    '.wan-card .wan-en{display:block;font-weight:500;font-size:.88em;color:var(--muted,#5B564C);margin-top:2px}' +
    '.wan-card .wan-kop h2 .wan-en{font-size:.68em;font-weight:600;margin-top:4px}' +
    '.wan-card .wan-kop p .wan-en{margin-top:6px}' +
    '.wan-card .wan-veld label .wan-nl,.wan-card .wan-veld label .wan-en{display:inline}' +
    '.wan-card .wan-veld label .wan-en{font-weight:500;color:var(--muted,#5B564C);margin-left:4px}' +
    '.wan-card .wan-veld label .wan-en::before{content:"/ "}' +
    '.wan-card.wan-tw .wan-knop{flex-direction:column;text-align:center;line-height:1.2}' +
    '.wan-card .wan-knop .wan-nl{display:block}' +
    '.wan-card .wan-knop .wan-en{display:block;font-size:12.5px;font-weight:500;color:#fff;opacity:.92;margin-top:1px}' +
    '.wan-card .wan-klaar .wan-en,.wan-card .wan-status .wan-en{color:inherit;opacity:.88}' +
    '.wan-klaar svg{flex:none;margin-top:2px;color:#099a0b}' +
    '.wan-klaar strong{display:block;font-size:16px}' +
    '@media (max-width:560px){.wan-card{padding:20px 18px;margin-top:22px}.wan-icoon{display:none}.wan-card .wan-kop h2{font-size:19px}.wan-card .wan-kop p{font-size:14.5px}.wan-form{margin-top:14px}.wan-card .wan-knop{flex:1 1 100%;margin-top:0}}';

  var ICOON_WA = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.1 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.8.8 1.9.1.1.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.6.4 0 .1 0 .5-.2 1z"/></svg>';
  var ICOON_OK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>';

  var TEKST = {
    kop: 'Link ook op WhatsApp ontvangen?',
    intro: 'Dan sturen we je op de dag zelf een herinnering en vlak voor de start je persoonlijke link.',
    mailLabel: 'E-mailadres van je aanmelding',
    telLabel: 'WhatsApp-nummer',
    knop: 'Ontvang de link op WhatsApp',
    bezig: 'Een momentje...',
    noot: 'Alleen voor de herinnering en de link van dit webinar.',
    klaarKop: 'Gelukt.',
    klaar: 'Je ontvangt de herinnering en de link op WhatsApp.',
    foutNummer: 'Dit nummer lijkt niet te kloppen. Vul je mobiele nummer in, met landcode als het niet Nederlands is, bijvoorbeeld +32 470 12 34 56.',
    foutMail: 'Vul het e-mailadres in waarmee je je hebt aangemeld.',
    geenMail: 'We vinden je aanmelding niet in deze browser. Meld je eerst aan, dan verschijnt deze stap vanzelf.',
    fout: 'Dat lukte niet. Probeer het zo nog eens, of stuur ons een berichtje via WhatsApp.'
  };

  /* Tweetalig (NL en EN onder elkaar): zet data-wa-taal="nl-en" op het element. Zonder dat blijft alles Nederlands. */
  function tw(nl, en) { return nl + '\u0001' + en; }
  var TEKST_NL_EN = {
    kop: tw('Link ook op WhatsApp ontvangen?', 'Get your link on WhatsApp too?'),
    intro: tw('Dan sturen we je op de dag zelf een herinnering en vlak voor de start je persoonlijke link.', "Then we'll send you a reminder on the day itself and your personal link right before the start."),
    mailLabel: tw('E-mailadres van je aanmelding', 'Email address you signed up with'),
    telLabel: tw('WhatsApp-nummer', 'WhatsApp number'),
    knop: tw('Ontvang de link op WhatsApp', 'Get the link on WhatsApp'),
    bezig: tw('Een momentje...', 'One moment...'),
    noot: tw('(Geen telefoontjes, alleen je link en een herinnering.)', '(No calls, just your link and a reminder.)'),
    klaarKop: tw('Gelukt.', 'Done.'),
    klaar: tw('Je ontvangt de herinnering en de link op WhatsApp.', "You'll receive the reminder and the link on WhatsApp."),
    foutNummer: tw('Dit nummer lijkt niet te kloppen. Vul je mobiele nummer in, met landcode als het niet Nederlands is, bijvoorbeeld +32 470 12 34 56.', "This number doesn't look right. Enter your mobile number, with country code if it isn't Dutch, for example +32 470 12 34 56."),
    foutMail: tw('Vul het e-mailadres in waarmee je je hebt aangemeld.', 'Enter the email address you signed up with.'),
    geenMail: tw('We vinden je aanmelding niet in deze browser. Meld je eerst aan, dan verschijnt deze stap vanzelf.', "We can't find your sign-up in this browser. Sign up first and this step appears automatically."),
    fout: tw('Dat lukte niet. Probeer het zo nog eens, of stuur ons een berichtje via WhatsApp.', "That didn't work. Please try again in a moment, or send us a message on WhatsApp.")
  };
  function zet(el, tekst) {
    var delen = String(tekst).split('\u0001');
    if (delen.length === 2) {
      el.textContent = '';
      var nl = document.createElement('span'); nl.className = 'wan-nl'; nl.textContent = delen[0];
      var en = document.createElement('span'); en.className = 'wan-en'; en.textContent = delen[1];
      el.appendChild(nl); el.appendChild(en);
    } else {
      el.textContent = tekst;
    }
  }

  function maakFormulier(host) {
    if (host.getAttribute('data-wa-klaar')) return;
    host.setAttribute('data-wa-klaar', '1');
    var tweetalig = host.getAttribute('data-wa-taal') === 'nl-en';
    var T = tweetalig ? TEKST_NL_EN : TEKST;

    if (!document.getElementById('wan-stijl')) {
      var st = document.createElement('style');
      st.id = 'wan-stijl';
      st.textContent = STIJL;
      document.head.appendChild(st);
    }

    var bewaard = lees();
    var email = (bewaard && bewaard.email) || '';
    var utm = (bewaard && bewaard.utm && Object.keys(bewaard.utm).length) ? bewaard.utm : utmUitAdres();
    /* Het zichtbare e-mailveld verschijnt alleen voor wie uit de herinneringsmail komt (utm_medium=email) zonder
       opgeslagen adres. In alle andere gevallen is het adres al bekend uit de aanmelding (Steven, 11 nov: niet nogmaals
       vragen). ?preview=1 toont het formulier zonder opslag, om de pagina te bekijken. */
    var uitMail = /[?&]utm_medium=email(&|$)/i.test(window.location.search);
    var voorbeeld = /[?&]preview=1(&|$)/.test(window.location.search);

    var kaart = document.createElement('div');
    kaart.className = 'wan-card' + (tweetalig ? ' wan-tw' : '');
    kaart.innerHTML =
      '<div class="wan-kop"><span class="wan-icoon">' + ICOON_WA + '</span><div><h2></h2><p class="wan-intro"></p></div></div>' +
      '<div class="wan-klaar" role="status" hidden>' + ICOON_OK + '<div><strong></strong><span class="wan-klaar-tekst"></span></div></div>' +
      '<form class="wan-form" novalidate></form>';
    zet(kaart.querySelector('h2'), T.kop);
    zet(kaart.querySelector('.wan-intro'), T.intro);
    zet(kaart.querySelector('.wan-klaar strong'), T.klaarKop);
    zet(kaart.querySelector('.wan-klaar-tekst'), T.klaar);

    var form = kaart.querySelector('form');
    var klaarBlok = kaart.querySelector('.wan-klaar');

    /* Optioneel: data-wa-na="/pad/" op het element stuurt na het invullen door naar die pagina (stap 2 van de aanmelding). */
    var naUrl = host.getAttribute('data-wa-na') || '';
    function doorsturen() {
      if (!naUrl) return;
      setTimeout(function () { try { window.location.assign(naUrl); } catch (e) {} }, 1400);
    }

    /* Verborgen velden: e-mailadres en utm-tags van de aanmelding. */
    var verborgenMail = document.createElement('input');
    verborgenMail.type = 'hidden'; verborgenMail.name = 'email'; verborgenMail.value = email;
    form.appendChild(verborgenMail);
    UTM.forEach(function (k) {
      var h = document.createElement('input');
      h.type = 'hidden'; h.name = k; h.value = utm[k] || '';
      form.appendChild(h);
    });

    /* Zichtbaar e-mailveld alleen als het adres niet bekend is. */
    var mailVeld = document.createElement('div');
    mailVeld.className = 'wan-veld wan-mail';
    mailVeld.innerHTML = '<label for="wan-mail"></label><input id="wan-mail" type="email" name="email_zichtbaar" autocomplete="email" inputmode="email" placeholder="jij@voorbeeld.nl" aria-describedby="wan-mail-fout"><p class="wan-status" id="wan-mail-fout" role="alert"></p>';
    zet(mailVeld.querySelector('label'), T.mailLabel);
    var mailInvoer = mailVeld.querySelector('input');
    var mailStatus = mailVeld.querySelector('.wan-status');
    mailVeld.hidden = !(uitMail && !email);
    form.appendChild(mailVeld);

    var rij = document.createElement('div');
    rij.className = 'wan-rij';
    rij.innerHTML = '<div class="wan-veld"><label for="wan-tel"></label><input id="wan-tel" type="tel" name="telefoon" autocomplete="tel" inputmode="tel" placeholder="+31 6 12345678" maxlength="40" aria-describedby="wan-tel-fout"><p class="wan-status" id="wan-tel-fout" role="alert"></p></div>' +
      '<button type="submit" class="btn wan-knop"></button>';
    zet(rij.querySelector('label'), T.telLabel);
    var telInvoer = rij.querySelector('input');
    var telStatus = rij.querySelector('.wan-status');
    var knop = rij.querySelector('button');
    zet(knop, T.knop);
    form.appendChild(rij);

    var noot = document.createElement('p');
    noot.className = 'wan-noot';
    zet(noot, T.noot);
    form.appendChild(noot);

    /* De melding staat direct onder het veld waar het om gaat, zodat je hem ziet met het toetsenbord open. */
    function toonFout(tekst, veld) {
      mailStatus.textContent = '';
      telStatus.textContent = '';
      mailInvoer.classList.remove('wan-mis'); mailInvoer.removeAttribute('aria-invalid');
      telInvoer.classList.remove('wan-mis'); telInvoer.removeAttribute('aria-invalid');
      if (!tekst) return;
      var doel = veld || telInvoer;
      zet(doel === mailInvoer ? mailStatus : telStatus, tekst);
      if (veld) { veld.classList.add('wan-mis'); veld.setAttribute('aria-invalid', 'true'); try { veld.focus(); } catch (e) {} }
    }
    function toonKlaar() {
      form.hidden = true;
      kaart.querySelector('.wan-intro').hidden = true;
      klaarBlok.hidden = false;
    }

    /* Geen opgeslagen adres en niet uit de mail: het nummer kan nergens aan gekoppeld worden. Alleen een korte melding. */
    if (!email && !uitMail && !voorbeeld) {
      kaart.querySelector('.wan-kop').hidden = true;
      form.hidden = true;
      var geen = document.createElement('p');
      geen.className = 'wan-geenmail';
      zet(geen, T.geenMail);
      kaart.appendChild(geen);
      host.appendChild(kaart);
      return;
    }

    /* Al ingevuld in deze browser: meteen de bevestiging. */
    if (bewaard && bewaard.wa) {
      toonKlaar();
      host.appendChild(kaart);
      doorsturen();
      return;
    }

    var bezig = false;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (bezig) return;
      var mail = ((verborgenMail.value || mailInvoer.value) || '').trim();
      var tel = (telInvoer.value || '').trim();
      if (voorbeeld && !email) {
        /* Voorbeeldmodus (?preview=1): geen opslag, alleen de bevestiging laten zien. */
        if (tel.replace(/\D/g, '').length < 9) { toonFout(T.foutNummer, telInvoer); return; }
        toonFout('');
        toonKlaar();
        return;
      }
      if (!MAIL.test(mail)) {
        if (uitMail) { mailVeld.hidden = false; toonFout(T.foutMail, mailInvoer); }
        else { toonFout(T.fout); }
        return;
      }
      if (tel.replace(/\D/g, '').length < 9) { toonFout(T.foutNummer, telInvoer); return; }

      bezig = true;
      knop.disabled = true;
      zet(knop, T.bezig);
      toonFout('');

      var ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var tijd = ctl ? setTimeout(function () { try { ctl.abort(); } catch (e) {} }, 15000) : null;
      fetch(API, {
        method: 'POST',
        headers: { 'apikey': KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_email: mail, p_telefoon: tel, p_utm: utm }),
        signal: ctl ? ctl.signal : undefined
      }).then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        return res.json();
      }).then(function (antwoord) {
        if (antwoord && antwoord.ok) {
          var o = lees() || { email: mail.toLowerCase(), utm: utm, t: Date.now() };
          o.wa = true;
          schrijf(o);
          toonKlaar();
          try { klaarBlok.setAttribute('tabindex', '-1'); klaarBlok.focus(); } catch (e) {}
          doorsturen();
          return;
        }
        if (antwoord && antwoord.reden === 'nummer') { toonFout(T.foutNummer, telInvoer); return; }
        if (antwoord && antwoord.reden === 'email') { if (uitMail) { mailVeld.hidden = false; toonFout(T.foutMail, mailInvoer); } else { toonFout(T.fout); } return; }
        toonFout(T.fout);
      }).catch(function () {
        toonFout(T.fout);
      }).then(function () {
        if (tijd) clearTimeout(tijd);
        bezig = false;
        knop.disabled = false;
        zet(knop, T.knop);
      });
    });

    host.appendChild(kaart);
  }

  function start() {
    var hosts = document.querySelectorAll('[data-wa-nummer]');
    for (var i = 0; i < hosts.length; i++) maakFormulier(hosts[i]);
  }

  /* De aanmeldpagina heeft de hook nodig, de bedankpagina het formulier; allebei kunnen geen kwaad op de ander. */
  volgInschrijving();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
