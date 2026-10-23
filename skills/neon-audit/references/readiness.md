# Readiness and handoff

Read before reporting a finished implementation or restyle. It decides whether the employee may ship the result themselves or must hand it to engineering. Review-only work skips this.

## Classify the work

| Work type | Examples | Readiness |
| --- | --- | --- |
| Campaign page | Campaign, landing, event, recruiting or education page | Ship-ready only when every condition below holds; otherwise Brand-ready |
| Back office | Internal management, approval or reporting screen | Brand-ready |
| Product feature | New functionality in a Finnomena product | Brand-ready |

A campaign page is **Ship-ready** only when it:

1. contains no investment content (see below);
2. collects no personal data, or sends it only to a company form service the employee names as already approved for public pages;
3. passes the ship-ready checklist.

Everything else is **Brand-ready**: the UI follows Finnomena branding, and an engineer reviews it before real users rely on it. Record the result in `NeonContext.workType` and `NeonContext.readiness`.

## Investment content

Investment content is anything that mentions an investment product or its returns: fund, stock, bond or portfolio names, performance or yield figures, return percentages, fees, investment promotions, or wording such as "ลงทุน", "ผลตอบแทน" or "กองทุน". Infer it from the brief and page copy. Ask one question only when the evidence is mixed. When still unsure, treat the page as containing investment content.

For such a page, add a clearly labeled placeholder where the compliance-approved risk disclaimer belongs, mark the page Brand-ready, and say it needs compliance review. Do not draft regulatory wording, invent performance figures or soften a claim to avoid review.

## Personal data

A registration, lead or contact form collects personal data. Ask which approved company form service receives it. Without one, do not invent an endpoint or store submissions: link the action to an external page the employee supplies, or leave a visibly labeled placeholder action, and mark the page Brand-ready.

## Ship-ready checklist

Report each item as passed, failed or unverified:

- production build succeeds and produces static output;
- no mock data, demo labels, placeholder copy or placeholder links remain;
- every action reaches a real destination;
- page title, description and share image are set and contain no source-brand names;
- Brand Floor holds when a reference design was used ([reference design checks](reference-design.md#verify));
- the page works at 375px and 1440px with no console errors.

Stop at the build output and this checklist. Deployment uses the company's existing publishing channel; do not deploy or create hosting accounts.

## Handoff Summary

For Brand-ready work, include a Handoff Summary in the final report. Also write it to `NEON-HANDOFF.md` at the project root for a new screen, feature, page or rebuild; for an in-place restyle, update that file only if it already exists, so a colors-only or partial change adds no new file. It contains:

- what was built or restyled, the path (Restyle, Rebuild or new build) and tier;
- Brand Intensity and reference design, if any;
- what is mocked and which services, authentication or permissions need wiring;
- investment content or personal-data flags awaiting review;
- checks performed and checks left unverified.

When the work lives in a Finnomena product repository, offer to open a draft pull request with the summary as its description; push or open it only after the employee agrees.
