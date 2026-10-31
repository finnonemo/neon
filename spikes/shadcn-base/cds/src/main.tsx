import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// CDS's required global reset + font-variable styles. Without these,
// `fontFamilyMono`'s CDS-default var(--defaultFont-mono) points at an
// undefined CSS variable, and components render without CDS's base reset.
import "@coinbase/cds-web/globalStyles";
import "@coinbase/cds-web/defaultFontStyles";
// Icon glyph font (@font-face for "CoinbaseIcons") that <Icon> (used by
// Sidebar/BottomNav's nav rail) renders characters from — without this,
// every <Icon> shows as a blank/tofu box, since the glyph font itself is
// never registered by @coinbase/cds-web's own imports above.
import "@coinbase/cds-icons/fonts/web/icon-font.css";

// Self-hosted Thai font weights used by Finnomena theme
import "@fontsource/ibm-plex-sans-thai/400.css";
import "@fontsource/ibm-plex-sans-thai/500.css";
import "@fontsource/ibm-plex-sans-thai/600.css";
import "@fontsource/ibm-plex-sans-thai/700.css";

import { AppRoot } from "./app/AppRoot";
import { App } from "./app/App";
import { Extras } from "./app/Extras";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRoot colorScheme={new URLSearchParams(location.search).has("dark") ? "dark" : "light"}>
      {new URLSearchParams(location.search).has("extras") ? <Extras /> : <App />}
    </AppRoot>
  </StrictMode>
);
