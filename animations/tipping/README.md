# Computed bottle-stability animations

Two silent, 10-second, 1280 × 720, 24 fps films are rendered with **HyperFrames 0.8.169**, using the same original physics and SVG rendering functions as the interactive lab. No AI-generated scientific imagery is used.

- `tilt/index.html`: a prescribed quarter-full tilt compares immobilized water with a horizontal, freely settled water surface. The liquid volume and centroids use 3D circular sections; the drawing is a central section. It does not simulate falling, slosh, or spilling.
- `criteria/index.html`: a fill sweep compares critical angle, energy barrier, fixed-height impulse, and initial angular-speed thresholds for the explicit rigid-payload reference. Each bar is divided by its own maximum over fill, and physical units remain visible.

## Reproduce on Windows / PowerShell

Node.js 22 or later and FFmpeg are required. The CLI discovers/downloads a rendering browser; `HYPERFRAMES_BROWSER_PATH` can specify an existing compatible Chrome. Local rendering requires no hosted render login.

```powershell
# From the repository root; compositions and local assets are already included.
npx --yes hyperframes@0.8.169 lint animations/tipping/tilt
npx --yes hyperframes@0.8.169 lint animations/tipping/criteria
npx --yes hyperframes@0.8.169 preview animations/tipping/tilt
# Stop preview with Ctrl+C when finished, then render:
npx --yes hyperframes@0.8.169 render animations/tipping/tilt --output assets/tilt-comparison.mp4 --fps 24 --workers 1 --strict
npx --yes hyperframes@0.8.169 render animations/tipping/criteria --output assets/criteria-sweep.mp4 --fps 24 --workers 1 --strict
```

The paused GSAP timeline is sought frame by frame. Both films use finite composition durations and deterministic state functions; they do not depend on wall-clock time, network requests, or random inputs. Scene source can also be inspected in a browser, although playback is owned by HyperFrames.

To regenerate composition HTML after changing the shared model or renderer, install GSAP 3.14.2 in a sibling `hyperframes-runtime` directory and run `python scripts/build_stability_films.py`. The generator copies the installed GSAP browser file and the locally bundled KaTeX SansSerif font. GSAP's license is in `GSAP-LICENSE.txt`; the font uses the license in `vendor/katex/LICENSE` at the repository root.

## Verification and scope

- Both final projects lint with zero errors and zero warnings.
- Renders use screenshot capture with software GPU in the build environment. Final MP4s, posters, and English caption tracks are under `assets/` at the repository root.
- Frames at beginning, middle, and end are inspected; media duration/frame count and deterministic motion are checked.
- Independent axial versus transverse integrations verify water volume and first moments. Exact unclipped free-surface formulas verify the energy correction and torque identity.
- `hyperframes usage --json` returned `status: unknown`, reason `no_subscription_login`; no hosted credits or subscription allowance is assumed. The films were rendered locally.

Documentation: https://hyperframes.heygen.com/packages/cli and https://github.com/heygen-com/hyperframes .
