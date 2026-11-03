// The expansion screen measured for the CDS baseline: one section per registry
// expansion item, each the item's Counterpart from ./expansion/<item>.tsx inside
// a data-measure=<item> hook. Sections are found, not listed, so an item adds
// its file and nothing else.
import type { ComponentType } from "react";
import { VStack } from "@coinbase/cds-web/layout";
import { Text } from "@coinbase/cds-web/typography";
import { Hook } from "./Hook";

const modules = import.meta.glob<{ default: ComponentType }>("./expansion/*.tsx", { eager: true });
const sections = Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))
  .map(([path, module]) => [path.slice("./expansion/".length, -".tsx".length), module.default] as const);

export function Expansion() {
  return (
    <VStack gap={4} padding={3} background="bg" minHeight="100vh">
      <Hook name="title"><Text as="h1" font="title2">Expansion</Text></Hook>
      {sections.map(([name, Section]) => (
        <VStack key={name} as="section" gap={2}>
          <Text as="h2" font="headline">{name}</Text>
          <Hook name={name}><Section /></Hook>
        </VStack>
      ))}
    </VStack>
  );
}
