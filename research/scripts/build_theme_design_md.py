"""Write one Refero-format DESIGN.md per Immersive Theme.

usage: python3 -I research/scripts/build_theme_design_md.py <immersive-themes.json> <colors.json> <out-dir>

Values come from the theme and token files; the prose in THEMES is interpreted
from skills/INSTRUCTION.md and ADR 0004. Section order follows the Refero
Styles corpus (see research/refero-design-md-schema.md).
"""
import json
import os
import sys

themes_path, colors_path, out_dir = sys.argv[1:4]
spec = json.load(open(themes_path, encoding="utf-8"))
colors = json.load(open(colors_path, encoding="utf-8"))


def hex_of(ref):
    family, step = ref.rsplit(".", 1)
    return colors[family][step]["value"].lower()


STEPS = ["100", "75", "50", "25"]
SECONDARY = ["green", "blue", "purple", "red", "orange"]
NAVY, WHITE = hex_of("Navy.100"), hex_of("White.100")

# CDS roles with a Finnomena source (theme/cds/theme.config.ts).
TYPE = [
    ("body", 17, 400, 22),
    ("headline", 17, 500, 22),
    ("title3", 20, 400, 25),
    ("title2", 22, 400, 28),
    ("title1", 28, 400, 34),
    ("display3", 54, 700, 64),
    ("display2", 60, 400, 70),
    ("display1", 92, 400, 102),
]
SPACE = [("0.25", 2), ("0.5", 4), ("0.75", 6), ("1", 8), ("1.5", 12), ("2", 16), ("3", 24),
         ("4", 32), ("5", 40), ("6", 48), ("7", 56), ("8", 64), ("9", 72), ("10", 80)]
RADIUS = [("100", 4, "xs"), ("200", 8, "sm"), ("300", 12, "md"), ("400", 16, "lg"), ("500", 24, "xl"),
          ("600", 32, "2xl"), ("700", 40, "3xl"), ("800", 48, "4xl"), ("1000", "round", "round")]

# Interpreted prose per theme. Keep every claim traceable to INSTRUCTION.md,
# ADR 0004 or the theme file; leave out what would have to be invented.
THEMES = {
    "club": {
        "mode": "light",
        "tagline": "Bright white membership page. Clean paper canvas, navy ink, blue-grey tint blocks and a yellow spark for the moments that matter.",
        "mood": "Club is the entry membership level and the most open of the four: a white canvas that keeps the page airy, navy text and a navy main action for a clear, trustworthy voice, and two supporting families. Light Grey steps build quiet section blocks; Yellow steps mark highlights, offers and the single most important block on a screen. It reads as Finnomena's everyday product voice dressed up for a campaign.",
        "palette_name": "Light Grey",
        "accent_name": "Yellow",
        "blocks_from": "100",
        "do_extra": [
            "Let the white canvas carry about 60% of the page; Light Grey and Yellow blocks share the next 30%, and navy text and actions supply the last 10%.",
        ],
        "dont_extra": [
            "Do not flood a whole section in Yellow.100; on Club yellow is the accent, so keep it to one highlighted block or band per screen.",
        ],
        "layout": "A white page with sections separated by Light Grey tint bands rather than lines. The hero sits on white with a display headline in navy and the navy main action; a single Yellow block draws the eye to the offer or key benefit. Benefit rows and feature groups sit on Light Grey.25–.75 blocks. Secondary colors appear only as small tags or illustration blocks.",
    },
    "exclusive": {
        "mode": "light",
        "tagline": "Saturated yellow canvas with navy ink. Loud, warm and unmistakably Finnomena, cooled by blue-grey blocks.",
        "mood": "Exclusive is the boldest light theme: Yellow.100 is the canvas, so the whole page glows. Navy text and a navy main action stay sharp on it at over 15:1. Yellow tint steps build blocks on the canvas, and Light Grey is the accent that gives the eye somewhere cooler to rest. Use it when the story should feel celebratory and premium.",
        "palette_name": "Yellow",
        "accent_name": "Light Grey",
        "blocks_from": "75",
        "do_extra": [
            "Let yellow cover about 60% of the page, Light Grey blocks about 30%, and navy text and actions the remaining 10%.",
        ],
        "dont_extra": [
            "Do not place a Yellow.100 block on the Yellow.100 canvas; stepped yellow blocks start at 75.",
        ],
        "layout": "The canvas is Yellow.100 from edge to edge. The hero headline sits directly on yellow in navy display type with the navy main action. Section groups step lighter (Yellow.75 → .25) instead of using borders, and Light Grey blocks break up long pages and hold forms or detail content. Secondary colors stay in small tags and illustration blocks.",
    },
    "private": {
        "mode": "light",
        "tagline": "Calm blue-grey canvas with navy ink and yellow highlights. Quiet, considered, a private-banking hush.",
        "mood": "Private is the most composed theme: Light Grey.100 is the canvas, a cool blue-grey that softens the page without going dark. Navy text and the navy main action keep a 9.45:1 floor on the canvas. Lighter Light Grey steps build blocks on it, and Yellow is the accent for the one or two things that need to stand out. Use it for a premium tier that should feel discreet rather than loud.",
        "palette_name": "Light Grey",
        "accent_name": "Yellow",
        "blocks_from": "75",
        "do_extra": [
            "Let blue-grey cover about 60% of the page, Yellow about 30%, and navy text and actions the remaining 10%.",
        ],
        "dont_extra": [
            "Do not place a Light Grey.100 block on the Light Grey.100 canvas; stepped blocks start at 75.",
        ],
        "layout": "A blue-grey page whose sections lift onto lighter Light Grey steps (.75 → .25) to group content. The hero headline sits on the canvas in navy with the navy main action; a Yellow block carries the key offer. Forms and dense detail sit on the lightest steps for the most contrast. Secondary colors stay in small tags and illustration blocks.",
    },
    "ultra": {
        "mode": "dark",
        "tagline": "Deep navy canvas, white type and a yellow spark. The top tier: dark, confident and high-contrast.",
        "mood": "Ultra is the only dark theme: Navy.100 is the canvas and text is white at 18.12:1. The main action flips to white with a navy label. Navy tint steps build blocks on the canvas (white text on .75, navy text on .50 and .25), Yellow is the accent, and Light Grey is a support family for calm content blocks. Use it for the highest membership tier or a premium launch.",
        "palette_name": "Navy",
        "accent_name": "Yellow",
        "support_name": "Light Grey",
        "blocks_from": "75",
        "do_extra": [
            "Let navy cover about 60% of the page, Light Grey and Yellow about 15% each, and white the remaining 10%.",
            "Switch text to navy on Navy.50, Navy.25, every Yellow step and every Light Grey step; keep white text only on Navy.100 and Navy.75.",
            "Give the white main action a 2px Navy #01172b boundary when it sits on Navy.50, Navy.25, Light Grey or Yellow blocks; white on those blocks is only 1.04–3.47:1, navy reaches at least 5.22:1.",
        ],
        "dont_extra": [
            "Do not use a navy main action on the navy canvas; Ultra's action is white with a navy label.",
            "Do not place a Navy.100 block on the Navy.100 canvas; stepped blocks start at 75.",
        ],
        "layout": "A navy page with white display headlines and the white main action. Sections group on Navy.75 blocks (white text) or lighter Navy and Light Grey blocks (navy text); a Yellow block marks the key offer. Long reading content and forms are easiest on Light Grey support blocks. Secondary colors stay in small tags and illustration blocks.",
    },
}

ORDER = ["club", "exclusive", "private", "ultra"]


def theme_colors(key):
    t = spec["themes"][key]
    rows = [("Canvas", t["canvas"], "canvas", "Page background; covers the largest share of the page")]
    rows.append(("Text", t["text"], "text", "All body and heading text on the canvas"))
    groups = [("palette", THEMES[key]["palette_name"], "Theme tint block")]
    groups.append(("accent", THEMES[key]["accent_name"], "Accent block, highlight or offer"))
    if "support" in t:
        groups.append(("support", THEMES[key]["support_name"], "Support block for calm reading content"))
    for group, family, role in groups:
        for step in STEPS:
            pair = t[group][step]
            note = role
            if step == "100" and pair["bg"] == t["canvas"]:
                note += " (same as canvas; use only as the canvas)"
            rows.append((f"{family} {step}", pair["bg"], f"{group}-{step}", f"{note}; text {name_of(pair['fg'])}"))
    rows.append(("Action", t["action"]["bg"], "action", f"Main action fill; label {name_of(t['action']['fg'])}"))
    rows.append(("On action", t["action"]["fg"], "on-action", "Main action label"))
    return t, rows


def name_of(ref):
    return {"Navy.100": "Navy", "White.100": "White"}.get(ref, ref)


def contrast(fg, bg):
    def lum(h):
        c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    a, b = sorted([lum(fg), lum(bg)], reverse=True)
    return (a + 0.05) / (b + 0.05)


def build(key):
    meta = THEMES[key]
    t, rows = theme_colors(key)
    label = t["label"]
    canvas, text = hex_of(t["canvas"]), hex_of(t["text"])
    action, on_action = hex_of(t["action"]["bg"]), hex_of(t["action"]["fg"])
    accent100 = hex_of(t["accent"]["100"]["bg"])
    first_block = t["palette"][meta["blocks_from"]]
    block_bg, block_fg = hex_of(first_block["bg"]), hex_of(first_block["fg"])
    ratio = " / ".join(f"{fam} {pct}" for fam, pct in t["ratio"].items())
    others = [k for k in ORDER if k != key]
    L = []
    w = L.append

    w(f"# Finnomena {label} — Style Reference")
    w(f"> {meta['tagline']}")
    w("")
    w(f"**Theme:** {meta['mode']}")
    w("")
    w("Provisional pending design owner review. Color values are `theme/tokens/colors.json` steps from the Immersive Theme file (`immersive-themes.json`, not yet merged) (Finnomena Guidelines v1, Colour 4.1–4.7); type, spacing and radius come from `theme/cds/theme.config.ts` and `theme/tokens/`. Roles, components, layout and prompts are interpreted from `skills/INSTRUCTION.md`, not measured from a live site. Immersive pages only; functional screens keep the shared CDS mapping.")
    w("")
    w(meta["mood"] + f" Membership ratio: {ratio}.")
    w("")

    w("## Tokens — Colors")
    w("")
    w("| Name | Value | Token | Role |")
    w("|------|-------|-------|------|")
    for name, ref, token, role in rows:
        w(f"| {name} | `{hex_of(ref)}` | `--immersive-{token}` | {role} |")
    w("")
    w("**Shared secondary colors** (every theme; small highlight, tag and illustration blocks only):")
    w("")
    w("| Family | 100 | 75 | 50 | 25 | Text |")
    w("|--------|-----|----|----|----|------|")
    for fam in SECONDARY:
        s = spec["secondary"][fam]
        fgs = sorted({name_of(s[st]["fg"]) for st in STEPS})
        fg_note = "Navy" if fgs == ["Navy"] else "White on 100, Navy on 75/50/25"
        cells = " | ".join(f"`{hex_of(s[st]['bg'])}`" for st in STEPS)
        w(f"| {fam.capitalize()} (`--immersive-{fam}-*`) | {cells} | {fg_note} |")
    w("")

    w("## Tokens — Typography")
    w("")
    w("### IBM Plex Sans Thai — The only typeface: display, headings, body, labels and actions, for Thai and Latin alike. Part of the Brand Floor at every Brand Intensity. · `--fontFamily-body`")
    w("- **Substitute:** none; load IBM Plex Sans Thai through the app's font loader, `sans-serif` only as the CSS fallback")
    w("- **Weights:** 400, 500, 700")
    w("- **Sizes:** " + ", ".join(f"{s}px" for s in sorted({r[1] for r in TYPE})))
    w("- **Line height:** 1.11–1.29 (fixed pixel line heights per role)")
    w("- **Letter spacing:** not set by the generated theme; keep the font default")
    w("- **Role:** Every text role. Weight 400 carries display, titles and body; 500 marks the headline role; 700 is display3 only. Verify Thai and Latin glyphs both render.")
    w("")
    w("### Type Scale")
    w("")
    w("| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |")
    w("|------|--------|--------|------|-------------|----------------|-------|")
    for role, size, weight, lh in TYPE:
        w(f"| {role} | IBM Plex Sans Thai | {weight} | {size}px | {lh}px | — | `--fontSize-{role}` |")
    w("")
    w("The generated theme defines no title4, label, caption or legal values; CDS defaults apply there.")
    w("")

    w("## Tokens — Spacing & Shapes")
    w("")
    w("**Base unit:** 8px")
    w("")
    w("**Density:** comfortable (interpreted for immersive pages)")
    w("")
    w("### Spacing Scale")
    w("")
    w("| Name | Value | Token |")
    w("|------|-------|-------|")
    for name, px in SPACE:
        token = f"`--space-{name}`" if "." not in name else f"CDS `{name}` (no CSS variable)"
        w(f"| {name} | {px}px | {token} |")
    w("")
    w("### Border Radius")
    w("")
    w("| Element | Value |")
    w("|---------|-------|")
    w("| buttons (pill) | round (`--borderRadius-1000`) |")
    w("| buttons (rect) | 8px (radius-sm) |")
    w("| tags (large, medium) | 8px |")
    w("| tags (small, x-small) | 4px |")
    w("| blocks and cards | choose one step from 16–32px and keep it page-wide (interpreted; no token assigns it) |")
    w("")
    w("| Name | Value | Token |")
    w("|------|-------|-------|")
    for key_, px, slug in RADIUS:
        val = "fully round" if px == "round" else f"{px}px"
        w(f"| {slug} | {val} | `--borderRadius-{key_}` |")
    w("")
    w("### Layout")
    w("")
    w("- **Page max-width:** not defined in tokens; reuse the app shell's content width")
    w("- **Section gap:** 64–80px (`--space-8`–`--space-10`, interpreted)")
    w("- **Card padding:** 24–32px (`--space-3`–`--space-4`, interpreted)")
    w("- **Element gap:** 8–16px (`--space-1`–`--space-2`)")
    w("")

    w("## Components")
    w("")
    w("### Main Action Button")
    w("**Role:** The one primary action per section")
    w("")
    w(f"`--immersive-action` ({action}) fill, `--immersive-on-action` ({on_action}) label at {contrast(on_action, action):.2f}:1, IBM Plex Sans Thai headline weight 500. Expressive size: 48px high, 240–256px wide, pill radius with 36px horizontal padding or rect 8px radius with 24px padding.")
    w("")
    w("### Secondary Action Button")
    w("**Role:** Alternative action beside the main one")
    w("")
    w(f"Transparent fill, {name_of(t['text'])} label and a 2px {name_of(t['text'])} outline on the canvas ({contrast(text, canvas):.2f}:1, above the 3:1 boundary minimum). Same height and radius as the main action so they pair.")
    if meta["mode"] == "dark":
        w("")
        w(f"On light blocks (Navy.50/.25, Light Grey, Yellow) switch to a Navy {NAVY} label and outline; white there falls to 1.04–3.47:1.")
    w("")
    w(f"### {meta['palette_name']} Tint Block")
    w("**Role:** Group a section or a set of benefits")
    w("")
    w(f"`--immersive-palette-{meta['blocks_from']}` ({block_bg}) fill with `--immersive-on-palette-{meta['blocks_from']}` ({block_fg}) text at {contrast(block_fg, block_bg):.2f}:1. Flat, no border, no shadow; step lighter for nested emphasis rather than adding opacity.")
    w("")
    w(f"### {meta['accent_name']} Accent Block")
    w("**Role:** The highlighted offer, key number or call-out")
    w("")
    w(f"`--immersive-accent-100` ({accent100}) fill with `--immersive-on-accent-100` text. Use one per screen so it keeps its pull; lighter accent steps can hold supporting copy.")
    w("")
    if "support" in t:
        sup = hex_of(t["support"]["75"]["bg"])
        w(f"### {meta['support_name']} Support Block")
        w("**Role:** Calm block for longer reading or forms on the dark canvas")
        w("")
        w(f"`--immersive-support-75` ({sup}) fill with navy text. Brings light surfaces into the navy page without leaving the theme.")
        w("")
    w("### Highlight Tag")
    w("**Role:** Small label for a feature, tier or category")
    w("")
    w("A secondary step such as `--immersive-green-25` with its `--immersive-on-green-25` text, 8px radius, 32px high with 8px side padding. Keep secondaries out of data where green or red would read as gain or loss.")
    w("")
    w("### Hero")
    w("**Role:** Opening proposition")
    w("")
    w(f"Display headline (display2 60px/70px or display3 54px/64px bold) in {name_of(t['text'])} on the canvas, a short title3 supporting line, the Main Action Button and relevant Finnomena imagery. One clear proposition, no gradient field.")
    w("")
    w("### Logo")
    w("**Role:** Brand identity")
    w("")
    w(f"The Finnomena mark from `templates/vitejs-cds/src/layout/Logo.tsx`, chosen for a {'dark' if meta['mode'] == 'dark' else 'light'} surface. Never recreate the wordmark as text.")
    w("")

    w("## Do's and Don'ts")
    w("")
    w("### Do")
    w(f"- Set `data-immersive-theme=\"{key}\"` on the page root and color every section from the `--immersive-*` properties.")
    w(f"- Pair each fill with its own `--immersive-on-*` text color; text is only White {WHITE} or Navy {NAVY}.")
    w("- Build emphasis with tint steps (100 → 75 → 50 → 25), not opacity.")
    w("- Keep one color family per background block.")
    w("- Keep IBM Plex Sans Thai for every text role and check Thai and Latin together.")
    for line in meta["do_extra"]:
        w(f"- {line}")
    w("")
    w("### Don't")
    w("- Do not use gradients inside a theme.")
    w("- Do not invent near-palette tints or new hex values; every color is a token step.")
    w("- Do not let secondary colors lead; keep them to small blocks, tags and illustrations.")
    w("- Do not use status colors as decoration; positive and negative stay semantic.")
    w("- Do not carry this theme into functional screens such as dense tables or back office tools.")
    for line in meta["dont_extra"]:
        w(f"- {line}")
    w("")

    w("## Surfaces")
    w("")
    w("| Level | Name | Value | Purpose |")
    w("|-------|------|-------|---------|")
    w(f"| 1 | Canvas | `{canvas}` | Page background |")
    level = 2
    for step in STEPS[STEPS.index(meta["blocks_from"]):]:
        w(f"| {level} | {meta['palette_name']} {step} | `{hex_of(t['palette'][step]['bg'])}` | Tint block, one step lighter |")
        level += 1
    w(f"| {level} | {meta['accent_name']} 100 | `{accent100}` | Accent block |")
    if "support" in t:
        w(f"| {level + 1} | {meta['support_name']} 75 | `{hex_of(t['support']['75']['bg'])}` | Support block for reading content |")
    w("")

    w("## Elevation")
    w("")
    w("- **None.** The tokens define no shadow (component drop shadow is 0 with a transparent color). Separate surfaces with tint steps instead of shadows or borders.")
    w("")

    w("## Imagery")
    w("")
    w("Finnomena or supplied imagery that explains the offer: product screens, people in context and colorful Finnomena illustrations, which may use the shared secondary colors. No stock imagery that contradicts the story, and no imagery, logos or copy from a reference brand.")
    w("")

    w("## Layout")
    w("")
    w(meta["layout"] + " Narrow screens stack blocks in reading order and keep the main action reachable.")
    w("")

    w("## Agent Prompt Guide")
    w("")
    w("**Quick Color Reference**")
    w(f"- text: {text} ({name_of(t['text'])})")
    w(f"- background: {canvas} (canvas), {block_bg} (tint block)")
    w(f"- accent: {accent100} ({meta['accent_name']})")
    w(f"- primary action: {action} (label {on_action})")
    w("- highlight: shared secondary steps, small blocks only")
    w("")
    w("**3-5 Example Component Prompts**")
    w("")
    w(f"1. Create a hero on the {label} theme: page root `data-immersive-theme=\"{key}\"`, display2 headline in IBM Plex Sans Thai 60px/70px weight 400 color var(--immersive-text), one supporting line at 20px/25px, and a Main Action Button.")
    w("")
    w(f"2. Create a main action: 'สมัครเลย' — 48px high, pill radius, 36px horizontal padding, background var(--immersive-action), label var(--immersive-on-action), 17px weight 500.")
    w("")
    w(f"3. Create a benefits section: three items on var(--immersive-palette-{meta['blocks_from']}) with text var(--immersive-on-palette-{meta['blocks_from']}), 24px radius, 32px padding, 16px gap, no shadow.")
    w("")
    w("4. Create an offer call-out: var(--immersive-accent-100) block with var(--immersive-on-accent-100) text, a title1 28px/34px headline and one line of body copy.")
    w("")
    w("5. Create a feature tag: var(--immersive-blue-25) fill, var(--immersive-on-blue-25) text, 8px radius, 32px high, 8px side padding, 17px weight 500.")
    w("")

    w("## Sibling Themes")
    w("")
    for o in others:
        ot = spec["themes"][o]
        w(f"- **{ot['label']}** — {THEMES[o]['tagline']} Canvas `{hex_of(ot['canvas'])}`.")
    w("")

    w("## Quick Start")
    w("")
    w("### CSS Custom Properties")
    w("")
    w("Copy the generated Immersive Themes CSS (`immersive-themes.css`) and `theme/css/theme.css` into the app; do not retype these values. For reference, the theme resolves to:")
    w("")
    w("```css")
    w(f"[data-immersive-theme=\"{key}\"] {{")
    w("  /* Colors */")
    for name, ref, token, _ in rows:
        w(f"  --immersive-{token}: {hex_of(ref)}; /* {ref} */")
    for group in ["palette", "accent"] + (["support"] if "support" in t else []):
        for step in STEPS:
            w(f"  --immersive-on-{group}-{step}: {hex_of(t[group][step]['fg'])}; /* {t[group][step]['fg']} */")
    w("}")
    w("")
    w(":root {")
    w("  /* From theme/css/theme.css */")
    w("  /* Typography: --fontFamily-<role>, --fontSize-<role>, --fontWeight-<role>, --lineHeight-<role> */")
    for role, size, weight, lh in TYPE:
        w(f"  /* {role}: {size}px / {lh}px / {weight} */")
    w("  /* Spacing: --space-0 … --space-10 (8px steps) */")
    w("  /* Radius: --borderRadius-100 (4px) … --borderRadius-800 (48px), --borderRadius-1000 (round) */")
    w("}")
    w("```")
    w("")
    w("### Tailwind v4")
    w("")
    w("```css")
    w("@theme inline {")
    w("  /* Aliases only; the values stay in the generated theme CSS */")
    w("  --color-canvas: var(--immersive-canvas);")
    w("  --color-ink: var(--immersive-text);")
    w("  --color-action: var(--immersive-action);")
    w("  --color-on-action: var(--immersive-on-action);")
    for group in ["palette", "accent"] + (["support"] if "support" in t else []):
        for step in STEPS:
            w(f"  --color-{group}-{step}: var(--immersive-{group}-{step});")
            w(f"  --color-on-{group}-{step}: var(--immersive-on-{group}-{step});")
    w("  --font-sans: 'IBM Plex Sans Thai', sans-serif;")
    for role, *_ in TYPE:
        w(f"  --text-{role}: var(--fontSize-{role});")
        w(f"  --text-{role}--line-height: var(--lineHeight-{role});")
        w(f"  --text-{role}--font-weight: var(--fontWeight-{role});")
    for key_, px, slug in RADIUS:
        w(f"  --radius-{slug}: var(--borderRadius-{key_});")
    w("}")
    w("```")
    w("")
    return "\n".join(L)


os.makedirs(out_dir, exist_ok=True)
for key in ORDER:
    path = os.path.join(out_dir, key, "DESIGN.md")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(build(key))
    print(path)
