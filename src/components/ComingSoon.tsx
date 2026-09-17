import { Card } from './Card'

interface ComingSoonProps {
  title: string
  body: string
}

export function ComingSoon({ title, body }: ComingSoonProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold text-stone-900">{title}</h1>
      <Card className="max-w-xl">
        <p className="text-stone-600">{body}</p>
        <p className="mt-3 text-sm text-stone-400">Deze functie komt in een volgende fase.</p>
      </Card>
    </div>
  )
}
