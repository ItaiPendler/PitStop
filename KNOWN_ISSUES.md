# Known issue: "Popup window closed" on Google sign-in (deployed site only)

**Status:** Unresolved, investigation paused.

## Symptom

On the deployed site (`https://itaipendler.github.io/PitStop/`), clicking "sign in
with Google" sometimes fails with an error whose underlying cause is GIS
reporting `popup_closed`. The user opens the popup, selects an account, reaches
the consent screen, clicks Allow — the popup then closes normally (looks
successful), but the app never receives an access token and shows a sign-in
error instead.

## What's confirmed

- **Does not reproduce on `localhost`** — only on the deployed GitHub Pages
  origin. This is the one fact every theory must explain.
- **Reproduces on both mobile (Chrome, Android) and desktop (Firefox)** — not
  browser-specific, not mobile-specific.
- The Google Cloud Console OAuth Client ID's **Authorized JavaScript origins**
  correctly includes `https://itaipendler.github.io`.
- The OAuth consent screen is in **Testing** publish status, but the account
  used **is** listed as a test user — not an access/authorization problem.
- **No `VITE_GOOGLE_CLIENT_SECRET` is needed or used** — PitStop's flow is
  GIS's token client (`initTokenClient`), a public-client browser flow with no
  server-side code exchange. Only `VITE_GOOGLE_CLIENT_ID` and
  `VITE_GOOGLE_API_KEY` are required and are the only two secrets wired into
  `.github/workflows/deploy.yml`.
- **Ruled out: the installable PWA / service worker.** Even though bug reports
  started right after the `pwa-setup` PR merged (suspicious timing), the user
  tested with the service worker unregistered via DevTools and the bug still
  occurred. The generated `dist/sw.js` also has no `controllerchange`-based
  reload logic, and the SW can only intercept same-origin (`/PitStop/`)
  requests — it cannot touch the cross-origin OAuth popup at all.
- **Ruled out: GitHub Pages response headers.** Checked directly
  (`curl -D -`) — no `Cross-Origin-Opener-Policy`, `Content-Security-Policy`,
  or similar header is sent that could interfere with the popup/opener
  relationship. `index.html` also has no COOP/CSP meta tags.
- **Ruled out (for this data set): double-click / duplicate `requestAccessToken`
  race.** The sign-in button does correctly disable via React state, and a
  double-click race wouldn't explain why it only fails on the deployed origin
  and never on localhost — this theory was proposed and then retracted once
  checked against that fact.
- Temporary diagnostic logging (added in `src/auth/googleTokenClient.ts`,
  commit on branch `debug/popup-closed-logging`, PR #8) captured a real
  failure on deployed Firefox:
  - `requestAccessToken called` → `token client ready, opening popup`
    (~2ms apart — no meaningful delay between click and popup-open).
  - Native browser console line: `Opening multiple popups was blocked due to
    lack of user activation.`
  - Native browser console line: `Storage access automatically granted for
    origin "https://accounts.google.com" on "https://itaipendler.github.io".`
    (Firefox's Storage Access API negotiating cross-site storage access —
    this only appears on the real deployed origin, never seen on localhost.)
  - ~10 seconds later: `error_callback` fires with
    `{ type: 'popup_closed', message: 'Popup window closed' }`.
  - The real success `callback` (which would carry the actual access token)
    **never fires at all** in this capture — not just delayed.

## Leading theory (not proven, not acted on)

GIS's popup-based token flow (`ux_mode: 'popup'`, the default) relies on the
popup and the opener page communicating (via `postMessage`/shared storage) to
hand the token back after consent. On a real public origin, browsers apply
third-party storage partitioning/tracking protections between our page and
`accounts.google.com` that don't apply the same way on `localhost` (a common
dev-convenience exemption in most browsers). That would explain the one solid
fact we have — works on localhost, fails on the real domain, regardless of
browser/device. In this theory, the storage/postMessage negotiation on the
real origin is failing to deliver the token back before GIS's own poller
decides the (genuinely closed, post-consent) popup means "cancelled."

We found a similar symptom independently reported/handled in another
open-source codebase with the same architecture (Google Picker + GIS token
client): see their comments in `google-picker.ts` (`spellcontrol` repo,
`georgepapagapitos/spellcontrol`) about `popup_closed` firing on both
cancellation *and* successful grants, and about duplicate `requestAccessToken`
calls triggering the same "multiple popups blocked" message. Their situation
isn't identical to ours (their fix was a grace period + a call-dedup guard),
but the parallel is worth knowing about if this is revisited.

## Proposed (not yet approved) fix

Switch the sign-in flow from popup-based (`ux_mode: 'popup'`, implicit) to
**redirect-based** (`ux_mode: 'redirect'`), which avoids the
popup/opener/third-party-storage dependency entirely — the browser does a
normal same-origin full-page navigation to Google and back. This is a bigger
architectural change than a bug fix: it needs a registered redirect URI in the
Google Cloud Console, and a bootstrap step on page load to pick up the
returned token instead of receiving it via a popup callback. The app's
"access token is memory-only, no silent restore on reload" design (see
`AuthContext.tsx` comments) would need to be revisited for this flow.

**This has not been implemented.** Picking this back up should start with:
confirming the redirect flow actually resolves it in practice (no way to be
100% sure without trying it), and getting explicit sign-off before touching
`src/auth/googleTokenClient.ts` / `src/auth/AuthContext.tsx`, since this
changes core auth architecture, not just a small tweak.

## Cleanup still pending

- The temporary diagnostic `console.log` lines added to
  `src/auth/googleTokenClient.ts` (PR #8, branch `debug/popup-closed-logging`)
  are still live on `main`/deployed. They should be removed once this
  investigation resumes and is resolved (or sooner, if they're noisy).
- The unused `VITE_GOOGLE_CLIENT_SECRET` GitHub Actions secret can be safely
  deleted — confirmed unnecessary for this app's auth flow.
