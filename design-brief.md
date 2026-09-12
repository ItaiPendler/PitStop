# PitStop — Design Brief

## The product
**PitStop** is a mobile-first web app (installable PWA) for tracking a car's fuel
efficiency. You log each fill-up — date, odometer, liters, price — and it shows how
many **km per liter** you're getting, plus history and stats. Data is shared, so a
couple can both see and update it from their phones. **The UI is entirely in Hebrew
(right-to-left).**

## Who it's for
A household — e.g. a couple sharing one or two cars. Non-technical, mostly on
**phones**, occasionally desktop. The core job: *"log a fill-up in 10 seconds"* and
*"glance at how efficient my last tank was."*

## Non-negotiable constraints
- **Hebrew, full RTL.** Everything mirrored — text right-aligned, layouts flipped,
  icons/chevrons/arrows reversed, charts RTL. Latin numerals are fine.
- **Mobile-first, responsive** up to desktop. Large thumb targets; one-handed use; the
  "add fill-up" action always within easy reach.
- **App-like (PWA):** needs an **app icon** and splash; should feel like a native app
  on the home screen, not a webpage.
- **Formats:** currency **₪ (ILS)**, distance **km**, volume **liters (ל׳)**,
  efficiency **km/L (ק״מ לליטר)**, dates **DD/MM/YYYY**.
- **No account UI** — sign-in is a single "Sign in with Google" button; there are no
  passwords or profile screens to design.

## Screens to design
1. **Onboarding / Connect** — welcome + "Sign in with Google," then "choose your
   sheet." First-run "set up your car" state.
2. **Dashboard (main)** — the hero: **last fill-up's km/L, big**, with a smaller
   **rolling-average km/L** beneath it (so a partial fill never looks alarming). Car
   name/nickname, current odometer, last fill date + cost. Below: a **recent fill-ups
   list** (date · km/L · liters · ₪), newest first, tappable to edit.
3. **Add / edit fill-up** — a fast form: date (defaults to today), odometer, liters,
   total ₪ and/or ₪ per liter (linked), notes. Clear primary "Save." Inline validation
   (e.g. odometer lower than last → gentle warning).
4. **Statistics** — summary tiles (average km/L, total distance, total spend, avg ₪/L,
   cost per 100 km) + **charts** (efficiency over time, ₪/L over time, monthly spend).
   Charts render via Chart.js — design a clean, legible-on-mobile, RTL chart style.
5. **Settings** — edit car details; **switch between cars**; add a new car; manage the
   connected sheet; sign out.
6. **About** — what it is, how it works, privacy, short setup help.

## States to cover (not just the happy path)
- **Empty** (no fill-ups yet — encouraging first-entry state)
- **Loading** (fetching from the sheet)
- **Error / permission denied** and **view-only mode** (read access — add/edit hidden)
- **Offline** (data viewable, saving disabled)
- **First fill-up** (efficiency shows "—", with a hint that one more fill is needed)

## Design direction
Clean, calm, trustworthy, and **glanceable** — the headline number should read
instantly. Data-forward but friendly, not a spreadsheet. A subtle **pit-stop /
motorsport** personality is welcome (the name invites it) but keep it tasteful, not
gimmicky. Please bring an intentional, distinctive visual identity — avoid a generic
default-dashboard look. **Light and dark themes.**

## Deliverables
- Figma mockups for all 6 screens at **mobile + desktop** breakpoints, **light + dark**,
  including the key states above.
- A small **component/style system**: color tokens, typography scale (Hebrew-friendly
  typeface), buttons, inputs, cards, list rows, stat tiles, chart styles, bottom/side
  navigation.
- **App icon** + install/splash treatment.
- Notes on RTL specifics and any motion/interaction ideas.

## Out of scope (v1 — don't design, but leave room in the nav for later)
Expenses logging, maintenance/service records, reminders, multi-language toggle,
receipt photos.

## Suggested Hebrew labels (refine with a native copywriter)
תדלוק (fill-up) · צריכת דלק (fuel consumption) · קילומטראז׳ / מד־אוץ (odometer) ·
ליטרים · תאריך · הערות · רכב · הגדרות · סטטיסטיקה · אודות · ק״מ לליטר (km/L).

---

*A full functional spec exists — see `spec.md` — available if the designer wants
deeper detail.*
