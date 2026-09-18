import type { ReactNode } from 'react'
import { Card } from '../../components/Card'

const POINTS: { title: string; body: ReactNode }[] = [
  {
    title: 'Geen server',
    body: 'Deze app heeft geen backend. Er is niets om je gegevens naartoe te sturen, dus dat gebeurt ook niet.',
  },
  {
    title: 'Waarom geen directe indiening bij de Belastingdienst',
    body: (
      <>
        Software mag alleen digitaal aangifte indienen via Digipoort met een{' '}
        <a
          href="https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/intermediairs/aangifte_doen/standard_business_reporting/watbetekentsbsvooru/wat_betekent_sbr_voor_u"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          PKIoverheid-servercertificaat
        </a>
        . Dat vereist per definitie een server. Dat is precies het voordeel van deze app: je
        gegevens blijven van jou in plaats van op een server te staan, en daarom kan de aangifte
        niet automatisch worden ingediend. Je krijgt wel een overzicht dat je in een paar seconden
        kunt overtikken in Mijn Belastingdienst Zakelijk.
      </>
    ),
  },
  {
    title: 'Opslag in je browser',
    body: 'Transacties, categorieën en bonnetje-foto’s worden lokaal opgeslagen in de database van je browser (IndexedDB), vergelijkbaar met hoe cookies werken, maar dan voor jouw boekhouddata.',
  },
  {
    title: 'Bonnetjes-herkenning draait lokaal',
    body: 'Tekst van bonnetje-foto’s wordt in de browser zelf herkend (geen foto verlaat je apparaat om herkend te worden).',
  },
  {
    title: 'Bonnetjes-herkenning kan zich vergissen',
    body: 'Op een vlakke, goed leesbare bon werkt de automatische herkenning van bedrag en datum vrijwel altijd goed. Bij een gekreukte, beschadigde of vage foto kan de herkenning een verkeerd bedrag voorstellen dat er op het eerste gezicht wél kloppend uitziet. Controleer daarom altijd de voorgestelde velden, en bij twijfel de meegetoonde ruwe herkende tekst, voordat je een bonnetje opslaat.',
  },
  {
    title: 'Jij bent verantwoordelijk voor back-ups',
    body: 'Omdat er geen server is, is er ook geen automatische back-up in de cloud. Maak dus regelmatig een back-up-bestand (komt beschikbaar bij het exporteren) en bewaar die zelf, bijvoorbeeld op je eigen schijf of in je eigen cloudopslag.',
  },
  {
    title: 'Wissen van browsergegevens = wissen van je boekhouding',
    body: 'Als je de site-data van deze app in je browser wist (of een andere browser/apparaat gebruikt), ben je zonder back-up je gegevens kwijt. Dit is de prijs van 100% privacy: er is geen "wachtwoord vergeten" bij een systeem dat niets van je opslaat.',
  },
  {
    title: 'Wanneer is je werk opgeslagen',
    body: 'Zodra je een import bevestigt of een transactie categoriseert, is dat direct opgeslagen in je browser, ook als de pagina daarna crasht of je hem per ongeluk wegklikt. Alleen tijdens het instellen van een import (vóórdat je op "Bevestig import" klikt) is er nog niets opgeslagen; crasht de pagina precies op dat moment, dan moet je dat ene bestand opnieuw uploaden.',
  },
  {
    title: 'Open source',
    body: 'De volledige broncode is vrij te bekijken. Je hoeft ons niet op ons woord te geloven dat er niets wordt verstuurd: je kunt het zelf (of iemand die het kan) laten controleren.',
  },
]

export function Privacy() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-stone-900">Privacy: hoe het écht werkt</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Geen kleine lettertjes: dit is de volledige werking van deze app als het om je gegevens
          gaat.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {POINTS.map((point) => (
          <Card key={point.title}>
            <h2 className="font-semibold text-stone-900">{point.title}</h2>
            <p className="mt-2 text-sm text-stone-600">{point.body}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
