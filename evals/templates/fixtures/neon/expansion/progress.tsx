// progress, measured against CDS ProgressBar (fixtures/expansion/progress.tsx)
// at 60%, named by its visible label.
import { Progress as NeonProgress } from "@/components/ui/progress"
import { Hook } from "../Hook"

export default function Progress() {
  return (
    <Hook name="progress-default">
      <div className="flex w-64 flex-col gap-2">
        <p id="progress-default-label" className="text-label2">อัปโหลดเอกสาร / Uploading documents</p>
        <NeonProgress value={60} aria-labelledby="progress-default-label" />
      </div>
    </Hook>
  )
}
