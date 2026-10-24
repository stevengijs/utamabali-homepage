#!/usr/bin/env node
/* Meldt de adressen uit sitemap.xml bij IndexNow (Bing, Yandex en anderen), zodat nieuwe of gewijzigde
   gidspagina's snel in de index komen. Bing voedt ook Copilot en ChatGPT Search. Google doet niet mee
   aan IndexNow: daarvoor de sitemap in Google Search Console indienen.
   Draai pas nadat de pagina's live staan:  node gids-bron/indexnow.mjs
   Het sleutelbestand <sleutel>.txt staat in de hoofdmap van de site (zo bewijs je dat de site van jou is). */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bestand = readdirSync(ROOT).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!bestand) throw new Error('geen sleutelbestand (32 hex-tekens .txt) in de hoofdmap');
const sleutel = bestand.replace('.txt', '');
const urls = [...readFileSync(join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'www.utamabali.com', key: sleutel, keyLocation: `https://www.utamabali.com/${bestand}`, urlList: urls }),
});
console.log(`IndexNow: ${r.status} ${r.statusText} voor ${urls.length} adressen`);
