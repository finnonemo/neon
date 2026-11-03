import { Text } from "@coinbase/cds-web/typography";
import { AppShell } from "../layout/AppShell";

// AppShell's `navigation` prop (see ../layout/navItems.ts's `NavItem`)
// drives both the desktop Sidebar rail and the mobile BottomNav — see
// ../layout/Sidebar.tsx and ../layout/BottomNav.tsx. Left empty here so a
// fresh scaffold never ships dead links; BottomNav renders nothing (not an
// empty bar) for an empty list. Replace with your own items once real
// in-app destinations exist, e.g. [{ label: "Home", icon: "home", href:
// "/", active: true }]. To link out to Finnomena's own ecosystem instead,
// import `finnomenaEcosystemNav` from "../layout/navItems" and pass it here.
export function App() {
  return (
    <AppShell
      contentHeader={<Text font="headline">Workspace</Text>}
      inspectorHeader={<Text font="headline">Details</Text>}
      sidebar={null}
      navigation={[]}
      content={<div>Content</div>}
      inspector={<div>Inspector — start building here</div>}
    />
  );
}
