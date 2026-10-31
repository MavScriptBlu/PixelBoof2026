# PixelBoof — Zero-Emoji 8-Bit SVG Icon System, Centered Press Start Button, Chiptune Audio & Mobile Viewport Polish

Upgrade PixelBoof's visual and tactile craft by eliminating every OS emoji across the entire photobooth in favor of custom 8-bit pixel and geometric SVG icons, fixing the vertical and horizontal alignment of the `PRESS START` play triangle on the homepage, and pairing full Web Audio chiptune sound effects with mobile-first touch ergonomics.

### User Review & Critical Decisions

> [!IMPORTANT]
> This plan reflects your confirmed preferences from our design alignment questions:

- **Confirmed Decision 1 — Zero Emojis Across the App & Refined MSTC IT Header Badge**:
  - Remove all Unicode emojis (`📷`, `🎟️`, `🖼️`, `🔄`, `⬇️`, `✨`, `🪄`, `🎨`, `🕹️`, `❓`, `✏️`, etc.) from buttons, lens drawers, category tabs, modals, empty states, toasts, and header badges.
  - Replace them with a unified **8-Bit Pixel & Geometric SVG Icon System** rendered on a crisp pixel grid (`shape-rendering="crispEdges"`) that matches the retro arcade aesthetic, including a clean geometric pixel emblem inside the `MSTC IT` header badge.
- **Confirmed Decision 2 — Centered 8-Bit Pixel Play Triangle Inline with `PRESS START`**:
  - Replace the misaligned Unicode `▶` character in the homepage start button with a custom stepped 8-bit pixel play triangle SVG (`14×14px` viewBox).
  - Align the SVG icon and `PRESS START` text using a single flex row (`inline-flex items-center justify-center gap-2.5 leading-none`) with optical baseline compensation for the `Press Start 2P` bitmap font so the play icon and text sit dead-center horizontally and vertically.
- **Confirmed Decision 3 — 8-Bit Chiptune Sound Effects & Mobile-First Viewport Polish**:
  - Wire Web Audio API 8-bit sound effects across interactive controls (menu/button blips, lens selection chimes, mechanical arcade shutter snap, queue confirmation tone, and C-major level-complete arpeggio on sticker completion), plus a header sound toggle so kiosk helpers or attendees can mute/unmute audio anytime.
  - Enforce mobile-first touch ergonomics: $\ge 44\times44\text{px}$ touch targets, `100dvh` zero-scroll camera framing, safe-area inset support (`env(safe-area-inset-bottom)`), and clean visual hierarchy without visual clutter.

---

### 1. Overview & Core Concept

- **What It Does**: Transforms PixelBoof into a cohesive, authentic 16-bit arcade photobooth where every icon, badge, button, and sound effect is custom-crafted on a pixel grid rather than relying on mismatched system emojis.
- **Target Audience / Persona**: High school students on personal smartphones (375px–430px viewports) and booth helpers operating Mid-State Technical College kiosk computers.
- **Key Value**: Eliminates the inconsistent, out-of-place look of OS emojis and baseline-shifted Unicode symbols, replacing them with razor-sharp arcade iconography, responsive touch hitboxes, and nostalgic chiptune audio feedback.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Header & Brand Identity (`MSTC IT` Badge + Action Bar)**:
     - The upper-left `MSTC IT` badge features a crisp geometric pixel microchip/monitor SVG emblem (no cartoon robot face or emoji) paired with `MSTC IT` and `PIXEL BOOF` typography.
     - Header action buttons (`DOWNLOAD BATCH`, `STICKERS: X/3`, `GALLERY / CAMERA`, `NEXT ATTENDEE`, and a new `SOUND ON/OFF` toggle) use crisp 8-bit pixel SVG icons (download arrow, ticket stub, photo frame, camera lens, reset arrows, speaker icon) aligned inline with `Press Start 2P` labels.
  2. **Homepage (`PRESS START` Screen)**:
     - Displays the `PIXEL BOOF` hero title, the primary CTA button containing a custom stepped 8-bit pixel play triangle SVG centered inline with `PRESS START`, and the pixel-bordered privacy notice (`Note: No images are saved; data is erased immediately upon page refresh.`).
     - Tapping `PRESS START` triggers an 8-bit arcade start blip and launches the live camera viewport.
  3. **Live Camera Stage & Pop-Up Lens Drawer**:
     - Floating camera utility buttons (`Flip`, `Upload`) and the bottom camera dock (`Active Lens`, `Arcade Shutter`, inline sticker thumbnails) use crisp pixel SVG icons with $\ge 44\times44\text{px}$ tap hitboxes.
     - Opening the **Lens Drawer** displays category deck tabs (`Arcade Classics`, `Fantasy & RPG`, `Sci-Fi & Action`, `Fursona & Mascots`, `Cards & Toons`, `Pride & Duos`), `Surprise Random Lens`, and `Custom Prompt` with geometric pixel SVG emblems instead of emojis.
  4. **Focused Sticker Modal, Gallery & Sticker Queue**:
     - Sticker inspection actions (`Save for Sticker`, `In Sticker Queue`, `Edit Sticker`, `Show Sticker / Compare Photo`, `PNG`, `Share`) and the Sticker Queue modal (`Send to Gmail`, `Kiosk ZIP Download`, `Clear`) use pixel SVG icons and play subtle 8-bit audio cues on interaction.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Authentic 16-bit Arcade Cabinet UI with Mid-State Maroon (`#9f1239`), Arcade Gold (`#facc15`), Electric Sky (`#38bdf8`), and CRT Obsidian (`#0b0e17`).
  - *Typography & Icon Alignment*: `Press Start 2P` (`pixel-font`) paired with `shape-rendering="crispEdges"` SVG icons inside `inline-flex items-center justify-center gap-2 leading-none` containers so icons never sit above or below the bitmap text baseline.
  - *Mobile Spatial Budget*:
    - Top Header Bar: Compact (`48px–54px`) with icon-consistent buttons.
    - Camera Viewport Stage: `80%+` of `100dvh` with zero vertical page scroll.
    - Bottom Camera Dock: `68px–76px` with safe-area bottom padding and thumb-friendly controls.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified `PixelIcon` SVG Component Over Unicode Emojis**
  - *Chosen Approach*: Build a dedicated `PixelIcon` SVG registry using stepped rectilinear paths (`shape-rendering="crispEdges"`) for all UI actions and category themes, completely removing emoji strings from rendered UI components and toast messages.
  - *Why*: OS emojis render differently across iOS, Android, Windows, and macOS, clashing with pixel typography and breaking vertical button alignment. Custom pixel SVGs inherit `currentColor`, scale cleanly, and preserve a true arcade cabinet aesthetic.

- **Decision 2: Optical Baseline Centering for `Press Start 2P` Buttons**
  - *Chosen Approach*: Replace Unicode symbols (`▶`, `▲`, `✕`) with explicit `viewBox="0 0 16 16"` pixel SVGs (`shrink-0 block`) inside `inline-flex items-center justify-center` wrappers with `leading-none`.
  - *Why*: The `Press Start 2P` bitmap font has an asymmetric ascender/descender box that causes inline text symbols like `▶` to drift off-center; explicit SVG dimensions inside a flex container guarantee mathematical and optical centering.

- **Decision 3: Zero-Dependency Web Audio Chiptune Synthesizer with Mute Toggle**
  - *Chosen Approach*: Synthesize all 8-bit sound effects in real time via the browser's native Web Audio API (`triangle`, `square`, and filtered noise oscillators) with a persistent mute toggle in the Zustand store.
  - *Why*: Requires zero external audio file downloads, works offline on school networks, adds zero latency on button taps, and respects browser autoplay policies.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     App Shell (100dvh, overflow-hidden)                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Header: [MSTC IT Pixel Emblem] PIXEL BOOF   [Audio][Queue][Gal]   │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │                                                                   │  │
│  │   HOMEPAGE SCREEN (!videoActive)                                  │  │
│  │   ┌───────────────────────────────────────────────────────────┐   │  │
│  │   │                      PIXEL BOOF                           │   │  │
│  │   │         ┌─────────────────────────────────────┐           │   │  │
│  │   │         │   [8-Bit Play SVG]  PRESS START     │           │   │  │
│  │   │         └─────────────────────────────────────┘           │   │  │
│  │   │       [Privacy Box: No images saved on refresh]           │   │  │
│  │   └───────────────────────────────────────────────────────────┘   │  │
│  │                                                                   │  │
│  │   ACTIVE CAMERA & MOBILE VIEWPORT (videoActive)                   │  │
│  │   ┌───────────────────────────────────────────────────────────┐   │  │
│  │   │ Live Webcam Feed + Floating SVG Controls [Flip] [Upload]  │   │  │
│  │   ├───────────────────────────────────────────────────────────┤   │  │
│  │   │ Bottom Dock: [PixelIcon + Lens]  (Shutter)  [Thumbnails]  │   │  │
│  │   └───────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Shared Systems:                                                        │
│  ├── PixelIcon SVG Registry (crispEdges 16x16 stepped pixel vectors)    │
│  └── 8-Bit Web Audio Synth (Click · Select · Shutter · Success · Mute)  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State Updates**:
  - `soundEnabled: true` in store state (persisted in `localStorage`) with `toggleSound()` action so users or booth helpers can mute/unmute all 8-bit Web Audio effects.
  - `icon` identifier on each theme and mode entry in `modes.js` (e.g., `'gamepad'`, `'sword'`, `'laser'`, `'paw'`, `'card'`, `'heart'`, `'star'`, `'pencil'`, `'question'`) mapped directly to `<PixelIcon name={...} />` so zero emojis are rendered anywhere in the lens drawer, camera dock, or modals.

- **Interactive Component & State Mapping**:
  - **Homepage `PRESS START` Button**:
    - Uses `inline-flex items-center justify-center gap-2.5 leading-none` containing `<PixelIcon name="play" className="w-3.5 h-3.5 shrink-0" />` and `<span>PRESS START</span>`, triggering `playClickSound()` and `startVideo()` on tap.
  - **MSTC IT Header Badge (`MstcBadge`)**:
    - Renders a crisp geometric pixel emblem (8-bit microchip/terminal crest) inside the maroon pixel frame alongside `MSTC IT`.
  - **Global Button & Modal Feedback**:
    - Every interactive button across Header, Camera, Lens Drawer, Gallery, Focused Sticker Modal, and Sticker Queue Modal renders `<PixelIcon />` vectors, enforces $\ge 44\text{px}$ mobile touch hitboxes where appropriate, and triggers subtle 8-bit chiptune audio feedback when `soundEnabled` is active.
