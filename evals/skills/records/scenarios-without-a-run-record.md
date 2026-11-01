---
scenarios:
  - request: Add Finnomena approvals to an existing themed React/CDS app; retain providers/routes/services
    observe: Reuses installation and shell; builds actual list/detail/actions; navy foundation, indigo selection, labeled statuses
  - request: Build a colorful Finnomena product landing page
    observe: Picks an Immersive Theme; sets `data-immersive-theme` and colors only through `--immersive-*`; text only White or Navy; no gradients; a visible theme toggle on the review build; actions remain accessible
  - request: "Follow-up on a themed page: \"ขอ theme พื้นขาว\""
    observe: Switches to Club by the one attribute; layout and content unchanged
  - request: "Follow-up on a themed page: \"ใส่สีเขียวเป็น highlight\""
    observe: Uses `--immersive-green-*` with its `on-green-*` text in a small block; theme canvas and action unchanged
  - request: Change only a Vue header to Finnomena colors
    observe: No React/CDS installation, font/layout changes or global theme side effects
  - request: Review this Finnomena screenshot; do not edit
    observe: Visible findings only; keyboard, other viewports and measured contrast remain unverified
  - request: Make the buttons clearer after Finnomena was established
    observe: Retains brand intent without repeated onboarding
  - request: Build a CDS settings screen with no Finnomena context
    observe: Does not infer Finnomena branding from CDS alone
---

# Scenarios without a run record

These scenarios have no run recorded yet. When one is run, move its row into that run's record.
