// The Neon base fixture: the same screens, routes and data as the CDS fixture,
// built from the Neon registry, so layouts.spec.mjs runs on both and
// cds-match.spec.mjs and layout-match.spec.mjs measure one against the other.
// The integration, on-color and spectrum routes exercise CDS only.
import { useState, type ReactNode } from "react"
import { House, UserRound, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Tag } from "@/components/ui/tag"
import { Toggle } from "@/components/ui/toggle"
import { AppShell } from "@/layout/AppShell"
import { ContentLayout } from "@/layout/ContentLayout"
import { SimpleLayout } from "@/layout/SimpleLayout"
import { MultiColumnLayout } from "@/layout/MultiColumnLayout"
import { ImmersiveLayout, type ImmersiveTheme } from "@/layout/ImmersiveLayout"
import { Logo } from "@/layout/Logo"
import type { ActivePane } from "@/layout/ResponsivePanes"
import type { NavItem } from "@/layout/navItems"
import { Approval } from "./app/Approval"
import { Extras } from "./app/Extras"
import { Expansion } from "./app/Expansion"

const params = new URLSearchParams(location.search)
const layout = params.get("layout") ?? "app"
const navigation: NavItem[] = params.has("empty") ? [] : [
  { label: "รายการ / Requests", icon: House, href: "#requests", active: true },
  { label: "Profile", icon: UserRound, href: "#profile" },
]

function Content({ onSelect }: { onSelect: (id: number) => void }) {
  const [filter, setFilter] = useState("")
  const [done, setDone] = useState(false)
  return <div className="flex flex-col gap-4 p-4">
    <h1 className="text-title2">รายการคำขอ / Requests</h1>
    <label>Filter <input value={filter} onChange={(e) => setFilter(e.target.value)} /></label>
    {Array.from({ length: 24 }, (_, id) => <Button key={id} type="button" onClick={() => onSelect(id)}>
      Request {id + 1} — ดูรายละเอียดคำขอ
    </Button>)}
    <Button type="button" onClick={() => setDone(true)}>Final action</Button>
    {done && <p role="status">Completed</p>}
  </div>
}

function Details({ selected }: { selected: number | null }) {
  const [notes, setNotes] = useState("")
  return <div className="flex flex-col gap-4 p-4">
    <h2 className="text-title2">รายละเอียด / Details</h2>
    <p>{selected === null ? "Select a request" : `Selected request ${selected + 1}`}</p>
    <label>Notes <input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
  </div>
}

// ?controls on the immersive route only (immersive-themes.spec.mjs): the fills a themed
// page must take from its theme, and a sticky bar that must pin to the viewport while
// the page beneath it (its parent's content) scrolls past.
function ThemedControls({ children }: { children: ReactNode }) {
  return <div>
    <div data-sticky-probe className="sticky top-0 z-10 bg-background p-4">Pinned section</div>
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary">Secondary action</Button>
        <Button variant="outline">Outline action</Button>
        <Button variant="ghost">Ghost action</Button>
        <Button variant="secondary" disabled>Disabled action</Button>
        <Button variant="link">Link action</Button>
        <Toggle defaultPressed>Pressed toggle</Toggle>
        <Toggle>Unpressed toggle</Toggle>
        <Tag>Neutral tag</Tag>
      </div>
      <SegmentedControl defaultValue="month" aria-label="Period">
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
    </div>
    {children}
  </div>
}

export function App() {
  const [activePane, setActivePane] = useState<ActivePane>("content")
  const [selected, setSelected] = useState<number | null>(null)
  const content = <Content onSelect={(id) => { setSelected(id); setActivePane("inspector") }} />
  const props = {
    contentHeader: <span className="text-headline">พื้นที่ทำงาน / Workspace</span>,
    contentActions: <Button variant="secondary" size="icon" aria-label="Search workspace" onClick={() => document.querySelector<HTMLInputElement>('input')?.focus()}><Search /></Button>,
    inspectorHeader: <span className="text-headline">รายละเอียด / Details</span>,
    sidebar: null, navigation, content, inspector: <Details selected={selected} />,
    ...(params.has("uncontrolled") ? {} : { activePane, onActivePaneChange: setActivePane }),
    paneLabels: { content: "Content", inspector: "Details", viewDetails: "ดูรายละเอียด", backToContent: "กลับไปที่รายการ" },
  }
  return layout === "approval" ? <Approval />
    : layout === "extras" ? <Extras />
    : layout === "expansion" ? <Expansion />
    : layout === "logo" ? <main><Logo /><Logo tone="light" /></main>
    : layout === "app" ? <AppShell {...props} />
    : layout === "content" ? <ContentLayout {...props} />
    : layout === "simple" ? <SimpleLayout {...props} />
    : layout === "board" ? <MultiColumnLayout {...props} columns={[content, <div key="next">Next column</div>, <div key="done">Completed column</div>]} />
    : <ImmersiveLayout {...props} content={params.has("controls") ? <ThemedControls>{content}</ThemedControls> : content} immersiveTheme={(params.get("theme") ?? undefined) as ImmersiveTheme | undefined} />
}
