// PROTOTYPE (spike): shadcn version of the comparison screen. Throwaway.
import { useState } from "react";
import { Check, House, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AppShell } from "../layout/AppShell";
import type { NavItem } from "../layout/navItems";
import { requests, statusLabel, type Status } from "./data";

const navigation: NavItem[] = [
  { label: "คำขออนุมัติ / Approvals", icon: House, href: "#approvals", active: true },
  { label: "Profile", icon: User, href: "#profile" },
];
const tagTone: Record<Status, string> = {
  pending: "text-warning bg-warning/10", approved: "text-positive bg-positive/10", rejected: "text-negative bg-negative/10",
};
const initials = (name: string) => name.split(" ").map((p) => p[0]).join("");

function StatusTag({ status }: { status: Status }) {
  return <Badge className={cn("rounded-sm px-2 py-0.5 text-label1 font-semibold", tagTone[status])}>{statusLabel[status]}</Badge>;
}

export function App() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(requests[0].id);
  const [confirmed, setConfirmed] = useState(false);
  const visible = requests.filter((r) => (tab === "all" || r.status === tab) && r.name.toLowerCase().includes(query.toLowerCase()));
  const current = requests.find((r) => r.id === selected)!;

  const content = (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <h1 className="text-title2">คำขออนุมัติ</h1>
      <div className="flex flex-col gap-1">
        <Label htmlFor="search" className="text-label2 font-normal text-muted-foreground leading-5">ค้นหา / Search</Label>
        <Input id="search" placeholder="ชื่อผู้ขอ" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-10 w-full rounded-full p-1">
          {[["all", "ทั้งหมด"], ["pending", "รอ"], ["approved", "อนุมัติ"]].map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="rounded-full text-label1">{label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <ul className="flex flex-col">
        {visible.map((r) => (
          <li key={r.id}>
            <button
              type="button" onClick={() => setSelected(r.id)} aria-pressed={r.id === selected}
              className={cn("flex w-full items-center gap-3 rounded-md px-4 py-4 text-left hover:bg-accent", r.id === selected && "bg-accent")}
            >
              <Avatar><AvatarFallback>{initials(r.name)}</AvatarFallback></Avatar>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-headline">{r.name}</span>
                <span className="text-body text-muted-foreground">{r.type}</span>
              </span>
              <StatusTag status={r.status} />
              {r.id === selected && <Check className="size-5" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const inspector = (
    <div className="flex flex-col gap-6 px-6 pb-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-12"><AvatarFallback className="text-headline">{initials(current.name)}</AvatarFallback></Avatar>
        <div className="flex flex-col gap-1">
          <h2 className="text-title3">{current.name}</h2>
          <p className="text-body text-muted-foreground">{current.type} · {current.amount}</p>
        </div>
        <div className="flex-1" />
        <StatusTag status={current.status} />
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <p className="text-headline">รายละเอียด / Details</p>
        <p className="text-body">{current.note}</p>
        <p className="text-label2 text-muted-foreground">ส่งเมื่อ {current.submitted}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="notes" className="text-label1">บันทึก / Notes</Label>
        <Textarea id="notes" rows={3} placeholder="เหตุผลประกอบการพิจารณา" className="p-4 text-body md:text-body" />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="confirm" className="size-5" checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} />
        <Label htmlFor="confirm" className="text-body">ตรวจสอบเอกสารครบแล้ว</Label>
      </div>
      <div className="flex gap-2">
        <Button disabled={!confirmed}>อนุมัติ / Approve</Button>
        <Button variant="secondary">ขอข้อมูลเพิ่ม</Button>
        <Button variant="destructive">ปฏิเสธ</Button>
      </div>
    </div>
  );

  return <AppShell sidebar={null} navigation={navigation} content={content} inspector={inspector} />;
}
