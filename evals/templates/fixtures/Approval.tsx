// The approval screen measured for the CDS baseline (evals/templates/cds-match.spec.mjs).
// `data-measure` hooks use display: contents, so they never change the layout they mark.
import { useState, type ReactNode } from "react";
import { Box, Divider, HStack, VStack } from "@coinbase/cds-web/layout";
import { Button } from "@coinbase/cds-web/buttons";
import { Text } from "@coinbase/cds-web/typography";
import { ListCell } from "@coinbase/cds-web/cells";
import { Checkbox, NativeTextArea, TextInput } from "@coinbase/cds-web/controls";
import { SegmentedTabs } from "@coinbase/cds-web/tabs";
import { Tag } from "@coinbase/cds-web/tag";
import { Avatar } from "@coinbase/cds-web/media";
import { AppShell } from "../layout/AppShell";
import type { NavItem } from "../layout/navItems";
import type { ActivePane } from "../layout/ResponsivePanes";
import { requests, statusLabel, type Status } from "./shared/data";

const navigation: NavItem[] = [
  { label: "คำขออนุมัติ / Approvals", icon: "home", href: "#approvals", active: true },
  { label: "Profile", icon: "avatar", href: "#profile" },
];
const tagScheme: Record<Status, "yellow" | "green" | "red"> = { pending: "yellow", approved: "green", rejected: "red" };

const Hook = ({ name, children }: { name: string; children: ReactNode }) =>
  <div data-measure={name} style={{ display: "contents" }}>{children}</div>;

export function Approval() {
  const [tab, setTab] = useState("all");
  const tabs = [{ id: "all", label: "ทั้งหมด" }, { id: "pending", label: "รอ" }, { id: "approved", label: "อนุมัติ" }];
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(requests[0].id);
  const [confirmed, setConfirmed] = useState(true);
  // ?pane=inspector opens the details pane, so the spec can measure it at 375.
  const [pane, setPane] = useState<ActivePane>(new URLSearchParams(location.search).get("pane") === "inspector" ? "inspector" : "content");
  const visible = requests.filter((r) => (tab === "all" || r.status === tab) && r.name.toLowerCase().includes(query.toLowerCase()));
  const current = requests.find((r) => r.id === selected)!;

  const content = (
    <VStack gap={2} paddingX={2} paddingBottom={2}>
      <Hook name="title"><Text as="h1" font="title2">คำขออนุมัติ</Text></Hook>
      <Hook name="search">
        <TextInput label="ค้นหา / Search" placeholder="ชื่อผู้ขอ" value={query} onChange={(e) => setQuery(e.target.value)} />
      </Hook>
      <Hook name="segmented">
        <SegmentedTabs accessibilityLabel="สถานะ / Status" tabs={tabs} activeTab={tabs.find((t) => t.id === tab) ?? null} onChange={(t) => setTab(t?.id ?? "all")} />
      </Hook>
      <Hook name="list">
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
      </Hook>
    </VStack>
  );

  const inspector = (
    <VStack gap={3} paddingX={3} paddingBottom={3}>
      <Hook name="summary">
        <HStack gap={2} alignItems="center">
          <Avatar name={current.name} size="xxl" />
          <VStack gap={0.5}>
            <Text as="h2" font="title3">{current.name}</Text>
            <Text font="body" color="fgMuted">{current.type} · {current.amount}</Text>
          </VStack>
          <Box flexGrow={1} />
          <Tag colorScheme={tagScheme[current.status]}>{statusLabel[current.status]}</Tag>
        </HStack>
      </Hook>
      <Divider />
      <Hook name="details">
        <VStack gap={1}>
          <Text font="headline">รายละเอียด / Details</Text>
          <Text font="body">{current.note}</Text>
          <Text font="label2" color="fgMuted">ส่งเมื่อ {current.submitted}</Text>
        </VStack>
      </Hook>
      <Hook name="notes">
        <TextInput label="บันทึก / Notes" inputNode={<NativeTextArea rows={3} placeholder="เหตุผลประกอบการพิจารณา" />} />
      </Hook>
      <Hook name="confirm">
        <Checkbox checked={confirmed} onChange={() => setConfirmed(!confirmed)}>ตรวจสอบเอกสารครบแล้ว</Checkbox>
      </Hook>
      <Hook name="actions">
        <HStack gap={1}>
          <Button variant="primary" disabled={!confirmed}>อนุมัติ / Approve</Button>
          <Button variant="secondary">ขอข้อมูลเพิ่ม</Button>
          <Button variant="negative">ปฏิเสธ</Button>
        </HStack>
      </Hook>
    </VStack>
  );

  return <AppShell sidebar={null} navigation={navigation} content={content} inspector={inspector} activePane={pane} onActivePaneChange={setPane} />;
}
