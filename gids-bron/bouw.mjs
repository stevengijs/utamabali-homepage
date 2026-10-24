#!/usr/bin/env node
/* UTAMA gidsen: bouwt de gratis gidspagina's uit gids-bron/onderwerpen/*.json.
   Elke gids staat op eigen adres in de hoofdmap, zonder tussenmap: utamabali.com/<slug>/ (Steven, 24 oktober 2026).

   Waarom een generator: elke Instagram-reel met een trefwoord (bijvoorbeeld CONSTRUCTION) krijgt
   dezelfde pagina met eigen inhoud. De inhoud moet als gewone HTML in de pagina staan, niet via
   JavaScript, want zoekmachines en AI-crawlers (ChatGPT, Claude, Perplexity) lezen alleen wat er
   in de bron staat. Het resultaat is statische HTML die in het repo staat; Vercel bouwt niets.

   Gebruik, vanuit de map apps/homepage:
     node gids-bron/bouw.mjs          pagina's, Markdown-versies, sitemap.xml en llms.txt
     node gids-bron/bouw.mjs --pdf    idem, plus de PDF en de deelafbeelding (headless Chrome)

   Nieuwe reel: kopieer een bestand in onderwerpen/, pas de inhoud aan, draai het script met --pdf,
   zet de korte link in vercel.json (het script print het regeltje) en commit de uitvoer. */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync, statSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const BRON = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(BRON, '..');
const SITE = 'https://www.utamabali.com';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MET_PDF = process.argv.includes('--pdf');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const datumNl = (iso) => { const [j, m, d] = iso.split('-').map(Number); return `${d} ${MAANDEN[m - 1]} ${j}`; };
const pixel = readFileSync(join(BRON, 'pixel.html'), 'utf8').trim();

const ORG = {
  '@type': 'Organization', '@id': `${SITE}/#organisatie`, name: 'UTAMA', url: `${SITE}/`,
  description: 'Boutique villaprojecten op Bali, ontwikkeld en gemanaged voor rendement.',
  logo: { '@type': 'ImageObject', url: `${SITE}/img/icon-192.png` },
  sameAs: ['https://www.instagram.com/stevenbalivillas/', 'https://invest.utamabali.com'],
};
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'UTAMA', inLanguage: 'nl-NL', publisher: { '@id': ORG['@id'] } };

/* ---------- gedeelde stukken ---------- */
const ICONEN = `<link rel="icon" href="/img/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="192x192" href="/img/icon-192.png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">`;
const LETTERS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/gratis.css">`;

function kop({ titel, beschrijving, url, afbeelding, type = 'article', alternatief = '', extraMeta = '' }) {
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="generator" content="UTAMA gids-bron">
<title>${esc(titel)}</title>
<script src="/t.js" defer></script>
<meta name="description" content="${esc(beschrijving)}">
<meta name="author" content="Steven Gijsman">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${url}">
${alternatief}<meta property="og:type" content="${type}">
<meta property="og:locale" content="nl_NL">
<meta property="og:site_name" content="UTAMA">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(titel)}">
<meta property="og:description" content="${esc(beschrijving)}">
<meta property="og:image" content="${afbeelding}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titel)}">
<meta name="twitter:description" content="${esc(beschrijving)}">
<meta name="twitter:image" content="${afbeelding}">
${extraMeta}<meta name="theme-color" content="#FAF5EA">
${ICONEN}
${LETTERS}
${pixel}
`;
}

const nav = (downloadUrl, portaalUrl) => `<header class="nav">
  <div class="wrap">
    <a href="/" class="brand" aria-label="UTAMA, naar de homepage">UTAMA</a>
    <nav class="nav-links" aria-label="Hoofdmenu">
      <a href="/webinar">Webinar</a>
      ${portaalUrl ? `<a class="btn klein nav-portaal" href="${portaalUrl}" data-portaal>Investeerdersportaal</a>` : ''}
      ${downloadUrl ? `<a class="btn cta klein" href="${downloadUrl}" download data-download>Download PDF</a>` : ''}
    </nav>
  </div>
</header>`;

const voet = `<footer class="voet">
  <div class="wrap">
    <div>UTAMA · Boutique vastgoedontwikkeling op Bali</div>
    <div><a href="/">utamabali.com</a> &nbsp;·&nbsp; <a href="https://www.instagram.com/stevenbalivillas/" target="_blank" rel="noopener">Instagram</a> &nbsp;·&nbsp; <a href="mailto:steven@utamabali.com">steven@utamabali.com</a> &nbsp;·&nbsp; <a href="/privacy.html">Privacy</a></div>
  </div>
</footer>`;

const afm = `<p class="afm"><strong>Let op!</strong> U belegt buiten AFM&#8209;toezicht. Geen vergunningplicht voor deze activiteit.</p>`;
const pijl = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3v11M5 9.5l5 5 5-5M4 17h12"/></svg>`;

/* ---------- gidspagina ---------- */
function telItems(t) { return t.fases.reduce((n, f) => n + f.items.length, 0); }
const gidsUrl = (t) => `${SITE}/${t.slug}/`;
const pdfUrl = (t) => `/${t.slug}/${t.pdf.bestand}`;
const ogUrl = (t) => `${SITE}/${t.slug}/og.jpg`;
const mdUrl = (t) => `/${t.slug}/index.md`;
const fotoUrl = (t) => `/${t.slug}/foto.jpg`;
const RESERVED = new Set(['webinar', 'webinar1', 'webinar3', 'webinar20okt', 'admin', 'claude', 'stop', 'img', 'video', 'privacy', 'reserve', 'construction', 'gids', 'index', 'mcp', 'oauth', 'r']);
const portaalUrl = (t) => `${t.portaal.url}${t.portaal.url.includes('?') ? '&' : '?'}utm_source=utamabali&utm_medium=checklist&utm_campaign=${t.campagne}`;
const link = (t) => `${gidsUrl(t)}?utm_source=instagram&utm_medium=reel&utm_campaign=${t.campagne}`;

function schema(t) {
  const url = gidsUrl(t);
  const auteur = { '@type': 'Person', '@id': `${SITE}/#steven`, name: t.auteur.naam, jobTitle: t.auteur.functie, worksFor: { '@id': ORG['@id'] }, sameAs: [t.auteur.instagram] };
  let n = 0;
  const lijst = t.fases.flatMap((f) => f.items.map((i) => ({ '@type': 'ListItem', position: ++n, name: i.kop, description: i.tekst })));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORG, WEBSITE, auteur,
      {
        '@type': 'Article', '@id': `${url}#artikel`, headline: t.h1, description: t.metaBeschrijving, inLanguage: 'nl-NL',
        datePublished: t.datumGepubliceerd, dateModified: t.datumBijgewerkt, image: [ogUrl(t)],
        author: { '@id': auteur['@id'] }, publisher: { '@id': ORG['@id'] }, isPartOf: { '@id': WEBSITE['@id'] },
        mainEntityOfPage: { '@id': url }, about: [{ '@type': 'Thing', name: 'Villa bouwen op Bali' }, { '@type': 'Thing', name: 'Investeren in vastgoed op Bali' }],
        associatedMedia: { '@type': 'MediaObject', name: t.pdf.titel, contentUrl: `${SITE}${pdfUrl(t)}`, encodingFormat: 'application/pdf' },
      },
      {
        '@type': 'WebPage', '@id': url, url, name: t.seoTitel, description: t.metaBeschrijving, inLanguage: 'nl-NL', isPartOf: { '@id': WEBSITE['@id'] },
        breadcrumb: { '@id': `${url}#kruimel` }, primaryImageOfPage: { '@type': 'ImageObject', url: ogUrl(t) },
      },
      {
        '@type': 'BreadcrumbList', '@id': `${url}#kruimel`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'UTAMA', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: t.pdf.titel, item: url },
        ],
      },
      { '@type': 'ItemList', '@id': `${url}#checklist`, name: t.pdf.titel, numberOfItems: n, itemListElement: lijst },
      { '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: t.faq.map((q) => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    ],
  };
}

function renderPagina(t) {
  const url = gidsUrl(t);
  const aantal = telItems(t);
  const dl = pdfUrl(t);
  const fasen = t.fases.map((f, i) => {
    const nr = f.doorlopend ? '&#8635;' : i + 1;
    return `<article class="fase" id="${f.id}">
        <div class="fase-kop"><span class="fase-nr" aria-hidden="true">${nr}</span><h3>${esc(f.titel)}</h3></div>
        <p class="fase-intro">${esc(f.intro)}</p>
        <ul class="items">
${f.items.map((it) => `          <li><span class="vink" aria-hidden="true"></span><div><b>${esc(it.kop)}</b><span>${esc(it.tekst)}</span></div></li>`).join('\n')}
        </ul>
      </article>`;
  }).join('\n      ');
  const fasenav = t.fases.map((f, i) => `<a href="#${f.id}">${f.doorlopend ? '&#8635;' : i + 1}. ${esc(f.titel.split(':')[0])}</a>`).join('');
  const cta = t.cta;

  return `${kop({
    titel: t.seoTitel, beschrijving: t.metaBeschrijving, url, afbeelding: ogUrl(t),
    alternatief: `<link rel="alternate" type="text/markdown" href="${mdUrl(t)}">\n`,
    extraMeta: `<meta property="article:published_time" content="${t.datumGepubliceerd}">\n<meta property="article:modified_time" content="${t.datumBijgewerkt}">\n<meta property="article:author" content="${esc(t.auteur.naam)}">\n`,
  })}<script type="application/ld+json">${jsonLd(schema(t))}</script>
</head>
<body class="heeft-vast">
${nav(dl, portaalUrl(t))}

<main>
  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <span class="eyebrow">Gratis checklist</span>
        <h1>${esc(t.h1)}</h1>
        <p class="lead">${esc(t.intro)}</p>
        <div class="hero-acties" id="hero-acties">
          <a class="btn cta" href="${dl}" download data-download>${pijl} Download de checklist (PDF)</a>
          <a class="btn licht" href="#checklist">Lees hem online</a>
        </div>
        <ul class="chips" aria-label="Over deze checklist">
          <li>Gratis</li><li>PDF van ${t.pdf.paginas} pagina's</li><li>${aantal} punten</li><li>Bijgewerkt ${datumNl(t.datumBijgewerkt)}</li>
        </ul>
      </div>
      <figure class="hero-foto" style="margin:0">
        <img src="${fotoUrl(t)}" alt="${esc(t.foto.alt)}" width="${t.foto.breedte}" height="${t.foto.hoogte}" fetchpriority="high">
        <figcaption class="doc">
          <span class="doc-icoon" aria-hidden="true">PDF</span>
          <span><b>${esc(t.pdf.titel)}</b><span>${aantal} punten in ${t.fases.length} blokken · gratis</span></span>
        </figcaption>
      </figure>
    </div>
  </section>

  <div class="wrap smal">
    <section class="antwoord" aria-labelledby="kort">
      <h2 id="kort">Kort antwoord</h2>
${t.korteAntwoord.map((p) => `      <p>${esc(p)}</p>`).join('\n')}
    </section>

    <nav class="fase-nav" aria-label="Springen naar een bouwfase">${fasenav}</nav>

    <div class="kop-sectie" id="checklist">
      <h2>De checklist: ${aantal} punten per bouwfase</h2>
      <p>Vink af wat klaar is. Download de PDF om hem mee te nemen naar de bouwplaats of naar je gesprek met de ontwikkelaar.</p>
    </div>

    <div>
      ${fasen}
    </div>

    <section class="band" aria-labelledby="neem-mee">
      <h2 id="neem-mee">Neem de checklist mee</h2>
      <p>Een PDF van ${t.pdf.paginas} pagina's met alle ${aantal} punten en de rode vlaggen. Print hem uit of open hem op je telefoon op de bouwplaats.</p>
      <div class="knoppen">
        <a class="btn cta" href="${dl}" download data-download>${pijl} Download de checklist (PDF)</a>
        <a class="btn licht" href="${portaalUrl(t)}" data-portaal>${esc(t.portaal.knop)} &rarr;</a>
      </div>
    </section>

    <section class="rood" aria-labelledby="rood">
      <h2 id="rood">${esc(t.roodVlaggen.titel)}</h2>
      <p>${esc(t.roodVlaggen.intro)}</p>
      <ul>
${t.roodVlaggen.items.map((i) => `        <li>${esc(i)}</li>`).join('\n')}
      </ul>
    </section>

    <div class="over">
      <div>
        <h2>${esc(t.uitleg.titel)}</h2>
        <p>${esc(t.uitleg.tekst)}</p>
        <a class="tekst" href="${t.uitleg.link.url}" target="_blank" rel="noopener">${esc(t.uitleg.link.tekst)} &rarr;</a>
      </div>
      <div>
        <h2>Over de schrijver</h2>
        <div class="auteur"><img src="${t.auteur.foto}" alt="${esc(t.auteur.naam)}" width="56" height="56" loading="lazy"><div><b>${esc(t.auteur.naam)}</b><span>${esc(t.auteur.functie)}</span></div></div>
        <p>${esc(t.auteur.tekst)}</p>
        <a class="tekst" href="${t.auteur.instagram}" target="_blank" rel="noopener">Volg op Instagram &rarr;</a>
      </div>
    </div>

    <section class="band paper" aria-labelledby="portaal">
      <h2 id="portaal">${esc(t.portaal.kop)}</h2>
      <p>${esc(t.portaal.tekst)}</p>
      <a class="btn cta" href="${portaalUrl(t)}" data-portaal>${esc(t.portaal.knop)} &rarr;</a>
    </section>

    <section class="band licht" data-vervalt="${cta.vervalt}" aria-labelledby="webinar">
      <span class="wanneer">${esc(cta.wanneer)}</span>
      <h2 id="webinar">${esc(cta.kop)}</h2>
      <p>${esc(cta.tekst)}</p>
      <a class="btn" href="${cta.url}">${esc(cta.knop)} &rarr;</a>
    </section>

    <section aria-labelledby="faq">
      <div class="kop-sectie" style="margin-top:34px"><h2 id="faq">Veelgestelde vragen</h2></div>
      <div class="faq">
${t.faq.map((q) => `        <div class="faq-item"><h3>${esc(q.v)}</h3><p>${esc(q.a)}</p></div>`).join('\n')}
      </div>
    </section>


    <p class="disclaimer">${esc(t.disclaimer)} Laatst bijgewerkt op ${datumNl(t.datumBijgewerkt)}.</p>
    ${afm}
  </div>
</main>

${voet}

<div class="vast" id="vast"><a class="btn cta" href="${dl}" download data-download>${pijl} Download de checklist (PDF)</a></div>

<script>
(function(){
  /* Download meten: eigen gebeurtenis in Meta, zonder de Lead-optimalisatie te vervuilen. */
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('[data-download]');
    if(a && window.fbq){ try{ fbq('trackCustom', 'ChecklistDownload', {content_name: ${JSON.stringify(t.pdf.titel)}}); }catch(x){} }
    var p = e.target.closest && e.target.closest('[data-portaal]');
    if(p && window.fbq){ try{ fbq('trackCustom', 'PortaalKlik', {content_name: ${JSON.stringify(t.slug)}}); }catch(x){} }
  });
  /* Vaste downloadbalk op mobiel weg zolang de knop in de kop in beeld is. */
  var v = document.getElementById('vast'), h = document.getElementById('hero-acties');
  if(v && h && 'IntersectionObserver' in window){ new IntersectionObserver(function(en){ v.classList.toggle('weg', en[0].isIntersecting); }).observe(h); }
  /* Tijdgebonden blok (bijvoorbeeld een webinar) verdwijnt na de datum. */
  document.querySelectorAll('[data-vervalt]').forEach(function(el){ if(Date.now() > Date.parse(el.getAttribute('data-vervalt'))) el.hidden = true; });
})();
</script>
</body>
</html>
`;
}

/* ---------- Markdown-versie voor AI-systemen ---------- */
function renderMd(t) {
  const aantal = telItems(t);
  return `# ${t.h1}

> ${t.intro}

Door ${t.auteur.naam}, ${t.auteur.functie}. Bijgewerkt ${datumNl(t.datumBijgewerkt)}. Taal: Nederlands.
Pagina: ${gidsUrl(t)}
PDF: ${SITE}${pdfUrl(t)}

## Kort antwoord

${t.korteAntwoord.join('\n\n')}

## De checklist: ${aantal} punten per bouwfase

${t.fases.map((f, i) => `### ${f.doorlopend ? 'Doorlopend' : `Fase ${i + 1}`}: ${f.titel}

${f.intro}

${f.items.map((it) => `- [ ] **${it.kop}.** ${it.tekst}`).join('\n')}
`).join('\n')}
## ${t.roodVlaggen.titel}

${t.roodVlaggen.intro}

${t.roodVlaggen.items.map((i) => `- ${i}`).join('\n')}

## ${t.uitleg.titel}

${t.uitleg.tekst}

## Veelgestelde vragen

${t.faq.map((q) => `### ${q.v}\n\n${q.a}\n`).join('\n')}
---

${t.disclaimer}
`;
}

/* ---------- print-versie voor de PDF en de deelafbeelding ---------- */
const PRINT_CSS = `
@page{size:A4;margin:14mm 15mm 16mm}
*{box-sizing:border-box}
body{margin:0;font:9.6pt/1.42 "Helvetica Neue",Helvetica,Arial,sans-serif;color:#17140F;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.top{display:flex;justify-content:space-between;align-items:center;border-bottom:1.5pt solid #17140F;padding-bottom:7pt;margin-bottom:12pt}
.merk{font-weight:800;font-size:13pt;letter-spacing:.32em}
.top span{font-size:8.5pt;letter-spacing:.14em;text-transform:uppercase;color:#5B564C;font-weight:700}
h1{font-size:21pt;line-height:1.1;margin:0 0 6pt;letter-spacing:-.02em}
.intro{color:#5B564C;margin:0 0 10pt;font-size:10pt}
.kort{background:#EEF0E2;border-radius:6pt;padding:8pt 10pt;margin-bottom:10pt;font-size:9.2pt}
.kort p{margin:0 0 3pt}.kort p:last-child{margin:0}
h2{font-size:11.5pt;margin:12pt 0 5pt;padding:4pt 8pt;background:#17140F;color:#fff;border-radius:4pt;break-after:avoid}
.fi{color:#5B564C;font-size:8.8pt;margin:0 0 3pt}
.pt{display:flex;gap:7pt;padding:3.4pt 0;border-top:.5pt solid #E7DECD;break-inside:avoid}
.fb{break-inside:avoid}
.pt:first-of-type{border-top:0}
.v{flex:none;width:9pt;height:9pt;border:1.3pt solid #17140F;border-radius:2pt;margin-top:1.5pt}
.pt b{display:block;font-size:9.6pt}.pt span.t{display:block;color:#5B564C;font-size:8.8pt}
.rood{background:#FBF3EC;border:.8pt solid #ecd9c8;border-radius:6pt;padding:8pt 10pt;margin-top:12pt;break-inside:avoid}
.rood h3{margin:0 0 4pt;font-size:11pt;color:#8B5A3C}
.rood li{margin:0 0 2pt;font-size:9pt}.rood ul{margin:0;padding-left:13pt}
.voet{margin-top:12pt;padding-top:7pt;border-top:1.5pt solid #17140F;font-size:8.2pt;color:#5B564C;break-inside:avoid}
.voet b{color:#17140F}
`;

function renderPrint(t) {
  const aantal = telItems(t);
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>${esc(t.pdf.titel)}</title><style>${PRINT_CSS}</style></head><body>
<div class="top"><span class="merk">UTAMA</span><span>Gratis checklist</span></div>
<h1>${esc(t.h1)}</h1>
<p class="intro">${esc(t.intro)}</p>
<div class="kort">${t.korteAntwoord.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
${t.fases.map((f, i) => `<section class="fb"><h2>${f.doorlopend ? 'Doorlopend' : `Fase ${i + 1}`}: ${esc(f.titel)}</h2>
<p class="fi">${esc(f.intro)}</p>
${f.items.map((it) => `<div class="pt"><span class="v"></span><div><b>${esc(it.kop)}</b><span class="t">${esc(it.tekst)}</span></div></div>`).join('\n')}</section>`).join('\n')}
<div class="rood"><h3>${esc(t.roodVlaggen.titel)}</h3><ul>${t.roodVlaggen.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>
<div class="voet"><b>${aantal} punten.</b> Online met uitleg, vragen en antwoorden: <b>utamabali.com/${t.slug}</b><br>
UTAMA ontwikkelt boutique villaprojecten op Bali voor investeerders · Instagram @stevenbalivillas · Bijgewerkt ${datumNl(t.datumBijgewerkt)}<br>
${esc(t.disclaimer)}</div>
</body></html>`;
}

function renderCover(t) {
  const aantal = telItems(t);
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;display:flex;background:#17140F;color:#fff;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;overflow:hidden}
.l{flex:1;padding:56px 56px 52px;display:flex;flex-direction:column;justify-content:space-between}
.merk{font-weight:800;font-size:26px;letter-spacing:.34em}
.e{display:inline-block;background:#099a0b;color:#fff;font-weight:800;font-size:19px;letter-spacing:.14em;text-transform:uppercase;padding:9px 16px;border-radius:8px;margin-bottom:22px}
h1{font-size:64px;line-height:1.04;margin:0 0 18px;letter-spacing:-.02em;text-wrap:balance}
p{margin:0;color:#c9d1a6;font-size:26px;font-weight:600}
.r{width:430px;background:url(../media/${t.foto.bestand}) center/cover}
</style></head><body><div class="l"><div class="merk">UTAMA</div><div><div class="e">Gratis checklist · PDF</div><h1>${esc(t.pdf.titel)}</h1><p>${aantal} punten per bouwfase</p></div><p style="font-size:20px">utamabali.com</p></div><div class="r"></div></body></html>`;
}

/* ---------- Chrome ---------- */
function chrome(args, uitvoer) {
  const profiel = join(BRON, '.tmp', 'chrome-profiel');
  const r = spawnSync('perl', ['-e', 'alarm 60; exec @ARGV', CHROME, '--headless=old', '--disable-gpu', '--hide-scrollbars', '--no-first-run', `--user-data-dir=${profiel}`, ...args], { stdio: 'ignore' });
  if (!existsSync(uitvoer)) throw new Error(`Chrome maakte ${uitvoer} niet (status ${r.status})`);
}

function maakBestanden(t) {
  if (!existsSync(CHROME)) { console.warn('  Chrome niet gevonden, PDF en deelafbeelding overgeslagen'); return; }
  const tmp = join(BRON, '.tmp');
  mkdirSync(tmp, { recursive: true });
  const printHtml = join(tmp, `${t.slug}-print.html`), coverHtml = join(tmp, `${t.slug}-cover.html`);
  writeFileSync(printHtml, renderPrint(t)); writeFileSync(coverHtml, renderCover(t));
  const pdf = join(ROOT, t.slug, t.pdf.bestand);
  chrome(['--no-pdf-header-footer', `--print-to-pdf=${pdf}`, `file://${printHtml}`], pdf);
  const paginas = (readFileSync(pdf, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`  PDF: ${pdf.replace(ROOT + '/', '')} (${paginas} pagina's, ${Math.round(statSync(pdf).size / 1024)} KB)`);
  if (paginas !== t.pdf.paginas) console.warn(`  LET OP: onderwerpen/${t.slug}.json zegt ${t.pdf.paginas} pagina's, de PDF heeft er ${paginas}`);
  const png = join(tmp, `${t.slug}-og.png`), jpg = join(ROOT, t.slug, 'og.jpg');
  chrome(['--window-size=1200,630', `--screenshot=${png}`, `file://${coverHtml}`], png);
  spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', png, '--out', jpg], { stdio: 'ignore' });
  console.log(`  Deelafbeelding: ${jpg.replace(ROOT + '/', '')}`);
}

/* ---------- sitemap en llms.txt ---------- */
function schrijfSitemap(alle) {
  const rij = (loc, lastmod) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[rij(`${SITE}/`), rij(`${SITE}/webinar/`), ...alle.map((t) => rij(gidsUrl(t), t.datumBijgewerkt))].join('\n')}
</urlset>
`;
  writeFileSync(join(ROOT, 'sitemap.xml'), xml);
}

function schrijfLlms(alle) {
  const txt = `# UTAMA

> UTAMA ontwikkelt boutique villaprojecten op Bali en verkoopt ze aan investeerders, vooral uit Nederland. UTAMA ontwikkelt de villa's, begeleidt de bouw en regelt verhuur en beheer: "Jij bezit het. Wij runnen het." Oprichter is Steven Gijsman. De site is in het Nederlands.

Over bouwen op Bali: UTAMA selecteert de aannemer, legt het bestek vast en staat dagelijks op de bouwplaats. Een nieuwbouwvilla duurt ongeveer 12 maanden. Beleggen in vastgoed op Bali valt buiten AFM-toezicht.

## Gratis gidsen

${alle.map((t) => `- [${t.kaartTitel}](${SITE}${mdUrl(t)}): ${t.metaBeschrijving}`).join('\n')}

## Belangrijke pagina's

- [Home](${SITE}/): wat UTAMA doet en voor wie.
- [Gratis webinar](${SITE}/webinar): live uitleg in 60 minuten over investeren in een villa op Bali.
- [Projecten en brochures](https://invest.utamabali.com): de villaprojecten met prijzen, plattegronden en bouwstatus.
`;
  writeFileSync(join(ROOT, 'llms.txt'), txt);
}

/* ---------- uitvoeren ---------- */
const alle = readdirSync(join(BRON, 'onderwerpen')).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(BRON, 'onderwerpen', f), 'utf8')));
if (!alle.length) throw new Error('geen onderwerpen gevonden');

for (const t of alle) {
  console.log(`${t.slug}`);
  const map = join(ROOT, t.slug), index = join(map, 'index.html');
  if (RESERVED.has(t.slug)) throw new Error(`slug "${t.slug}" is gereserveerd`);
  if (existsSync(map) && !(existsSync(index) && readFileSync(index, 'utf8').includes('content="UTAMA gids-bron"'))) throw new Error(`${t.slug}/ bestaat al en is geen gegenereerde gids, kies een andere slug`);
  mkdirSync(map, { recursive: true });
  writeFileSync(index, renderPagina(t));
  writeFileSync(join(map, 'index.md'), renderMd(t));
  copyFileSync(join(BRON, 'media', t.foto.bestand), join(map, 'foto.jpg'));
  if (MET_PDF) maakBestanden(t);
  const lang = join(map, t.pdf.bestand);
  if (!existsSync(lang)) console.warn(`  LET OP: ${t.pdf.bestand} bestaat nog niet, draai met --pdf`);
  const vercel = readFileSync(join(ROOT, 'vercel.json'), 'utf8');
  const kort = `/${t.trefwoord.toLowerCase()}`;
  console.log(`  ManyChat-link: ${link(t)}`);
  console.log(`  Korte link ${kort}: ${vercel.includes(`"source": "${kort}"`) ? 'staat in vercel.json' : 'ONTBREEKT in vercel.json, voeg toe: { "source": "' + kort + '", "destination": "/' + t.slug + '/?utm_source=instagram&utm_medium=reel&utm_campaign=' + t.campagne + '", "permanent": false }'}`);
}
schrijfSitemap(alle);
schrijfLlms(alle);
if (MET_PDF) rmSync(join(BRON, '.tmp'), { recursive: true, force: true });
console.log(`Klaar: ${alle.length} gids${alle.length === 1 ? '' : 'en'}, sitemap.xml en llms.txt.`);
