// spinner, measured against CDS Spinner (fixtures/expansion/spinner.tsx) at the
// default size and size 4. The spin is paused from mount on both targets, so
// the ring measures at rest and the axe spec's wait for settled animations ends.
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
        <NeonSpinner size={4} style={paused} label="กำลังโหลด / Loading" />
      </Hook>
    </div>
  )
}
