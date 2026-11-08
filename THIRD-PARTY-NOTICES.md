# UI source attributions

The following components were adapted from source supplied by the user. Their original author comments are retained in the source files.

- `src/components/HoldButton.jsx` and `HoldButton.css`: React Bits HoldButton. Adaptations: Turkish labels, accessible click-to-confirm alternative, focus/disable/Escape cancellation, async deletion wrapper and StudyOS theme colors.
- `src/components/LiquidNavbar.tsx`: Nimbus UI Liquid Navbar “Waterline”, by guglielmogiannattasio.it. Source reference: https://21st.dev/r/gughigug/liquid-glass-navbar . Adaptations: StudyOS routes, Turkish navigation label, reduced-motion fallback, graphics-resource cleanup and layout integration. Attribution does not imply the navigation source has the same license as the engine below.
- `src/components/GlassLogo.tsx`: 21st.dev Liquid Glass Logo Reveal, source reference https://21st.dev/r/shepovalovdenis/liquid-glass-logo-reveal . Original source identifies the shader and spring timeline as ported from https://github.com/zanwei/glass-icon-reveal . Adaptations: local StudyOS SVG, bounded startup timing, theme integration and static fallback on rendering failure.

## Glass-icon-reveal engine — MIT License

The adjustable glass material controls and surface composition in `src/glass.ts`, `src/glass-workspace.css` and `src/components/GlassControls.tsx` were adapted for StudyOS from the user-supplied Adjustable Glass Dashboard reference by troyjlorents-gh: https://21st.dev/r/troyjlorents-gh/adjustable-glass-dashboard . Its finance sample data, sidebar, navigation and GSAP animations are not included.

Copyright (c) 2026 Zanwei Guo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Interactive card reference

`src/components/SpotlightCard.tsx` and `spotlight-card.css` adapt the interaction concept from the user-supplied InteractiveTravelCard by kavikatiyar: https://21st.dev/r/kavikatiyar/3d-card . StudyOS uses local lesson content, theme-aware color surfaces, pointer spotlight, reduced tilt, keyboard focus and reduced-motion support. The travel sample image and external destination are not included. No additional animation dependency was added.
