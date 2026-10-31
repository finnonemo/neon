import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { SidebarNav } from "./SidebarNav";
import type { NavItem } from "./navItems";

export function Sidebar({ width, navigation = [], children }: { width: number; navigation?: NavItem[]; children: ReactNode }) {
  if (width === 0) return null;
  const isRail = width === 64;
  return (
    <div style={{ width }} className="flex h-full shrink-0 flex-col">
      <div className={cn("flex h-16 shrink-0 items-center", isRail ? "justify-center" : "justify-start ps-4")}>
        <Logo variant={isRail ? "icon" : "full"} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav items={navigation} isRail={isRail} />
        {!isRail && children}
      </div>
      <div className="h-16 shrink-0" />
    </div>
  );
}
