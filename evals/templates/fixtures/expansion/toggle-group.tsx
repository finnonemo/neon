// toggle-group's Counterpart, CDS's grouped toggle buttons. CDS 9.26.1 exports
// no toggle button, so this is the composition: a ButtonGroup of Buttons, each
// aria-pressed, inverse when pressed and secondary when not (PROVISIONAL (#200);
// size PROVISIONAL (#201)). One group per size the item exports (s for
// default, xs for sm, m for lg), a disabled group and a vertical one.
import { useState, type ReactNode } from "react";
import { Button, ButtonGroup } from "@coinbase/cds-web/buttons";
import type { ButtonSize } from "@coinbase/cds-web/buttons";
import { VStack } from "@coinbase/cds-web/layout";
import { Hook } from "../Hook";

type Option = [value: string, label: ReactNode];

function Group({ label, size, options, initial, single, disabled, vertical }: {
  label: string; size: ButtonSize; options: Option[]; initial: string[]; single?: boolean; disabled?: boolean; vertical?: boolean;
}) {
  const [pressed, setPressed] = useState(initial);
  const toggle = (value: string) => setPressed((current) =>
    single ? [value] : current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  return (
    <ButtonGroup accessibilityLabel={label} direction={vertical ? "vertical" : "horizontal"}>
      {options.map(([value, text]) => (
        <Button
          key={value}
          size={size}
          variant={pressed.includes(value) ? "inverse" : "secondary"}
          aria-pressed={pressed.includes(value)}
          disabled={disabled}
          onClick={() => toggle(value)}
        >
          {text}
        </Button>
      ))}
    </ButtonGroup>
  );
}

export default function ToggleGroup() {
  return (
    <VStack gap={3} width={320}>
      <Hook name="toggle-group-default">
        <Group label="สินทรัพย์ / Assets" size="s" initial={["stock", "gold"]}
          options={[["stock", "หุ้น"], ["fund", "กองทุน"], ["gold", "ทอง"]]} />
      </Hook>
      <Hook name="toggle-group-sm">
        <Group label="ช่วงเวลา / Period" size="xs" single initial={["week"]}
          options={[["day", "วัน / 1D"], ["week", "สัปดาห์ / 1W"], ["month", "เดือน / 1M"]]} />
      </Hook>
      <Hook name="toggle-group-lg">
        <Group label="มุมมอง / View" size="m" single initial={["list"]}
          options={[["list", "รายการ / List"], ["grid", "ตาราง / Grid"]]} />
      </Hook>
      <Hook name="toggle-group-disabled">
        <Group label="ความเสี่ยง / Risk" size="s" disabled initial={["low"]}
          options={[["low", "ต่ำ / Low"], ["high", "สูง / High"]]} />
      </Hook>
      <Hook name="toggle-group-vertical">
        <Group label="การแจ้งเตือน / Alerts" size="s" vertical initial={["email"]}
          options={[["email", "อีเมล / Email"], ["sms", "ข้อความ / SMS"]]} />
      </Hook>
    </VStack>
  );
}
