// spinner, measured against Core's Progress circle at XSmall (the default) and
// Large, then a numeric size, which Core does not have. The spin is paused from
// mount on every target, so the ring measures at rest and the axe spec's wait
// for settled animations ends.
import { Spinner as NeonSpinner } from "@/components/ui/spinner"
import { Hook } from "../Hook"

const paused = { animationPlayState: "paused" } as const

export default function Spinner() {
  return (
    <div className="flex items-center gap-4">
      <Hook name="spinner-default">
        <NeonSpinner style={paused} label="กำลังโหลด / Loading" />
      </Hook>
      <Hook name="spinner-large">
        <NeonSpinner size="lg" style={paused} label="กำลังโหลด / Loading" />
      </Hook>
      <Hook name="spinner-scaled">
        <NeonSpinner size={4} style={paused} label="กำลังโหลด / Loading" />
      </Hook>
    </div>
  )
}
