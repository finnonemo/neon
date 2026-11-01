// The Neon base fixture: the same screens and data as the CDS fixture, built
// from the Neon registry, so cds-match.spec.mjs measures one against the other.
// Components join as their tickets land; until the layouts are ported the
// screens stack plainly.
import { Approval } from "./app/Approval"
import { Extras } from "./app/Extras"

const layout = new URLSearchParams(location.search).get("layout")

export function App() {
  return layout === "extras" ? <Extras /> : <Approval />
}
