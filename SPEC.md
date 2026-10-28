# Product Specification: Grunge Network

**Status:** Current implementation documented  
**Last updated:** 2026-10-28

## 1. Purpose

Grunge Network is a static, browser-based explorer for relationships among bands, people, and cities connected to grunge and adjacent alternative rock. Users can browse a graph, focus on a node, search the catalog, and follow shared musicians between bands.

## 2. Goals

- Make relationships among cities, bands, and musicians visible as an interactive graph.
- Make shared musicians useful for discovering connections between otherwise separate bands.
- Keep the site deployable as static files, including on GitHub Pages, without a backend or build step.
- Keep the interface and all user-facing text in English.

## 3. Users and primary scenarios

1. A visitor opens the page and explores the connected network.
2. A visitor selects a city, band, or person to see its immediate relationships.
3. A visitor searches for a name and selects a result, including an item hidden from the default overview.
4. A visitor zooms and pans to inspect a dense part of the graph.
5. A visitor switches between the full network and the summary view, or reveals bands excluded from the connected overview.

## 4. Functional requirements

### FR-01: Load the catalog

On startup, fetch `people.json`, `bands.json`, `cities.json`, and `memberships.json` from `data/`. Render after all four files load. If a fetch or parse fails, show a readable error in the detail panel.

### FR-02: Default network view

Open in the full network view. It contains city, band, and person nodes, with city-to-band and band-to-person edges.

### FR-03: Connected-band overview

In the default full overview, include a band when at least one of its members also belongs to another band in the catalog. The shared person creates the connection between those bands. Include the people associated with the visible bands and the cities of those bands. This filters out bands without a shared-member link and avoids leaving their members as orphan nodes.

### FR-04: Show all bands

The full overview provides a **Show all bands** control. It reveals bands without shared-member links and their associated member nodes. The control changes to **Hide unconnected bands** while that option is enabled. The control is shown in the full overview, not while a node is selected.

### FR-05: Summary view

The user can switch to a summary view that shows cities and all bands without person nodes. The user can return to the full network at any time.

### FR-06: Select and explore nodes

- Selecting a **city** shows its bands and city-to-band connections.
- Selecting a **band** shows its city, members, roles, and membership status.
- Selecting a **person** shows their bands and the cities associated with those bands.
- A selected node and its immediate neighbors are emphasized; unrelated nodes are visually dimmed where applicable.
- Keyboard users can focus a node and activate it with Enter or Space.

### FR-07: Search

Search matches city, band, and person names. Selecting a result focuses that item even if the item is not in the current overview filter.

### FR-08: Zoom and pan

- The mouse wheel zooms around the pointer position.
- Zoom-in, zoom-out, and fit controls are available.
- Holding the left mouse button and dragging pans the graph.
- A click selects a node; movement past the drag threshold pans and must not select the node beneath the pointer.

### FR-09: Member status

Memberships marked `current` are visually emphasized. Memberships marked `former` are gray and italicized. A person's status is specific to that band relationship.

### FR-10: Responsive and accessible interface

The sidebar and graph adapt to narrower screens. The graph has an accessible label, nodes expose names and button semantics, and keyboard activation is supported.

## 5. Data and source requirements

- Wikipedia is the project's required reference source for band, member, city-of-origin, role, and date facts.
- New or materially updated band records should include a direct Wikipedia URL in their `source` property. Use the corresponding band article for roster and timeline facts; use a person article only when it supports a person-specific fact.
- Do not infer a relationship from a band's genre or location alone. A member-to-band relationship must be supported by the reference source.
- `null` for a membership or band's `to` year means ongoing/present in the UI.
- Record known inactive periods in `periods` when a band's history is discontinuous and the detail view needs to communicate those periods.

## 6. Non-functional requirements

- The app remains static HTML, CSS, JavaScript, and JSON with no server-side runtime.
- The graph is usable with the current catalog size and does not require an external graph service.
- Graph construction must be safe for static hosting and must not execute data as HTML.
- No analytics, accounts, or user data storage are required.

## 7. Acceptance criteria

- A fresh load starts in the full network view.
- Bands without shared-member links are absent from the default full overview; **Show all bands** reveals them, and the control can hide them again.
- Summary and full views remain switchable.
- Search and node selection continue to work for all catalog entries, including hidden overview entries.
- Wheel zoom and left-button drag pan both work, and an ordinary click still selects a node.
- All IDs referenced by bands and memberships resolve to an existing city, band, or person.
- User-facing text remains in English.

## 8. Known product question

The page header says “1988–1998”, while the catalog includes bands and careers outside that date range. Decide whether that label describes the genre focus or should be updated to describe the broader catalog. Do not change it without an explicit product decision.
