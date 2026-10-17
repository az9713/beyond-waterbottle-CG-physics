# Design and verification

## Design reference

`assets/design-concept-generated.png` is a generated UI mockup, explicitly **not scientific evidence**. The design brief specified a dark educational app, six chapter tabs, a 30/70 controls-to-plot split, a bottle schematic, three key metrics, and flowing derivations. The accepted palette is navy `#0b1220`, cyan `#38bdf8`, and amber `#fbbf24`, with muted blue-gray supporting text and restrained borders.

The design was inspected as an image before implementation. The rendered implementation was inspected with `view_image` after browser capture. This is a static HTML/CSS/JavaScript deliverable; the plotted mathematics, controls, and diagrams are native code, not screenshots.

## Fidelity ledger

| Item | Design reference | Implementation and decision |
|---|---|---|
| Title and chapter navigation | Cyan title, serif subtitle, six numbered tabs | Matched copy and hierarchy; horizontal scrolling on mobile |
| Layout | Left controls and bottle; right plot and metrics | Matched desktop two-column relationship; stacked on mobile |
| Palette | Dark navy, cyan curves, amber CG | Matched tokens; fixed initially low-contrast schematic labels |
| Controls | Sliders, play, reset | Functional controls plus a purposeful CSV download |
| Typography | Clear sans controls, editorial subtitle, rendered equations | Explicit system typography and locally bundled KaTeX |
| Scientific plot | Illustrative fill-axis concept | Intentional correction: use fraction consumed for the emptying plot; render computed curve and correctly positioned minimum |
| Chart range | Concept range focused on the dip | Intentional full-height range so the water-surface line and arbitrary shell CG remain visible |
| Content | Opening derivation preview | Added the required chapter heading, full scholarly treatment, and scoped source links |

Above-the-fold copy matches the user's requested structure and the concept brief. Additional text explains actual interactive state and necessary assumptions. No invented metrics, marketing claims, decorative labels, or generic illustrative source imagery were added.

## Verification method

The connected Browser plugin reported that it required an originating browser context. The cloud browser could not reach the local server. Playwright with Chromium was therefore used for rendered and interaction checks. Standard Playwright browser download failed; an npm-distributed Chromium executable was used for the test runtime only, outside this repository.

Desktop and mobile rendering, all six tabs, local equation/font loading, sliders, playback, CSV export, shape changes, independent dimensional curves, source deep links, keyboard navigation, and print visibility are covered by `tests/browser.test.cjs`. Numerical checks in `tests/physics.test.cjs` include independent quadrature and finite-difference derivatives. Tests require zero external page-load requests and zero browser script errors.

Intentional scope limits: the app implements cylinder and analytic varying-area static models, plus the shared balance equations. Tilt geometry, capillary free surfaces, the reduced slosh oscillator, and Navier–Stokes are derived or formulated in the text; their solvers are not implemented. The displayed data are model predictions, never experimental observations.
