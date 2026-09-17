# ZZP Boekhouder

Gratis, open-source en volledig privé boekhoudhulp voor ZZP'ers en kleine
ondernemers. Upload een bankafschrift (CSV/Excel) of je eigen bijhoudlijstje,
voeg straks foto's van bonnetjes toe, en krijg een overzicht van precies welke
bedragen in welk vakje van je btw-aangifte horen.

**Status:** actief in ontwikkeling. Import van bankafschriften/Excel en de
basis van het btw-datamodel werken. Categorisatie-wizard, bonnetjes-OCR en
Excel-export volgen in latere fases (zie [Roadmap](#roadmap)).

## Waarom dit bestaat

Bestaande boekhoudpakketten (Moneybird, Shine, e.d.) zijn prima, maar kosten
geld en vragen je om je financiële data op hun server te zetten. Dit project
is het tegenovergestelde: gratis, open source, en zo gebouwd dat het
technisch onmogelijk is om jouw gegevens naar een server te sturen — er ís
geen server.

## Hoe privé is het echt?

- **Geen backend.** Deze app is een statische website. Alle logica (bestanden
  inlezen, bonnetjes herkennen, btw berekenen) draait in je eigen browser.
- **Opslag lokaal in je browser** via IndexedDB. Niets wordt geüpload.
- **Geen accounts, geen tracking, geen cookies.**
- Keerzijde: er is geen cloud-back-up. Wis je je browserdata, dan ben je je
  boekhouding kwijt tenzij je zelf een back-up-bestand hebt geëxporteerd.

Zie de `/privacy`-pagina in de app voor de volledige uitleg.

## Techstack

- [Vite](https://vite.dev/) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) voor styling
- [Dexie.js](https://dexie.org/) (IndexedDB) voor lokale opslag
- [papaparse](https://www.papaparse.com/) en
  [read-excel-file](https://www.npmjs.com/package/read-excel-file) voor het
  inlezen van CSV/Excel
- [write-excel-file](https://www.npmjs.com/package/write-excel-file) voor het
  genereren van het aangifte-exportbestand
- [Tesseract.js](https://tesseract.projectnaptha.com/) voor client-side
  bonnetjes-OCR (volgende fase)
- [Vitest](https://vitest.dev/) voor unit tests

## Lokaal draaien

```bash
npm install
npm run dev
```

Overige scripts: `npm run build`, `npm run test`, `npm run lint`.

## Roadmap

0. ~~Scaffold~~
1. ~~Btw-domeinmodel (rubrieken, classificatielogica)~~
2. ~~Import-pipeline (CSV/Excel, kolom-mapping, dedupe)~~
3. Categorisatie-wizard + herkenning van terugkerende transacties
4. Bonnetjes-OCR
5. Aangifte-overzicht op scherm + Excel-export + back-up
6. Onboarding, polish, mobiel

## Bijdragen

Zie [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licentie

[MIT](./LICENSE) — gebruik, kopieer en pas aan zoals je wilt.

**Disclaimer:** deze app is hulpmiddel, geen belastingadvies. Controleer je
aangifte altijd zelf of laat die controleren door een boekhouder/adviseur.
