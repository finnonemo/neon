// toggle-group, measured against CDS's grouped toggle buttons
// (fixtures/expansion/toggle-group.tsx): one group per size, a disabled group
// and a vertical one. The default and disabled groups are type="multiple"
// (aria-pressed); the sm and lg groups are type="single" (radios).
import { ToggleGroup as NeonToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Hook } from "../Hook"

export default function ToggleGroup() {
  return (
    <div className="flex w-80 flex-col gap-6">
      <Hook name="toggle-group-default">
        <NeonToggleGroup type="multiple" aria-label="สินทรัพย์ / Assets" defaultValue={["stock", "gold"]}>
          <ToggleGroupItem value="stock">หุ้น</ToggleGroupItem>
          <ToggleGroupItem value="fund">กองทุน</ToggleGroupItem>
          <ToggleGroupItem value="gold">ทอง</ToggleGroupItem>
        </NeonToggleGroup>
      </Hook>
      <Hook name="toggle-group-sm">
        <NeonToggleGroup type="single" size="sm" aria-label="ช่วงเวลา / Period" defaultValue="week">
          <ToggleGroupItem value="day">วัน / 1D</ToggleGroupItem>
          <ToggleGroupItem value="week">สัปดาห์ / 1W</ToggleGroupItem>
          <ToggleGroupItem value="month">เดือน / 1M</ToggleGroupItem>
        </NeonToggleGroup>
      </Hook>
      <Hook name="toggle-group-lg">
        <NeonToggleGroup type="single" size="lg" aria-label="มุมมอง / View" defaultValue="list">
          <ToggleGroupItem value="list">รายการ / List</ToggleGroupItem>
          <ToggleGroupItem value="grid">ตาราง / Grid</ToggleGroupItem>
        </NeonToggleGroup>
      </Hook>
      <Hook name="toggle-group-disabled">
        <NeonToggleGroup type="multiple" disabled aria-label="ความเสี่ยง / Risk" defaultValue={["low"]}>
          <ToggleGroupItem value="low">ต่ำ / Low</ToggleGroupItem>
          <ToggleGroupItem value="high">สูง / High</ToggleGroupItem>
        </NeonToggleGroup>
      </Hook>
      <Hook name="toggle-group-vertical">
        <NeonToggleGroup type="multiple" orientation="vertical" aria-label="การแจ้งเตือน / Alerts" defaultValue={["email"]}>
          <ToggleGroupItem value="email">อีเมล / Email</ToggleGroupItem>
          <ToggleGroupItem value="sms">ข้อความ / SMS</ToggleGroupItem>
        </NeonToggleGroup>
      </Hook>
    </div>
  )
}
