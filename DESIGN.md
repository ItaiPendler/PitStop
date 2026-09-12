---
name: PitStop Fuel & Fleet Monitor
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffbda5'
  on-tertiary: '#5a1c00'
  tertiary-container: '#ff956b'
  on-tertiary-container: '#7a2800'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#7f2b00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-hero:
    fontFamily: Rubik
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Rubik
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Rubik
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Rubik
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Rubik
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-telemetry-lg:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.03em
  label-telemetry-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  caption:
    fontFamily: Rubik
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers a high-precision, motorsport-inspired utility aesthetic optimized for instant telemetry and daily fuel tracking. The interface blends the calm, disciplined clarity of flight instruments and pit-wall monitors with consumer-grade ergonomics. It is engineered primarily for mobile field use at bright petrol stations (one-thumb triage, glanceable numbers, high contrast), while scaling to comprehensive desktop fleet analytics.

### Visual Style

- **Telemetry Precision:** Grounded in deep slate (`#0F172A`), high-visibility amber/fuel orange accents, and crisp technical readouts. Information hierarchy mirrors racing HUDs: instantaneous values are oversized and unmistakable, secondary metrics sit in low-noise auxiliary tiers.
- **Calm Utility:** Avoids gimmicky skeuomorphism or sensory overload. The atmosphere is quiet, controlled, and trustworthy, punctuated by targeted neon-amber and performance-emerald signals.
- **Native RTL Architecture:** Designed from the foundational grid up for bidirectional integrity, with Hebrew as the primary script, flowing naturally right-to-left with balanced metric units and numeric strings.

## Colors

The system uses a dark telemetry foundation designed for high legibility under bright sunlight and night-time driving conditions alike.

### Color Roles & Rationale

- **Primary (`#F59E0B` - Pit Amber):** Serves as the primary operational accent—fill triggers, active route milestones, speed alerts, and key interactive focal points.
- **Secondary (`#10B981` - Lap Emerald):** Dedicated strictly to efficiency gains, below-budget fill-ups, optimal km/L ratings, and positive delta readouts.
- **Tertiary (`#EA580C` - Rev Orange):** Used for peak consumption warnings, critical fuel thresholds, and overdue service alerts.
- **Neutral Surface Hierarchy:**
  - Base Canvas: Deep Graphite/Slate (`#0F172A`)
  - Elevated Container Tier 1: `#1E293B`
  - Elevated Container Tier 2: `#334155`
  - Subtle Ghost Borders: `rgba(241, 245, 249, 0.08)`
  - Primary Text: Crisp Ice White (`#F8FAFC`)
  - Secondary Text: Slate Neutral (`#94A3B8`)
  - Numeric Telemetry: Optical Pure White (`#FFFFFF`) with mono spacing

## Typography

The typographic hierarchy is customized for Hebrew legibility and high-speed scan efficiency.

- **Primary Hebrew Engine (`Rubik`):** Selected for its sturdy geometric architecture, natural Hebrew diacritics support, and open counters. It provides immediate readability on dashboard mounts without visual fatigue.
- **Telemetry & Gauge Numerals (`JetBrains Mono`):** Applied to real-time metrics, ILS (`₪`) amounts, odometer logs, and fuel volumes (`L`). Monospaced alignment prevents layout jitter when values tick live.
- **RTL & Number Handling:** Numbers and Latin units (e.g., `12.4 km/L`, `₪ 340.50`) retain left-to-right internal ordering (`dir="ltr"` or `unicode-bidi: plaintext`) within Hebrew RTL strings to prevent inverted hyphenation or broken decimals.

## Layout & Spacing

The system runs on an 8-point rhythmic grid, optimized for fluid adaptation across handheld mobile viewports and multi-column desktop control centers.

### Form Factor Behavior

- **Mobile (Viewport < 768px):** Single-column stacked telemetry cards with a fixed 56px bottom navigation bar pinned inside the thumb zone. Outer margins stay tight at `margin: 1rem` to maximize screen real estate for quick data entry.
- **Desktop (Viewport >= 1024px):** Reflows into a 12-column grid. Left-hand mirrored desktop sidebar (positioned physically on the right in RTL mode) handles vehicle fleet switching, while the main canvas splits into a 2:1 ratio (live telemetry graphs and refill logs vs. summary gauges and quick-add drawer).
- **RTL Grid Mirroring:** All gutters, margins, paddings, and column offsets systematically reverse. Flex and Grid specifications rely strictly on CSS Logical Properties (`padding-inline-start`, `margin-inline-end`, `inset-inline`).

## Elevation & Depth

This system avoids heavy, soft drop shadows that wash out under outdoor daylight. Visual hierarchy is established via tonal layering paired with razor-sharp micro-borders.

- **Level 0 (Canvas):** Base background `#0F172A`. Absolute baseline.
- **Level 1 (Cards & Data Tiles):** `#1E293B` background reinforced with a 1px ghost border (`rgba(241, 245, 249, 0.08)`).
- **Level 2 (Active Gauges & Floating Drawers):** `#334155` background, 1px border (`rgba(241, 245, 249, 0.14)`), and a tight ambient shadow: `0 4px 20px -2px rgba(0, 0, 0, 0.45)`.
- **Telemetry Glow (Accent Elevation):** Active buttons and warning indicators emit a low-spread chromatic aura rather than black shadow:
  - Fueling focus state: `0 0 16px -2px rgba(245, 158, 11, 0.35)`
  - Efficiency optimal state: `0 0 16px -2px rgba(16, 185, 129, 0.30)`

## Shapes

The design uses balanced, modern rounded geometry (`level 2` - 0.5rem / 8px base radius). This bridges the gap between precision industrial cockpit equipment and ergonomic touchscreen software.

- **Input Fields & Action Controls:** 8px (`rounded-md` / 0.5rem) to ensure clear tap targets.
- **Telemetry & Metric Cards:** 16px (`rounded-lg` / 1rem) for self-contained, protective enclosures.
- **Status Pills & Live Chips:** Full pill contour (`9999px`) to immediately signal transient or categorized telemetry (e.g., fuel type, tank status).

## Components

### Buttons

- **Pit Primary Button:** High-visibility amber (`#F59E0B`) background with deep slate text (`#0F172A`, Rubik 600). 48px minimum touch height for gloved or one-handed operation. On press, scales down smoothly to `0.98` scale.
- **Telemetry Secondary:** Transparent slate background with a 1px border (`rgba(241, 245, 249, 0.16)`) and ice-white text.
- **RTL Icon Placement:** Action icons (plus sign, pump symbol) lead on the right side of Hebrew label text with `space-sm` separation.

### Metric Readout Cards (Telemetry Tiles)

- Built with a top auxiliary row containing the Hebrew metric label (e.g., "צריכה ממוצעת") in `label-sm` slate, paired with a small trend badge.
- The hero metric is rendered in pure white `JetBrains Mono`, followed immediately by a muted Latin/Hebrew unit descriptor (e.g., `14.2` `ק"מ/ל`).

### Input Fields

- Large-format, dark-filled containers (`#1E293B`) with high-contrast text inputs.
- Numeric inputs (Odometer, Liters, ILS total) force numeric keypad mode (`inputmode="decimal"`), RTL layout direction with LTR interior alignment, and high-visibility trailing currency/unit markers pinned to the left edge of the input.

### Efficiency Status Chips

- Compact pills utilizing subtle alpha-tinted backgrounds:
  - Optimal: `rgba(16, 185, 129, 0.15)` background with `#10B981` text and dot indicator.
  - Caution: `rgba(234, 88, 12, 0.15)` background with `#EA580C` text.
- Dot status indicator always sits on the physical right (lead side in RTL).

### Selection & Toggles (Checkboxes, Radios, Segmented Controls)

- Segmented fuel-grade switch (95 / 98 / Diesel) built as an integrated dark slate bar with an animated amber sliding pill indicating active state.
- Checkboxes use 20px rounded squares with heavy checkmarks and vibrant emerald fills on confirmed state.
