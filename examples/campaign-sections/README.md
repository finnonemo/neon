# Campaign sections

A partially reviewed example: composition and interaction behavior approved on 2026-11-24. Color mapping, typography, the Brand Pattern picks and the copy are not approved. It shows a Campaign Page in four sections, in [CampaignSections.tsx](CampaignSections.tsx), for someone deciding whether to take an offer. Use it as a reference for the order and shape of the sections, not as a template to copy: the class and its facts are synthetic.

## Which composition, and why

| Section | Composition | Why |
| --- | --- | --- |
| Proposition | Name, date, three short facts and the action, with the picture beside them (below them on a phone) | The first screen answers what it is, when, and what to do. |
| Benefits | One figure with a Pattern on one side, three short benefits on the other, on a tinted ground | Three things to take away read as a list, not as three equal cards. |
| Questions | The questions in an accordion, the heading and a Pattern on the opposite side from the section above | Answers stay out of the way until asked for. The flip keeps two neighbours from sharing a composition. |
| Terms and booking | The terms, then the acceptance and the action, on the accent ground | The terms are read beside the control that accepts them. |

The hero's action goes to the booking section. Booking without acceptance names what is missing and moves focus to the checkbox; booking replaces the form with its result and moves focus to that heading.

Finnomena shows in the Club theme, the shell's logo and the four Pattern files beside the source, drawn by the Block engine in the `white__yellow-100` Colourway. Each is drawn whole: never cropped or stretched. There is no motion.

## What can vary

The theme, the picture, the number of questions and the facts. Draw Patterns in the Colourway of the campaign's own theme, at the size of the box that holds them. The hero's photo is a marked slot (`[ภาพ: …]`): a real page puts its own photo there. The order (proposition, benefits, questions, terms with the action) doesn't vary.

## Verified

At 375, 768, 1024 and 1440:

- The page never scrolls sideways, and the hero's action is inside the first screen.
- No section heading takes more than two lines.
- Every Pattern keeps its file's ratio.
- The answer opens, the missing acceptance is announced and focused, and the booked heading takes focus, all from the keyboard controls themselves.
- Axe finds no WCAG 2.2 AA violation at the start, with the error and once booked.

Not verified: the other Immersive Themes, and a Tab-only pass through the page.
