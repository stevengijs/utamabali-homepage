/* UTAMA richting B. Geen URL- of hashwijziging bij scrollen of klikken (t.js telt pushState/replaceState). */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- Taal: woordenboek T, sleutels in data-t ---------- */
  var T = { en: {
    skip: 'Skip to content',
    navHow: 'How it works', navAtoZ: 'A to Z', navGuests: 'Guests', navProjects: 'Projects', navProof: 'Results',
    navWebinar: 'Masterclass', navWebinarFree: 'Free masterclass', navCta: 'Invest with us', menuLang: 'Language',
    roleJij: 'You', roleWij: 'We', roleWijP: 'We &amp; partners', legWij: 'UTAMA with our partners', rolePartner: 'Partner', ownIt: 'own it.', runIt: 'run it.',
    tagPhoto: 'Photo', tagImp: 'Impression', tagTeman: 'Delivered project', tagSite: 'On site',
    noteUpd: 'Construction update ready', noteUpdSub: 'Every week in your portal', noteNow: 'now',
    rekenvb: 'Worked example', tellerH: 'What your year could look like later', peak: 'peak season',
    tellerYear: 'a year, realistic scenario', tellerPays: 'payouts a year',
    tellerNote: 'Bar heights are an illustration: the amount varies by season.',
    heroEyebrow: 'Passive income from Bali',
    heroH: 'A villa in Bali.<br><span class="accent">A payout every month.</span>',
    heroP: 'We develop and manage boutique villas in the south of Bali. Guests stay, you receive your share of the rent every month. MOKA in Kedungu: 14 of 15 sold, the last one reserved.',
    kpiRetK: 'Return', tot: 'to', kpiRetS: 'a year, scenario', kpiPayK: 'Payout', kpiPayV: 'Monthly', kpiPayS: 'rental income',
    kpiDoneK: 'Delivered', kpiDoneV: 'projects',
    heroFine: 'Worked example: realistic scenario The Maison. Returns are estimates, not guarantees.',
    prodEyebrow: 'What you buy', prodH: 'You buy a villa.<br><span class="accent">Every month you receive rent.</span>',
    prodSub: 'Money goes in. The villa earns from guests. Every month a payout comes back, in euros to your own account. The example below is a real project: The Maison in Pererenan, two of six still available.',
    flowInleg: 'Investment', flowTo: 'to The Maison', vanaf: 'from', flowNotary: '+ notary fee 1%',
    flow1H: 'You invest', flow1P: 'At The Maison from €225,000.',
    flowVilla: 'The villa', flow2H: 'The villa works', flow2P: 'Delivered fully furnished and ready to rent.',
    pfGoal: 'Direct through our website', flowGuests: 'Guests', flow3H: 'Guests book',
    flow3P: 'Through Airbnb, Booking.com and the other platforms, and directly through the project\'s own website.',
    payNoteB: 'Payout', payNoteS: 'June · worked example', flowPay: 'Payout', flow4H: 'You receive',
    flow4P: 'The rental income every month, from the first guests.',
    sumK: 'Worked example · realistic scenario The Maison', perYear: 'a year', perMonth: 'payout a month, on average',
    srcPage: 'Source: The Maison project page', srcBrochure: 'Source: example month in the brochure',
    amtYear: '≈ €29,900', perYearPaid: 'paid out a year', srcYear: 'Twelve times the example month',
    fNacht: '€175 a night', fBez: '85% occupancy', fOmzet: 'revenue €4,530 a month', fKosten: 'less: costs and management €2,039', fUit: '≈ €2,491 payout',
    mon1: 'Jan', mon2: 'Feb', mon3: 'Mar', mon4: 'Apr', mon5: 'May', mon6: 'Jun', mon7: 'Jul', mon8: 'Aug', mon9: 'Sep', mon10: 'Oct', mon11: 'Nov', mon12: 'Dec', seasHoog: 'High season: July, August and December', seasTussen: 'Shoulder season', seasLaag: 'Low season: rainy months, February, March and November',
    fn1B: 'Real project.', fn1: 'The worked example is The Maison, now on sale.', fn2B: 'Leasehold 30 + 30.', fn2: 'Thirty years, with a thirty-year extension, fixed by the notary.', fn3B: 'You can always sell.', fn3: 'Instead of renting on, also within our network. It has been done at a profit before.', fn4B: 'Stay yourself?', fn4: 'You can, by arrangement. Though these homes are made to be rented out every day.', tellerAria: 'Payout per month, worked example',
    ysMaand: 'Per month', ysJaar: 'Whole year', ysOmzet: 'Revenue of the home', ysKosten: 'Costs and management', ysUit: 'Payout to you',
    yearH: 'What a year could look like later', yearP: 'Twelve payouts. The amount varies by season. Hover over a month for the amounts.', yearPill: '12 payouts',
    together: 'paid out a year',
    yearNote: 'Illustration: the monthly figures follow the realistic scenario in The Maison brochure (€175 a night, 85% occupancy), spread over the seasons. Revenue is the rent the home earns. Costs and management are rental management, operations and other costs and tax.',
    prodSource: 'Source: <a href="https://invest.utamabali.com/the-maison">invest.utamabali.com/the-maison</a>, from €225,000 and ±14% a year in the realistic scenario. Appreciation is separate. The notary fee of 1% and the monthly maintenance contribution come on top. No hidden costs. Returns are estimates, not guarantees.',
    atozEyebrow: 'A to Z', atozH: 'From land to guest.<br><span class="accent">Arranged from A to Z.</span>',
    atozSub: 'Each step shows who does it. We develop and manage, our partners build and rent out. You sign, and receive every month from the first guest on.',
    legPartner: 'Our partners', legJij: 'The investor',
    s1Card: 'Purchase agreement', s1Signed: 'Signed', s1Portal: 'Your portal is open', s1H: 'You step in',
    s1P: 'You choose a project and invest. From day one you follow everything in your portal.',
    s2H: 'The land', s2P: 'Only land zoned for short-stay rental. We secure it on leasehold: 30 years plus a 30-year extension.',
    s3Cap: 'Data on demand and rentals', s3H: 'The concept', s3P: 'We choose location and layout with data on demand and rentals.',
    s4a: 'Permits', s4b: 'Notarial deed', s4H: 'Permits', s4P: 'We handle the permits and the notary.',
    s5H: 'Design', s5P: 'With our partners for interior and exterior architecture.',
    s6H: 'Construction', s6P: 'An independent contractor builds. We fix the specifications and are on site every day.',
    s7H: 'Instagrammable', s7P: 'Furniture, decoration and architecture: designed to be photographed. Guests share it.',
    s8H: 'Key handover', s8P: 'Fully furnished and ready to rent. You choose: rent it out, use it yourself or sell.',
    s9H: 'Fully managed', s9P: 'With our partners we take care of everything: the listing on the platforms, pricing, guest contact, check-in, cleaning and maintenance.', abType: 'Villa in Mengwi, Indonesia', abMeta: '2 guests · 1 bedroom · 1 bed · 1 bath', ariaAbListing: 'View the TEMAN Villas listing on Airbnb', altAbListing: 'TEMAN Villas, one of our delivered villas, as guests see it on Airbnb',
    s10Note: 'Payout', s10Cap: 'Month: June', s10H: 'The payout', s10P: 'The rental income every month, to your account in the Netherlands or Indonesia, in euros or rupiah.',
    swipe: 'Swipe for all ten steps',
    gEyebrow: 'Our model', gH: 'Guests book direct more and more.<br><span class="accent">Without the 15% platform commission.</span>',
    gSub: 'Social media and content bring guests in. Whoever books direct on our website steps into the brand, with no platform commission. At MOKA this is live today. The big platforms stay alongside.',
    gAttract: 'Attract', gSmH: 'Social media first', gSmP: 'Video and stories about every villa. That is how guests find us.',
    gVideo: 'Video and content', gOther: 'Other channels', gGoal: 'Direct through our website', gSoon: 'own site per project',
    gDirectH: 'Book directly through the project\'s own website', gDirectP: 'More brand experience for the guest and less commission. That is better for the return.', gMore: '≈ 15% higher payout per direct booking', gAlso: 'Alongside', gPfH: 'On all major platforms', gBoth: 'Both', gRent: 'rental income', gPayout: 'your monthly payout',
    gNote: 'This is our model for every project, combined with the major platforms. A direct booking carries no platform commission of 15%. At MOKA it is already live: <a href="https://www.mokavillas.com/" target="_blank" rel="noopener">mokavillas.com</a>. Our rental partners handle bookings, platforms and pricing. We set it up and manage it.',
    navSure: 'Certainty', rating: '4.83', amtInleg: '€225,000', amtPay: '≈ €2,491',
    pEyebrow: 'Every project its own brand', pH: 'Guests book a brand.<br><span class="accent">Your villa is part of it.</span>',
    pSub: 'Own name, own design, own audience, a unique experience. That is why the nightly rate is higher.',
    bGoMaison: 'See The Maison', bGoMoka: 'See MOKA', bGoReload: 'Put me on the list', tzTag: 'Coming soon · new project', tzT: 'Next project to be revealed soon', tzPrice: 'Pre-sale: €125,000 to €235,000', tzNote: 'Limited places. Only those who register their interest and are ready to buy get access.', tzGo: 'Put me on the list', soldHead: 'Sold out before', soldStamp: 'Sold out', soldTemanSt: 'Delivered and rented out', soldPalmaSt: 'Every villa sold', palmaStatus: 'Handover November 2026', palmaGo: 'Watch the video', ariaPalmaVideo: 'Watch the video of Villa Palma', ariaClose: 'Close', mokaStatus: 'Handover November 2026', altSoldTeman: 'TEMAN Villas in Tumbak Bayuh, delivered', altSoldPalma: 'Impression of Villa Palma in Kedungu',
    mEyebrow: 'Data and automation', mH: 'Demand is moving west.<br><span class="accent">We are already there.</span>',
    mSub: 'Seminyak, Canggu, Pererenan. Now Cemagi and Kedungu, where we already develop. We choose location and layout with data and AI. Prices move automatically, with our rental partners.',
    mapK: 'Schematic, not to scale',
    mapT: 'Bali keeps growing, and that growth moves west from Seminyak. Our projects sit where it is heading now.', mapK: 'Google Maps · click a place', mapKProj: 'Our projects · always close to the beach', mapKHot: 'Hotspots nearby', mapKTrend: 'The direction', mokaNote: '600 m from the beach, 2 min by scooter', approxNote: 'approximate location', maisonNote: '3 min by scooter to the beach, pin approximate', reloadNote: 'revealed soon', mpNext: 'Next project', hotSauna: 'sauna and ice bath', hotWell: 'wellness and social club', hotPadel: 'padel club', hotBeach: 'beach', trendNote: 'Seminyak, Canggu, Pererenan, Cemagi, Kedungu', mapOpen: 'Open in Google Maps', mapListAria: 'Places on the map', mapIframe: 'Google Maps: the southwest coast of Bali with our projects',
    aiK: 'Data and AI',
    ai1: 'The place: where demand is heading, from data on demand and rentals.',
    ai2: 'The layout: the floor plan that earns the most per square metre.',
    ai3: 'The nightly price: moves automatically with demand, together with our rental partners.',
    autoK: 'What runs automatically', auto1: 'Nightly prices move with demand, together with our rental partners.',
    auto2: 'A construction update in your portal every week.',
    auto4: 'Your investor portal: contract, progress and documents in one place.',
    auto3: 'At The Maison the construction camera already streams live in the brochure; at the next project soon too, with self check-in through a smart lock.',
    cmpEyebrow: 'Location first', cmpH: 'The place first.<br><span class="accent">The square metres second.</span>',
    cmpSub: 'A guest books a bedroom in a prime location, not extra square metres. So compact earns more per euro.',
    cmpBigK: 'Spacious villa, three bedrooms', cmpBigEx: 'Large pool, large garden, more upkeep', cmpPriceL: 'Investment', cmpRoiL: 'Yield', cmpBigRoi: '≈ 11.9% a year', cmpSmRoi: '≈ 16.4% a year', cmpBigPrice: '€325,000', cmpSmPrice: '€135,000', cmpSmEx: 'Lower entry, less upkeep and staff', cmpBig1: 'Payout ≈ €3,223 a month', cmpBig2: 'On an investment of €325,000', cmpBig3: '€195 a night, realistic scenario', cmpBig4: 'Large pool, large garden, more upkeep',
    cmpSmallK: '1 bedroom Suite', cmpSm1: 'Payout ≈ €1,842 a month', cmpSm2: 'On an investment of €135,000', cmpSm3: '€95 a night, realistic scenario', cmpSm4: 'Lower entry, less upkeep and staff',
    amsK: 'It works the same in the Netherlands', amsA: 'Studio, 40 m²', amsB: 'House, three bedrooms', amsUp: 'Buy €375,000 · rent €1,500 a month · 4.8% a year', amsDown: 'Buy €1,000,000 · rent €3,250 a month · 3.9% a year',
    amsP: 'Per euro invested the studio brings in more rent. A tenant pays for a place to sleep, not for square metres. Bali works the same way.',
    cmpTag: 'MOKA, one bedroom', altCompact: 'Impression of the living room of a compact one-bedroom home in MOKA',
    lblInterieur: 'Interior',
    bMaisonLine: 'Six homes in a gated community, three minutes by scooter from the beach.',
    bMokaLine: 'Boutique resort, 600 metres from the beach. Fifteen homes in one community.',
    bReloadLine: 'Next project, revealed soon. From €125,000.',
    altMokaPoster: 'Impression of a villa in MOKA, Kedungu',
    ctaProjects: 'See the projects',
    ctaProjectsNote: 'All projects, numbers and brochures are on invest.utamabali.com',
    altLocatie: 'Steven in a meeting on site, on the land of a new project',
    capLocatie: 'On site, discussing the land',
    capOpgZwembad: 'Delivered, ready for the first guests',
    capOpgeleverd: 'Delivered villa',
    pfDone: 'Delivered',
    pfRented: 'Rented to guests',
    pfResold: 'Delivered and resold',
    reelSrc: '@stevenbalivillas · real numbers from our most watched reel',
    ctaPnlH: 'Want to see all the numbers?',
    ctaPnlP: 'The full brochure of The Maison with the complete P&L: revenue, costs, payout per month and the scenarios side by side.',
    ctaPnlBtn: 'View the full brochure and P&L',
    ctaPnlAll: 'Or see all projects on invest.utamabali.com',
    wEyebrow: 'Healthy and in the picture', wH: 'The new guest lives healthy.<br><span class="accent">Every concept is designed for it.</span>',
    wSub: 'Less partying, more recovery. Guests want a home with an idea: sauna, ice bath, jacuzzi, sport, an interior worth sharing. Our concepts are designed around that.',
    wGym: 'Sport', wSauna: 'Sauna', wIce: 'Ice bath', wJac: 'Jacuzzi', wTag1: 'Next project, revealed soon',
    altReloadWell: 'Impression of a roof terrace from above: sauna, ice bath, jacuzzi, a gym corner and a lounge',
    altNissen: 'Open kitchen with wooden shelves, hob and rattan bar stools in a delivered villa', wT1: 'Interiors guests share',
    altMokaJac: 'Impression of a jacuzzi on the roof terrace of a villa in MOKA, looking over the rice fields to the sea', wT2: 'Jacuzzi on the roof terrace',
    wPartK: 'With partners close by', wPartP: 'Padel, recovery and wellness near our projects.',
    wS1K: 'Wellness tourism worldwide', wS1V: 'USD 894 bn', wS1S: 'Source: Global Wellness Institute, figure for 2024',
    wS2K: 'Premium on homes with wellness', wS2S: 'International research. Source: Global Wellness Institute, 300+ studies',
    wS3K: 'Foreign visitors to Bali in 2025', wS3V: '6.95 m', wS3S: '9.7% more than in 2024. Source: BPS Bali',
    zEyebrow: 'Dutch and precise', zH: 'Agreements on paper.<br><span class="accent">No empty promises.</span>',
    zSub: 'A Dutch party with a Dutch founder. Leasehold 30 + 30 years, permits included, paid out every month in euros. Agreements that hold, in writing.',
    altNotaris: 'Steven Gijsman signing a contract at the notary in Bali', tagNotaris: 'At the notary', altOpgWoon: 'Furnished living room with open kitchen of a delivered project, under a wooden roof structure',
    z1B: 'Dutch.', z1: 'Dutch party, Dutch founder, in Bali himself.',
    z2B: 'Permits included.', z2: 'We deliver every home including permits.',
    z3B: 'Only where renting is allowed.', z3: 'Only in places assigned for tourism and short-stay rental.',
    z4B: 'Warranty on the build.', z4: 'Five years on the structure, one year on the finishes, in your purchase agreement.',
    z5B: 'Leasehold.', z5: 'Foreigners cannot own land in Bali, so you buy the right of use: with us 30 years plus a 30-year extension, fixed by the notary.',
    z6B: 'Paid in stages.', z6: 'You pay in steps that follow construction.',
    z7B: 'Own funds.', z7: 'You buy with your own money, no mortgage or bank in between.',
    z8B: 'What comes on top.', z8: 'Notary fee 1% and a maintenance contribution. No hidden costs.',
    bEyebrow: 'Delivered', bH: 'Four projects delivered.<br><span class="accent">Proof comes before promise.</span>', bSub: 'Real villas, real guests: photos, not renders. MOKA is now being handed over, 14 of 15 sold and the last one reserved.',
    stDone: 'Delivered', stSold: 'At a profit, February 2026', stMoka: '14 of 15 sold · last unit reserved', stHandover: 'Last unit reserved, in handover',
    rFrom: 'from', mpOn: 'on Airbnb', mpDone: 'delivered', rStand: 'as of 28 September 2026', trackK: 'Track record', stDoneSold: 'Delivered, sold', stBuild: 'Under construction',
    peopleEyebrow: 'The team', peopleH: 'Steven leads the projects.<br><span class="accent">Ashley gets to know you.</span>', peopleSub: 'And a team that is on the building site every day, so you do not have to be.', capSteven: 'Steven on the build', altStevenBouw2: 'Steven in a helmet on the building site, among the rebar', capVoorman: 'With the foreman on the foundation', capBeton: 'Concrete pour at MOKA', capLach: 'The foreman and Steven', capOverleg: 'Meeting with the build team', capTeman: 'TEMAN Villas under construction', capZwembad: 'Pool under construction, Villa Calmaan', capLucht: 'MOKA today, from above', altVoorman: 'Steven and the foreman on the foundation, with the drawings', altBeton: 'Concrete pour at MOKA, the pump above the formwork', altLach: 'The MOKA foreman smiles at Steven', altOverleg: 'The build team in a meeting with the drawings', altTeman: 'Steven with two builders in the formwork of TEMAN Villas', altZwembad: 'The pool of Villa Calmaan under construction', altLucht: 'MOKA from above, between the rice fields', teamLine: 'Next to Steven and Ashley: a permanent site manager on every building site, a team for buyer communication, marketing and the guest experience, and our partners for architecture, interiors and permits.',
    stevenK: 'Founder', stevenP: 'Dutch. Leads every project, from the land to the key handover, and is on the building site.',
    ashleyK: 'Introduction', ashleyP: 'Runs the introduction calls. Your situation first, a project second.', ashleyCta: 'Book a call',
    fEyebrow: 'Frequently asked', faqH: 'What investors ask,<br><span class="accent">before they step in.</span>', faqSub: 'In the order they are asked. From own funds to what is still available.',
    faqAsideK: 'Not found?', faqAsideH: 'Is your question not here?', faqAsideP: 'Send Ashley a WhatsApp message.',
    q1: 'Can I finance this?',
    a1: 'You buy with your own money. A Dutch bank does not finance leasehold in Indonesia. You pay in stages that follow construction, so the amount is spread out.',
    q2: 'How does it work and what do I earn?',
    a2: 'You buy a home in one of our projects. We develop, arrange the permits and the notary, and set up the rental with our rental partners. From the first guests you receive the rental income every month. The return depends on project, occupancy and season: as a scenario 12 to 17% a year. Appreciation comes on top. The land is leasehold: foreigners cannot own land in Bali, so you buy the right of use. With us that is 30 years, with a 30-year extension. The exact calculation is in each project brochure and we walk through it on a call.',
    q3: 'Do I buy privately or through a PT PMA, and what about tax in the Netherlands?',
    a3: 'Both are possible. What fits depends on your situation and we discuss it on the call. Real estate abroad is taxed in the country where it lies, not in the Netherlands. If you buy privately, you declare it in box 3 in the Netherlands and receive relief against double taxation. That makes it tax-efficient. Our advisers in the Netherlands and Indonesia confirm this. This is not personal advice: have your own situation checked by an adviser.',
    q4: 'Renders do not convince me. What is real?',
    a4: 'A pre-sale always runs on renders: you buy before the build, and that is where the price advantage sits. Once a project is under way you see the real build: weekly updates in your portal and a construction camera. Delivered villas you can see and visit. Ask Ashley for real footage.',
    q5: 'Which homes are still available?',
    a5: 'That changes week to week. Two ways to know right now:', a5Btn1: 'See the projects', a5Txt1: 'The current status per project, with prices and the brochure.', a5Btn2: 'Message Ashley', a5Txt2: 'Ask directly on WhatsApp which homes are still available. Ashley answers herself.',
    q6: 'How does leasehold work, and for how long?',
    a6: 'Foreigners cannot own land outright in Bali. Everyone buys leasehold: that is how ownership works here. With us the term is 30 years, with a 30-year extension, fixed by the notary in the purchase agreement. After handover you can rent it out, use it yourself or sell.',
    q7: 'What comes on top of the price?',
    a7: 'You pay the notary fee of 1% of the leasehold value. After handover there is a monthly maintenance contribution, and rental management is a percentage of the rental income. It is all in the brochure per project. No hidden costs.',
    q9: 'What warranty do I get on the construction?',
    a9: 'A five-year warranty on the structure and one year on the finishes. It is in your purchase agreement.',
    q8: 'Where do I start?',
    a8: 'With an introduction call with Ashley. Your situation first, a project second. Then you choose a project and read the brochure.', a8Btn1: 'WhatsApp Ashley', a8Txt1: 'Book a fifteen-minute introduction call. Ashley answers herself.', a8Btn2: 'See the projects', a8Txt2: 'All projects with prices and the brochure.',
    ctaEyebrow: 'The next step',
    ctaH: 'You own it. We run it.<br><span class="accent">Four projects came before yours.</span>', ctaP: 'Choose a project, or send Ashley a WhatsApp message.',
    refT: 'Introduce someone who buys a villa. You receive it when the purchase agreement is signed.', refGo: 'How it works',
    footP: 'Boutique villa projects in the south of Bali. Pererenan, Cemagi and Kedungu.',
    footFine: 'Returns are estimates, not guarantees. Renders are impressions. © 2026 UTAMA',
    altHero: 'TEMAN Villas in Tumbak Bayuh at dusk: a white villa with arches, an open bedroom and a private pool',
    altMaison: 'Impression of the facades of The Maison in Pererenan', altGrond: 'Steven Gijsman with the contractor on site, plans in hand', altZebra: 'Zebra chairs and a lounger in a villa interior, designed to be photographed', altSleutel: 'Steven and a buyer at the key handover of his villa', tagInterior: 'Interior', tagHandover: 'Key handover', socViews: 'views', socShares: 'shares', socSaves: 'saves', socComments: 'comments', socReal: 'real numbers',
    altMaisonLiving: 'Impression of the living room of The Maison', altStevenBouw: 'Steven Gijsman on the formwork of a floor slab, with the concrete mixer and rice fields behind',
    altOpgZwembad: 'Delivered villa: the pool along the living room, ready for the first guests', tagDelivered: 'delivered project', altCalmaKeuken: 'Furnished open kitchen of Villa Calma',
    altCalmaan: 'Villa Calmaan, furnished: open kitchen and living area by the pool, ready for the first guests',
    altCalmaZit: 'Kitchen wall with niches and shelves in Villa Calma', altReload: 'Impression of a bedroom with an arched window and a view over the palms to the sea',
    altCalma: 'Villa Calma: pool along the dining table, with a spiral staircase and palms', altCalmaan2: 'Villa Calmaan: open kitchen and living area by the pool',
    altMokaNu: 'MOKA in Kedungu from the air: a row of white villas next to the rice fields, under construction',
    altSteven: 'Steven Gijsman, founder of UTAMA, reviewing a drawing', altAshley: 'Portrait of Ashley from UTAMA',
    yearAria: 'Illustration: twelve monthly payouts of varying height. Pick a month for the amounts.',
    stepsAria: 'Ten steps from land to guest',
    mapAria: 'Schematic map of the south-west coast of Bali: from Seminyak via Canggu and Pererenan to Cemagi and Kedungu. The Maison is in Pererenan, the next project in Cemagi, MOKA in Kedungu.'
  } };
  /* Teksten van de teller, per taal */
  var D = {
    nl: { start: 'Zo kan je jaar er straks uitzien', startSub: 'Rekenvoorbeeld · The Maison',
          inleg: 'Jouw inleg', inlegSub: 'vanaf €225.000 · The Maison',
          step: 'Stap {n} van 10', month: 'Maand {n} · uitbetaling', monthSub: 'Straks, na de eerste gasten · rekenvoorbeeld',
          monthN: 'Maand {n} · rekenvoorbeeld', monthSubN: 'Straks, na de eerste gasten',
          done: 'Jaar 1: twaalf uitbetalingen', doneSub: '±14%, realistisch scenario The Maison', doneSubN: '±14% per jaar · The Maison' },
    en: { start: 'What your year could look like later', startSub: 'Worked example · The Maison',
          inleg: 'Your investment', inlegSub: 'from €225,000 · The Maison',
          step: 'Step {n} of 10', month: 'Month {n} · payout', monthSub: 'Later, after the first guests · worked example',
          monthN: 'Month {n} · worked example', monthSubN: 'Later, after the first guests',
          done: 'Year 1: twelve payouts', doneSub: '±14%, realistic scenario The Maison', doneSubN: '±14% a year · The Maison' }
  };
  var lang = 'nl';
  function setLang(l) {
    lang = l === 'en' ? 'en' : 'nl';
    root.lang = lang;
    document.title = lang === 'en' ? 'UTAMA | A villa in Bali, rental income every month' : 'UTAMA | Een villa op Bali, elke maand de huuropbrengst';
    $$('[data-t]').forEach(function (el) {
      var k = el.getAttribute('data-t');
      if (!el.hasAttribute('data-nl')) el.setAttribute('data-nl', el.innerHTML);
      var v = lang === 'en' ? T.en[k] : null;
      el.innerHTML = v != null ? v : el.getAttribute('data-nl');
    });
    $$('[data-t-alt]').forEach(function (el) {
      if (!el.hasAttribute('data-nl-alt')) el.setAttribute('data-nl-alt', el.getAttribute('alt') || '');
      var v = lang === 'en' ? T.en[el.getAttribute('data-t-alt')] : null;
      el.setAttribute('alt', v != null ? v : el.getAttribute('data-nl-alt'));
    });
    $$('[data-t-title]').forEach(function (el) {
      if (!el.hasAttribute('data-nl-title')) el.setAttribute('data-nl-title', el.getAttribute('title') || '');
      var v = lang === 'en' ? T.en[el.getAttribute('data-t-title')] : null;
      el.setAttribute('title', v != null ? v : el.getAttribute('data-nl-title'));
    });
    $$('[data-t-aria]').forEach(function (el) {
      if (!el.hasAttribute('data-nl-aria')) el.setAttribute('data-nl-aria', el.getAttribute('aria-label') || '');
      var v = lang === 'en' ? T.en[el.getAttribute('data-t-aria')] : null;
      el.setAttribute('aria-label', v != null ? v : el.getAttribute('data-nl-aria'));
    });
    $$('.lang button').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem('utama_lang', lang); } catch (e) {}
    lastKey = ''; if (typeof updateDock === 'function') updateDock();
    if (typeof renderSplit === 'function') renderSplit();
  }
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });

  /* ---------- Nav: rand bij scrollen ---------- */
  var nav = $('#nav');
  function navState() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }

  /* ---------- Mobiel menu ---------- */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? (lang === 'en' ? 'Close menu' : 'Menu sluiten') : (lang === 'en' ? 'Open menu' : 'Menu openen'));
    menu.hidden = !open;
    menu.classList.toggle('open', open);
    root.classList.toggle('menu-open', open);
    if (open) { var n0 = $('.menu-links', menu); if (n0) n0.focus({ preventScroll: true }); }
  }
  if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
  });

  /* ---------- Ankers: scrollen zonder de hash te veranderen ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ---------- Google Maps: klik op een plek ---------- */
  var gmap = $('.gmap'), mapOpen = $('.map-open'), mps = $$('.mp');
  function mapGo(btn) {
    if (!gmap) return;
    var q = btn.getAttribute('data-q') || '', z = btn.getAttribute('data-z') || '14';
    gmap.src = 'https://www.google.com/maps?' + q + '&z=' + z + '&hl=' + (lang === 'en' ? 'en' : 'nl') + '&output=embed';
    if (mapOpen) mapOpen.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q.replace(/^q=/, '').replace(/\+/g, ' '));
    mps.forEach(function (b) { var on = b === btn; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  mps.forEach(function (b) { b.addEventListener('click', function () { mapGo(b); }); });

  /* ---------- Tijdlijn ---------- */
  var atoz = $('#atoz'), stage = $('.atoz-stage'), track = $('.steps'), vp = $('.steps-vp'), rail = $('.rail');
  var steps = $$('.step', track || document);
  var railN = rail ? $('.rail-n b', rail) : null;
  var pinned = false, pinDist = 0, stepIdx = 0;

  function setStep(i, p) {
    stepIdx = i;
    if (rail) rail.style.setProperty('--p', String(clamp(p, 0.06, 1)));
    if (railN) railN.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    steps.forEach(function (s, k) { s.classList.toggle('on', k <= i); s.classList.toggle('now', k === i); });
  }
  function setupPin() {
    if (!atoz || !stage || !track) return;
    var want = !reduce && window.innerWidth >= 1024 && window.innerHeight >= 700 && window.innerHeight <= 1300;
    atoz.classList.toggle('pin', want);
    atoz.style.height = '';
    if (vp) vp.style.setProperty('--x', '0px');
    pinned = false;
    if (!want) return;
    var stageH = window.innerHeight - (nav ? nav.offsetHeight : 68);
    var inner = $('.wrap', stage);
    if (inner.scrollHeight > stageH - 24) { atoz.classList.remove("pin"); return; } /* past niet: gewoon raster */
    var wrapW = inner.clientWidth - parseFloat(getComputedStyle(inner).paddingLeft) - parseFloat(getComputedStyle(inner).paddingRight);
    pinDist = Math.max(0, track.scrollWidth - wrapW);
    atoz.style.height = (stageH + pinDist + Math.round(stageH * 0.25)) + 'px';
    pinned = true;
  }
  function pinScroll() {
    if (!pinned) return;
    var navH = nav ? nav.offsetHeight : 68;
    var start = atoz.getBoundingClientRect().top - navH;
    var span = pinDist + Math.round((window.innerHeight - navH) * 0.25);
    var p = clamp(-start / span, 0, 1);
    var px = clamp((-start) / pinDist, 0, 1);
    if (vp) vp.style.setProperty('--x', (-px * pinDist).toFixed(1) + 'px');
    setStep(Math.min(9, Math.floor(p * 9.999)), p);
  }
  /* Klikken op een stap (Steven, 8 oktober 2026): de tijdlijn springt naar die stap. Vastgepind op desktop betekent dat
     de pagina scrollt naar de plek waar die stap in beeld staat; anders schuift de strook zelf. */
  function goToStep(i) {
    var s = steps[i]; if (!s) return;
    var smooth = reduce ? 'auto' : 'smooth';
    if (pinned) {
      var navH = nav ? nav.offsetHeight : 68;
      var span = pinDist + Math.round((window.innerHeight - navH) * 0.25);
      var p = (i + 0.5) / 10;
      var y = atoz.getBoundingClientRect().top + window.scrollY - navH + p * span;
      window.scrollTo({ top: Math.round(y), behavior: smooth });
    } else if (track && track.scrollWidth > track.clientWidth + 8) {
      track.scrollTo({ left: Math.max(0, s.offsetLeft - 16), behavior: smooth });
    } else {
      s.scrollIntoView({ behavior: smooth, block: 'center' });
    }
  }
  steps.forEach(function (s, i) {
    var dot = $('.step-dot', s);
    if (!dot) return;
    dot.addEventListener('click', function (e) { e.preventDefault(); goToStep(i); });
    dot.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToStep(i); } });
    s.addEventListener('click', function (e) { if (e.target.closest('a, button, .step-dot')) return; goToStep(i); });
  });
  if (track) {
    track.addEventListener('scroll', function () {
      if (pinned) return;
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? track.scrollLeft / max : 1;
      setStep(Math.round(p * 9), 0.1 + p * 0.9);
      updateDock();
    }, { passive: true });
  }

  /* ---------- De uitbetalingsteller (dock) ----------
     Fases: start (hero) > inleg (wat je koopt) > bouw (tijdlijn, stap 1 tot 10) > uitbetaling (maand 1 tot 12).
     Toekomende tijd, geen valuta, hoogte per maand is een illustratie. */
  var dock = $('#dock'), teller = $('#teller'), heroCta = $('.hero-cta');
  var dBars = dock ? $$('.d-bars i', dock) : [], dTitle = dock ? $('.d-title', dock) : null, dSub = dock ? $('.d-sub', dock) : null;
  var dCount = dock ? $('.d-count', dock) : null, dProg = dock ? $('.d-prog', dock) : null;
  var secProduct = $('#product'), secGuests = $('#gasten'), secEnd = $('#start'), foot = $('.foot');
  var footVisible = false, lastFilled = -1, lastKey = '', dockReady = false;
  var desktop = function () { return window.innerWidth >= 1024; };

  var lastPreview = null;
  function fill(n, preview) {
    preview = !!preview;
    if (n === lastFilled && preview === lastPreview) return;
    dock.classList.toggle('preview', preview);
    var grew = !preview && lastPreview === false && n > lastFilled;
    dBars.forEach(function (b, i) {
      b.classList.toggle('f', i < n);
      b.classList.toggle('new', grew && i === n - 1 && !reduce);
    });
    lastFilled = n; lastPreview = preview;
  }
  function txt(title, sub, count, prog) {
    var key = title + '|' + sub + '|' + count + '|' + prog;
    if (key === lastKey) return; lastKey = key;
    dTitle.textContent = title; dSub.textContent = sub; dCount.textContent = count || '';
    dock.classList.toggle('build', prog != null);
    if (dProg && prog != null) dProg.style.setProperty('--dp', String(prog));
  }
  function top(el) { return el.getBoundingClientRect().top + window.scrollY; }
  function updateDock() {
    if (!dock) return;
    var d = D[lang], y = window.scrollY, vh = window.innerHeight, line = y + vh * 0.55;
    /* pas tonen als de bezoeker voorbij de hero-teller (desktop) of de hero-knoppen (mobiel) is */
    var anchor = desktop() ? teller : heroCta, past = true;
    if (anchor) { var r = anchor.getBoundingClientRect(); past = r.height > 0 ? r.bottom < (nav ? nav.offsetHeight : 60) : true; }
    var hide = !dockReady || footVisible || !past;
    var wasOff = dock.classList.contains('off');
    dock.classList.toggle('off', hide);
    /* eerste keer: direct zichtbaar met een kleine binnenkomst; daarna pas glijden bij verbergen en tonen */
    if (wasOff && !hide && !dock.classList.contains('live')) {
      dock.classList.add('enter');
      setTimeout(function () { dock.classList.add('live'); }, 60);
    }
    if (!secProduct || !atoz || !secGuests || !secEnd) return;
    if (line < top(secProduct)) {
      fill(12, true); txt(d.start, d.startSub, '', null);
    } else if (line < top(atoz)) {
      fill(0); txt(d.inleg, d.inlegSub, '', null);
    } else if (line < top(secGuests)) {
      var i = stepIdx;
      if (!pinned && window.innerWidth >= 1024) {
        var a0 = top(atoz), a1 = top(secGuests);
        i = Math.min(9, Math.floor(clamp((line - a0) / (a1 - a0), 0, 0.999) * 10));
      }
      fill(i >= 9 ? 1 : 0);
      txt(d.step.replace('{n}', i + 1), (steps[i] && $('h3', steps[i]) ? $('h3', steps[i]).textContent : ''), '', (i + 1) / 10);
    } else {
      var s0 = top(secGuests), s1 = top(secEnd) + vh * 0.2;
      var m = 1 + Math.floor(clamp((line - s0) / (s1 - s0), 0, 0.9999) * 12);
      m = clamp(m, 1, 12);
      fill(m);
      var narrow = window.innerWidth < 1024;
      if (m === 12) txt(d.done, narrow ? d.doneSubN : d.doneSub, '12/12', null);
      else txt((narrow ? d.monthN : d.month).replace('{n}', m), narrow ? d.monthSubN : d.monthSub, m + '/12', null);
    }
    /* boven de donkere afsluiter en de footer een lichte variant */
    dock.classList.toggle('paper', y + vh - 12 > top(secEnd));
  }
  /* Mobiel: de teller wijkt bij omlaag scrollen en komt terug bij omhoog scrollen, zodat hij geen inhoud bedekt */
  var lastY = window.scrollY, tucked = false;
  function tuckDock() {
    if (!dock) return;
    var y = window.scrollY, dy = y - lastY;
    if (window.innerWidth >= 1024) { if (tucked) { tucked = false; dock.classList.remove('tuck'); } lastY = y; return; }
    if (dy > 6 && !tucked && y > 120) { tucked = true; dock.classList.add('tuck'); }
    else if (dy < -6 && tucked) { tucked = false; dock.classList.remove('tuck'); }
    if (Math.abs(dy) > 6) lastY = y;
  }

  /* ---------- Scrollen: een rAF per frame ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    var done = false;
    var run = function () { if (done) return; done = true; ticking = false; navState(); pinScroll(); updateDock(); tuckDock(); };
    raf(run); setTimeout(run, 50); /* valt terug op een timer als rAF stilstaat (achtergrondtab, headless) */
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  var rT;
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1100) setMenu(false);
    clearTimeout(rT); rT = setTimeout(function () { setupPin(); pinScroll(); updateDock(); }, 120);
  });

  /* ---------- Taal bij het laden ---------- */
  /* Zelfde keuze als de vorige site: eigen keuze, dan de NL-cookie van middleware.js, dan de browsertaal. */
  function pickInitialLang() {
    try { var saved = localStorage.getItem('utama_lang'); if (saved === 'nl' || saved === 'en') return saved; } catch (e) {}
    try { if (/(?:^|; )utama_geo=NL(?:;|$)/.test(document.cookie)) return 'nl'; } catch (e) {}
    try { var bl = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase(); if (bl.indexOf('nl') === 0) return 'nl'; } catch (e) {}
    return 'en';
  }
  if (pickInitialLang() === 'en') setLang('en');

  /* ---------- Teller zichtbaar maken ---------- */
  if (dock) {
    dockReady = true;
    dock.classList.add('off');
    dock.hidden = false;
    document.body.classList.add('has-dock');
    if ('IntersectionObserver' in window) {
      if (foot) new IntersectionObserver(function (en) { footVisible = en[0].isIntersecting; updateDock(); }, { threshold: 0 }).observe(foot);
    }
  }
  setupPin(); navState(); pinScroll(); setStep(stepIdx, 0.1); updateDock();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setupPin(); pinScroll(); updateDock(); });
  window.addEventListener('load', function () { setupPin(); pinScroll(); updateDock(); });

  /* ---------- MOKA-video: pas laden als hij in beeld komt, een lichtere versie onder 1024 px,
     niets bij reduced motion of bij een databesparende voorkeur (prefers-reduced-data) ---------- */
  var saveData = (window.matchMedia && window.matchMedia('(prefers-reduced-data: reduce)').matches) ||
    (navigator.connection && navigator.connection.saveData === true);
  if (!reduce && !saveData && 'IntersectionObserver' in window) {
    var vIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.getAttribute('src')) {
            var mob = v.getAttribute('data-src-mobile');
            v.src = (mob && window.innerWidth < 1024) ? mob : v.getAttribute('data-src');
          }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (v.getAttribute('src')) { v.pause(); }
      });
    }, { rootMargin: '0px 0px 10% 0px' });
    $$('video[data-src]').forEach(function (v) { vIO.observe(v); });
  }

  /* Zo kan een jaar er straks uitzien: per maand omzet, kosten en uitbetaling. Werkt ook met reduced motion:
     die zet alleen de animaties uit (style.css), niet de grafiek.
     Basis is de voorbeeldmaand uit de brochure van The Maison (realistisch scenario, €175 per nacht, 85% bezetting):
     omzet €4.530, kosten en beheer €2.039, uitbetaling €2.491. Elke maand is die basis maal een seizoensfactor;
     het gemiddelde van de twaalf factoren is 1, dus het jaar telt op tot twaalf keer de voorbeeldmaand. */
  var BASE = { gross: 4530, net: 2491 };
  var barsBox = $('.bars');
  var barEls = barsBox ? $$('.bar', barsBox) : [];
  var tip = barsBox ? $('.bar-tip', barsBox) : null;
  var split = $('[data-split]');
  var H = barEls.map(function (b) { return parseFloat(getComputedStyle(b).getPropertyValue('--h')) || 1; });
  var meanH = H.reduce(function (a, b) { return a + b; }, 0) / (H.length || 1);
  var MONTHS = H.map(function (hv) {
    var f = hv / meanH;
    var gross = Math.round(BASE.gross * f / 10) * 10;
    var net = Math.round(BASE.net * f);
    return { gross: gross, costs: gross - net, net: net };
  });
  var YEAR = MONTHS.reduce(function (a, m) { return { gross: a.gross + m.gross, costs: a.costs + m.costs, net: a.net + m.net }; }, { gross: 0, costs: 0, net: 0 });
  var MNL = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
  var MEN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var SEAS = ['tussen','laag','laag','tussen','tussen','tussen','hoog','hoog','tussen','tussen','laag','hoog'];
  var SEASN = { nl: { hoog: 'hoogseizoen', tussen: 'tussenseizoen', laag: 'laagseizoen' }, en: { hoog: 'high season', tussen: 'shoulder season', laag: 'low season' } };
  function mName(i) { var n = lang === 'en' ? MEN[i - 1] : MNL[i - 1]; return n.charAt(0).toUpperCase() + n.slice(1); }
  function mSeason(i) { return SEASN[lang === 'en' ? 'en' : 'nl'][SEAS[i - 1]]; }
  var selMonth = 7, scope = 'maand';
  function eur(n) {
    var str = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.');
    return '€' + str;
  }
  function setScopeUI() {
    if (!split) return;
    $$('.ys-toggle button', split).forEach(function (t) {
      var on = t.getAttribute('data-scope') === scope;
      t.classList.toggle('on', on); t.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function renderSplit() {
    if (!split) return;
    var row = scope === 'jaar' ? YEAR : MONTHS[selMonth - 1];
    var title = scope === 'jaar'
      ? (lang === 'en' ? 'Whole year, 12 payouts' : 'Heel jaar, 12 uitbetalingen')
      : mName(selMonth) + ' · ' + mSeason(selMonth);
    $('[data-ys-title]', split).textContent = title;
    $('[data-ys-gross]', split).textContent = eur(row.gross);
    $('[data-ys-costs]', split).textContent = '−' + eur(row.costs);
    $('[data-ys-net]', split).textContent = eur(row.net);
    var yn = $('[data-year-net]'); if (yn) yn.textContent = '≈ ' + eur(Math.round(YEAR.net / 100) * 100);
    setScopeUI();
    barEls.forEach(function (b, i) {
      var on = scope === 'maand' && i + 1 === selMonth;
      b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', mName(i + 1) + ', ' + mSeason(i + 1));
    });
    if (tip) {
      if (scope === 'maand') {
        var b = barEls[selMonth - 1], bb = b.getBoundingClientRect(), pb = barsBox.getBoundingClientRect();
        tip.style.setProperty('--x', (bb.left - pb.left + bb.width / 2) + 'px');
        tip.style.top = (bb.top - pb.top) + 'px';
        $('b', tip).textContent = eur(MONTHS[selMonth - 1].net);
        $('small', tip).textContent = (lang === 'en' ? 'payout ' + MEN[selMonth - 1] : 'uitbetaling ' + MNL[selMonth - 1]);
        tip.classList.add('show');
      } else tip.classList.remove('show');
    }
  }
  function pick(i) { selMonth = i; scope = 'maand'; renderSplit(); }
  barEls.forEach(function (b, i) {
    b.addEventListener('mouseenter', function () { barsBox.classList.add('hot'); pick(i + 1); });
    b.addEventListener('focus', function () { pick(i + 1); });
    b.addEventListener('click', function () { pick(i + 1); });
  });
  if (barsBox) barsBox.addEventListener('mouseleave', function () { barsBox.classList.remove('hot'); });
  if (split) $$('.ys-toggle button', split).forEach(function (t) {
    t.addEventListener('click', function () {
      scope = t.getAttribute('data-scope') === 'jaar' ? 'jaar' : 'maand';
      renderSplit();
    });
  });
  window.addEventListener('resize', function () { if (tip && tip.classList.contains('show')) renderSplit(); });
  if (barsBox) { renderSplit(); setTimeout(renderSplit, 1200); }

  /* De kleine grafiek in de hero: dezelfde maanden en bedragen, met een bedrag bij aanwijzen (Steven, 8 oktober 2026). */
  var tBox = $('.t-bars'), tBars = $$('.t-bar', tBox), tTip = tBox ? $('.t-tip', tBox) : null;
  function tShow(i) {
    if (!tTip || !MONTHS[i - 1]) return;
    var b = tBars[i - 1], bb = b.getBoundingClientRect(), pb = tBox.getBoundingClientRect();
    tTip.style.setProperty('--x', (bb.left - pb.left + bb.width / 2) + 'px');
    tTip.style.top = (bb.top - pb.top) + 'px';
    $('b', tTip).textContent = eur(MONTHS[i - 1].net);
    $('small', tTip).textContent = (lang === 'en' ? MEN[i - 1] : MNL[i - 1]) + ' · ' + mSeason(i);
    tTip.classList.add('show');
    tBars.forEach(function (x, k) { x.classList.toggle('sel', k === i - 1); });
  }
  tBars.forEach(function (b, i) {
    b.addEventListener('mouseenter', function () { tShow(i + 1); });
    b.addEventListener('focus', function () { tShow(i + 1); });
    b.addEventListener('click', function () { tShow(i + 1); });
  });
  if (tBox) tBox.addEventListener('mouseleave', function () { if (tTip) tTip.classList.remove('show'); tBars.forEach(function (x, k) { x.classList.toggle('sel', k === 6); }); });

  if (reduce) return;

  /* ---------- Hero: zachte binnenkomst ---------- */
  raf(function () { var h = $('#belofte'); if (h) h.classList.add('anim'); });

  /* ---------- Onthullen bij scrollen ----------
     Inhoud is standaard zichtbaar. Pas na een echte handeling van de bezoeker (aanraken, scrollwiel,
     toets, muis) worden elementen die nog onder de vouw staan net voor ze in beeld komen verborgen
     en daarna onthuld. Een geprogrammeerde scroll of een headless screenshot ziet dus altijd alles. */
  if (!('IntersectionObserver' in window)) return;
  var inIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      inIO.unobserve(en.target);
      var el = en.target;
      raf(function () {
        el.classList.add('rv-in');
        setTimeout(function () { el.classList.add('rv-done'); el.classList.remove('rv-pre'); }, 2400);
      });
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  var preIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      preIO.unobserve(en.target);
      /* alleen verbergen als het element nog echt onder het scherm staat */
      if (en.boundingClientRect.top < window.innerHeight) return;
      en.target.classList.add('rv-pre');
      inIO.observe(en.target);
    });
  }, { rootMargin: '0px 0px 25% 0px' });
  var armed = false;
  function arm() {
    if (armed) return; armed = true;
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) { window.removeEventListener(ev, arm, true); });
    var vh0 = window.innerHeight || 800;
    $$('[data-reveal]').forEach(function (el) {
      if (pinned && el === track) return; /* de stepper regelt zijn eigen oplichten */
      if (el.getBoundingClientRect().top > vh0 * 1.02) preIO.observe(el);
    });
  }
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) { window.addEventListener(ev, arm, { capture: true, passive: true }); });
})();
