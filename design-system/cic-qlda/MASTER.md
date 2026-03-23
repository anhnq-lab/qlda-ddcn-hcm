# CIC QLDA — Design System MASTER

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** CIC QLDA — Hệ thống quản lý dự án đầu tư xây dựng
**Updated:** 2026-03-22
**Tech Stack:** React 18 + TypeScript, Tailwind CSS v3, Vite, Supabase, Recharts, Lucide React

---

## Global Rules

### Color Palette

| Role | Hex / Tailwind | CSS Variable | Usage |
|------|----------------|--------------|-------|
| **Primary (Gold)** | `#D4A017` / `primary-500` | `--color-primary` | CTAs, active tabs, key highlights |
| **Accent (Dark Gold)** | `#B8860B` / `primary-600` | — | Hover states for primary elements |
| **Background Light** | `#F8FAFC` / `slate-50` | `--bg-page` | Main page background |
| **Background Dark** | `#0F172A` / `slate-900` | `--bg-page-dark` | Dark mode page background |
| **Surface Light** | `#FFFFFF` / `white` | — | Cards, panels in light mode |
| **Surface Dark** | `#1E293B` / `slate-800` | — | Cards, panels in dark mode |
| **Text Primary** | `#1E293B` / `slate-800` | — | Headings and strong text |
| **Text Secondary** | `#64748B` / `slate-500` | — | Labels, subtitles |
| **Text Muted** | `#94A3B8` / `slate-400` | — | Disabled, placeholders |
| **Success** | `#10B981` / `emerald-500` | — | Completed, healthy, approved |
| **Warning** | `#F59E0B` / `amber-500` | — | In-progress, caution |
| **Danger** | `#EF4444` / `red-500` | — | Errors, overdue, rejected |
| **Info** | `#3B82F6` / `blue-500` | — | Informational, pending |

**Color Notes:** "Corporate Elegant & Utilitarian" — gold as brand accent, semantic colors for status.

> ⚠️ Do NOT use orange/amber/blue/emerald/indigo mapped to gold. Each color must mean what it semantically represents.

### Board Colors (MANAGEMENT_BOARDS)
Each Ban QLDA has its own brand color used in charts and badges:

| Board | Color |
|-------|-------|
| Ban QLDA 1 | Per `types/project.types.ts` MANAGEMENT_BOARDS[].hex |
| Ban QLDA 2–5 | Same — do NOT override these in charts |

---

### Typography

- **Font:** `Be Vietnam Pro` (Google Fonts) — designed for Vietnamese diacritics
- **Fallback:** `system-ui, -apple-system, sans-serif`
- **Mono:** `JetBrains Mono` — for numbers in data tables
- **Mood:** Modern, professional, Vietnamese-first

**Google Fonts import:** (in `index.html`)
```html
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**Tailwind config:**
```js
fontFamily: {
  sans:    ['Be Vietnam Pro', 'system-ui', '-apple-system', 'sans-serif'],
  heading: ['Be Vietnam Pro', 'system-ui', '-apple-system', 'sans-serif'],
  mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
}
```

---

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px / 0.25rem` | Tight gaps |
| `--space-2` | `8px / 0.5rem` | Icon gaps, inline |
| `--space-4` | `16px / 1rem` | Standard padding |
| `--space-6` | `24px / 1.5rem` | Section padding |
| `--space-8` | `32px / 2rem` | Large gaps |
| `--space-12` | `48px / 3rem` | Section margins |
| `--space-16` | `64px / 4rem` | Hero padding |

---

### Shadow Depths

| Level | Tailwind | Usage |
|-------|----------|-------|
| `shadow-sm` | `shadow-sm` | Subtle card lift |
| `shadow-md` | `shadow-md` | Active dropdowns |
| `shadow-lg` | `shadow-lg` | Modals, overlays |

---

## Component Specs

### Stat Cards (KPI Cards)

- Container: `bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm`
- Icon bg: `bg-{color}-50 dark:bg-{color}-500/10` with icon `text-{color}-600 dark:text-{color}-400`
- Value: `text-2xl font-black text-slate-800 dark:text-white`
- Label: `text-[11px] font-bold text-slate-500 uppercase tracking-wider`
- Progress bar: `bg-{color}-500` full opacity, NOT opacity modifier

### Buttons

```css
/* Primary — Gold Brand */
.btn-primary {
  @apply bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl px-4 py-2 transition-all shadow-sm hover:shadow-md;
}

/* Secondary / Outline */
.btn-secondary {
  @apply bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-semibold rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all;
}

/* Danger */
.btn-danger {
  @apply bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-4 py-2 transition-all;
}
```

### Tables

- Header: `bg-gray-50 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400`
- Row hover: `hover:bg-blue-50/30 dark:hover:bg-slate-700/30`
- Dividers: `divide-y divide-gray-100 dark:divide-slate-700`
- Numbers: `font-mono tabular-nums text-right` — always right-aligned

### Badges / Status Pills

```
Success (completed):  bg-emerald-100 text-emerald-700  dark:bg-emerald-900/30 dark:text-emerald-400
Warning (in progress): bg-amber-100 text-amber-700    dark:bg-amber-900/30 dark:text-amber-400
Danger (overdue):     bg-red-100 text-red-700         dark:bg-red-900/30 dark:text-red-400
Info (pending):       bg-blue-100 text-blue-700       dark:bg-blue-900/30 dark:text-blue-400
Neutral:              bg-gray-100 text-gray-700       dark:bg-slate-700 dark:text-slate-300
```

### Form Inputs

```css
.input, .filter-primary {
  @apply bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 
         rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-slate-100
         focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none;
}
```

---

## Dark Mode Rules

- **Solid backgrounds only** — no `bg-white/50` or `bg-gray-50/80` — use solid `slate-800`, `slate-900`
- `bg-white dark:bg-slate-800` — standard card
- `bg-gray-50 dark:bg-slate-900` — page background, table headers
- `bg-gray-100 dark:bg-slate-700` — subtle section bg

---

## Recharts Charts

- **Axis ticks:** `fill: theme === 'dark' ? '#94A3B8' : '#6B7280'`
- **Grid lines:** `stroke: theme === 'dark' ? '#334155' : '#E5E7EB'`
- **Tooltip:** `bg-white dark:bg-slate-800` with `border border-gray-200 dark:border-slate-600`
- **KH Vốn & GN chart bars:** `planned` = `slate-200 / slate-600`, `actual` = `board.hex` (per board color)
- **Donut / Pie:** use `SOURCE_COLORS` from `capitalConstants.ts`

---

## Style Guidelines

**Style:** Corporate Elegant & Utilitarian

**Keywords:** Professional, data-dense, precise, Vietnamese ERP, trustworthy, clean grid

**Key Effects:**
- Hover transitions: 150–200ms ease
- No jarring color changes on hover — use lighter shade of same color
- `hover:-translate-y-1` only for primary CTA cards, NOT all elements
- Progress bars: `transition-all duration-700 ease-out`

---

## Anti-Patterns (Do NOT Use)

- ❌ **Emojis as icons** — Use Lucide React SVG icons only
- ❌ **Opacity hacks for dark mode** — `dark:bg-white/10` — use solid colors
- ❌ **Color remapping** — orange=gold, blue=gold etc. Each color must be semantic
- ❌ **Hardcoded hex in JSX** — except Recharts and board colors from `types/project.types.ts`
- ❌ **`Inter` font** — use `Be Vietnam Pro` (better Vietnamese support)
- ❌ **Missing `cursor-pointer`** — All clickable elements must have it
- ❌ **Layout-shifting hovers** — scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio (WCAG AA)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use Lucide React instead)
- [ ] All icons from `lucide-react` consistently sized (`w-4 h-4` or `w-5 h-5`)
- [ ] `cursor-pointer` on all interactive elements
- [ ] Hover states with smooth transitions (150–200ms)
- [ ] Dark mode: solid slate colors, no opacity tricks
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected (handled in `index.css`)
- [ ] `tabular-nums` on all number columns in tables
- [ ] Responsive: 375px, 768px, 1024px, 1440px tested
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
