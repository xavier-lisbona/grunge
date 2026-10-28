# Technical Design: Grunge Network

**Status:** Describes the current implementation  
**Last updated:** 2026-10-28

## 1. System shape

The app is a static client-side site. `index.html` loads one stylesheet, one JavaScript file, and four JSON datasets. The browser fetches the data, derives a graph for the current view, lays out the nodes, and renders the result as SVG. GitHub Pages can serve the project without a backend or compilation step.

```text
index.html
  ├── css/style.css
  ├── js/app.js ── fetches ── data/{people,bands,cities,memberships}.json
  └── SVG graph + sidebar controls
```

## 2. Data model

The JSON files are the source of truth. The graph itself is derived in the browser.

### City (`data/cities.json`)

```json
{"id":"seattle","name":"Seattle","country":"United States"}
```

A city is a band's recorded city of origin. Some records may include a `source` URL.

### Band (`data/bands.json`)

```json
{"id":"pearl-jam","name":"Pearl Jam","city":"seattle","from":1990,"to":null}
```

`city` references a city ID. `from` and `to` describe the overall span. `to: null` means ongoing. `periods` represents a discontinuous timeline. A direct Wikipedia URL belongs in `source` for new or updated records.

### Person (`data/people.json`)

```json
{"id":"eddie-vedder","name":"Eddie Vedder"}
```

A person is a reusable node shared across all band relationships.

### Membership (`data/memberships.json`)

```json
{"person":"eddie-vedder","band":"pearl-jam","from":1990,"to":null,"status":"current","role":"vocals"}
```

Each record joins one person to one band. `status` is `current` or `former`; `role` is presentation text. The same person can have memberships in multiple bands, which is how the overview derives band-to-band connections.

### Integrity rules

- IDs are unique within each entity file.
- Every band's `city` resolves to a city ID.
- Every membership's `person` and `band` resolve to existing IDs.
- A person-band pair appears at most once; represent timeline nuance in that record rather than duplicating the edge.
- Dates use four-digit years; `null` represents an ongoing relationship.

## 3. View construction

`context()` selects one graph projection:

- No selected node: `overview(fullGraph)` builds the full or summary view.
- City selected: show that city and its bands.
- Band selected: show the band's city, band node, and members.
- Person selected: show the person's bands, those bands' cities, and the person.

For the connected full overview, `overview()` counts memberships by person. A band is considered connected when one of its members has a membership in at least one other band. The connected set is built from the shared-person links. With **Show all bands** enabled, every band and its member relationships are included. The summary view includes all bands and omits people.

## 4. Layout and SVG rendering

`layout(nodes, edges)` assigns city positions, places bands in circular groups around their cities, and places people around related nodes. A fixed number of pairwise relaxation passes push overlapping nodes apart. The selected-band layout places the city and band at separate anchors and distributes members around the band.

`render()` derives the current context, builds SVG edge and node groups, applies styling classes for node type and membership status, applies the current `viewBox`, and refreshes search results. SVG labels are created as text nodes rather than HTML strings.

Node radii and visual classes are determined by type and selection state. Cities are purple, bands teal, people muted gray, active members highlighted, and former members subdued.

## 5. Interaction state

State lives in `js/app.js`: loaded datasets, selected node, current view mode, all-bands toggle, zoom, graph viewport center, and pointer-pan state. State is in memory only and resets on page reload.

- The wheel handler zooms at the pointer.
- Toolbar buttons change zoom or reset it to fit.
- Pointer events start pan tracking on left-button down; pointer capture begins only after the drag threshold is crossed. This preserves node clicks while allowing a drag to continue outside the initial node.
- The selection click handler is suppressed after a drag.
- Search selection uses the same `select()` path as graph-node activation.

## 6. Error handling and security

Data fetch or JSON parse failures are caught by the load promise and shown in the details panel. Names and detail strings are assigned with `textContent` or SVG text nodes. Do not insert dataset content through `innerHTML`.

## 7. Deployment and maintenance

The repository can be hosted as static files. There is no package manager, build command, or configured automated test suite. After changing JavaScript or CSS, update the query-string asset version in `index.html` to avoid stale browser caches. Validate JSON syntax and all foreign-key references when changing datasets.

## 8. Current constraints

- Layout uses hand-written deterministic heuristics rather than a graph-layout library.
- Large graphs can become dense; overview filtering and zoom/pan are the primary navigation aids.
- Search and overview filters do not persist across reloads.
- The data schema supports sources, but older dataset entries may not yet include an inline `source` field.
