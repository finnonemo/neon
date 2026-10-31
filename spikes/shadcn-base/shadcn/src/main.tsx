import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@fontsource/ibm-plex-sans-thai/400.css";
import "@fontsource/ibm-plex-sans-thai/500.css";
import "@fontsource/ibm-plex-sans-thai/600.css";
import "@fontsource/ibm-plex-sans-thai/700.css";
import { AppRoot } from "./app/AppRoot";
import { App } from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRoot colorScheme={new URLSearchParams(location.search).has("dark") ? "dark" : "light"}>
      <App />
    </AppRoot>
  </StrictMode>
);
