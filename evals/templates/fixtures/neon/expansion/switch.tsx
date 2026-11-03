// switch, measured against CDS Switch (fixtures/expansion/switch.tsx). CDS
// sets a control's label in body, fg when checked and fgMuted when not; Label
// is muted by default, so a checked switch's label takes the foreground.
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch as NeonSwitch } from "@/components/ui/switch"
import { Hook } from "../Hook"

const label = "text-body peer-data-[state=checked]:text-foreground"

export default function Switch() {
  const [off, setOff] = useState(false)
  const [on, setOn] = useState(true)
  return (
    <div className="flex w-64 flex-col gap-4">
      <Hook name="switch-off">
        <div className="flex items-center gap-2">
          <NeonSwitch id="switch-off" checked={off} onCheckedChange={setOff} />
          <Label htmlFor="switch-off" className={label}>แจ้งเตือน / Alerts</Label>
        </div>
      </Hook>
      <Hook name="switch-on">
        <div className="flex items-center gap-2">
          <NeonSwitch id="switch-on" checked={on} onCheckedChange={setOn} />
          <Label htmlFor="switch-on" className={label}>สแกนนิ้ว / Touch ID</Label>
        </div>
      </Hook>
      <Hook name="switch-disabled-off">
        <div className="flex items-center gap-2">
          <NeonSwitch id="switch-disabled-off" checked={false} disabled />
          <Label htmlFor="switch-disabled-off" className={label}>ล็อกไว้ / Locked</Label>
        </div>
      </Hook>
      <Hook name="switch-disabled-on">
        <div className="flex items-center gap-2">
          <NeonSwitch id="switch-disabled-on" checked disabled />
          <Label htmlFor="switch-disabled-on" className={label}>ยืนยันตัวตน / Verified</Label>
        </div>
      </Hook>
    </div>
  )
}
