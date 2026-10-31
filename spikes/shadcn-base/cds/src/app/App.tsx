// PROTOTYPE (spike): CDS version of the comparison screen. Throwaway.
import { useState } from "react";
import { Box, Divider, HStack, VStack } from "@coinbase/cds-web/layout";
import { Button } from "@coinbase/cds-web/buttons";
import { Text } from "@coinbase/cds-web/typography";
import { ListCell } from "@coinbase/cds-web/cells";
import { Checkbox, NativeTextArea, SegmentedControl, TextInput } from "@coinbase/cds-web/controls";
import { Tag } from "@coinbase/cds-web/tag";
import { Avatar } from "@coinbase/cds-web/media";
import { AppShell } from "../layout/AppShell";
import type { NavItem } from "../layout/navItems";
import { requests, statusLabel, type Status } from "./data";

const navigation: NavItem[] = [
  { label: "คำขออนุมัติ / Approvals", icon: "home", href: "#approvals", active: true },
  { label: "Profile", icon: "avatar", href: "#profile" },
];
const tagScheme: Record<Status, "yellow" | "green" | "red"> = { pending: "yellow", approved: "green", rejected: "red" };

export function App() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(requests[0].id);
  const [confirmed, setConfirmed] = useState(false);
  const visible = requests.filter((r) => (tab === "all" || r.status === tab) && r.name.toLowerCase().includes(query.toLowerCase()));
  const current = requests.find((r) => r.id === selected)!;

  const content = (
    <VStack gap={2} paddingX={2} paddingBottom={2}>
      <Text as="h1" font="title2">คำขออนุมัติ</Text>
      <TextInput label="ค้นหา / Search" placeholder="ชื่อผู้ขอ" value={query} onChange={(e) => setQuery(e.target.value)} />
      <SegmentedControl
        options={[{ value: "all", label: "ทั้งหมด" }, { value: "pending", label: "รอ" }, { value: "approved", label: "อนุมัติ" }]}
        value={tab} onChange={setTab}
      />
      <VStack>
        {visible.map((r) => (
          <ListCell
            key={r.id} title={r.name} description={r.type} selected={r.id === selected}
            media={<Avatar name={r.name} size="l" />}
            end={<Tag colorScheme={tagScheme[r.status]}>{statusLabel[r.status]}</Tag>}
            onClick={() => setSelected(r.id)}
          />
        ))}
      </VStack>
    </VStack>
  );

  const inspector = (
    <VStack gap={3} paddingX={3} paddingBottom={3}>
      <HStack gap={2} alignItems="center">
        <Avatar name={current.name} size="xxl" />
        <VStack gap={0.5}>
          <Text as="h2" font="title3">{current.name}</Text>
          <Text font="body" color="fgMuted">{current.type} · {current.amount}</Text>
        </VStack>
        <Box flexGrow={1} />
        <Tag colorScheme={tagScheme[current.status]}>{statusLabel[current.status]}</Tag>
      </HStack>
      <Divider />
      <VStack gap={1}>
        <Text font="headline">รายละเอียด / Details</Text>
        <Text font="body">{current.note}</Text>
        <Text font="label2" color="fgMuted">ส่งเมื่อ {current.submitted}</Text>
      </VStack>
      <VStack gap={1}>
        <Text as="label" font="label1" htmlFor="notes">บันทึก / Notes</Text>
        <NativeTextArea id="notes" rows={3} placeholder="เหตุผลประกอบการพิจารณา" />
      </VStack>
      <Checkbox checked={confirmed} onChange={() => setConfirmed(!confirmed)}>ตรวจสอบเอกสารครบแล้ว</Checkbox>
      <HStack gap={1}>
        <Button variant="primary" disabled={!confirmed}>อนุมัติ / Approve</Button>
        <Button variant="secondary">ขอข้อมูลเพิ่ม</Button>
        <Button variant="negative">ปฏิเสธ</Button>
      </HStack>
    </VStack>
  );

  return <AppShell sidebar={null} navigation={navigation} content={content} inspector={inspector} />;
}
