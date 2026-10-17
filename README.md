# Beyond the water bottle: center-of-gravity physics

A six-tab, interactive physics explainer that starts with a draining cylindrical water bottle and develops a general theory of changing weighted averages.

**GitHub Pages target:** https://az9713.github.io/beyond-waterbottle-CG-physics/

The URL becomes live after the repository is pushed and GitHub Pages finishes building. Local files alone do not activate it.

## Chapters

1. **Full mathematics** — continuous mass moments, endpoints, derivative identity, uniqueness, convexity, dimensionless limits, and a separate drinking-rate model.
2. **Intuition** — endpoint argument, vanishing ballast, the half-full test, a marginal-layer interpretation, and a symmetry analysis: axial rotations, horizontal reflection, complementary-fill moment symmetry, and why the normalized CG curve is not symmetric. Direct link: [Symmetry argument](https://az9713.github.io/beyond-waterbottle-CG-physics/#symmetry).
3. **Real-world effects** — nonuniform cross-section, air, retained films and droplets, moving shell mass, fixed and changing tilt, capillarity, a reduced slosh model, and the full fluid equations and boundary conditions.
4. **Shared framework** — thermal mixing, capacitor charge sharing, inelastic momentum capture, and solute mixing; exact dimensionless collapse under matching input protocols.
5. **Unknown unknowns** — singular limits, reference frames, system boundaries, stability, inverse identification, noisy measurements, and the limits of analogies.
6. **Next explorations** — experiments, geometry computation, system identification, and an AI-agent scientific reasoning benchmark; primary references with attribution scope.

## Use it

Open `index.html` directly, or serve the folder:

```powershell
python -m http.server 8000
```

Then open http://localhost:8000. The app has no runtime network dependencies: KaTeX, its equation-rendering script, and WOFF2 fonts are bundled in `vendor/katex/`. Source links naturally require internet access. No account, backend, build tool, or package installation is required to read the site.

For a **single downloadable file**, open `standalone.html`. It embeds all scripts, styles, equations, and fonts and also works offline. `index.html` uses the companion local files to keep the hosted edition smaller.

Controls change fill, bottle/full-water mass ratio, empty-bottle CG, and (in the real-world tab) area slope. Play empties at constant mass rate; switching chapters pauses it. CSV exports 1,001 computed states. The family plot can toggle four independently evaluated dimensional analogues. Tabs support arrow keys, Home/End, deep links, and direct source-reference navigation. Print includes all chapters and expands the conceptual notes.

## The central result

For shell mass `M`, shell CG height `b`, water density `rho`, cylindrical cross-section `A`, and remaining depth `h`:

```text
z(h) = (M b + rho A h² / 2) / (M + rho A h)
dz/dh = rho A (h - z) / (M + rho A h)
```

The minimum occurs when the surface passes through the combined CG. With `M / full_water_mass = 1/8` and `b/H = 1/2`, the minimum has 25% of the water remaining and `z/H = 1/4`.

The vertical-slice uniqueness theorem extends to any fixed rigid orientation under a single bottom-filled horizontal free surface. A fixed tilt alone does **not** eliminate the unique vertical minimum. A changing orientation can change the observed trajectory. The detailed assumptions are included next to the proofs.

## Rebuild and test

The checked-in `index.html` is ready to serve. Its long-form content is maintained in `build_content.py`:

```powershell
python build_content.py
python scripts/build_standalone.py
node tests/physics.test.cjs
```

Numerical checks cover endpoints, exact turning points, boundary cases, inversion of volume to depth, the derivative identity over different geometries, independent numerical quadrature, and dimensional collapse. `tests/browser.test.cjs` starts its own local server and performs browser interaction, math rendering, offline-resource, mobile layout, CSV, deep-link, and print checks when Playwright is installed:

```powershell
npm install
npx playwright install chromium
node tests/browser.test.cjs
```

## Publish with the GitHub CLI

Run in the project folder with `gh`, `git`, and GitHub authentication available:

```powershell
gh auth login
.\scripts\publish.ps1
```

The script creates the requested public repository if absent, commits the project, pushes `main` without force, and configures Pages to publish the root of `main`. It refuses to overwrite an existing different local remote. It does not grant itself credentials. The Bash counterpart is `bash scripts/publish.sh`.

If an existing repository has conflicting history, the ordinary push fails rather than overwriting it. Reconcile that history before retrying. Repository permissions must allow creation/push and Pages configuration. Review deployment with:

```powershell
gh api repos/az9713/beyond-waterbottle-CG-physics/pages
gh api repos/az9713/beyond-waterbottle-CG-physics/pages/builds/latest
```

## Scientific scope and provenance

All app diagrams and curves are deterministic computed models, not measured data. The slosh oscillator is illustrative, with unspecified geometry-dependent parameters; no CFD, capillary interface, or fluid–structure solver is implemented. Standard laws are linked to primary OpenStax and NASA material. Derived claims and recommended experiments are identified as calculations or proposals.

`assets/design-concept-generated.png` is an **AI-generated UI design reference, not a scientific figure or screenshot of the finished application**. Its plotted geometry and labels are illustrative. It is not displayed by the application; the implemented charts use the tested mathematical models.

This repository contains the educational artifact, not the private conversation archive. No personal profile, private transcript, credentials, or unrelated workspace files are included.

## Files

| Path | Purpose |
|---|---|
| `index.html` | Ready-to-read six-tab app |
| `standalone.html` | Self-contained offline edition |
| `build_content.py` | Editable chapter content and static HTML generator |
| `physics.js` | Pure dimensionless physical models |
| `app.js` | Interactive SVG plots, controls, tabs, CSV and print behavior |
| `style.css` | Responsive dark design and print styling |
| `tests/` | Numerical and browser verification |
| `scripts/publish.ps1`, `scripts/publish.sh` | GitHub CLI publication |
| `vendor/katex/` | Locally bundled KaTeX 0.16.11, fonts, MIT license |

Original project code and educational text are provided under the MIT license. Third-party KaTeX retains its own included MIT license. Linked external references retain their respective licenses.
