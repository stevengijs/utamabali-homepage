# Gidsen (/gids): een nieuwe reel, een nieuwe pagina

Elke Instagram-reel met een trefwoord (bijvoorbeeld CONSTRUCTION) verwijst naar een gidspagina met een gratis PDF.
De pagina's staan als gewone HTML in `gids/` (goed voor Google en AI-systemen) en komen uit dit mapje.

## Nieuwe gids toevoegen

1. Kopieer `onderwerpen/bouwchecklist-villa-bali.json` naar een nieuwe naam en pas de inhoud aan.
   Velden: `slug`, `trefwoord` (het woord dat in de reel staat), `campagne`, titels, `korteAntwoord`, `fases` (blokken met punten),
   `roodVlaggen`, `faq`, `auteur`, `cta`, `pdf.bestand`, `foto`. De foto zet je in `gids/img/`.
2. Vanuit `apps/homepage`: `node gids-bron/bouw.mjs --pdf`. Dat schrijft de pagina, de Markdown-versie, de hub `/gids/`,
   `sitemap.xml`, `llms.txt`, de PDF en de deelafbeelding (Google Chrome op de Mac is nodig voor de PDF).
3. Zet de korte link in `vercel.json` (het script print het regeltje als het ontbreekt).
4. Controleer `pdf.paginas` in het JSON (het script waarschuwt als het niet klopt) en commit de uitvoer.
5. Het live repo `stevengijs/utamabali-homepage` bedient utamabali.com: zet de nieuwe bestanden daar ook neer.

## Regels voor de tekst

Geen lang streepje, geen emoji, geen projectnamen of plaatsen in algemene tekst, elke bewering met een getal,
geen juridische of fiscale details als feit. Zie `fact-boundaries` en `tone-of-voice` in het brain.
`gids-bron/` zelf komt niet live (`.vercelignore`).
