# Coding standards

Reviewers read this file. Mechanical rules live in `evals/skills/*.test.mjs` and `scripts/check-repository.mjs`; this file holds the judgement calls those checks cannot make.

## Evidence claims

Applies to pull request bodies, eval records and review findings.

- A claim about rendered UI names what was measured: the element, by its label or selector, and the viewport width, color scheme and state it was seen in. "`+ Add Column` renders white on navy at 375px in light mode" is a claim; "buttons look right on mobile" is not.
- A causal claim ("X causes Y", "this fixes Z") cites the file and line, or the measured value, that shows the mechanism. Without one, state the observation and mark the cause unverified.
- A claim covers what was checked and no more. One dialog checked is one dialog; one sample is reported as one sample; a check that could not run is reported as blocked.
