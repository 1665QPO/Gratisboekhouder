import { Link } from 'react-router-dom'
import { Card } from '../../components/Card'

const STEPS = [
  {
    title: 'Upload je bankafschrift of Excel',
    body: 'CSV of Excel-export van je bank, of je eigen bijhoudlijstje. Jij kiest zelf welke kolom wat betekent.',
  },
  {
    title: 'Beantwoord een paar simpele vragen',
    body: 'Per kostenpost of ontvangst stelt de app de juiste vraag, zodat jij niet hoeft te weten hoe de Belastingdienst het noemt.',
  },
  {
    title: 'Download je aangifte-overzicht',
    body: 'Een overzichtelijke spreadsheet met precies de bedragen die in elk vakje van je btw-aangifte moeten.',
  },
]

export function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col items-start gap-6 py-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-sm font-medium text-accent-800">
          Gratis & open source · gemaakt voor ZZP&apos;ers
        </span>
        <h1 className="text-4xl font-semibold leading-tight text-stone-900 sm:text-5xl">
          Jouw btw-aangifte,
          <br />
          zonder gedoe en zonder abonnement.
        </h1>
        <p className="max-w-xl text-lg text-stone-600">
          Upload een bankafschrift of je eigen Excel, voeg bonnetjes toe, en krijg een overzicht van
          precies wat je moet invullen bij de Belastingdienst. Alles draait in je eigen browser, er
          gaat niets naar een server.
        </p>
        <div className="flex gap-3">
          <Link
            to="/import"
            className="inline-flex items-center rounded-full bg-accent-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-700"
          >
            Begin met importeren
          </Link>
          <Link
            to="/privacy"
            className="inline-flex items-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Hoe zit het met privacy?
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <Card key={step.title}>
            <span className="text-sm font-semibold text-accent-700">Stap {index + 1}</span>
            <h2 className="mt-2 text-lg font-semibold text-stone-900">{step.title}</h2>
            <p className="mt-2 text-sm text-stone-600">{step.body}</p>
          </Card>
        ))}
      </section>
    </div>
  )
}
