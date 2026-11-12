// radio-group, measured against Core's Radio and CDS RadioGroup (fixtures/expansion/radio-group.tsx).
// The headline names the group; each option's Label is Core's Value: body in Text/text-primary,
// chosen or not. Label turns it Text/text-disabled beside a disabled radio.
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup as NeonRadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Hook } from "../Hook"

const label = "text-body text-foreground"
const payouts = [["bank", "ธนาคาร / Bank"], ["wallet", "วอลเล็ต / Wallet"], ["card", "บัตร / Card"]]
const frequencies = [["monthly", "รายเดือน / Monthly"], ["weekly", "รายสัปดาห์ / Weekly"]]

export default function RadioGroup() {
  const [payout, setPayout] = useState("bank")
  return (
    <div className="flex w-64 flex-col gap-6">
      <Hook name="radio-group-enabled">
        <div className="flex flex-col gap-4">
          <p id="payout-label" className="text-headline">บัญชีรับเงิน / Payout</p>
          <NeonRadioGroup aria-labelledby="payout-label" value={payout} onValueChange={setPayout}>
            {payouts.map(([value, text]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem id={`payout-${value}`} value={value} />
                <Label htmlFor={`payout-${value}`} className={label}>{text}</Label>
              </div>
            ))}
          </NeonRadioGroup>
        </div>
      </Hook>
      <Hook name="radio-group-disabled">
        <div className="flex flex-col gap-4">
          <p id="frequency-label" className="text-headline">รอบการลงทุน / Frequency</p>
          <NeonRadioGroup aria-labelledby="frequency-label" defaultValue="monthly" disabled>
            {frequencies.map(([value, text]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem id={`frequency-${value}`} value={value} />
                <Label htmlFor={`frequency-${value}`} className={label}>{text}</Label>
              </div>
            ))}
          </NeonRadioGroup>
        </div>
      </Hook>
    </div>
  )
}
