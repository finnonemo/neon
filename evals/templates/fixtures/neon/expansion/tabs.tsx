// tabs, measured against Core's Tabs and, where Core gives no value, CDS Tabs (fixtures/expansion/tabs.tsx): an active
// tab, an inactive one and a disabled one, each with its panel; then a selected tab that is disabled.
import { Tabs as NeonTabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hook } from "../Hook"

export default function Tabs() {
  return (
    <div className="flex w-80 flex-col">
      <Hook name="tabs-default">
        <NeonTabs defaultValue="overview">
          <TabsList aria-label="บัญชี / Account">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="documents" disabled>เอกสาร</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><p>ยอดคงเหลือและรายการล่าสุด / Balance and recent activity</p></TabsContent>
          <TabsContent value="history"><p>รายการย้อนหลัง 30 วัน / The last 30 days</p></TabsContent>
          <TabsContent value="documents"><p>หนังสือรับรอง / Certificates</p></TabsContent>
        </NeonTabs>
      </Hook>
      <Hook name="tabs-disabled-selected">
        <NeonTabs defaultValue="closed">
          <TabsList aria-label="บัญชีที่ปิดแล้ว / Closed account">
            <TabsTrigger value="closed" disabled>ปิดแล้ว</TabsTrigger>
          </TabsList>
          <TabsContent value="closed"><p>ไม่มีรายการ / Nothing to show</p></TabsContent>
        </NeonTabs>
      </Hook>
    </div>
  )
}
