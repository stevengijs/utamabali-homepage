# Gidsen (/gids): een nieuwe reel, een nieuwe pagina

Elke Instagram-reel met een trefwoord (bijvoorbeeld CONSTRUCTION) verwijst naar een gidspagina met een gratis PDF.
Elke gids staat op een eigen adres in de hoofdmap, zonder tussenmap: `utamabali.com/<slug>/`. De pagina's zijn gewone HTML (goed voor Google en AI-systemen) en komen uit dit mapje.
Geen `/gids` in het adres van een gids zelf (Steven, 24 oktober 2026): leads komen via een reel direct op de lander. Het overzicht `/gids/` bestaat wel; de footerlink "Gids" op de homepage wijst daarheen en elke nieuwe gids komt er automatisch in.

## Nieuwe gids toevoegen

1. Kopieer `onderwerpen/bouwchecklist-villa-bali.json` naar een nieuwe naam en pas de inhoud aan.
   Velden: `slug`, `trefwoord` (het woord dat in de reel staat), `campagne`, titels, `korteAntwoord`, `fases` (blokken met punten),
   `roodVlaggen`, `faq`, `auteur`, `cta`, `pdf.bestand`, `foto`. De foto zet je in `gids-bron/media/`.
2. Vanuit `apps/homepage`: `node gids-bron/bouw.mjs --pdf`. Dat schrijft `<slug>/` (pagina, Markdown-versie, foto, PDF, deelafbeelding),
   `sitemap.xml`, `llms.txt`, de PDF en de deelafbeelding (Google Chrome op de Mac is nodig voor de PDF).
3. Zet de korte link in `vercel.json` (het script print het regeltje als het ontbreekt).
4. Controleer `pdf.paginas` in het JSON (het script waarschuwt als het niet klopt) en commit de uitvoer.
5. Het live repo `stevengijs/utamabali-homepage` bedient utamabali.com: zet de nieuwe bestanden daar ook neer.

## Regels voor de tekst

Geen lang streepje, geen emoji, geen projectnamen of plaatsen in algemene tekst, elke bewering met een getal,
geen juridische of fiscale details als feit. Zie `fact-boundaries` en `tone-of-voice` in het brain.
`gids-bron/` zelf komt niet live (`.vercelignore`).
