// PROTOTYPE (spike): shared mock data for both comparison apps.
export type Status = "pending" | "approved" | "rejected";
export const statusLabel: Record<Status, string> = { pending: "รออนุมัติ", approved: "อนุมัติแล้ว", rejected: "ปฏิเสธ" };
const names = ["Somchai Jaidee", "Kanya Srisuk", "Anan Wongsa", "Pim Rattanakul", "Niran Chaiyo", "Malee Boonmee", "Tawan Siri", "Ploy Charoen"];
const types = ["เบิกค่าเดินทาง", "ลาพักร้อน", "ซื้ออุปกรณ์", "อบรมภายนอก"];
const statuses: Status[] = ["pending", "pending", "approved", "rejected"];
export const requests = names.map((name, i) => ({
  id: i + 1,
  name,
  type: types[i % types.length],
  status: statuses[i % statuses.length],
  amount: `฿${(1250 * (i + 1)).toLocaleString("th-TH")}`,
  submitted: `${i + 3} ต.ค. 2569`,
  note: "ขออนุมัติตามรายละเอียดที่แนบ ใบเสร็จและเอกสารประกอบอยู่ในไฟล์แนบ",
}));
