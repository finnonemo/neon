// progress, measured against Core's Progress bar at 60%, named by its visible
// label; then Core's other Sizes and Statuses, and the bar with no value.
import { Progress as NeonProgress } from "@/components/ui/progress"
import { Hook } from "../Hook"

export default function Progress() {
  return (
    <div className="flex w-64 flex-col gap-4">
      <Hook name="progress-default">
        <div className="flex flex-col gap-2">
          <p id="progress-default-label" className="text-label2">อัปโหลดเอกสาร / Uploading documents</p>
          <NeonProgress value={60} aria-labelledby="progress-default-label" />
        </div>
      </Hook>
      <Hook name="progress-small"><NeonProgress size="sm" value={25} aria-label="ขนาดเล็ก / Small" /></Hook>
      <Hook name="progress-large"><NeonProgress size="lg" value={75} aria-label="ขนาดใหญ่ / Large" /></Hook>
      <Hook name="progress-success"><NeonProgress status="success" value={100} aria-label="อัปโหลดแล้ว / Uploaded" /></Hook>
      <Hook name="progress-error"><NeonProgress status="error" value={100} aria-label="อัปโหลดไม่สำเร็จ / Upload failed" /></Hook>
      <Hook name="progress-indeterminate"><NeonProgress aria-label="กำลังเตรียม / Preparing" /></Hook>
    </div>
  )
}
