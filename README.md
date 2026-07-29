# UTAMA Bali — Homepage (one-page lander)

Single-page marketing homepage for utamabali.com. Static HTML, no build step, all images inlined as base64 so the whole site is one self-contained `index.html`.

- **Repo:** https://github.com/stevengijs/utamabali-homepage
- **Doel:** vervangt de huidige Framer-site op utamabali.com (top-of-funnel/merk), verwijst door naar invest.utamabali.com voor de investeerdersfunnel.

This is a separate, newer project from `stevengijs/utamabali-website` (an earlier, more extensive Astro build with blog/project pages/contact form that was never put into production). That project is untouched.

## Live gaan

1. Dit repo is gekoppeld aan een Vercel-project.
2. Voeg `utamabali.com` en `www.utamabali.com` toe aan het Vercel-project (Settings → Domains).
3. Wijzig de DNS-records bij de domeinregistrar volgens de waarden die Vercel daar toont.
4. Zodra de DNS-wijziging is doorgevoerd, kan de Framer-koppeling voor dit domein worden losgekoppeld/opgezegd.

## Bewerken

Alles staat in `index.html`. Er is geen build-stap; wijzigingen zijn direct zichtbaar na een push naar `main` (Vercel deployt automatisch).
