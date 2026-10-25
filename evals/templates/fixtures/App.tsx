import { useState } from "react";
import { Box } from "@coinbase/cds-web/layout";
import { Button } from "@coinbase/cds-web/buttons";
import { Icon } from "@coinbase/cds-web/icons";
import { Text } from "@coinbase/cds-web/typography";
import { AppRoot } from "./AppRoot";
import { AppRoot as IntegrationRoot } from "./IntegrationRoot";
import { AppShell } from "../layout/AppShell";
import { ContentLayout } from "../layout/ContentLayout";
import { SimpleLayout } from "../layout/SimpleLayout";
import { MultiColumnLayout } from "../layout/MultiColumnLayout";
import { ImmersiveLayout } from "../layout/ImmersiveLayout";
import { Logo } from "../layout/Logo";
import type { ActivePane } from "../layout/ResponsivePanes";
import type { NavItem } from "../layout/navItems";

const params = new URLSearchParams(location.search);
const layout = params.get("layout") ?? "app";
const navigation: NavItem[] = params.has("empty") ? [] : [
  { label: "รายการ / Requests", icon: "home", href: "#requests", active: true },
  { label: "Profile", icon: "avatar", href: "#profile" },
];

function Content({ onSelect }: { onSelect: (id: number) => void }) {
  const [filter, setFilter] = useState("");
  const [done, setDone] = useState(false);
  return <Box padding={2} display="flex" flexDirection="column" gap={2}>
    <Text as="h1" font="title2">รายการคำขอ / Requests</Text>
    <label>Filter <input value={filter} onChange={(e) => setFilter(e.target.value)} /></label>
    {Array.from({ length: 24 }, (_, id) => <Button key={id} type="button" onClick={() => onSelect(id)}>
      Request {id + 1} — ดูรายละเอียดคำขอ
    </Button>)}
    <Button type="button" onClick={() => setDone(true)}>Final action</Button>
    {done && <Text role="status">Completed</Text>}
  </Box>;
}

function Details({ selected }: { selected: number | null }) {
  const [notes, setNotes] = useState("");
  return <Box padding={2} display="flex" flexDirection="column" gap={2}>
    <Text as="h2" font="title2">รายละเอียด / Details</Text>
    <Text>{selected === null ? "Select a request" : `Selected request ${selected + 1}`}</Text>
    <label>Notes <input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
  </Box>;
}

export function App() {
  const [activePane, setActivePane] = useState<ActivePane>("content");
  const [selected, setSelected] = useState<number | null>(null);
  const [dark, setDark] = useState(params.get("mode") === "dark");
  const [clicked, setClicked] = useState(false);
  const content = <Content onSelect={(id) => { setSelected(id); setActivePane("inspector"); }} />;
  const props = {
    sidebar: null, navigation, content, inspector: <Details selected={selected} />,
    ...(params.has("uncontrolled") ? {} : { activePane, onActivePaneChange: setActivePane }),
    paneLabels: { content: "Content", inspector: "Details", viewDetails: "ดูรายละเอียด", backToContent: "กลับไปที่รายการ" },
  };
  const Provider = layout === "integration" ? IntegrationRoot : AppRoot;
  return <Provider colorScheme={dark ? "dark" : "light"}>
    {layout === "integration" ? <Box padding={2} background="bg" color="fg">
      <Text as="h1" font="title2">Integration — ภาษาไทย / English</Text>
      <Button onClick={() => setClicked(true)}>CDS action</Button>
      <span data-testid="integration-icon"><Icon name="home" size="m" color="fg" /></span>
      <Logo /><Logo tone="light" />
      <button onClick={() => setDark(!dark)}>Toggle theme</button>
      {clicked && <Text role="status">Completed</Text>}
    </Box> : layout === "app" ? <AppShell {...props} />
      : layout === "content" ? <ContentLayout {...props} />
      : layout === "simple" ? <SimpleLayout {...props} />
      : layout === "board" ? <MultiColumnLayout {...props} columns={[content]} />
      : <ImmersiveLayout {...props} />}
  </Provider>;
}
