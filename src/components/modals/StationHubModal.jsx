/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState} from 'react'
import {useStore, ORGANIZER_EMAIL} from '../../lib/store'
import PixelBoofQrCard, {
  DEFAULT_BOOTH_QR_URL,
  CLOUD_RUN_ROOT_URL,
  CLOUD_RUN_PASS_URL,
  CLOUD_RUN_FALLBACK_URL,
  buildPixelBoofQrSvgMarkup,
  downloadPixelBoofQrPng
} from '../common/PixelBoofQrCard'
import {MstcBadge, PixelCloseButton, PixelIcon} from '../common/PixelUI'

const CLOUD_RUN_LOCK_CLI =
  'gcloud run services remove-iam-policy-binding pixelboof --member="allUsers" --role="roles/run.invoker" --region=us-central1'

const CLOUD_RUN_UNLOCK_CLI =
  'gcloud run services add-iam-policy-binding pixelboof --member="allUsers" --role="roles/run.invoker" --region=us-central1'

/**
 * Generates and downloads a standalone, printable 2-Page HTML file
 * (`pixelboof-station-guide.html`) with the real scannable SVG QR code embedded.
 */
export function downloadStandaloneGuideHtml(qrUrl = DEFAULT_BOOTH_QR_URL) {
  const qrSvg = buildPixelBoofQrSvgMarkup(qrUrl, {includeTitle: true})
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PixelBoof — 2-Page Station &amp; Helper Guide (MSTC Tech-Con)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Press+Start+2P&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Inter', sans-serif; background: #cbd5e1; color: #0f172a; margin: 0; padding: 24px 12px; }
    .pixel-font { font-family: 'Press Start 2P', monospace; }
    @media print {
      body { background: #ffffff !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .print-page { box-shadow: none !important; margin: 0 !important; width: 100% !important; page-break-after: always; break-after: page; }
      .print-page.last-print-page { page-break-after: auto; break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="max-w-[8.5in] mx-auto mb-5 bg-[#140f1d] text-white p-4 rounded-lg border-2 border-[#8B1E41] flex flex-wrap justify-between items-center gap-3 no-print shadow-lg">
    <div>
      <p class="pixel-font text-[10px] text-[#ffcc00] mb-1">PIXEL BOOF — 2-PAGE STATION POSTER &amp; VOLUNTEER GUIDE</p>
      <p class="text-xs text-slate-300">Page 1: Attendee Step-by-Step Guide (3-Sticker Limit &amp; Event QR) | Page 2: Volunteer &amp; Helper Station Guide</p>
    </div>
    <button onclick="window.print()" class="bg-[#8B1E41] hover:bg-[#6e1633] text-[#ffcc00] border border-[#ffcc00] text-xs font-bold py-2 px-4 rounded shadow cursor-pointer">
      Print / Save 2-Page PDF
    </button>
  </div>

  <!-- PAGE 1: STUDENT-FACING STATION POSTER -->
  <div class="print-page bg-white max-w-[8.5in] mx-auto mb-8 p-6 sm:p-10 shadow-xl border-t-[10px] border-[#8B1E41] flex flex-col justify-between">
    <div>
      <div class="bg-[#140f1d] border-2 border-[#8B1E41] p-5 rounded-lg text-white mb-5">
        <div class="flex justify-between items-center border-b border-amber-500/40 pb-2 mb-3">
          <span class="pixel-font text-[9px] text-[#ffcc00]">MID-STATE TECH-CON // AI BOOTH</span>
          <span class="pixel-font text-[9px] text-cyan-400">LIMIT: 3 STICKERS / PERSON</span>
        </div>
        <h2 class="font-black text-2xl sm:text-3xl tracking-tight uppercase text-white mb-1">
          PIXEL BOOF: <span class="text-[#ffcc00]">AI STICKER ARCADE</span>
        </h2>
        <p class="text-xs text-slate-300 font-semibold">
          Step up to the live webcam, transform into 40+ retro game heroes, fursonas, or collector cards, and get up to 3 real die-cut vinyl stickers crafted right here on our Cricut Joy Xtra!
        </p>
      </div>

      <!-- LEVEL 1 -->
      <div class="mb-4 border-2 border-slate-200 rounded-lg p-4 bg-slate-50">
        <div class="flex items-center mb-2">
          <span class="pixel-font text-[10px] bg-[#8B1E41] text-white px-2.5 py-1 rounded">LEVEL 1: STEP UP OR SCAN QR</span>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <div class="bg-[#031019] p-2.5 rounded border-2 border-[#1f6f78] shrink-0" style="width: 132px;">
            ${qrSvg}
          </div>
          <div class="flex-1 w-full">
            <p class="text-xs sm:text-sm font-medium text-slate-800 mb-2">
              Use the open browser at this station computer, or scan the <strong>PixelBoof QR Code</strong> to run PixelBoof on your phone during Tech-Con hours:
            </p>
            <div class="bg-[#140f1d] border-2 border-cyan-500 rounded p-3 text-center">
              <p class="text-[10px] uppercase tracking-widest text-cyan-400 font-bold mb-1">LIVE BOOTH URL (ACTIVE DURING TECH-CON HOURS ONLY):</p>
              <p class="pixel-font text-xs sm:text-sm text-[#ffcc00] tracking-wide select-all break-all">${qrUrl}</p>
              <p class="text-[11px] text-slate-300 mt-1">Booth Passcode (if prompted): <strong class="text-cyan-300">MSTC26</strong> or <strong class="text-cyan-300">TECHCON26</strong></p>
            </div>
          </div>
        </div>
      </div>

      <!-- LEVEL 2 -->
      <div class="mb-4 border-2 border-slate-200 rounded-lg p-4 bg-slate-50">
        <div class="flex items-center mb-2">
          <span class="pixel-font text-[10px] bg-[#8B1E41] text-white px-2.5 py-1 rounded">LEVEL 2: PICK A LENS GROUP &amp; SNAP</span>
        </div>
        <p class="text-xs sm:text-sm font-medium text-slate-800">
          Click <strong>PRESS START</strong>, open the <strong>LENS</strong> drawer to pick from <strong>6 grouped category decks</strong> (<em>Arcade &amp; Platform, RPG &amp; Fantasy, Action &amp; Sci-Fi, Fursona, Cards &amp; Toons, or Pride &amp; Duos</em>)—or choose <strong>Custom Prompt</strong> to type your own idea! Hit the round <strong>Camera Shutter</strong> button and watch the bottom tray shimmer while Gemini AI builds your transparent die-cut sticker.
        </p>
      </div>

      <!-- LEVEL 3 -->
      <div class="mb-4 border-2 border-[#8B1E41] rounded-lg p-4 bg-rose-50/60">
        <div class="flex items-center mb-2">
          <span class="pixel-font text-[10px] bg-[#8B1E41] text-[#ffcc00] px-2.5 py-1 rounded">LEVEL 3: QUEUE YOUR TOP 3 (MAX 3 STICKERS!)</span>
        </div>
        <p class="text-xs sm:text-sm font-semibold text-slate-900 mb-2">
          Click any finished creation in the bottom tray (or <strong>Gallery</strong>) and click <strong>Save for Sticker (Max 3)</strong>. Then open <strong>Sticker Queue</strong> and enter your <strong>Full Name &amp; High School</strong> (required to unlock Send/Download):
        </p>
        <div class="bg-slate-900 text-amber-300 font-mono text-xs p-2.5 rounded">
          Auto-Named Batch Format: Alex_Rivera-SPASH_PixelBoof_3stickers.zip
        </div>
        <p class="text-xs text-slate-700 font-medium mt-1.5">
          *Why a 3-sticker limit? Every sticker is custom printed and cut on-site with our Cricut Joy Xtra—keeping it to 3 per person makes sure everyone gets their stickers before the buses leave!
        </p>
      </div>

      <!-- LEVEL 4 -->
      <div class="bg-[#140f1d] border-2 border-[#8B1E41] p-4 rounded-lg text-white">
        <div class="flex items-center mb-2">
          <span class="pixel-font text-[10px] text-[#ffcc00]">LEVEL 4: HELPER HANDOFF &amp; ON-SITE CRICUT LOOT</span>
        </div>
        <p class="text-xs sm:text-sm text-slate-200 leading-snug mb-1">
          Click <strong>Send to Gmail (${ORGANIZER_EMAIL})</strong> or wave over an <strong>AI Booth Helper</strong> once your 3 stickers are queued! Our helpers batch-transfer your saved stickers so our Cricut operator can print and precision-cut them right at the booth.
        </p>
        <p class="text-xs text-cyan-300 font-bold">
          Submit your Sticker Queue at least 35 minutes before buses depart so your batch finishes cutting in time!
        </p>
      </div>
    </div>

    <div class="pt-3 mt-4 border-t border-slate-200 flex justify-between items-center text-xs">
      <span class="font-extrabold text-[#8B1E41]">Mid-State Technical College // IT Department</span>
      <span class="font-semibold text-slate-700">PixelBoof AI Booth</span>
      <span class="font-black text-[#8B1E41]">ATTENDEE GUIDE — PAGE 1</span>
    </div>
  </div>

  <!-- PAGE 2: BOOTH HELPER & OPERATOR PLAYBOOK -->
  <div class="print-page bg-white max-w-[8.5in] mx-auto mb-6 p-6 sm:p-10 shadow-xl border-t-[10px] border-[#8B1E41] flex flex-col justify-between">
    <div>
      <div class="bg-[#140f1d] border-2 border-[#8B1E41] p-5 rounded-lg text-white mb-5">
        <div class="flex justify-between items-center border-b border-cyan-500/40 pb-2 mb-3">
          <span class="pixel-font text-[9px] text-cyan-400">BOOTH HELPER PLAYBOOK</span>
          <span class="pixel-font text-[9px] text-[#ffcc00]">STAFF &amp; VOLUNTEERS ONLY</span>
        </div>
        <h2 class="font-black text-2xl tracking-tight uppercase text-white mb-1">
          RUNNING THE <span class="text-cyan-400">PIXEL BOOF</span> STATION
        </h2>
        <p class="text-xs text-slate-300 font-semibold">
          Our mission: Help attendees create their custom AI stickers, send/download their top 3 picks to the Cricut print queue, and keep the station moving smoothly!
        </p>
      </div>

      <h3 class="font-black text-sm uppercase text-[#8B1E41] mb-2">
        1. Station Helper Loop (Station PCs &amp; Mobile &rarr; Gmail / Shared Drive)
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div class="border border-slate-300 rounded p-3 bg-slate-50">
          <p class="font-bold text-xs text-slate-900 uppercase mb-1">Step A: Enforce the 3-Sticker Cap</p>
          <p class="text-xs text-slate-700 leading-relaxed">
            Students can snap several test photos, but they may only queue <strong>up to 3 stickers</strong> for printing. The app blocks adding a 4th sticker to the queue automatically.
          </p>
        </div>
        <div class="border border-slate-300 rounded p-3 bg-slate-50">
          <p class="font-bold text-xs text-slate-900 uppercase mb-1">Step B: Tag Name &amp; School + Send / Download Batch</p>
          <p class="text-xs text-slate-700 leading-relaxed">
            Open <strong>Sticker Queue</strong>, verify both <strong>Full Name &amp; High School</strong> are filled in, and click <strong>Send to Gmail (${ORGANIZER_EMAIL})</strong> or <strong>Download Batch</strong> for a ready-to-sort ZIP!
          </p>
        </div>
        <div class="border-2 border-[#8B1E41] rounded p-3 bg-rose-50/40 sm:col-span-2">
          <p class="font-extrabold text-xs text-[#8B1E41] uppercase mb-1">Step C: Transfer Batch &amp; Click &ldquo;Next Attendee&rdquo;</p>
          <p class="text-xs text-slate-800 leading-relaxed">
            Once the ZIP is emailed to <strong>${ORGANIZER_EMAIL}</strong> or dropped into the <strong>PixelBoof Shared Google Drive</strong> folder for the Cricut Joy Xtra, click <strong>Next Attendee</strong> and confirm to wipe the session back to <code>0/3</code> on the Homepage for the next student!
          </p>
        </div>
      </div>

      <h3 class="font-black text-sm uppercase text-[#8B1E41] mb-2">
        2. Booth Pacing, Break Rotation &amp; Bus Cutoff Schedule
      </h3>
      <div class="border border-slate-300 rounded-lg p-3.5 bg-slate-50 mb-5 text-xs text-slate-800 space-y-2">
        <p>
          <strong class="text-slate-950">• Break &amp; Group Photo Window:</strong> About <strong>15 minutes before the group photo</strong> (and for a mid-day break), pause new print batches so Blu can catch up on the Cricut queue, take a breather, and join the group photo!
        </p>
        <p>
          <strong class="text-slate-950">• Hard Bus Cutoff (35 Minutes Before Departure):</strong> Stop sending new print batches <strong>35 minutes before the buses leave</strong>. Students can still use the booth and save digital stickers to their phones via QR/Share, but the Cricut queue closes so Blu has time to finish printing and cutting every batch before buses depart!
        </p>
      </div>

      <h3 class="font-black text-sm uppercase text-[#8B1E41] mb-2">
        3. Mobile QR Code &amp; Cloud Run Cost Protection
      </h3>
      <div class="border-l-4 border-[#8B1E41] bg-slate-100 p-3.5 rounded-r-lg text-xs text-slate-800 space-y-1.5">
        <p>
          <strong class="text-slate-950">• Event-Time Mobile Access:</strong> Kids can scan the booth QR code (<code>${qrUrl}</code>) to run PixelBoof on their phones while in line and email their 3-sticker batch directly from the Sticker Queue modal.
        </p>
        <p>
          <strong class="text-slate-950">• Post-Event Shutdown:</strong> When Tech-Con wraps, see <strong>Page 3</strong> for the 1-click Short.io toggle that dead-ends the attendee QR code while keeping your personal app alive!
        </p>
      </div>
    </div>

    <div class="pt-3 mt-4 border-t border-slate-200 flex justify-between items-center text-xs">
      <span class="font-extrabold text-[#8B1E41]">Mid-State Technical College // IT Department</span>
      <span class="font-semibold text-slate-700">Gmail / Shared Drive &rarr; Cricut Joy Xtra</span>
      <span class="font-black text-[#8B1E41]">HELPER PLAYBOOK — PAGE 2</span>
    </div>
  </div>

  <!-- PAGE 3: ORGANIZER MASTER PLAYBOOK (PRIVATE REFERENCE FOR BLU) -->
  <div class="print-page last-print-page bg-white max-w-[8.5in] mx-auto mb-6 p-6 sm:p-10 shadow-xl border-t-[10px] border-cyan-600 flex flex-col justify-between">
    <div>
      <div class="bg-[#140f1d] border-2 border-cyan-500 p-5 rounded-lg text-white mb-5">
        <div class="flex justify-between items-center border-b border-cyan-500/40 pb-2 mb-3">
          <span class="pixel-font text-[9px] text-cyan-400">PAGE 3: ORGANIZER MASTER PLAYBOOK</span>
          <span class="pixel-font text-[9px] text-[#ffcc00]">BLU &bull; ${ORGANIZER_EMAIL}</span>
        </div>
        <h2 class="font-black text-2xl tracking-tight uppercase text-white mb-1">
          ORGANIZER <span class="text-cyan-400">CONTROL</span> &amp; KILL SWITCH GUIDE
        </h2>
        <p class="text-xs text-slate-300 font-semibold">
          Your personal master reference for Short.io routing, the 1-click dead end, keeping your personal app alive, and running the Cricut Joy Xtra.
        </p>
      </div>

      <!-- 1. The 1-Click Short.io Dead End -->
      <div class="mb-4 border-2 border-emerald-500 rounded-lg p-4 bg-emerald-50/60">
        <div class="flex items-center mb-2">
          <span class="pixel-font text-[10px] bg-emerald-700 text-white px-2.5 py-1 rounded">1. THE 1-CLICK KILL SWITCH (SHORT.IO)</span>
        </div>
        <p class="text-xs font-semibold text-slate-900 mb-1.5">
          How to dead-end attendee QR code access after Tech-Con without breaking your app:
        </p>
        <div class="space-y-1 text-xs text-slate-800">
          <p><strong>• How the link is wired:</strong> The QR badge encodes <code>https://pixelboof.mavscript.blue/mstc26</code> via <strong>Short.io</strong>, which forwards users to Cloud Run (<code>https://pixelboof.cloud.run</code>).</p>
          <p><strong>• The 1-Click Shutdown:</strong> Log into <strong>app.short.io</strong> &rarr; find the <strong>mstc26</strong> link &rarr; flip status to <strong>Inactive</strong>. Scanners immediately get an inactive/expired dead end at Short.io's edge at $0.00 cost.</p>
          <p><strong>• Your personal app stays 100% active:</strong> You can still open <code>https://pixelboof.cloud.run</code> directly anytime on your laptop or phone to showcase your work, try prompts, or create new stickers!</p>
        </div>
      </div>

      <!-- 2. Cloud Run Route Dead End & Cost Guard -->
      <div class="mb-4 border-2 border-slate-300 rounded-lg p-4 bg-slate-50">
        <div class="flex items-center mb-2">
          <span class="pixel-font text-[10px] bg-slate-800 text-white px-2.5 py-1 rounded">2. CLOUD RUN ROUTE DEAD END &amp; BUDGET GUARD</span>
        </div>
        <div class="space-y-1 text-xs text-slate-800">
          <p><strong>• Route-Level Dead End:</strong> In Cloud Run &rarr; <em>Variables &amp; Secrets</em>, add <code>EVENT_CLOSED=true</code>. Anyone visiting <code>/mstc26</code> receives a custom retro 16-bit &ldquo;Event Concluded&rdquo; screen, while the homepage remains fully unlocked for you.</p>
          <p><strong>• Token &amp; Budget Guard:</strong> Sticker generations are locked to 1K resolution (<code>1024x1024</code>) on <code>gemini-nano-banana-2.1</code> to keep API expenses minimal.</p>
          <p><strong>• Emergency Full Lock (CLI):</strong> To lock the entire container at Google's edge, run:<br>
            <code class="bg-slate-900 text-amber-300 font-mono text-[10px] p-1 rounded inline-block mt-0.5">gcloud run services remove-iam-policy-binding pixelboof --member="allUsers" --role="roles/run.invoker" --region=us-central1</code>
          </p>
        </div>
      </div>

      <!-- 3. Cricut Joy Xtra & Gmail Ingestion -->
      <div class="mb-4 border-2 border-[#8B1E41] rounded-lg p-4 bg-rose-50/40">
        <div class="flex items-center mb-2">
          <span class="pixel-font text-[10px] bg-[#8B1E41] text-[#ffcc00] px-2.5 py-1 rounded">3. CRICUT JOY XTRA BATCH INGESTION</span>
        </div>
        <div class="space-y-1 text-xs text-slate-800">
          <p><strong>• Email Destination:</strong> Attendee ZIP batches are sent to <strong>${ORGANIZER_EMAIL}</strong> with the naming format:<br>
            <code class="bg-slate-900 text-amber-300 font-mono text-[10px] p-1 rounded inline-block mt-0.5">Alex_Rivera-SPASH_PixelBoof_3stickers.zip</code>
          </p>
          <p><strong>• Cricut Design Space Import:</strong> Open Design Space &rarr; <em>Upload Image</em> &rarr; select the extracted PNGs &rarr; choose <strong>Complex</strong> &rarr; select <strong>Print Then Cut</strong>. The white die-cut sticker border is already rendered into the PNG.</p>
          <p><strong>• Vinyl Sizing:</strong> Recommended size: <strong>2.5" to 3"</strong> wide on Cricut Printable Vinyl or Waterproof Sticker Paper for fast cutting and clean peeling.</p>
        </div>
      </div>

      <!-- 4. Quick Bypasses & Passcodes -->
      <div class="border-2 border-cyan-500 rounded-lg p-3.5 bg-cyan-50/50">
        <div class="flex items-center mb-1.5">
          <span class="pixel-font text-[10px] bg-cyan-700 text-white px-2.5 py-1 rounded">4. MASTER BYPASS CODES &amp; HOTKEYS</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
          <div class="bg-white border border-cyan-200 p-2 rounded">
            <p class="font-bold text-slate-900">URL Passcode Bypasses:</p>
            <p class="font-mono text-[11px] text-cyan-700">?pass=MSTC26 &bull; ?pass=TECHCON26</p>
          </div>
          <div class="bg-white border border-cyan-200 p-2 rounded">
            <p class="font-bold text-slate-900">Organizer PIN (Lock Modal):</p>
            <p class="font-mono text-[11px] text-cyan-700">MSTC26 or TECHCON26</p>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-3 mt-4 border-t border-slate-200 flex justify-between items-center text-xs">
      <span class="font-extrabold text-[#8B1E41]">Mid-State Technical College // IT Department</span>
      <span class="font-semibold text-slate-700">Organizer: Blu (${ORGANIZER_EMAIL})</span>
      <span class="font-black text-cyan-700">ORGANIZER PLAYBOOK — PAGE 3</span>
    </div>
  </div>
</body>
</html>`

  const blob = new Blob([html], {type: 'text/html;charset=utf-8'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'pixelboof-station-guide.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 2-Page Station Poster & Volunteer Playbook content.
 * Rendered inside StationHubModal and also available in print view (#view-guide).
 */
export function StationGuideContent({qrUrl = DEFAULT_BOOTH_QR_URL, onPrint}) {
  const {showToast} = useStore.getState()

  const handleDownloadHtml = () => {
    downloadStandaloneGuideHtml(qrUrl)
    showToast('Downloaded standalone pixelboof-station-guide.html!')
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  return (
    <div id="view-guide" className="text-slate-900">
      {/* Top Helper Bar (Hidden on Print) */}
      <div className="max-w-[8.5in] mx-auto mb-5 bg-[#140f1d] text-white p-3.5 sm:p-4 border-2 border-[#9f1239] flex flex-wrap justify-between items-center gap-3 no-print shadow-lg">
        <div>
          <p className="pixel-font text-[9px] sm:text-[10px] text-[#facc15] mb-1">
            PIXEL BOOF — 3-PAGE STATION POSTER, HELPER &amp; ORGANIZER GUIDE
          </p>
          <p className="text-xs text-slate-300">
            Page 1: Student Step-by-Step | Page 2: Volunteer Playbook | Page 3: Organizer Private Guide (Blu)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-download-guide-html"
            type="button"
            onClick={handleDownloadHtml}
            className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2 min-h-[40px] bg-sky-700 hover:bg-sky-600 text-white border-sky-300"
          >
            <PixelIcon name="download" size={12} />
            <span>DOWNLOAD STANDALONE HTML</span>
          </button>
          <button
            id="btn-print-guide"
            type="button"
            onClick={handlePrint}
            className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2 min-h-[40px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15]"
          >
            <PixelIcon name="print" size={12} />
            <span>PRINT / SAVE 3-PAGE PDF</span>
          </button>
        </div>
      </div>

      {/* PAGE 1: STUDENT-FACING STATION POSTER */}
      <div className="print-page bg-white max-w-[8.5in] mx-auto mb-6 p-5 sm:p-8 shadow-xl border-t-[10px] border-[#8B1E41] flex flex-col justify-between text-slate-900">
        <div>
          {/* Header Banner */}
          <div className="bg-[#140f1d] border-2 border-[#8B1E41] p-4 sm:p-5 rounded-lg text-white mb-4">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-amber-500/40 pb-2 mb-3">
              <span className="pixel-font text-[8px] sm:text-[9px] text-[#ffcc00]">
                MID-STATE TECH-CON // AI BOOTH
              </span>
              <span className="pixel-font text-[8px] sm:text-[9px] text-cyan-400">
                LIMIT: 3 STICKERS / PERSON
              </span>
            </div>
            <h2 className="font-black text-xl sm:text-3xl tracking-tight uppercase text-white mb-1">
              PIXEL BOOF: <span className="text-[#ffcc00]">AI STICKER ARCADE</span>
            </h2>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
              Step up to the live webcam, transform into 40+ retro game heroes, fursonas, or collector cards, and get up to 3 real die-cut vinyl stickers crafted right here on our Cricut Joy Xtra!
            </p>
          </div>

          {/* LEVEL 1 (With Scannable PixelBoof QR Code) */}
          <div className="mb-3.5 border-2 border-slate-200 rounded-lg p-3.5 sm:p-4 bg-slate-50">
            <div className="flex items-center mb-2">
              <span className="pixel-font text-[9px] sm:text-[10px] bg-[#8B1E41] text-white px-2.5 py-1 rounded">
                LEVEL 1: STEP UP OR SCAN QR
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <PixelBoofQrCard url={qrUrl} size={114} includeTitle={true} />
              <div className="flex-1 w-full">
                <p className="text-xs sm:text-sm font-medium text-slate-800 mb-2">
                  Use the open browser at this station computer, or scan the <strong>PixelBoof QR Code</strong> to run PixelBoof on your phone during Tech-Con hours:
                </p>
                <div className="bg-[#140f1d] border-2 border-cyan-500 rounded p-2.5 sm:p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold mb-1">
                    LIVE BOOTH URL (ACTIVE DURING TECH-CON HOURS ONLY):
                  </p>
                  <p className="pixel-font text-[10px] sm:text-xs text-[#ffcc00] tracking-wide select-all break-all">
                    {qrUrl}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Booth Passcode (if prompted):{' '}
                    <strong className="text-cyan-300 font-mono">MSTC26</strong> or{' '}
                    <strong className="text-cyan-300 font-mono">TECHCON26</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LEVEL 2 */}
          <div className="mb-3.5 border-2 border-slate-200 rounded-lg p-3.5 sm:p-4 bg-slate-50">
            <div className="flex items-center mb-2">
              <span className="pixel-font text-[9px] sm:text-[10px] bg-[#8B1E41] text-white px-2.5 py-1 rounded">
                LEVEL 2: PICK A LENS GROUP &amp; SNAP
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
              Click <strong>PRESS START</strong>, tap the <strong>LENS</strong> button to pick from <strong>6 grouped category decks</strong> (<em>Arcade &amp; Platform, RPG &amp; Fantasy, Action &amp; Sci-Fi, Fursona, Cards &amp; Toons, or Pride &amp; Duos</em>)—or choose <strong>Custom Prompt</strong> to type your own idea! Hit the round <strong>Camera Shutter</strong> button and watch the bottom tray shimmer while Gemini AI builds your transparent die-cut sticker.
            </p>
          </div>

          {/* LEVEL 3 */}
          <div className="mb-3.5 border-2 border-[#8B1E41] rounded-lg p-3.5 sm:p-4 bg-rose-50/60">
            <div className="flex items-center mb-2">
              <span className="pixel-font text-[9px] sm:text-[10px] bg-[#8B1E41] text-[#ffcc00] px-2.5 py-1 rounded">
                LEVEL 3: QUEUE YOUR TOP 3 (MAX 3 STICKERS!)
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-2">
              Click any finished creation in the bottom tray (or <strong>Gallery</strong>) and click <strong>Save for Sticker (Max 3)</strong> to add your favorites to your <strong>Sticker Queue</strong>. Then open <strong>Sticker Queue</strong> and enter your <strong>Full Name &amp; High School</strong> (required):
            </p>
            <div className="bg-slate-900 text-amber-300 font-mono text-xs p-2.5 rounded">
              Auto-Named Batch Format: Alex_Rivera-SPASH_PixelBoof_3stickers.zip
            </div>
            <p className="text-xs text-slate-700 font-medium mt-1.5">
              *Why a 3-sticker limit? Every sticker is custom printed and cut on-site with our Cricut Joy Xtra—keeping it to 3 per person makes sure everyone gets their stickers before the buses leave!
            </p>
          </div>

          {/* LEVEL 4 */}
          <div className="bg-[#140f1d] border-2 border-[#8B1E41] p-3.5 sm:p-4 rounded-lg text-white">
            <div className="flex items-center mb-2">
              <span className="pixel-font text-[9px] sm:text-[10px] text-[#ffcc00]">
                LEVEL 4: HELPER HANDOFF &amp; ON-SITE CRICUT LOOT
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-snug mb-1">
              Click <strong>Send to Gmail ({ORGANIZER_EMAIL})</strong> or wave over an <strong>AI Booth Helper</strong> once your 3 stickers are queued! Our helpers batch-transfer your saved stickers so our Cricut operator can print and precision-cut them right at the booth.
            </p>
            <p className="text-xs text-cyan-300 font-bold">
              Submit your Sticker Queue at least 35 minutes before buses depart so your batch finishes cutting in time!
            </p>
          </div>
        </div>

        <div className="pt-3 mt-4 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="font-extrabold text-[#8B1E41]">
            Mid-State Technical College // IT Department
          </span>
          <span className="font-semibold text-slate-700">PixelBoof AI Booth</span>
          <span className="font-black text-[#8B1E41]">ATTENDEE GUIDE — PAGE 1</span>
        </div>
      </div>

      {/* PAGE 2: BOOTH HELPER & OPERATOR PLAYBOOK */}
      <div className="print-page bg-white max-w-[8.5in] mx-auto mb-6 p-5 sm:p-8 shadow-xl border-t-[10px] border-[#8B1E41] flex flex-col justify-between text-slate-900">
        <div>
          <div className="bg-[#140f1d] border-2 border-[#8B1E41] p-4 sm:p-5 rounded-lg text-white mb-4">
            <div className="flex justify-between items-center border-b border-cyan-500/40 pb-2 mb-3">
              <span className="pixel-font text-[8px] sm:text-[9px] text-cyan-400">
                BOOTH HELPER PLAYBOOK
              </span>
              <span className="pixel-font text-[8px] sm:text-[9px] text-[#ffcc00]">
                STAFF &amp; VOLUNTEERS ONLY
              </span>
            </div>
            <h2 className="font-black text-xl sm:text-2xl tracking-tight uppercase text-white mb-1">
              RUNNING THE <span className="text-cyan-400">PIXEL BOOF</span> STATION
            </h2>
            <p className="text-xs text-slate-300 font-semibold">
              Our mission: Help attendees create their custom AI stickers, batch-transfer their top 3 picks to the Cricut print queue, and keep the station running smoothly!
            </p>
          </div>

          <h3 className="font-black text-sm uppercase text-[#8B1E41] mb-2">
            1. Station Helper Loop (Station PCs &amp; Mobile &rarr; Gmail / Shared Drive)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="border border-slate-300 rounded p-3 bg-slate-50">
              <p className="font-bold text-xs text-slate-900 uppercase mb-1">
                Step A: Enforce the 3-Sticker Cap
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                Students can snap several test photos, but they may only queue <strong>up to 3 stickers</strong> for printing. The app blocks adding a 4th sticker to the queue automatically.
              </p>
            </div>
            <div className="border border-slate-300 rounded p-3 bg-slate-50">
              <p className="font-bold text-xs text-slate-900 uppercase mb-1">
                Step B: Tag Name &amp; School + Send or Download Batch
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                Open <strong>Sticker Queue</strong>, verify both <strong>Full Name &amp; High School</strong> are filled in, and click <strong>Send to Gmail ({ORGANIZER_EMAIL})</strong> or <strong>Download Batch (X/3)</strong> for a ready-to-sort ZIP!
              </p>
            </div>
            <div className="border-2 border-[#8B1E41] rounded p-3 bg-rose-50/40 sm:col-span-2">
              <p className="font-extrabold text-xs text-[#8B1E41] uppercase mb-1">
                Step C: Upload Batch to Shared Drive &amp; Click &ldquo;Next Attendee&rdquo;
              </p>
              <p className="text-xs text-slate-800 leading-relaxed">
                Once the batch is sent to <strong>{ORGANIZER_EMAIL}</strong> or dropped into the <strong>PixelBoof Shared Google Drive</strong> folder for Blu on the Cricut station, click <strong>Next Attendee</strong> inside the Sticker Queue modal (or header) to reset the station back to <code>0/3</code> for the next student!
              </p>
            </div>
          </div>

          <h3 className="font-black text-sm uppercase text-[#8B1E41] mb-2">
            2. Booth Pacing, Break Rotation &amp; Bus Cutoff Schedule
          </h3>
          <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50 mb-4 text-xs text-slate-800 space-y-2">
            <p>
              <strong className="text-slate-950">• Break &amp; Group Photo Window:</strong> About <strong>15 minutes before the group photo</strong> (and for a mid-day break), pause new print batches so Blu can catch up on the Cricut queue, take a breather, and join the group photo!
            </p>
            <p>
              <strong className="text-slate-950">• Hard Bus Cutoff (35 Minutes Before Departure):</strong> Stop sending new print batches <strong>35 minutes before the buses leave</strong>. Students can still use the booth and save digital stickers to their phones via QR/Share, but the Cricut queue closes so Blu has time to finish printing and cutting every batch before the buses depart!
            </p>
          </div>

          <h3 className="font-black text-sm uppercase text-[#8B1E41] mb-2">
            3. Mobile QR Code &amp; Cloud Run Cost Protection
          </h3>
          <div className="border-l-4 border-[#8B1E41] bg-slate-100 p-3.5 rounded-r-lg text-xs text-slate-800 space-y-1.5">
            <p>
              <strong className="text-slate-950">• Event-Time Mobile Access:</strong> Kids can scan the booth QR code (<code>{qrUrl}</code>) to run PixelBoof on their phones while in line and send their 3-sticker ZIP batch directly from the Sticker Queue modal.
            </p>
            <p>
              <strong className="text-slate-950">• Post-Event Shutdown:</strong> When Tech-Con wraps, see <strong>Page 3</strong> for the 1-click Short.io toggle that dead-ends the attendee QR code while keeping your personal app alive!
            </p>
          </div>
        </div>

        <div className="pt-3 mt-4 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="font-extrabold text-[#8B1E41]">
            Mid-State Technical College // IT Department
          </span>
          <span className="font-semibold text-slate-700">
            Gmail / Shared Drive &rarr; Cricut Joy Xtra
          </span>
          <span className="font-black text-[#8B1E41]">HELPER PLAYBOOK — PAGE 2</span>
        </div>
      </div>

      {/* PAGE 3: ORGANIZER MASTER PLAYBOOK (PRIVATE REFERENCE FOR BLU) */}
      <div className="print-page last-print-page bg-white max-w-[8.5in] mx-auto mb-2 p-5 sm:p-8 shadow-xl border-t-[10px] border-cyan-600 flex flex-col justify-between text-slate-900">
        <div>
          <div className="bg-[#140f1d] border-2 border-cyan-500 p-4 sm:p-5 rounded-lg text-white mb-4">
            <div className="flex justify-between items-center border-b border-cyan-500/40 pb-2 mb-3">
              <span className="pixel-font text-[8px] sm:text-[9px] text-cyan-400">
                PAGE 3: ORGANIZER MASTER PLAYBOOK
              </span>
              <span className="pixel-font text-[8px] sm:text-[9px] text-[#ffcc00]">
                BLU &bull; {ORGANIZER_EMAIL}
              </span>
            </div>
            <h2 className="font-black text-xl sm:text-2xl tracking-tight uppercase text-white mb-1">
              ORGANIZER <span className="text-cyan-400">CONTROL</span> &amp; KILL SWITCH GUIDE
            </h2>
            <p className="text-xs text-slate-300 font-semibold">
              Your personal master reference for Short.io routing, the 1-click dead end, keeping your personal app alive, and running the Cricut Joy Xtra.
            </p>
          </div>

          {/* 1. The 1-Click Short.io Dead End */}
          <div className="mb-3.5 border-2 border-emerald-500 rounded-lg p-3.5 sm:p-4 bg-emerald-50/60">
            <div className="flex items-center mb-2">
              <span className="pixel-font text-[9px] sm:text-[10px] bg-emerald-700 text-white px-2.5 py-1 rounded">
                1. THE 1-CLICK KILL SWITCH (SHORT.IO)
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-900 mb-1.5">
              How to dead-end attendee QR code access after Tech-Con without breaking your app:
            </p>
            <div className="space-y-1 text-xs text-slate-800">
              <p>
                <strong>• How the link is wired:</strong> The QR badge encodes <code>https://pixelboof.mavscript.blue/mstc26</code> via <strong>Short.io</strong>, which forwards users to Cloud Run (<code>https://pixelboof.cloud.run</code>).
              </p>
              <p>
                <strong>• The 1-Click Shutdown:</strong> Log into <strong>app.short.io</strong> &rarr; find the <strong>mstc26</strong> link &rarr; flip status to <strong>Inactive</strong>. Scanners immediately get an inactive/expired dead end at Short.io's edge at $0.00 cost.
              </p>
              <p>
                <strong>• Your personal app stays 100% active:</strong> You can still open <code>https://pixelboof.cloud.run</code> directly anytime on your laptop or phone to showcase your work, try prompts, or create new stickers!
              </p>
            </div>
          </div>

          {/* 2. Cloud Run Route Dead End & Cost Guard */}
          <div className="mb-3.5 border-2 border-slate-300 rounded-lg p-3.5 sm:p-4 bg-slate-50">
            <div className="flex items-center mb-2">
              <span className="pixel-font text-[9px] sm:text-[10px] bg-slate-800 text-white px-2.5 py-1 rounded">
                2. CLOUD RUN ROUTE DEAD END &amp; BUDGET GUARD
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-800">
              <p>
                <strong>• Route-Level Dead End:</strong> In Cloud Run &rarr; <em>Variables &amp; Secrets</em>, add <code>EVENT_CLOSED=true</code>. Anyone visiting <code>/mstc26</code> receives a custom retro 16-bit &ldquo;Event Concluded&rdquo; screen, while the homepage remains fully unlocked for you.
              </p>
              <p>
                <strong>• Token &amp; Budget Guard:</strong> Sticker generations are locked to 1K resolution (<code>1024x1024</code>) on <code>gemini-nano-banana-2.1</code> to keep API expenses minimal.
              </p>
              <p>
                <strong>• Emergency Full Lock (CLI):</strong> To lock the entire container at Google's edge, run:<br />
                <code className="bg-slate-900 text-amber-300 font-mono text-[10px] p-1 rounded inline-block mt-0.5">
                  gcloud run services remove-iam-policy-binding pixelboof --member="allUsers" --role="roles/run.invoker" --region=us-central1
                </code>
              </p>
            </div>
          </div>

          {/* 3. Cricut Joy Xtra & Gmail Ingestion */}
          <div className="mb-3.5 border-2 border-[#8B1E41] rounded-lg p-3.5 sm:p-4 bg-rose-50/40">
            <div className="flex items-center mb-2">
              <span className="pixel-font text-[9px] sm:text-[10px] bg-[#8B1E41] text-[#ffcc00] px-2.5 py-1 rounded">
                3. CRICUT JOY XTRA BATCH INGESTION
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-800">
              <p>
                <strong>• Email Destination:</strong> Attendee ZIP batches are sent to <strong>{ORGANIZER_EMAIL}</strong> with the naming format:<br />
                <code className="bg-slate-900 text-amber-300 font-mono text-[10px] p-1 rounded inline-block mt-0.5">
                  Alex_Rivera-SPASH_PixelBoof_3stickers.zip
                </code>
              </p>
              <p>
                <strong>• Cricut Design Space Import:</strong> Open Design Space &rarr; <em>Upload Image</em> &rarr; select the extracted PNGs &rarr; choose <strong>Complex</strong> &rarr; select <strong>Print Then Cut</strong>. The white die-cut sticker border is already rendered into the PNG.
              </p>
              <p>
                <strong>• Vinyl Sizing:</strong> Recommended size: <strong>2.5" to 3"</strong> wide on Cricut Printable Vinyl or Waterproof Sticker Paper for fast cutting and clean peeling.
              </p>
            </div>
          </div>

          {/* 4. Quick Bypasses & Passcodes */}
          <div className="border-2 border-cyan-500 rounded-lg p-3 sm:p-3.5 bg-cyan-50/50">
            <div className="flex items-center mb-1.5">
              <span className="pixel-font text-[9px] sm:text-[10px] bg-cyan-700 text-white px-2.5 py-1 rounded">
                4. MASTER BYPASS CODES &amp; HOTKEYS
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
              <div className="bg-white border border-cyan-200 p-2 rounded">
                <p className="font-bold text-slate-900">URL Passcode Bypasses:</p>
                <p className="font-mono text-[11px] text-cyan-700">?pass=MSTC26 &bull; ?pass=TECHCON26</p>
              </div>
              <div className="bg-white border border-cyan-200 p-2 rounded">
                <p className="font-bold text-slate-900">Organizer PIN (Lock Modal):</p>
                <p className="font-mono text-[11px] text-cyan-700">MSTC26 or TECHCON26</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 mt-4 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="font-extrabold text-[#8B1E41]">
            Mid-State Technical College // IT Department
          </span>
          <span className="font-semibold text-slate-700">
            Organizer: Blu ({ORGANIZER_EMAIL})
          </span>
          <span className="font-black text-cyan-700">ORGANIZER PLAYBOOK — PAGE 3</span>
        </div>
      </div>
    </div>
  )
}

export default function StationHubModal({
  initialTab = 'cloud',
  onClose
}) {
  const boothQrUrl = useStore.useBoothQrUrl()
  const isLockedSim = useStore.useIsLockedSim()
  const {setBoothQrUrl, setIsLockedSim, showToast} = useStore.getState()

  const [activeTab, setActiveTab] = useState(initialTab) // 'cloud' | 'guide'
  const [urlDraft, setUrlDraft] = useState(boothQrUrl || DEFAULT_BOOTH_QR_URL)

  const handleUpdateQr = e => {
    e.preventDefault()
    const cleaned = urlDraft.trim() || DEFAULT_BOOTH_QR_URL
    setBoothQrUrl(cleaned)
    setUrlDraft(cleaned)
    showToast('Updated Booth QR Code!')
  }

  const handleSelectPresetUrl = presetUrl => {
    setUrlDraft(presetUrl)
    setBoothQrUrl(presetUrl)
    showToast(`Switched QR URL to ${presetUrl}`)
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(boothQrUrl)
      showToast(`Copied "${boothQrUrl}" to clipboard!`)
    } catch {
      showToast('Select the URL text to copy.', 'info')
    }
  }

  const handleCopyCli = async cmd => {
    try {
      await navigator.clipboard.writeText(cmd)
      showToast('Copied Cloud Run gcloud command to clipboard!')
    } catch {
      showToast('Could not copy automatically — select text to copy.', 'info')
    }
  }

  const handleDownloadLockBat = () => {
    const batContent = `@echo off
echo =========================================================
echo PIXELBOOF - POST-EVENT GOOGLE CLOUD RUN LOCK SCRIPT
echo =========================================================
echo Revoking public allUsers access so no after-hours Gemini charges occur...
${CLOUD_RUN_LOCK_CLI}
echo.
echo Done! Public access to PixelBoof is now locked ($0.00 cost).
echo To re-open later, run:
echo ${CLOUD_RUN_UNLOCK_CLI}
pause
`
    const blob = new Blob([batContent], {type: 'text/plain;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lock-booth.bat'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Downloaded lock-booth.bat script!')
  }

  const handleDownloadQrPng = async () => {
    await downloadPixelBoofQrPng(
      boothQrUrl,
      'QR_https___pixelboof.mavscript.blue_mstc26.png'
    )
    showToast('Downloaded high-res PixelBoof QR PNG!')
  }

  return (
    <div
      id="modal-station-hub"
      className="fixed inset-0 bg-black/90 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 no-print"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="station-hub-title"
    >
      <div
        className="pixel-box bg-[#151928] border-[#facc15] max-w-5xl w-full h-[94dvh] sm:h-[90dvh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Mode Switcher Bar */}
        <div className="bg-[#0b0e17] border-b-2 border-[#9f1239] px-3 py-2.5 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <MstcBadge size="sm" />
            <h2
              id="station-hub-title"
              className="pixel-font text-[9px] sm:text-xs text-[#facc15] truncate"
            >
              MSTC TECH-CON STATION HUB
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              id="nav-tab-cloud"
              type="button"
              onClick={() => setActiveTab('cloud')}
              className={`pixel-btn text-[8px] sm:text-[9px] px-2.5 py-2 min-h-[38px] ${
                activeTab === 'cloud'
                  ? 'bg-[#9f1239] text-[#facc15] border-[#facc15]'
                  : 'bg-[#151928] text-slate-300 border-[#475569] hover:border-slate-300'
              }`}
            >
              <PixelIcon name="qr" size={12} />
              <span>1. QR &amp; COST GUARD</span>
            </button>

            <button
              id="nav-tab-guide"
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`pixel-btn text-[8px] sm:text-[9px] px-2.5 py-2 min-h-[38px] ${
                activeTab === 'guide'
                  ? 'bg-[#9f1239] text-[#facc15] border-[#facc15]'
                  : 'bg-[#151928] text-slate-300 border-[#475569] hover:border-slate-300'
              }`}
            >
              <PixelIcon name="guide" size={12} />
              <span>2. 2-PAGE STATION GUIDE</span>
            </button>

            <PixelCloseButton
              id="btn-close-station-hub"
              onClick={onClose}
              ariaLabel="Close Station Hub"
            />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-6">
          {activeTab === 'cloud' ? (
            <div className="max-w-4xl mx-auto space-y-5">
              {/* Top Hero Card: Scannable PixelBoof QR + 3-Layer Cloud Run Wallet Protection */}
              <div className="pixel-box bg-[#1b2033] border-[#facc15] p-4 sm:p-5">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Official Scannable PixelBoof QR Card */}
                  <div className="flex flex-col items-center shrink-0 gap-2">
                    <PixelBoofQrCard
                      url={boothQrUrl}
                      size={184}
                      includeTitle={true}
                    />
                    <span className="pixel-font text-[8px] bg-[#9f1239] text-[#facc15] border border-[#facc15] px-2.5 py-1">
                      PASS: MSTC26 / TECHCON26
                    </span>
                    <div className="flex items-center gap-1.5 w-full">
                      <button
                        type="button"
                        onClick={handleDownloadQrPng}
                        className="pixel-btn text-[7px] px-2.5 py-2 min-h-[36px] bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-300 flex-1 justify-center"
                        title="Download high-resolution QR code PNG"
                      >
                        <PixelIcon name="download" size={11} />
                        <span>QR PNG</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="pixel-btn text-[7px] px-2.5 py-2 min-h-[36px] bg-[#0f1320] text-sky-300 border-sky-400 flex-1 justify-center"
                        title="Copy QR Event URL"
                      >
                        <PixelIcon name="copy" size={11} />
                        <span>COPY URL</span>
                      </button>
                    </div>
                  </div>

                  {/* 3-Layer Cloud Run Wallet Protection */}
                  <div className="flex-1 min-w-0">
                    <span className="pixel-font text-[8px] sm:text-[9px] text-sky-400 block mb-1">
                      HOW TO LET KIDS USE CELLPHONES SAFELY
                    </span>
                    <h3 className="pixel-font text-xs sm:text-base text-[#facc15] mb-2 leading-relaxed">
                      3-LAYER CLOUD RUN WALLET PROTECTION
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
                      Attendees can scan your custom{' '}
                      <code className="text-[#facc15] font-mono">
                        {DEFAULT_BOOTH_QR_URL}
                      </code>{' '}
                      QR code above to launch PixelBoof on their phones! Even if that URL stays in their mobile browser history after they get on the bus, your Google Cloud Run wallet is protected by 3 layers:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-[#0b0e17] border-2 border-[#9f1239] p-3">
                        <p className="font-bold text-[#facc15] mb-1">
                          1. /mstc26 &amp; Pass Gate
                        </p>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Visiting <code className="text-sky-300">/mstc26</code> or{' '}
                          <code className="text-sky-300">?pass=TECHCON26</code> unlocks the booth during Tech-Con hours and blocks unauthenticated calls when locked.
                        </p>
                      </div>
                      <div className="bg-[#0b0e17] border-2 border-[#9f1239] p-3">
                        <p className="font-bold text-[#facc15] mb-1">
                          2. 1-Click Cloud Run Lock
                        </p>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Run <code className="text-sky-300">lock-booth.bat</code> when buses leave to remove{' '}
                          <code className="text-sky-300">allUsers</code> invoker access at Google&rsquo;s edge ($0.00 cost).
                        </p>
                      </div>
                      <div className="bg-[#0b0e17] border-2 border-[#9f1239] p-3">
                        <p className="font-bold text-[#facc15] mb-1">
                          3. Server Key &amp; 1K Cap
                        </p>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Your <code className="text-sky-300">GEMINI_API_KEY</code> stays strictly server-side on Cloud Run (never leaked to browsers) and caps images at <code className="text-sky-300">1K</code>.
                        </p>
                      </div>
                    </div>

                    {/* Quick Action Bar: Test Lock Simulator or Open Printable 2-Page Guide */}
                    <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-[#334155]">
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isLockedSim
                          setIsLockedSim(next)
                          if (next) {
                            showToast(
                              'Simulating After-Hours Lock Screen (Gemini API calls blocked).'
                            )
                            onClose()
                          } else {
                            showToast('Booth unlocked for live Tech-Con session!')
                          }
                        }}
                        className={`pixel-btn text-[8px] px-3 py-2 min-h-[38px] ${
                          isLockedSim
                            ? 'bg-rose-800 text-white border-rose-300'
                            : 'bg-[#0b0e17] text-amber-300 border-amber-400'
                        }`}
                      >
                        <PixelIcon
                          name={isLockedSim ? 'lock' : 'unlock'}
                          size={12}
                        />
                        <span>
                          {isLockedSim
                            ? 'BOOTH STATUS: LOCKED (TAP TO UNLOCK)'
                            : 'TEST AFTER-HOURS LOCK SCREEN'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('guide')}
                        className="pixel-btn text-[8px] px-3 py-2 min-h-[38px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15]"
                      >
                        <PixelIcon name="print" size={12} />
                        <span>OPEN 2-PAGE PRINTABLE POSTER &amp; GUIDE</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Grid: Customize Booth QR URL + Post-Event Kill Switch CLI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form
                  onSubmit={handleUpdateQr}
                  className="pixel-box bg-[#1b2033] border-[#475569] p-4 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="pixel-font text-[10px] sm:text-xs text-[#facc15] mb-2">
                      CUSTOMIZE BOOTH QR URL
                    </h3>
                    <p className="text-xs text-slate-300 mb-3">
                      Your custom short link <code className="text-sky-300">{DEFAULT_BOOTH_QR_URL}</code> is wired up by default. You can also switch to the direct Cloud Run URL or any custom URL below:
                    </p>
                    <label
                      htmlFor="qr-url-input"
                      className="text-[10px] font-bold text-sky-400 uppercase block mb-1"
                    >
                      Active Event QR URL
                    </label>
                    <input
                      id="qr-url-input"
                      type="text"
                      value={urlDraft}
                      onChange={e => setUrlDraft(e.target.value)}
                      className="w-full bg-[#0b0e17] border-2 border-[#334155] focus:border-[#facc15] px-3 py-2 min-h-[40px] text-xs text-white font-mono mb-2.5 outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectPresetUrl(DEFAULT_BOOTH_QR_URL)
                        }
                        className={`pixel-btn text-[7px] px-2 py-1.5 ${
                          boothQrUrl === DEFAULT_BOOTH_QR_URL
                            ? 'bg-sky-700 text-white border-sky-300'
                            : 'bg-[#0b0e17] text-slate-300 border-[#334155]'
                        }`}
                        title="Short.io custom branded short link with Caliper QR"
                      >
                        <span>pixelboof.mavscript.blue/mstc26</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectPresetUrl(CLOUD_RUN_ROOT_URL)
                        }
                        className={`pixel-btn text-[7px] px-2 py-1.5 ${
                          boothQrUrl === CLOUD_RUN_ROOT_URL
                            ? 'bg-sky-700 text-white border-sky-300'
                            : 'bg-[#0b0e17] text-slate-300 border-[#334155]'
                        }`}
                        title="Direct Google Cloud Run custom domain"
                      >
                        <span>pixelboof.cloud.run</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectPresetUrl(CLOUD_RUN_PASS_URL)
                        }
                        className={`pixel-btn text-[7px] px-2 py-1.5 ${
                          boothQrUrl === CLOUD_RUN_PASS_URL
                            ? 'bg-sky-700 text-white border-sky-300'
                            : 'bg-[#0b0e17] text-slate-300 border-[#334155]'
                        }`}
                        title="Direct Google Cloud Run with event bypass"
                      >
                        <span>pixelboof.cloud.run/mstc26</span>
                      </button>
                    </div>
                  </div>
                  <button
                    id="btn-update-qr"
                    type="submit"
                    className="pixel-btn text-[8px] sm:text-[9px] px-3 py-2.5 min-h-[42px] bg-[#9f1239] hover:bg-[#be123c] text-[#facc15] border-[#facc15] w-full justify-center"
                  >
                    <PixelIcon name="reset" size={12} />
                    <span>UPDATE QR CODE</span>
                  </button>
                </form>

                <div className="pixel-box bg-[#1b2033] border-[#475569] p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="pixel-font text-[10px] sm:text-xs text-sky-400 mb-2">
                      EVENT KILL SWITCH (HOW IT WORKS)
                    </h3>
                    <div className="bg-[#0b0e17] border-2 border-emerald-500/50 p-2.5 rounded mb-2.5">
                      <p className="text-[11px] font-bold text-emerald-400 mb-1">
                        Option 1: 1-Click Dead End in Short.io (Recommended)
                      </p>
                      <p className="text-xs text-slate-300">
                        In <strong>app.short.io</strong>, toggle the <code>mstc26</code> short link to <strong>Inactive</strong>. All QR code scans immediately stop at Short.io&rsquo;s edge—while your main app (<code>pixelboof.cloud.run</code>) stays <strong>100% active and working for you</strong>!
                      </p>
                    </div>

                    <div className="bg-[#0b0e17] border-2 border-amber-500/50 p-2.5 rounded mb-2.5">
                      <p className="text-[11px] font-bold text-amber-300 mb-1">
                        Option 2: Cloud Run Route Dead End (EVENT_CLOSED=true)
                      </p>
                      <p className="text-xs text-slate-300">
                        Add variable <code className="text-amber-200">EVENT_CLOSED=true</code> in Cloud Run. This turns <code>/mstc26</code> into an &ldquo;Event Concluded&rdquo; screen, while the homepage remains fully unlocked for you.
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-1.5">
                      Option 3: Total Cloud Lockdown (shuts down entire service):
                    </p>
                    <pre
                      id="cli-lock-cmd"
                      className="bg-[#0b0e17] border border-[#334155] p-2 text-[10px] text-slate-300 font-mono overflow-x-auto mb-2.5 select-all"
                    >
                      {CLOUD_RUN_LOCK_CLI}
                    </pre>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      id="btn-copy-cli"
                      type="button"
                      onClick={() => handleCopyCli(CLOUD_RUN_LOCK_CLI)}
                      className="pixel-btn text-[8px] px-3 py-2 min-h-[38px] bg-[#0f1320] hover:bg-[#1e2538] text-white border-[#475569] justify-center"
                    >
                      <PixelIcon name="copy" size={12} />
                      <span>COPY LOCK CMD</span>
                    </button>
                    <button
                      id="btn-download-lock-bat"
                      type="button"
                      onClick={handleDownloadLockBat}
                      className="pixel-btn text-[8px] px-3 py-2 min-h-[38px] bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-500 justify-center"
                    >
                      <PixelIcon name="download" size={12} />
                      <span>LOCK-BOOTH.BAT</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <StationGuideContent
              qrUrl={boothQrUrl}
              onPrint={() => window.print()}
            />
          )}
        </div>
      </div>
    </div>
  )
}
