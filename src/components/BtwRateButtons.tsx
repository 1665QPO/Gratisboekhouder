import type { BtwRate } from '../features/btw/types'
import { Button } from './Button'

interface BtwRateButtonsProps {
  value: BtwRate
  onChange: (rate: BtwRate) => void
}

export function BtwRateButtons({ value, onChange }: BtwRateButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button variant={value === 21 ? 'primary' : 'secondary'} onClick={() => onChange(21)}>
        21%
      </Button>
      <Button variant={value === 9 ? 'primary' : 'secondary'} onClick={() => onChange(9)}>
        9%
      </Button>
      <Button variant={value === 0 ? 'primary' : 'secondary'} onClick={() => onChange(0)}>
        0% / geen btw
      </Button>
    </div>
  )
}
