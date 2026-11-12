---
name: neon-block
description: Use when an employee asks for Finnomena Brand Artwork as an image file, such as an ad, a social post or story, a cover, a closing frame or a Pattern background, drawn by the Block engine as SVG and PNG. Applies to explicit invocation and established Finnomena intent. Use neon-create for app screens and web pages, including a Campaign Page and its Brand Pattern.
---

# Draw Finnomena Brand Artwork

## Purpose

Turn a spoken request into Brand Artwork: a Pattern alone, or one Page with a headline and the logo. You read the request and choose the settings; the Block engine draws. Every Pattern, colour and letter in the result comes from the engine, so the artwork stays inside the brand guideline.

## When to use

Use for a single picture the employee will post, print or place in another file. This release draws one Page without photos in four layouts. A deck, a proposal, a photo layout or an animated piece is outside it: say so, and offer the Pages it can draw (a cover, a headline frame, a closing frame) for the employee to assemble.

## Tools

The engine is reached through three tools named `options`, `candidates` and `render`, served by `finno`. Where your tool list has them, call them. Where it does not, run the same tools from a terminal with the same settings as flags and `--json` for the answer:

```
node <Neon root>/scripts/finno.mjs candidates --format story-9-16 --layout headline --headline "Invest [every month]" --json
```

The Neon root is two levels above this skill's real directory. Run the command from the employee's working directory, where the files are written to `./finnomena-artwork/`. The command needs Node 20.15 or later; if neither route works, report that and stop, since artwork drawn any other way is not Brand Artwork.

## Workflow

1. Settle three things from the request, asking only for what is missing: where the artwork will be used, the exact words on it, and the feeling. Use the employee's words as given, in Thai or English. Where they gave none and the piece needs words, propose a headline and get their yes before drawing.
2. Call `options` once and choose every setting from its answer:

   | Setting | Choose by |
   | --- | --- |
   | Format | Where it is used: a feed post is `square` or `portrait-4-5`, a story or reel is `story-9-16`, a slide or screen is `screen-16-9`, print is `a4-portrait` or `a4-landscape`, a link preview is `link-1-91`. Any other size is `width` and `height` in px. |
   | Layout | `headline` for an ad or post with words, `cover` for the front of a document or deck (it also takes a short `label`), `closing` for a sign-off, `pattern` for a background with no words. |
   | Colourway | The primary group (navy, grey, white with yellow) unless the employee names a colour or the piece belongs to a product with a secondary colour. |
   | Slope | `half` by default, `75` for growth and momentum, `flat` for calm and stability. |

   Mark the words the headline turns on with [square brackets] to Highlight them, within the limit `options` states.
3. Call `candidates` with those settings and show the employee the numbered sheet it returns. Ask which number they want. For twelve more, call it again without `set`. When the employee asked for a single result with no choosing, pick the Candidate whose blocks leave the headline clearest and say which you picked.
4. Call `render` with the same settings plus the `set` and the `pick`. A change of words or Colourway keeps the picked Pattern: render again with the same `set` and `pick`. A change of Format, layout or Slope draws different Patterns, so return to step 3.
5. Look at the preview `render` returns before reporting. Text that is clipped, crowded by blocks or hard to read is fixed by another Candidate, a shorter headline or another Colourway, then rendered again.
6. To place the artwork in Figma, Slides or a document, use the connector the employee already has for that product and give it the SVG, which stays vector. Without one, hand over the file paths.

## Reading the answer

- **Refused**: the engine refuses a setting outside the guideline and says why. Choose again from `options`; the refusal is the guideline speaking, so it is settled by a different choice, never by another route to the same result.
- **Warnings**: relay each one in plain words. `finno.plexTypeface` means the Finnomena Trek font files are absent from this computer, so the text is in IBM Plex Sans Thai: the artwork is a draft for review, and the final is drawn once the employee sets `FINNO_FONTS_DIR` to the directory that holds the Trek files.
- **Open in Block**: the link opens the same artwork in Block's web app, where a designer can adjust it by hand.

## Done

Report the three file paths (SVG, PNG and the Document it was drawn from), the Format, layout and Colourway used, the Candidate picked, every warning, and the Open in Block link. Artwork that names an investment product or its returns is Investment Content: say it needs compliance review before it is published.
