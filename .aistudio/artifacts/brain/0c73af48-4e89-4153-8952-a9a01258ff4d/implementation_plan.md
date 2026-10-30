# PixelBoof — Mobile-First UI Overhaul, Homepage Privacy Notice & Auto-Email Batch Delivery

Redesign the PixelBoof photobooth interface so the live camera and generated stickers occupy maximum screen space on both phones and school kiosk computers, keep the retro `pixel-font` privacy disclaimer exclusively on the **Homepage (Press Start screen)**—which appears on every page refresh and whenever **Next Attendee** is clicked—and add **Auto-Email / Send to Booth (`mavscriptblue@gmail.com`)** so students using their personal phones can send their 3-sticker batch straight to your email alongside the Kiosk ZIP download.

## User Review & Critical Decisions

> [!IMPORTANT]
> This revised plan incorporates your latest feedback alongside our earlier layout choices:

- **Confirmed Decision 1 — Privacy Disclaimer Strictly on the Homepage**:
  - The stylized `pixel-font` notice (`Note: No images are saved; data is erased immediately upon page refresh.`) will appear **only on the Homepage (`PRESS START` screen)**—not as a persistent bar across other views.
  - Both **refreshing the page** and clicking **🔄 Next Attendee** will stop the active camera stream, wipe all in-memory photos/queue data, and return the screen directly to the **Homepage** so the next student always sees the title screen and privacy note first.
- **Confirmed Decision 2 — Auto-Send / Email Sticker Batch to `mavscriptblue@gmail.com` (Personal Phones + Kiosk ZIP)**:
  - When an attendee enters their **Full Name** and **High School** in the Sticker Queue (`0/3`) and submits their batch:
    1. **Auto-Email to Organizer (`mavscriptblue@gmail.com`)**: The server (`/api/email-sticker-batch`) packages their queued stickers into `${Name}-${School}_PixelBoof_${count}stickers.zip` in memory (saving nothing to disk) and emails the ZIP attachment directly to `mavscriptblue@gmail.com` (using server-side SMTP/email transport, plus a mobile Web Share / mail fallback if offline).
    2. **Kiosk Local ZIP Download**: Also keeps the instant browser `.zip` download for school computers with webcams ("kiosk mode").
- **Confirmed Decision 3 — Compact Dock with Pop-Up Lens Drawer & Inline Thumbnails**:
  - Replaces the tall multi-row category/chip panels on the Camera screen with a single compact bottom dock (`[🎨 Active Lens]`, `[📸 Shutter]`, and an inline row of recent sticker thumbnails) plus a pop-up **Lens Drawer** modal.
- **Confirmed Decision 4 — Skip Preview by Default & Go Straight to Large Sticker Result**:
  - Snapping a photo immediately starts generating the `gemini-nano-banana-2.1` sticker and automatically opens the large-format **Sticker Inspection Modal** once ready.

---

## 1. Overview & Core Concept

- **What It Does**: Provides a fast, mobile-friendly and kiosk-ready AI sticker photobooth for Mid-State Technical College's November 13th Tech-Con where students snap photos, transform into 16-bit die-cut stickers, and either email their 3-sticker print batch to `mavscriptblue@gmail.com` from their personal phones or download the batch ZIP directly on the booth computers.
- **Target Audience / Persona**: High school attendees on personal smartphones (iOS/Android) and booth helpers operating school computers with webcams.
- **Key Value**: Solves the mobile viewport crunch so the camera and sticker art fill 80%+ of the screen, ensures every new attendee starts on the clean Homepage with the privacy disclaimer, and seamlessly routes personal-phone sticker batches to your inbox for Cricut printing.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Homepage (`PRESS START` Screen — Shown on Refresh & Next Attendee)**:
     - Displays the retro `PIXEL BOOF` arcade logo, the primary `▶ PRESS START` button, and the stylish retro `pixel-font` info box:
       `Note: No images are saved; data is erased immediately upon page refresh.`
     - Starts completely clean on page load (no pre-seeded demo stickers cluttering the queue).
     - Clicking **🔄 Next Attendee** from either the Gallery or the Sticker Queue modal stops the webcam, clears all photos/queue items, and returns straight to this Homepage.
  2. **Full-Viewport Camera & Compact Bottom Dock**:
     - Once `▶ PRESS START` is tapped, the live camera feed fills 80%+ of the viewport height with floating top-right utility buttons (`🔄 Flip`, `📁 Upload`).
     - The single-row bottom dock houses:
       - **Left**: Active Lens trigger button (opens the **Pop-Up Lens Drawer** with the 6 category tabs, 40+ lenses, Random, and Custom Prompt + PixelBot coach).
       - **Center**: Tactile round Arcade Shutter button.
       - **Right**: Single compact inline row of recent snapped sticker thumbnails.
  3. **Instant Transform to Large Sticker Result**:
     - Pressing the shutter immediately triggers `gemini-nano-banana-2.1` generation (`instantTransform: true` by default) with a shimmering loading state in the inline thumbnail strip, and automatically opens the enlarged **Focused Sticker Modal** when ready.
  4. **Sticker Queue (`0/3`) — Auto-Email for Phones & ZIP for Kiosks**:
     - Inside the Sticker Queue modal, students enter their **Attendee Full Name** and **High School**.
     - Clicking **📧 Send & Download Batch (3/3)** automatically sends the ZIP package (`Name-School_PixelBoof_3stickers.zip`) to **`mavscriptblue@gmail.com`** via `/api/email-sticker-batch` (so phone users' stickers arrive straight in your inbox) while also offering the local ZIP download for kiosk computers.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: 16-bit CRT Arcade Cabinet with Mid-State Technical College Maroon (`#8B1E41`), Arcade Gold (`#ffcc00`), and Electric Cyan (`#06b6d4`) on deep CRT obsidian (`#120d18`).
  - *Typography & Hierarchy*: `Press Start 2P` (`pixel-font`) for titles, arcade buttons, and the Homepage privacy disclaimer box; high-contrast sans-serif for inputs and helper labels.
  - *Responsive Spatial Budget*:
    - Compact Top Header: `48px–52px`
    - Camera / Gallery Stage: `80%–84%` of `100dvh`
    - Single-Row Bottom Camera Dock: `68px–74px`

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Homepage-Only Privacy Notice & True Station Reset**
  - *Chosen Approach*: Display the `pixel-font` privacy box (`Note: No images are saved; data is erased immediately upon page refresh.`) exclusively on the Homepage (`!videoActive`), and make `resetStationForNextAttendee` stop the active camera stream so the booth returns to the Homepage after each student.
  - *Why*: Gives the active camera and gallery views maximum vertical room while guaranteeing that every student stepping up to the kiosk (or opening the app on their phone) sees the privacy disclaimer first.

- **Decision 2: Stateless In-Memory Auto-Email to `mavscriptblue@gmail.com`**
  - *Chosen Approach*: Add a stateless Express endpoint (`POST /api/email-sticker-batch`) that accepts the attendee's Name, High School, and base64 sticker PNGs, builds the `.zip` buffer in RAM, and emails it directly to `mavscriptblue@gmail.com` via Nodemailer/SMTP (configured via environment variables in `.env.example`, with automatic Web Share / email fallback on mobile if SMTP credentials aren't set), then immediately discards the buffer from memory.
  - *Why*: Students on personal phones don't have a way to plug into the Cricut computer; emailing the batch directly from the backend means high schoolers never have to log into Google OAuth on their phones, and zero images are ever saved to disk or a database.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     App Shell (100dvh, overflow-hidden)                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Compact Top Header (PIXEL BOOF · Stickers 0/3 · Camera/Gallery)   │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │                                                                   │  │
│  │   STATE A: HOMEPAGE (On Refresh or "Next Attendee")               │  │
│  │   ┌───────────────────────────────────────────────────────────┐   │  │
│  │   │                     PIXEL BOOF                            │   │  │
│  │   │                  [ ▶ PRESS START ]                        │   │  │
│  │   │  ┌─────────────────────────────────────────────────────┐  │   │  │
│  │   │  │ Note: No images are saved; data is erased           │  │   │  │
│  │   │  │ immediately upon page refresh. (pixel-font)         │  │   │  │
│  │   │  └─────────────────────────────────────────────────────┘  │   │  │
│  │   └───────────────────────────────────────────────────────────┘   │  │
│  │                                                                   │  │
│  │   STATE B: ACTIVE CAMERA VIEW (80%+ Viewport Height)              │  │
│  │   ┌───────────────────────────────────────────────────────────┐   │  │
│  │   │ Live Webcam Feed + Floating [🔄 Flip] [📁 Upload]         │   │  │
│  │   ├───────────────────────────────────────────────────────────┤   │  │
│  │   │ Single-Row Bottom Dock:                                   │   │  │
│  │   │ [🎨 Active Lens ▲]     ( 📸 Shutter )     [Thumb1][Thumb2]│   │  │
│  │   └───────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Pop-Up Modals & Backend Routes:                                        │
│  ├── LensDrawerModal (6 Category Tabs · 40+ Lenses · Custom Prompt)     │
│  ├── FocusedPhotoModal (Large Hero Sticker · 1-Line AI Edit · Queue)    │
│  ├── StickerQueueModal ──► POST /api/email-sticker-batch                │
│  │                         (Auto-emails ZIP to mavscriptblue@gmail.com  │
│  │                          + Kiosk Local ZIP Download)                 │
│  └── ChatBotPanel Modal (Flash Lite / Flash Prompt Coach)               │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `isHomepage` / `videoActive`: Managed so initial load (`init` with zero demo photos) and `resetStationForNextAttendee()` both set `cameraStarted: false`, stopping any active media tracks and returning to the Homepage.
  - `instantTransform: true`: Defaulted to `true` so shutter snaps immediately generate the sticker and open `FocusedPhotoModal` upon completion.
  - `showLensDrawer: false`: Controls the pop-up Lens Selector sheet from the bottom dock.
  - `emailSending: false`: Tracks in-flight status when auto-emailing the sticker batch to `mavscriptblue@gmail.com`.

- **Interactive Component & State Mapping**:
  - **Homepage (`CameraView` when `!videoActive`)**:
    - Renders the arcade title, `▶ PRESS START`, and the `pixel-font` box containing `Note: No images are saved; data is erased immediately upon page refresh.`
  - **Next Attendee Reset (`resetStationForNextAttendee`)**:
    - Clears `photos`, `stickerQueue`, `attendeeName`, `attendeeSchool`, `capturedPreview`, and signals `CameraView` to stop the webcam stream so the Homepage is immediately displayed.
  - **Batch Submission (`StickerQueueModal` & `POST /api/email-sticker-batch`)**:
    - Generates `${prefix}_PixelBoof_${count}stickers.zip` in memory and sends it to `mavscriptblue@gmail.com` via `/api/email-sticker-batch`, while also supporting one-click local ZIP download on kiosk computers and native mobile file sharing (`navigator.share`) on phones.
