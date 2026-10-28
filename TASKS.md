# Specification Tasks

Tasks are grouped by the current specification. Completed items describe behavior present in the code; open items are follow-up work, not a promise of an implementation date.

## Delivered

- [x] **SPEC-01** Document product goals, users, requirements, acceptance criteria, and source policy in `SPEC.md`.
- [x] **DESIGN-01** Document the static architecture, JSON entities, graph projection, layout, and interaction model in `DESIGN.md`.
- [x] **APP-01** Load city, band, person, and membership datasets in the browser.
- [x] **APP-02** Start in the full-network view and allow switching to the summary view.
- [x] **APP-03** Filter the default full overview to bands connected through shared members; allow revealing all bands.
- [x] **APP-04** Search for, select, and inspect cities, bands, and people.
- [x] **APP-05** Support wheel/button zoom and left-button drag panning without breaking click selection.
- [x] **APP-06** Distinguish active and former member nodes visually.
- [x] **DATA-01** Include the documented catalog of bands, cities, people, and memberships, with new band sources pointing to Wikipedia.

## Follow-up work

- [ ] **DATA-02** Add a repeatable data-integrity command that validates JSON, unique IDs, city references, membership references, and duplicate person-band pairs.
- [ ] **DATA-03** Audit existing band and city records for direct Wikipedia source URLs and fill missing sources where they can be verified.
- [ ] **UX-01** Decide whether the “1988–1998” header accurately describes the wider catalog; update the product spec and UI together after that decision.
- [ ] **A11Y-01** Verify graph interactions with keyboard navigation and a screen reader, and document supported behavior.

## Completion criteria for follow-up tasks

- A completed task has a corresponding code or documentation change.
- Data changes include a source URL and pass the integrity checks once DATA-02 exists.
- User-facing copy remains English.
- A change does not regress search, node selection, zoom, or drag panning.
