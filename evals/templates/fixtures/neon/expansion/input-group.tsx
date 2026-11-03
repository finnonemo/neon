// input-group, measured against CDS TextInput's start and end slots
// (fixtures/expansion/input-group.tsx): a start icon, a text suffix and an end
// icon button.
import { SearchIcon, XIcon } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Hook } from "../Hook"

export default function InputGroupSection() {
  return (
    <div className="flex w-64 flex-col gap-6">
      <Hook name="input-group-start">
        <InputGroup>
          <InputGroupInput aria-label="ค้นหา / Search" placeholder="ชื่อผู้ขอ" />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </Hook>
      <Hook name="input-group-suffix">
        <InputGroup>
          <InputGroupInput aria-label="จำนวนเงิน / Amount" defaultValue="1,000" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>THB</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </Hook>
      <Hook name="input-group-button">
        <InputGroup>
          <InputGroupInput aria-label="รหัสอ้างอิง / Reference" defaultValue="FN-2026-0042" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon" aria-label="ล้าง / Clear">
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Hook>
    </div>
  )
}
