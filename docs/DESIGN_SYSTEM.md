# ResQOne — Design System & Visual Specification

> **Primary Visual Specification:** [`src/assets/mockup_reference.png`](../src/assets/mockup_reference.png)  
> **Interactive Live Showcase:** Route `/design-system` (`src/pages/DesignSystemPage.jsx`)  
> **Tailwind Configuration:** [`tailwind.config.js`](../tailwind.config.js)  
> **Global CSS & Font Declarations:** [`src/index.css`](../src/index.css)

---

## 1. The Approved Visual Reference (`mockup_reference.png`)

The file located at **`src/assets/mockup_reference.png`** (file size: ~1.8 MB) serves as the **strict, authoritative visual specification** for the entire ResQOne Citizen application.

All components, layouts, color codes, border radiuses, typography, and spacing were designed to match this reference. Every developer and AI engineer working on this repository must treat this image as the project's design specification, not merely as optional inspiration.

### Composite Panels in `mockup_reference.png`:

```
+-----------------------------------------------------------------------------------------------+
|                            mockup_reference.png Composite Layout                              |
+---------------------------------------------------------------+-------------------------------+
| Top Left:                                                     | Top Right:                    |
| - Citizen Public Landing Page                                 | - Citizen Login Split Screen  |
|   (Hero Ambulance Visual, Headline, CTAs, Feature Cards)      | - Citizen Registration Screen |
+---------------------------------------------------------------+-------------------------------+
| Middle Left:                                                  | Middle Right:                 |
| - Citizen Dashboard Workspace                                 | - Emergency Reporting Form    |
|   (Navy Sidebar, Stat Cards, Weather Advisory, Incidents)     |   (7 Incident Selector Cards, |
|                                                               |    GPS Search, Upload Zone)   |
+---------------------------------------------------------------+-------------------------------+
| Bottom Left:                                                  | Bottom Right:                 |
| - My Incidents List                                           | - Citizen Profile Details     |
|   (Status Tabs, Filter Search, Compact Incident Rows)         | - Notification Center Feed    |
| - Incident Details View                                       |   (Severity Alerts, Filters)  |
|   (5-Stage Visual Timeline, Responder Card, GPS Map)          |                               |
+---------------------------------------------------------------+-------------------------------+
```

---

## 2. Color Palette & Design Tokens

The color tokens are formally declared in `tailwind.config.js`:

### 2.1 Primary Brand & Emergency Red
Used for critical actions, emergency report buttons, active sidebar navigation highlights, and high-urgency alerts:

| Color Name | Token / Class | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Emergency Red (Primary)** | `bg-red-600` / `text-red-600` | `#DC2626` | Primary CTAs, active sidebar link background, brand accents |
| **Red Hover / Active** | `bg-red-700` | `#B91C1C` | Button hover state, pressed states |
| **Red Dark** | `bg-red-800` | `#991B1B` | High-contrast borders, focused outlines |
| **Red Light Surface** | `bg-red-50` | `#FEF2F2` | Alert backgrounds, badge tints, selected card glow |
| **Red Border Tint** | `border-red-200` | `#FECACA` | Borders on emergency alerts and active selector cards |

### 2.2 Deep Navy / Charcoal Sidebar (`sidebar.*`)
Used for the persistent desktop sidebar, mobile drawer background, and dark marketing footer:

| Color Name | Token / Class | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Sidebar Default** | `bg-[#111827]` | `#111827` | Primary desktop sidebar surface |
| **Sidebar Dark** | `bg-[#0f172a]` | `#0F172A` | Mobile drawer header, dark footer surface |
| **Sidebar Hover** | `hover:bg-slate-800` | `#1F2937` | Inactive sidebar link hover background |
| **Sidebar Border** | `border-slate-800` | `#374151` | Divider lines between sidebar sections |
| **Sidebar Muted Text** | `text-slate-400` | `#9CA3AF` | Inactive icon colors, secondary labels |
| **Sidebar Text** | `text-slate-200` | `#F3F4F6` | Inactive nav link labels |

### 2.3 Incident Status Badges (`status.*`)
Colors strictly match the status pills illustrated in `mockup_reference.png`:

| Status State | Background Token | Text Token | Border Token | Visual Appearance |
| :--- | :--- | :--- | :--- | :--- |
| **In Progress** | `#FEF3C7` (`bg-amber-50`) | `#B45309` (`text-amber-700`) | `#FDE68A` | Warm Amber pill indicating dispatched units currently responding |
| **Resolved** | `#DCFCE7` (`bg-emerald-50`) | `#15803D` (`text-emerald-700`) | `#BBF7D0` | Fresh Green pill indicating emergency successfully completed |
| **Reported** | `#E0F2FE` (`bg-sky-50`) | `#0369A1` (`text-sky-700`) | `#BAE6FD` | Sky Blue pill indicating incident received by dispatch |
| **Verified** | `#EDE9FE` (`bg-violet-50`) | `#6D28D9` (`text-violet-700`) | `#DDD6FE` | Purple pill indicating operator confirmed caller details |

### 2.4 Neutral Surface & Content Slates
| Surface Name | Hex Code | Tailwind Utility | Purpose |
| :--- | :--- | :--- | :--- |
| **App Canvas** | `#F8FAFC` | `bg-slate-50` | Global page body background |
| **Card Surface** | `#FFFFFF` | `bg-white` | White content surfaces, modals, popovers |
| **Card Borders** | `#E2E8F0` | `border-slate-200` | Subtle hairline borders framing cards |
| **Primary Text** | `#0F172A` | `text-slate-900` | High-contrast headings and primary labels |
| **Secondary Text** | `#64748B` | `text-slate-500` | Timestamps, subtitles, helper hints |

---

## 3. Typography System

The application relies on the **Inter** font family loaded from Google Fonts in `index.html` with clean system fallbacks:

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Scale & Hierarchy:

| Element | Tailwind Classes | Visual Style |
| :--- | :--- | :--- |
| **Hero Headline** | `text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900` | High-impact bold headline for landing |
| **Page Title** | `text-lg sm:text-xl font-bold text-slate-900` | Workspace page titles (`AppHeader`) |
| **Section Heading** | `text-base font-bold text-slate-900` | Card titles, group dividers |
| **Body Standard** | `text-sm font-normal text-slate-600 leading-relaxed` | General readable copy and form labels |
| **Small / Meta** | `text-xs font-medium text-slate-500` | Timestamps, coordinates, subtext |
| **Micro / Badges** | `text-[10px] font-bold uppercase tracking-wider` | Incident badges, category tags, notification counts |

---

## 4. Elevation, Shadows & Border Radius

### Custom Shadows (`tailwind.config.js`):
- **`shadow-resq-card`**: `0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`  
  *Subtle, clean elevation used on cards and stat widgets to maintain a flat, professional feel.*
- **`shadow-resq-elevated`**: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)`  
  *Used on modals, floating drawers, and active hover cards.*

### Rounded Corners:
- **`rounded-resq`**: `0.5rem` (`8px`) — Standard for inputs, buttons, and inner card containers.
- **`rounded-resq-lg`**: `0.75rem` (`12px`) — Outer boundary for primary cards and modal dialogs.
- **`rounded-full`**: Pill shapes for badges and avatar circles.

---

## 5. Standard Component Guidelines

### 5.1 Buttons (`src/components/common/Button.jsx`)
```jsx
import Button from '../components/common/Button';

// 1. Primary Action (Emergency Red)
<Button variant="primary" size="md" icon={ShieldAlert}>
  Report Emergency
</Button>

// 2. Secondary Outline Action
<Button variant="outline" size="md">
  Learn More
</Button>

// 3. Subtle Ghost Action
<Button variant="ghost" size="sm">
  Cancel
</Button>
```
- **States:** Supports `loading={true}` (replaces icon with animated spinner and disables pointer events) and `disabled={true}` (`opacity-50`).

### 5.2 Form Inputs (`src/components/common/Input.jsx`)
```jsx
import Input from '../components/common/Input';
import { Mail } from 'lucide-react';

<Input
  label="Email Address"
  type="email"
  icon={Mail}
  placeholder="citizen@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>
```
- **Error States:** When `error` prop is passed, border shifts to `border-red-500`, focus ring turns red, and an inline red error message appears below.

### 5.3 Status Badges (`src/components/common/Badge.jsx`)
```jsx
import Badge from '../components/common/Badge';

<Badge variant="progress">In Progress</Badge>
<Badge variant="resolved">Resolved</Badge>
<Badge variant="reported">Reported</Badge>
<Badge variant="verified">Verified</Badge>
```

### 5.4 Cards (`src/components/common/Card.jsx`)
Structured using subcomponents for consistent spacing:
```jsx
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting context description.</CardDescription>
  </CardHeader>
  <CardContent>
    Main body content...
  </CardContent>
</Card>
```

---

## 6. Visual Audit: Live Demonstration at `/design-system`

To inspect all design tokens, buttons, badges, modals, and input states interactively in the browser:
1. Start the dev server: `npm run dev -- --port 3000`.
2. Open your browser to: **`http://localhost:3000/design-system`**.
3. This page serves as a living styleguide and component catalog for all ResQOne contributors.
