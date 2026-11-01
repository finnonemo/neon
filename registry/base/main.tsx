import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"

// Self-hosted Thai font weights used by the Finnomena theme
import "@fontsource/ibm-plex-sans-thai/400.css"
import "@fontsource/ibm-plex-sans-thai/500.css"
import "@fontsource/ibm-plex-sans-thai/600.css"
import "@fontsource/ibm-plex-sans-thai/700.css"

import { AppRoot } from "./app/AppRoot"
import { App } from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRoot>
      <App />
    </AppRoot>
  </StrictMode>
)
