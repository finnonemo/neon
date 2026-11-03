// The expansion screen on the Neon base, measured against fixtures/Expansion.tsx:
// one section per registry expansion item from ./expansion/<item>.tsx, inside a
// data-measure=<item> hook. Sections are found, not listed, so an item adds its
// file and nothing else.
import type { ComponentType } from "react"
import { Hook } from "./Hook"

const modules = import.meta.glob<{ default: ComponentType }>("./expansion/*.tsx", { eager: true })
const sections = Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))
  .map(([path, module]) => [path.slice("./expansion/".length, -".tsx".length), module.default] as const)

export function Expansion() {
  return (
    <main className="flex min-h-svh flex-col gap-8 p-6">
      <Hook name="title"><h1 className="text-title2">Expansion</h1></Hook>
      {sections.map(([name, Section]) => (
        <section key={name} className="flex flex-col gap-4">
          <h2 className="text-headline">{name}</h2>
          <Hook name={name}><Section /></Hook>
        </section>
      ))}
    </main>
  )
}
