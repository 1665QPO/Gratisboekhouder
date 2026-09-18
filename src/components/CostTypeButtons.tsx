import { INVESTERING_DREMPEL } from '../features/btw/constants'
import type { CostType } from '../features/btw/types'
import { Button } from './Button'

const BELASTINGDIENST_INVESTEREN_URL =
  'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/investeren_in_bedrijfsmiddelen'

interface CostTypeButtonsProps {
  value: CostType
  onChange: (costType: CostType) => void
}

export function CostTypeButtons({ value, onChange }: CostTypeButtonsProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <Button
          variant={value === 'kosten' ? 'primary' : 'secondary'}
          onClick={() => onChange('kosten')}
        >
          Kosten
        </Button>
        <Button
          variant={value === 'investering' ? 'primary' : 'secondary'}
          onClick={() => onChange('investering')}
        >
          Investering
        </Button>
      </div>
      <p className="text-xs text-stone-500">
        Vanaf €{INVESTERING_DREMPEL} en een gebruiksduur van meer dan een jaar is een aanschaf meestal een
        investering, die je over meerdere jaren afschrijft in plaats van in één keer als kosten
        aftrekt.{' '}
        <a
          href={BELASTINGDIENST_INVESTEREN_URL}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Bron en uitzonderingen: Belastingdienst
        </a>
        .
      </p>
    </div>
  )
}
