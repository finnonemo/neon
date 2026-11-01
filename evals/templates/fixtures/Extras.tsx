// The extras screen measured for the CDS baseline: Select, DatePicker, Tooltip,
// Table with a row menu, Dialog and toast. Hooks are display: contents.
import { useState, type ReactNode } from "react";
import { Box, HStack, VStack } from "@coinbase/cds-web/layout";
import { Button, IconButton } from "@coinbase/cds-web/buttons";
import { Text } from "@coinbase/cds-web/typography";
import { Select } from "@coinbase/cds-web/alpha/select";
import { DatePicker } from "@coinbase/cds-web/dates";
import { Dropdown } from "@coinbase/cds-web/dropdown";
import { SelectOption } from "@coinbase/cds-web/controls";
import { Modal, ModalBody, ModalFooter, ModalHeader, Tooltip } from "@coinbase/cds-web/overlays";
import { useToast } from "@coinbase/cds-web/overlays/useToast";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@coinbase/cds-web/tables";
import { requests, statusLabel, types } from "./shared/data";

const Hook = ({ name, children }: { name: string; children: ReactNode }) =>
  <div data-measure={name} style={{ display: "contents" }}>{children}</div>;

export function Extras() {
  const [type, setType] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <VStack gap={3} padding={3} background="bg" minHeight="100vh">
      <Hook name="title"><Text as="h1" font="title2">Extras</Text></Hook>
      <HStack gap={2} alignItems="flex-end" flexWrap="wrap">
        <Hook name="select">
          <Box width={256}>
            <Select label="ประเภท / Type" placeholder="เลือกประเภท" value={type} onChange={(v) => setType(v as string | null)} options={types.map((t) => ({ value: t, label: t }))} />
          </Box>
        </Hook>
        <Hook name="date">
          <Box width={256}>
            <DatePicker label="วันที่ส่ง / Submitted" date={date} onChangeDate={setDate} error={dateError} onErrorDate={setDateError} />
          </Box>
        </Hook>
        <Hook name="help">
          <Tooltip content="ช่วยเหลือ / Help"><IconButton name="info" accessibilityLabel="ช่วยเหลือ" transparent /></Tooltip>
        </Hook>
      </HStack>
      <Hook name="table">
        <Table>
          <TableHeader><TableRow>
            <TableCell title="ชื่อ" /><TableCell title="ประเภท" /><TableCell title="จำนวนเงิน" alignItems="flex-end" /><TableCell title="สถานะ" /><TableCell title="" />
          </TableRow></TableHeader>
          <TableBody>
            {requests.slice(0, 5).map((r) => (
              <TableRow key={r.id}>
                <TableCell title={r.name} /><TableCell title={r.type} /><TableCell title={r.amount} alignItems="flex-end" /><TableCell title={statusLabel[r.status]} />
                <TableCell>
                  <Dropdown content={<><SelectOption value="view" title="ดูรายละเอียด" /><SelectOption value="reject" title={<Text font="headline" color="fgNegative">ปฏิเสธ</Text>} /></>}>
                    <IconButton name="more" accessibilityLabel={`ตัวเลือก ${r.name}`} transparent />
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Hook>
      <Hook name="actions">
        <HStack gap={1}>
          <Button variant="negative" onClick={() => setOpen(true)}>ปฏิเสธคำขอ</Button>
          <Button variant="secondary" onClick={() => toast.show("บันทึกแล้ว / Saved")}>บันทึก</Button>
        </HStack>
      </Hook>
      <Modal visible={open} onRequestClose={() => setOpen(false)}>
        <ModalHeader title="ยืนยันการปฏิเสธ" closeAccessibilityLabel="ปิด" />
        <ModalBody><Text font="body">คำขอนี้จะถูกส่งกลับไปยังผู้ขอ</Text></ModalBody>
        <ModalFooter
          primaryAction={<Button variant="negative">ยืนยัน</Button>}
          secondaryAction={<Button variant="secondary" onClick={() => setOpen(false)}>ยกเลิก</Button>}
        />
      </Modal>
    </VStack>
  );
}
