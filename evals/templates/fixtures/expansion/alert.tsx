// alert's Counterpart, CDS Banner, in each variant at its default contextual
// style: no dismiss and no actions, so the body lays out the same at 375 and
// 1440. CDS clamps the title to 2 lines and the message to 3; each Thai
// message wraps to 2 or 3 lines here, inside the clamp.
import { Banner } from "@coinbase/cds-web/banner";
import { VStack } from "@coinbase/cds-web/layout";
import { Hook } from "../Hook";

const alerts = [
  {
    variant: "informational",
    icon: "info",
    title: "ปิดปรับปรุงระบบ / Maintenance",
    message: "ระบบจะปิดปรับปรุงคืนวันเสาร์ เวลา 22:00–02:00 น. / Back by 2am Sunday",
  },
  {
    variant: "warning",
    icon: "warning",
    title: "เอกสารใกล้หมดอายุ / Document expiring",
    message: "บัตรประชาชนของคุณจะหมดอายุภายใน 30 วัน กรุณาอัปเดตก่อนทำรายการ / Update your ID card",
  },
  {
    variant: "error",
    icon: "error",
    title: "โอนเงินไม่สำเร็จ / Transfer failed",
    message: "ยอดเงินในบัญชีไม่เพียงพอ ลองอีกครั้งหลังเติมเงิน / Insufficient balance",
  },
  {
    variant: "promotional",
    icon: "megaphone",
    title: "กองทุนใหม่ / New fund",
    message: "เริ่มลงทุนขั้นต่ำ 500 บาท พร้อมสิทธิลดหย่อนภาษี / From 500 baht",
  },
] as const;

export default function Alert() {
  return (
    <VStack gap={2} width={320}>
      {alerts.map(({ variant, icon, title, message }) => (
        <Hook key={variant} name={`alert-${variant}`}>
          <Banner variant={variant} startIcon={icon} title={title}>{message}</Banner>
        </Hook>
      ))}
    </VStack>
  );
}
