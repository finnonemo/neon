import { useColorScheme } from "../app/colorScheme";
import iconDark from "../assets/logo/logo-finnomena-icon-dark.svg";
import iconLight from "../assets/logo/logo-finnomena-icon-light.svg";
import textDark from "../assets/logo/logo-finnomena-text-dark.svg";
import textLight from "../assets/logo/logo-finnomena-text-light.svg";

const assets = { full: { light: textLight, dark: textDark }, icon: { light: iconLight, dark: iconDark } };

export function Logo({ variant = "full", tone }: { variant?: "full" | "icon"; tone?: "light" | "dark" }) {
  const scheme = useColorScheme();
  const isFull = variant === "full";
  return (
    <a href="https://www.finnomena.com" target="_blank" rel="noopener noreferrer">
      <img src={assets[variant][tone ?? scheme]} alt="Finnomena" width={isFull ? 136 : 32} height={32} className="block" />
    </a>
  );
}
