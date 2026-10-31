// PROTOTYPE (spike): lucide icons replace CDS icon-font names.
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  external?: boolean;
  active?: boolean;
}
