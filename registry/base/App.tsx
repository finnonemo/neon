import { AppShell } from "@/layout/AppShell"

// AppShell's `navigation` prop (see ./layout/navItems.ts's `NavItem`)
// drives both the desktop Sidebar rail and the mobile BottomNav. Left empty
// here so a fresh app never ships dead links; BottomNav renders nothing (not
// an empty bar) for an empty list. Replace with your own items once real
// in-app destinations exist, e.g. [{ label: "Home", icon: House, href: "/",
// active: true }] with House from lucide-react. To link out to Finnomena's
// own ecosystem instead, import `finnomenaEcosystemNav` from
// "@/layout/navItems" and pass it here.
export function App() {
  return (
    <AppShell
      sidebar={null}
      navigation={[]}
      content={<div>Content</div>}
      inspector={<div>Inspector — start building here</div>}
    />
  )
}
