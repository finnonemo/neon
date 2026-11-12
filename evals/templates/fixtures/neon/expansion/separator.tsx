// separator, measured against Core's Divider. The horizontal one keeps the
// default (decorative); the vertical one, which Core does not have, is marked
// semantic, so the a11y spec sees both. The inset one is Core's Inset=Start.
import { Separator as NeonSeparator } from "@/components/ui/separator"
import { Hook } from "../Hook"

export default function Separator() {
  return (
    <div className="flex w-64 flex-col gap-4">
      <Hook name="separator-horizontal">
        <div className="flex flex-col gap-2">
          <p className="text-body">ยอดคงเหลือ / Balance</p>
          <NeonSeparator />
          <p className="text-body">ค่าธรรมเนียม / Fees</p>
        </div>
      </Hook>
      <Hook name="separator-vertical">
        <div className="flex h-6 items-center gap-2">
          <p className="text-label2">บัญชี / Account</p>
          <NeonSeparator orientation="vertical" decorative={false} />
          <p className="text-label2">ประวัติ / History</p>
        </div>
      </Hook>
      <Hook name="separator-inset">
        <NeonSeparator inset="start" />
      </Hook>
    </div>
  )
}
