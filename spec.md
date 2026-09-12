# PitStop — Product & Technical Specification

> **Status:** Draft v0.2 — core decisions locked (see §15)
> **Owner:** itaip
> **Last updated:** 2026-09-12

PitStop is a small, collaborative web app for tracking a car's fuel efficiency and
history. It replaces paper fuel receipts and manual km/L math, and lets a couple of
trusted people (e.g. you and your partner) see and update the same data from their
phones — with **no backend of its own**. All data lives in a **Google Sheet** you own.

---

## 1. Vision & problem

Today you track fuel on paper receipts: for each fill-up you write the date, liters
added, price, and odometer reading, then calculate km/L by hand. This is tedious,
easy to lose, and impossible to share.

**PitStop** turns that into a clean web app that:

- Records each fill-up in a few taps.
- Calculates and displays fuel efficiency automatically.
- Is shared — your partner (and a handful of others) see the same live data.
- Stores nothing on its own servers. The **Google Sheet is the single source of truth**.
- Runs as a static site on **GitHub Pages** — free, no server to maintain.
- Is in **Hebrew (RTL)** and installable on phones (PWA).

---

## 2. Goals & non-goals

### v1 goals

- Fuel/refueling tracking, end to end (add, view, edit history).
- Automatic efficiency (km/L) and cost stats, including charts.
- Multi-car support (each car is a tab in one spreadsheet).
- Google sign-in; access governed by Google's normal sheet sharing.
- Hebrew RTL UI, ILS (₪) currency, km & liters.
- Installable PWA with offline **viewing** of last-loaded data.

### Explicitly v2+ (not in v1)

- **Expenses** — logging non-fuel costs (service, tolls, insurance) in a _separate_
  table. v1 keeps the fuel log clean and reserves the structure for this.
- Maintenance / service records, repairs, tire changes.
- Documents & renewal reminders (insurance, license).
- Multi-language (English, etc.) and offline **write** queue.
- Photo attachments of receipts.

### Non-goals (probably never)

- PitStop-hosted accounts or database.
- Selling data / analytics on third-party servers.

---

## 3. Users & access model

- **Audience:** you + partner + a handful of family/friends (small, trusted group).
- **Identity:** everyone signs in with their **Google account**.
- **Authorization is Google's job, not PitStop's:** a person can read/write the data
  **iff** the spreadsheet has been shared with their Google account (Viewer =
  read-only in-app; Editor = can add/edit). PitStop has no roles or permission system
  of its own.
- **Read-only users:** if someone only has Viewer access, the app still renders, but
  write actions fail at Google's API. The UI must detect this and hide/disable
  add & edit, showing a friendly "you have view-only access" note.

---

## 4. Core architecture

```
┌───────────────────────────┐         ┌──────────────────────────┐
│  Browser (phone/desktop)  │         │        Google            │
│                           │  OAuth  │                          │
│  PitStop SPA (React)      │◀───────▶│  Google Identity Svc     │
│  - UI (Hebrew, RTL)       │  token  │  (sign-in + token)       │
│  - Sheets client (fetch)  │         │                          │
│  - localStorage: sheet id │  HTTPS  │  Google Sheets API v4    │
│                           │◀───────▶│  (the user's Sheet)      │
└───────────────────────────┘         └──────────────────────────┘
         Hosted on GitHub Pages (static files only)
```

- **100% client-side.** No PitStop server. The site is static HTML/JS/CSS on GitHub
  Pages. It talks **directly** from the browser to Google APIs using the signed-in
  user's short-lived access token.
- **PitStop stores almost nothing:** only the chosen spreadsheet id/link and small UI
  preferences, in the browser's `localStorage`. The access token is kept in memory
  and is not persisted.
- **The Sheet is the database.** All car and fuel data lives there. Anyone with access
  can also open the raw Sheet directly if they want.

### 4.1 Authentication & authorization (Google)

- Uses **Google Identity Services (GIS)**, token model, in the browser. No client
  secret is needed or used (safe for a public static site). Access tokens last ~1
  hour; when one expires the app silently requests a new one, falling back to a
  "reconnect" tap.
- **Scope — recommended:** `https://www.googleapis.com/auth/drive.file` **+ Google
  Picker.** This is a **non-sensitive** scope: the app can only touch the _specific
  file the user picks_ (or files it creates). Benefits:
  - **No Google app-verification** required, even when published.
  - Cleaner, less scary consent screen.
  - Onboarding becomes "pick your PitStop sheet" via the Google Picker.
- **Scope — simpler fallback:** `https://www.googleapis.com/auth/spreadsheets` +
  paste-a-link onboarding. Easier to build, but this is a **sensitive** scope:
  - Fine for our small group in **"Testing"** publishing mode (add each person as a
    _test user_, max 100). Test users see a one-time "unverified app" warning they can
    click through.
  - Going fully public would require Google verification.
- **Decision:** ship with **`drive.file` + Picker** to avoid verification and
  minimize access. (Paste-link + `spreadsheets` remains a documented fallback only.)

### 4.1.1 What this means for multiple users

There is no shared app login. Every person authenticates as **themselves**; the Google
Sheet's own sharing is the only access control.

| Ingredient        | Identifies              | Shared or personal                           |
| ----------------- | ----------------------- | -------------------------------------------- |
| **Client ID**     | the PitStop app         | one public value, same for everyone          |
| **Sheet ID**      | the file (from its URL) | same for everyone using that sheet           |
| **Access token**  | one signed-in user      | personal, ~1h, in that user's browser only   |
| **Drive sharing** | who may read/write      | the real gate — set via Drive's Share button |

**Flow (you vs. your partner):** each opens PitStop, signs in with their **own** Google
account, and receives their **own** short-lived token. Both use the same public Client
ID and the same Sheet ID. On **every** request Google re-checks _that token's user_
against the file's sharing list — owner/Editor → read + write; Viewer → read-only (app
drops to read-only mode); no access → denied. Tokens are never shared between people.

**Who do you add, and where?**

- **Cloud project members (IAM):** ❌ never — that list is only for people who
  _develop/administer_ the app, not end users.
- **OAuth "test users":** needed **only if** the consent screen is left in **Testing**
  mode. Because **`drive.file`** is a _non-sensitive_ scope, you can publish the consent
  screen to **"In production" without Google verification**, so **no user is added
  anywhere.**
- **To grant someone access:** just **share the Sheet** with their Google account in
  Drive. To revoke: un-share it.

Net: the one-time app setup is "publish consent screen to production," and per-person
access is purely a Drive share — nothing per-user in the Cloud project.

### 4.2 Deployment (GitHub Pages)

- Static build (Vite) published to GitHub Pages via a **GitHub Actions** workflow on
  push to `main`.
- **SPA routing on Pages:** use **hash-based routing** (`/#/stats`) or a `404.html`
  fallback so deep links / refreshes don't 404.
- The OAuth **Client ID** is public and baked into the build (this is expected and
  safe). Configure **Authorized JavaScript origins** for both
  `https://<user>.github.io` and `http://localhost:5173` (dev).
- Set Vite `base` to **`/PitStop/`** (repo name is **PitStop** → `https://<user>.github.io/PitStop/`) so assets resolve on Pages.

---

## 5. Tech stack

| Concern       | Choice                                 | Notes                                        |
| ------------- | -------------------------------------- | -------------------------------------------- |
| Framework     | **React + TypeScript**                 | Per your preference (React over Vue/Svelte). |
| Build/dev     | **Vite**                               | Fast, static output for Pages.               |
| Routing       | **React Router (hash history)**        | Avoids Pages deep-link 404s.                 |
| Charts        | **Chart.js** (`react-chartjs-2`)       | Good RTL support; lightweight.               |
| Auth          | **Google Identity Services**           | Token model, loaded via Google script.       |
| Sheets access | **Sheets API v4 via `fetch`**          | No heavy SDK needed in-browser.              |
| File pick     | **Google Picker API**                  | For the `drive.file` onboarding flow.        |
| PWA           | **vite-plugin-pwa** (Workbox)          | Installable + offline app shell/read.        |
| Styling       | Plain CSS / CSS Modules (designer-led) | RTL via logical properties; see §10.         |
| i18n          | Simple Hebrew strings module           | Structured so multi-language is easy later.  |

> Vue would be an equally good fit; the whole design is framework-agnostic, so we can
> swap if you change your mind.

---

## 6. Data model — Google Sheet structure

**One spreadsheet** (shared with the group) holds **one tab (sheet) per car**.

To stay robust against manual edits and row insertions, PitStop, on first use of a
tab, writes a known layout **and defines named ranges** it then reads/writes by name
(not by hardcoded cell). A hidden **schema-version marker** lets us migrate later.

### 6.1 Per-car tab layout

```
        A                 B            C        D               E              F                 G
 1  PitStop              1  ← schema version marker (col A label, col B value)
 2
 3  ── Car info ──
 4  Make                 Toyota
 5  Model                Corolla
 6  Year                 2018
 7  License plate        12-345-67
 8  Nickname             שלי         ← used for display & tab name
 9  Tank capacity (L)    50          ← optional
10  Initial odometer     41200       ← optional
11
12  Date        Odometer(km)  Liters   Total ₪   ₪/L     Efficiency(km/L)   Notes   ← fuel-log header
13  2026-01-04  41560         32.1     181.20    5.646   (formula)          ...
14  2026-01-19  41980         28.0     158.20    5.650   (formula)          ...
    ...
```

- **Named ranges** created by the app: `CarInfo` (the A4:B10 block) and `FuelLog`
  (the header + data rows). Reads use these; new fill-ups are **appended** below the
  last data row of `FuelLog` (car-info block sits above and is never touched by
  appends).
- **Efficiency column is a Sheet formula** (computed in-sheet, so the app doesn't have
  to). See §7 for the exact formula. First data row's efficiency is blank.

### 6.2 Fuel-log columns (v1)

| Col | Field             | Type    | Req? | Notes                                       |
| --- | ----------------- | ------- | ---- | ------------------------------------------- |
| A   | Date              | date    | ✔    | Defaults to today in the form.              |
| B   | Odometer (km)     | number  | ✔    | Cumulative reading; must be ≥ previous row. |
| C   | Liters            | number  | ✔    | Amount added this fill.                     |
| D   | Total price (₪)   | number  | –    | Optional; auto-derives ₪/L.                 |
| E   | Price / L (₪)     | number  | –    | Optional; auto-derives total.               |
| F   | Efficiency (km/L) | formula | auto | `(B_now − B_prev) / C_now`; blank on row 1. |
| G   | Notes             | text    | –    | Free text.                                  |

> D and E are linked: entering either one auto-fills the other from Liters in the
> form. Storing both is convenient and matches receipts.

### 6.3 Reserved for v2 (not created in v1)

- A separate **Expenses** table (its own tab, or a clearly separated block) with its
  own columns (date, category, amount ₪, odometer, notes). Kept separate because its
  shape differs from fuel records.

### 6.4 Empty vs existing sheet

- **Empty tab / new car:** PitStop injects the layout above + named ranges + the
  efficiency formula + schema marker.
- **Existing valid tab:** detected via the schema marker and named ranges; data is
  read and displayed.
- **Malformed / hand-broken tab:** app shows a clear error with a "repair structure"
  action rather than corrupting data.

---

## 7. Efficiency & statistics definitions

### 7.1 Per-fill efficiency (the headline number)

```
efficiency(km/L) at fill N = (odometer_N − odometer_{N−1}) / liters_N
```

- Divides the distance since the last fill by the fuel added **this** fill (the fuel
  that refilled the tank for that distance). Requires that both this and the previous
  fill topped up the tank.
- **First fill:** no previous odometer → efficiency is blank.
- **Partial fills:** a partial top-up makes that single row read high (and the next
  full fill read low). This is expected; individual rows are _estimates_.

### 7.2 Robust average (partial-fill proof)

```
average efficiency = (odometer_last − odometer_first) / Σ(liters, excluding first fill)
```

- Because it sums all distance over all fuel, partial fills wash out. This is the
  **trustworthy** number, shown alongside the last-fill value so the headline is never
  misleading. A rolling window (e.g. last 5 fills) is also offered.

### 7.3 Stats page metrics (v1)

- Average efficiency (lifetime + rolling), **best** and **worst** fill.
- Total distance, total liters, total spend (₪).
- Average **₪/L**, latest ₪/L, and price trend.
- **Cost per 100 km** (₪) and cost per km.
- Fill-up count; average days & km between fills.
- **Charts:** efficiency over time (line, with average overlay), ₪/L over time (line),
  monthly spend (bar), liters per fill (bar). All RTL-aware.

---

## 8. Screens (Hebrew, RTL)

> Visual design defined in `DESIGN.md` (see §9.1). Below is structure & behavior only.

1. **Onboarding / Connect**
   - Sign in with Google → pick your PitStop sheet (Picker) _or_ paste its link.
   - If the sheet/tab is empty, offer "set up my car" (injects structure).
   - Remembers the sheet locally so it's one-time.

2. **Main / Dashboard**
   - **Hero:** last-fill efficiency (big), with the robust average shown beneath.
   - Car summary (nickname, make/model/year), current odometer, last fill date & cost.
   - **Recent fuelings** list (date, km/L, liters, ₪), newest first; tap to **edit**,
     swipe/menu to **delete** (with confirm).

3. **Add / edit fueling**
   - Same form for new and existing entries. Fields: date (default today), odometer,
     liters, total ₪ and/or ₪/L (auto-linked), notes.
   - Validation: odometer ≥ last reading (warn, allow override), liters > 0, date not
     in the future (warn). Duplicate-ish entry guard.
   - Add = append; edit = update the row; delete = remove the row. Optimistic UI with
     error rollback. After any write, re-read so efficiency recalculates.

4. **Statistics**
   - Summary tiles + the charts from §7.3. Range filter (all / year / last N).

5. **Settings**
   - Edit car info; **switch car** (tabs); **add a new car** (creates a tab); manage
     the connected sheet link; sign out. Locale is fixed to Hebrew/₪/km in v1 but shown.

6. **About**
   - What PitStop is, how the Sheet-as-database model works, privacy, and a short
     setup guide (share the sheet, sign in, add a fill-up).

---

## 9. Offline / PWA

- Installable (add-to-home-screen), app-shell cached via Workbox (shell assets only —
  UI chrome, not data).
- **No offline data viewing.** All car/fuel data is fetched live from the Sheet after
  signing in; nothing is cached or shown without an active, signed-in session. If
  there's no connectivity or no valid session, the app shows a clear "sign in" /
  "you're offline" state instead of stale data.
- **Writes require connectivity** in v1 (clear "you're offline" message). An offline
  write queue is a v2 improvement.

---

## 9.1 Visual design

Visual identity is defined in **`DESIGN.md`** (motorsport/telemetry aesthetic — dark
slate + amber/emerald accents, Rubik + JetBrains Mono, RTL-native layout). It
supersedes `design-brief.md`'s brief-only guidance now that the design is in-house.

- **Dark theme only.** No light theme in v1 — the telemetry aesthetic is designed
  for a dark canvas, and it simplifies the token set and QA surface.

---

## 10. Localization & RTL

- **Hebrew UI, full RTL** (`dir="rtl"`, `lang="he"`). Use CSS **logical properties**
  (`margin-inline-start`, etc.) so layout mirrors correctly.
- Formats: currency **₪** (ILS), dates **DD/MM/YYYY**, numbers with locale separators.
- All user-facing text lives in a single strings module to make future languages easy.
- Charts configured for RTL axes/legends/tooltips.

---

## 11. Security & privacy

- No PitStop server; data never touches third-party servers — only Google's APIs.
- Access token kept **in memory** only; **only** the sheet id + UI prefs in
  `localStorage`.
- Minimal scope (`drive.file` recommended) → the app can only touch the sheet you pick.
- Access is fully controlled by **Google Sheet sharing**; revoke by un-sharing.
- Honest caveat: this is a client-only app, so **anyone with edit access to the sheet
  can change any data** — appropriate for a small trusted group.

---

## 12. Error handling & edge cases

| Case                          | Behavior                                                                |
| ----------------------------- | ----------------------------------------------------------------------- |
| Not signed in                 | Gate app behind sign-in; explain why Google is needed.                  |
| Token expired                 | Silent refresh; else a "reconnect" prompt.                              |
| No sheet chosen               | Onboarding flow.                                                        |
| Permission denied (view-only) | Read-only mode; disable add/edit with a note.                           |
| Empty tab                     | Offer to inject structure.                                              |
| Malformed tab                 | Error + "repair structure"; never silently corrupt.                     |
| First fuelling                | Efficiency blank; explain one more fill is needed.                      |
| Odometer < previous           | Warn (possible typo / odometer reset); allow override.                  |
| Concurrent edits              | Appends rarely conflict; last-write-wins on edits; re-read after write. |
| API rate limit                | Backoff + retry; friendly message.                                      |

---

## 13. Setup checklist (for deployment)

1. Google Cloud project → enable **Sheets API** (and **Picker API** if using it).
2. Configure **OAuth consent screen** (External; app name PitStop). With the
   non-sensitive `drive.file` scope, set publishing status to **In production** — no
   verification and no test-user list required. (Only add test users if you
   deliberately keep it in Testing mode.)
3. Create **OAuth Client ID** (Web); add authorized origins
   (`https://<user>.github.io`, `http://localhost:5173`).
4. Put the public Client ID in the app config.
5. GitHub repo → **Pages** via Actions; set Vite `base` to `/PitStop/`.
6. Create a spreadsheet, share it with the group's Google accounts.
7. Open PitStop → sign in → pick the sheet → add your car → log a fill-up.

---

## 14. Roadmap

- **v1** — Fuel tracking with **add/edit/delete**, stats + charts, multi-car, Google
  auth (`drive.file` + Picker), Hebrew RTL, PWA.
- **v1.1** — Polish from designer mockups; rolling-average tuning; range filters.
- **v2** — Separate **Expenses** table; maintenance/service; renewal reminders;
  multi-language; offline write queue; receipt photos.

---

## 15. Decisions (resolved) & remaining assumptions

**Locked:**

1. **Auth scope:** `drive.file` + Google Picker (non-sensitive, no verification).
2. **Headline metric:** last-fill km/L as the hero, robust rolling average beneath.
3. **Editing:** full **add / edit / delete** of fill-ups in v1.
4. **Tab naming:** each car tab is named by its **nickname**.
5. **Site:** repo/site name **PitStop** → `https://<user>.github.io/PitStop/`,
   Vite `base = /PitStop/`, OAuth origins set accordingly.
6. **No offline data viewing:** all car/fuel data must be live and requires an
   active signed-in session to display — no cached/last-known data shown offline
   or while signed out (revised from an earlier offline-read draft in §9).

**Assumptions (call out if wrong):**

7. **One shared spreadsheet** for the whole group (not per-person sheets).
8. **₪/L and total price both optional and auto-linked** (enter either, the other
   fills in; both stored).
9. Distance in **km**, volume in **liters**, currency **₪ (ILS)**, UI **Hebrew/RTL**.
