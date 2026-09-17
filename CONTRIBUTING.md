# Bijdragen aan ZZP Boekhouder

Fijn dat je wilt bijdragen! Een paar richtlijnen:

## Uitgangspunten van dit project

Deze staan niet ter discussie in een PR, ze zijn de reden dat dit project
bestaat:

1. **Geen backend.** Alles draait client-side, in de browser. Voeg geen
   server, API-calls naar eigen infrastructuur, of externe tracking toe.
2. **Privacy voor gemak.** Als een feature vereist dat gebruikersdata een
   server op moet, hoort die niet in dit project.
3. **Nederlandse belastingcontext.** De btw-rubrieken en terminologie volgen
   de Belastingdienst-indeling. Wijzigingen daaraan moeten aantoonbaar correct
   zijn (bij voorkeur met een link naar de officiële bron).

## Lokaal ontwikkelen

```bash
npm install
npm run dev      # dev-server
npm run test     # unit tests (Vitest)
npm run lint     # oxlint
npm run build    # productie-build + typecheck
```

## Pull requests

- Houd PR's gericht op één ding.
- Voeg unit tests toe voor nieuwe logica in `src/features/*` (met name
  btw-classificatie en bedrag/datum-parsing — dit is financiële logica, fouten
  hier zijn direct schadelijk voor gebruikers).
- Draai `npm run lint`, `npm run test` en `npm run build` voordat je een PR
  opent.

## Iets melden

Gebruik de issue-tracker van deze repository voor bugs en featureverzoeken.
