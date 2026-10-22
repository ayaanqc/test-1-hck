# जवाबदेही / Jawabdehi

A working prototype of a complaint system that keeps moving. Someone reports a problem with a
government office, the complaint goes to the right office, climbs the chain when deadlines pass,
and shows the complainant the legal routes and free legal aid when nobody answers.

**Everything is made up.** No data leaves the browser, nothing is sent to a real government system,
and every office, official, lawyer and complaint in the app is fictional. This is a prototype, not
legal advice.

Built with React + Vite + Tailwind CSS, plain JavaScript, React Router.
Events live in `localStorage`, evidence files in IndexedDB, and open tabs are kept in sync with
`BroadcastChannel`.

---

## Run it

```bash
npm install
npm run dev
```

Open the printed URL (http://localhost:5173). Node 18+ is needed, and the page must be served from
localhost or over HTTPS, because the hash chain uses the browser's Web Crypto (`crypto.subtle`).

```bash
npm run build     # production build into dist/
npm run preview   # serve the build
```

### AI (optional)

The AI drafting endpoint is `api/ai.js` (a serverless function). It is also served by the Vite dev
server at `/api/ai`, so there is nothing extra to run.

```bash
cp .env.example .env
# then put a Gemini key (or an OpenAI key) in .env
GEMINI_API_KEY=...
```

- Gemini is the default because it accepts audio and video directly (transcription + drafting).
- `AI_PROVIDER=openai` uses Whisper for transcription and a chat model for drafting.
- **With no key the app still works.** The AI screens return a prepared result for the sample
  evidence, labelled **"Demo result"**. The key is only read on the server and never reaches the
  frontend.
- The same `api/ai.js` deploys as a Vercel function; `netlify/functions/ai.mjs` is a thin wrapper
  for Netlify. `vercel.json` / `netlify.toml` are included.

### Tests

```bash
npm run smoke         # records, hash chain, escalation, indicator, tamper detection, AI fallback
npm run smoke:ui      # renders all 29 screens in jsdom, in English and Hindi
npm run smoke:journey # drives the real report screens from start to a filed complaint
```

---

## Demo script (5 minutes)

Use the **Demo role** switcher in the header. Each tab keeps its own role, so you can open two tabs
and they update each other live.

1. **Citizen (Sunita)** → *Report a problem* → one question per screen. Pick **A bribe was asked for**,
   municipal, Market Licence Counter, say when, describe who, add the optional witness, type the
   story. Either **record with the microphone**, or press **Use the sample recording (demo)** — both go
   to the AI draft step, which returns a prepared result labelled **"Demo result"** when no key is set.
   With no recording at all, choose **Continue without a recording**.
2. In the AI draft, open **Correct this field** to change anything; your version is kept next to the
   AI version. Then confirm the phone number with the **demo OTP shown on screen** (123456), tick the
   declaration, send.
   You get a complaint ID such as `JD-2026-004822`, the office, and the deadlines. Print or save the receipt.
3. **Office official** → the complaint is in the inbox. The name, phone, witnesses and evidence are not
   there. It waits for the reviewer before any action is possible.
4. **Reviewer (oversight)** → open the complaint, see identity, evidence fingerprints and the AI flags
   ("worth a closer look", with reasons). Approve the removals.
5. **Office official** → acknowledge, or mark **investigation in progress** with an expected date and
   post updates. Escalation pauses only while an update arrives every 15 days.
6. **Admin** → *Demo date*: **Move 5 days forward** two or three times. Each missed deadline creates an
   escalation entry on the citizen's timeline, saying which office missed which date, plus
   "This says nothing about whether the complaint is true."
7. **Citizen** → *Track* → open the complaint: full timeline, upcoming deadlines, decisions, legal help.
   At the top of the chain it shows **Next steps outside this system**, a print-ready case summary,
   and free legal aid first.
8. **Admin** → *Tamper test* → change one stored entry, then open that complaint and press
   **Verify this record**. It fails on exactly the changed entry. *Reset demo* puts everything back.
9. **Public** → the public record (URL `/record`) → search `JD-2026-004120` (restricted: date and reason category only) or
   `JD-2026-004821` (ID, department, office, category, status, timeline — nothing else).

Other sample complaints to try: `JD-2026-004710` (escalated twice), `JD-2026-004688` (investigation,
updates on time), `JD-2026-004532` (updates stopped, escalation resumed), `JD-2026-004205` (rejected
then appealed), `JD-2026-004300` (closed with a finding), `JD-2026-004044` (withdrawn), and the cluster
`JD-2026-004002` / `004003` / `004004` (duplicate + coordinated flags).

---

## What is where

```
src/data/           authorities.js (chains + sample deadlines), officials.js, complaints.js (15 samples
                    + an archive of 11 closed ones), legal.js, legalaid.js, config.js (every deadline
                    and threshold), demoAi.js (prepared AI result for the sample evidence)
src/i18n/           en.js, hi.js — every piece of interface text, including legal routes
src/lib/            store.js (append-only events, actions, BroadcastChannel), hash.js (SHA-256 chain),
                    engine.js (derived state + escalation plans), accountability.js, flags.js,
                    db.js (IndexedDB evidence), ai.js, format.js, useStore.js
src/components/     Layout (with the 112 line on every page), Timeline, Verify/Evidence/Speak, Common
src/pages/          every screen (home, report, draft, submitted, track, my complaint, office inbox,
                    office complaint, review list, review complaint, legal, next steps, public record,
                    public complaint, office/department pages, accountability + how, admin, settings,
                    case summary)
api/ai.js           the only place a provider key is read
```

### The record nobody can rewrite

Every complaint is an append-only list of events. Each event stores
`SHA-256(previous event's hash + canonical JSON of {seq, type, at, by, byRole, details})`, computed
with `crypto.subtle.digest`. There is no delete and no edit anywhere, for any role. Corrections,
withdrawals, restrictions, findings, rejections and appeals are all new events with a person, a
time and a reason. Every evidence file's SHA-256 is taken when it is added and stored in the event.

**Verify this record** rewalks the chain and re-hashes every evidence file, and names the entry that
does not match. The Admin tamper test changes a stored entry (or replaces an evidence file) so the
failure can be shown.

### Escalation

Per level: acknowledge in 3 days, respond in 15, resolve in 30 (`src/data/config.js`). A missed
deadline creates an `escalated` event and moves the complaint to the next office in its chain.
"Investigation in progress" pauses escalation only while an update arrives at least every 15 days;
a missed update resumes it and the timeline says so. At the top of the chain, with no resolution, the
complaint shows **Next steps outside this system**.

### Accountability indicator

Only **closed** complaints are counted, so filing a complaint never changes it:
40% acknowledged on time + 30% responded on time + 20% closed within the deadline + 10%
substantiated findings. Shown only after at least 10 closed complaints. "How this is worked out"
shows the formula and the per-complaint data behind it.

### Privacy

The complainant's name, phone, witness names and evidence are known only to the reviewer (and to the
complainant). The reviewer approves the removals before the office can act or read the summary.
Public pages show only complaint ID, department, office, category, status and timeline. A restricted
complaint shows only the date and the reason category. "If you are in danger right now, call 112" is
on every page.

---

## Not finished / limits of the prototype

- **Transcription only works with a provider key.** Without one, the recording path returns the
  prepared demo draft (clearly labelled "Demo result" for the sample evidence); the typed path is
  fully working. There is no real speech-to-text in the browser.
- **Speech input** (the 🎙 buttons) uses the browser's Web Speech API, so it depends on the browser
  (Chrome/Android support it; Firefox usually does not) and on a network service. It is not
  available in the jsdom tests.
- **No server database.** Events are in this browser's `localStorage`, evidence in IndexedDB.
  Tabs on the same browser sync through `BroadcastChannel`; other devices do not.
- **No real integrations.** There is no connection to any government system, no SMS/OTP, no email,
  and no way to add a real official. The OTP is printed on screen. "File appeal", "withdraw",
  "request a correction" etc. only record events in this demo.
- **Deadlines, chains, the income limit and the lawyer directory are sample data**, marked as such in
  the app. Real chains, deadlines and legal aid limits differ by state.
- **Public statistics are computed from the sample data only** (15 live samples + 11 archived closed
  complaints), so most offices legitimately show "not enough closed complaints yet".
- **No automated browser test** (no headless browser in this environment): screens are tested by
  rendering every route in jsdom, and the report journey is driven through the real DOM. Microphone
  capture and audio playback were not testable here.
- **Accessibility** was built in (48px targets, ≥16px text, visible focus, text labels next to every
  status colour, `aria-live` messages, skip link, high-contrast and three text sizes). It has not
  been audited with a screen reader.
- Translations are complete for all interface text, but the demo transcript quote in the AI draft is
  shown in the language of the interface, not as a word-for-word bilingual transcript.
