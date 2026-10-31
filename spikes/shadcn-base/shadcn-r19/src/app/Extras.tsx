// PROTOTYPE (spike): overlays, table, select, date picker — shadcn side. Throwaway.
import { useState } from "react";
import { CalendarIcon, CircleHelp, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { requests, statusLabel, types } from "./data";

export function Extras() {
  const [type, setType] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-title2">Extras</h1>
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex w-64 flex-col gap-1">
          <Label htmlFor="type" className="text-label2 font-normal leading-5 text-muted-foreground">ประเภท / Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="type" className="w-full"><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
            <SelectContent>{types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex w-64 flex-col gap-1">
          <Label htmlFor="date" className="text-label2 font-normal leading-5 text-muted-foreground">วันที่ส่ง / Submitted</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date" variant="outline" className="w-full justify-between rounded-md font-normal">
                {date ? date.toLocaleDateString("th-TH") : "เลือกวันที่"} <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} /></PopoverContent>
          </Popover>
        </div>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="ช่วยเหลือ"><CircleHelp /></Button></TooltipTrigger>
          <TooltipContent>ช่วยเหลือ / Help</TooltipContent>
        </Tooltip>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>ชื่อ</TableHead><TableHead>ประเภท</TableHead><TableHead className="text-right">จำนวนเงิน</TableHead><TableHead>สถานะ</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {requests.slice(0, 5).map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell><TableCell>{r.type}</TableCell>
              <TableCell className="text-right tabular-nums">{r.amount}</TableCell><TableCell>{statusLabel[r.status]}</TableCell>
              <TableCell className="w-12">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`ตัวเลือก ${r.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>ดูรายละเอียด</DropdownMenuItem><DropdownMenuItem variant="destructive">ปฏิเสธ</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-2">
        <Dialog>
          <DialogTrigger asChild><Button variant="destructive">ปฏิเสธคำขอ</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-title3">ยืนยันการปฏิเสธ</DialogTitle><DialogDescription className="text-body">คำขอนี้จะถูกส่งกลับไปยังผู้ขอ</DialogDescription></DialogHeader>
            <DialogFooter><DialogClose asChild><Button variant="secondary">ยกเลิก</Button></DialogClose><Button variant="destructive">ยืนยัน</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="secondary" onClick={() => toast("บันทึกแล้ว / Saved")}>บันทึก</Button>
      </div>
      <Toaster />
    </main>
  );
}
