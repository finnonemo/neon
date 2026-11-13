// alert, measured against CDS Banner (fixtures/expansion/alert.tsx) in each
// variant, with the same Thai messages. The button after them (unmeasured)
// shows a new alert, for the a11y spec to hear it announced.
import { useState } from "react"
import { CircleCheckIcon, CircleXIcon, InfoIcon, MegaphoneIcon, TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Hook } from "../Hook"

const alerts = [
  {
    variant: "informational",
    Icon: InfoIcon,
    title: "ปิดปรับปรุงระบบ / Maintenance",
    message: "ระบบจะปิดปรับปรุงคืนวันเสาร์ เวลา 22:00–02:00 น. / Back by 2am Sunday",
  },
  {
    variant: "warning",
    Icon: TriangleAlertIcon,
    title: "เอกสารใกล้หมดอายุ / Document expiring",
    message: "บัตรประชาชนของคุณจะหมดอายุภายใน 30 วัน กรุณาอัปเดตก่อนทำรายการ / Update your ID card",
  },
  {
    variant: "error",
    Icon: CircleXIcon,
    title: "โอนเงินไม่สำเร็จ / Transfer failed",
    message: "ยอดเงินในบัญชีไม่เพียงพอ ลองอีกครั้งหลังเติมเงิน / Insufficient balance",
  },
  {
    variant: "promotional",
    Icon: MegaphoneIcon,
    title: "กองทุนใหม่ / New fund",
    message: "เริ่มลงทุนขั้นต่ำ 500 บาท พร้อมสิทธิลดหย่อนภาษี / From 500 baht",
  },
] as const

export default function AlertSection() {
  const [submitted, setSubmitted] = useState(false)
  return (
    <div className="flex w-80 flex-col gap-4">
      {alerts.map(({ variant, Icon, title, message }) => (
        <Hook key={variant} name={`alert-${variant}`}>
          <Alert variant={variant}>
            <Icon />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </Hook>
      ))}
      {/* Core's Success and its 80px minimum height, which CDS has no baseline for. */}
      <Hook name="alert-success">
        <Alert variant="success">
          <CircleCheckIcon />
          <AlertTitle>โอนเงินสำเร็จ / Transfer complete</AlertTitle>
          <AlertDescription>เงินเข้าบัญชีปลายทางแล้ว / The money has arrived</AlertDescription>
        </Alert>
      </Hook>
      <Hook name="alert-title-only">
        <Alert>
          <InfoIcon />
          <AlertTitle>บันทึกแล้ว / Saved</AlertTitle>
        </Alert>
      </Hook>
      <Hook name="alert-appears">
        <Button variant="secondary" size="sm" className="self-start" onClick={() => setSubmitted(true)}>
          ส่งคำขอ / Submit
        </Button>
        {submitted && (
          <Alert variant="error">
            <CircleXIcon />
            <AlertTitle>ส่งคำขอไม่สำเร็จ / Request failed</AlertTitle>
            <AlertDescription>กรุณาลองใหม่อีกครั้ง / Please try again</AlertDescription>
          </Alert>
        )}
      </Hook>
    </div>
  )
}
