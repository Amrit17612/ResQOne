# ResQOne — Citizen Frontend Technical Documentation & AI Handover Guide

> **Repository:** [https://github.com/Amrit17612/ResQOne](https://github.com/Amrit17612/ResQOne)  
> **Local Workspace Path:** `/Users/a6203427868/Desktop/ResQone`  
> **Current Status:** Phase 1 (Citizen Frontend) Complete — Milestones 1 to 9 Verified & Built  
> **Latest Verified Git Commit:** `e59eee8` (`test: audit and stabilize citizen frontend`)  
> **Primary Design Reference:** [`src/assets/mockup_reference.png`](../src/assets/mockup_reference.png)

---

## 1. Executive Summary & Purpose

**ResQOne** is a modern civic emergency response and incident-tracking web application designed to connect citizens with emergency services (police, fire, medical, disaster response). The platform empowers citizens to report emergencies with accurate GPS locations and incident details, track responder timelines in real time, view localized safety advisories, and manage emergency contacts.

This repository hosts the **Citizen Frontend Module** developed during **Phase 1** across 9 structured milestones.

```
+-----------------------------------------------------------------------------------+
|                                  ResQOne Platform                                 |
+---------------------------------------------------------+-------------------------+
|                Citizen Frontend (Phase 1)               |     Backend Services    |
|               [THIS REPOSITORY - COMPLETED]             |  [TEAM MEMBER 2 - PENDING|
+---------------------------------------------------------+-------------------------+
| - Responsive Public Landing & Navigation                | - RESTful API Gateway   |
| - Citizen Login & Registration Interfaces               | - Real Citizen Auth/JWT |
| - Citizen Incident Dashboard & Safety Advisories        | - Database Persistence  |
| - Emergency Incident Reporting & GPS Geolocation        | - Dispatch Engine       |
| - Incident Tracking, Status Timelines & Detail Views    | - Live WebSockets/Push  |
| - Citizen Profile & Emergency Contact Management        | - SMS / Mailer Gateway  |
| - Notifications Center & Reactive Read Synchronization  |                         |
| - Complete Design System Matching Approved Mockup       |                         |
+---------------------------------------------------------+-------------------------+
```

---

## 2. Technology Stack & Verified Environment

The application has been verified against the following stack versions:

| Category | Technology | Verified Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime & Bundler** | [Vite](https://vitejs.dev/) | `^5.4.11` (installed `v5.4.21`) | Next-generation frontend build tool and local dev server |
| **Framework** | [React](https://react.dev/) | `^18.3.1` | Component-based UI rendering engine |
| **DOM Renderer** | [React DOM](https://react.dev/) | `^18.3.1` | React DOM bindings for web |
| **Routing** | [React Router DOM](https://reactrouter.com/) | `^6.28.0` (installed `v6.30.0`) | Client-side routing, layout nesting, and route aliases |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^3.4.15` (installed `v3.4.17`) | Utility-first CSS framework configured with custom tokens |
| **CSS Preprocessor** | [PostCSS](https://postcss.org/) & [Autoprefixer](https://github.com/postcss/autoprefixer) | `postcss ^8.4.49`, `autoprefixer ^10.4.20` | Vendor prefixing and CSS processing pipeline |
| **Icons** | [Lucide React](https://lucide.dev/) | `^0.460.0` (installed `v0.475.0`) | Modern, clean feather-derived icon pack |
| **Node.js Environment** | Node.js | `>= 18.x` (verified on Node 22+ / macOS) | JavaScript execution environment |

---

## 3. Quickstart & Verification Commands

All commands must be executed from the project root (`/Users/a6203427868/Desktop/ResQone`):

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev -- --port 3000
```
- Local URL: `http://localhost:3000`
- Network URL: Displayed in the Vite terminal prompt if `--host` is supplied.

### 3. Production Build Validation
```bash
npm run build
```
- Output Directory: `dist/`
- Verified Output: 0 errors, 1613 modules transformed, production assets generated cleanly in `< 2.0s`.

### 4. Preview Production Build
```bash
npm run preview -- --port 3000
```

---

## 4. Current Implementation Status: Demo vs Real Functionality

Because the backend is scheduled for development by Team Member 2, the frontend incorporates **structured service layers** with **transparent demo-mode indicators**. 

The table below explicitly clarifies what is functional code vs what is simulated:

| Feature / Domain | Current Implementation Status | Real / Verified Functionality | Demo / Simulated Functionality |
| :--- | :--- | :--- | :--- |
| **Landing Page** (`/`) | Fully Functional | Responsive navbar, hero banner, CTAs, feature cards, safety tips, footer | Links to `/dashboard`, `/report`, `/login`, `/register` navigate to client pages |
| **Authentication UI** (`/login`, `/register`) | Fully Functional UI | Form inputs, password show/hide toggle, comprehensive regex validation, error alerts | Submissions trigger service layer; returns status `pending_backend` with preview links |
| **Citizen Dashboard** (`/dashboard`) | Fully Functional | Dynamic summary stat cards, emergency reporting CTA banner, recent incidents list, interactive safety carousel | Metric counts are calculated dynamically from `incidentService.DEMO_INCIDENTS` |
| **Emergency Reporting** (`/report`, `/report-emergency`) | Fully Functional | 7 incident-type selector cards, description validation, file drag-and-drop preview, real browser GPS (`navigator.geolocation`) | Submissions validate payload on client and simulate dispatch record; does not contact 112/police dispatch |
| **My Incidents** (`/incidents`) | Fully Functional | Status tab filters (`All`, `In Progress`, `Resolved`), real-time search query filter, count badges, empty states | Populated from in-memory demo incidents dataset |
| **Incident Details** (`/incidents/:id`) | Fully Functional | Dynamic parameter routing (`useParams`), verified timeline steps, responders on scene card, GPS location preview, copy incident ID | Loads incident matching `:id` (`inc-001`, `inc-002`, `inc-003`); returns 404 card for invalid IDs |
| **Citizen Profile** (`/profile`) | Fully Functional | Edit profile form, validation, emergency contacts, blood group, modals for password/notification preferences | Updates persist in service memory during session; reloads reset back to `INITIAL_DEMO_PROFILE` |
| **Notifications** (`/notifications`) | Fully Functional | Tab filters (`All`, `Unread`), single mark-as-read, mark-all-as-read, category severity styling | Updates persist in memory; **pub/sub synchronized** in real time with sidebar and header badges |
| **Design System** (`/design-system`) | Fully Functional | Interactive showcase of all color swatches, button variants, inputs, cards, badges, alerts, modals | Live reference for frontend developers and AI agents |
| **Backend Integration** | Scaffolding Only | `.env.example` (`VITE_API_BASE_URL`), service stubs prepared with async signatures | No live server connection; `authService.js`, `incidentService.js`, etc. use local stubs |

---

## 5. Documentation Directory Index

This `docs/` folder contains comprehensive documentation for the ResQOne project:

| Document | Primary Focus |
| :--- | :--- |
| **[`docs/README.md`](./README.md)** | This document. Master entry point, quickstart, verified tech stack, demo vs real status, and handover instructions. |
| **[`docs/PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md)** | Functional specifications, citizen user journey, route classification, public vs app layouts, and out-of-scope items. |
| **[`docs/PHASE_1_MILESTONE_HISTORY.md`](./PHASE_1_MILESTONE_HISTORY.md)** | Chronological history of Milestones 1 to 9, verified Git commit hashes, technical decisions, code diffs, and limitations. |
| **[`docs/ARCHITECTURE_AND_FILE_MAP.md`](./ARCHITECTURE_AND_FILE_MAP.md)** | Directory tree, component hierarchy, service layers, reactive pub/sub architecture, routing table, and Mermaid diagrams. |
| **[`docs/DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)** | Color palette, typography, status badges, spacing, components, and mapping to `src/assets/mockup_reference.png`. |
| **[`docs/BACKEND_INTEGRATION_GUIDE.md`](./BACKEND_INTEGRATION_GUIDE.md)** | RESTful API specifications, payload schemas, auth headers, and step-by-step instructions for connecting the real backend. |

---

## 6. Recommended Reading Order for a New AI or Engineer

If you are a new AI agent or human software engineer onboarding onto this repository:

1. **Step 1:** Read **[`docs/README.md`](./README.md)** (this file) to grasp the overall project boundary and verified facts.
2. **Step 2:** Read **[`docs/PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md)** to understand the citizen user flow and feature semantics.
3. **Step 3:** Inspect **[`docs/ARCHITECTURE_AND_FILE_MAP.md`](./ARCHITECTURE_AND_FILE_MAP.md)** before attempting to modify or add any components.
4. **Step 4:** Review **[`docs/DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)** and view [`src/assets/mockup_reference.png`](../src/assets/mockup_reference.png) to preserve visual fidelity with the approved UI.
5. **Step 5:** Review **[`docs/BACKEND_INTEGRATION_GUIDE.md`](./BACKEND_INTEGRATION_GUIDE.md)** if your task involves connecting APIs or building backend endpoints.

---

## 7. Instructions for the Next AI

> **MANDATORY RULES FOR FUTURE AI AGENTS WORKING ON THIS REPOSITORY:**

1. **Inspect Existing Files Before Writing New Code:**
   - Always run `git status` and verify your working branch (`main`).
   - Do not hallucinate or assume that backend servers, Node/Express/Django/Go backends, databases (PostgreSQL/MongoDB), or emergency dispatch webhooks already exist. They do **not** exist in this repository.
2. **Respect the Service Layer Architecture:**
   - All data fetching and mutation currently lives inside `src/services/` (`authService.js`, `incidentService.js`, `notificationService.js`, `profileService.js`).
   - If connecting a real backend, **do not write ad-hoc `fetch()` calls directly inside UI components**. Instead, update the service methods inside `src/services/` to read `import.meta.env.VITE_API_BASE_URL`.
3. **Maintain Visual Fidelity with `mockup_reference.png`:**
   - The master visual reference is [`src/assets/mockup_reference.png`](../src/assets/mockup_reference.png).
   - Use the established color tokens: Emergency Red (`#dc2626`), Deep Navy Sidebar (`#111827`), Slate backgrounds (`#f8fafc`), and Status badges (Amber for *In Progress*, Emerald for *Resolved*, Sky for *Reported*, Violet for *Verified*).
   - Do not replace Tailwind CSS with other CSS libraries or introduce ad-hoc utility frameworks without explicit user consent.
4. **Preserve Reactive State Patterns:**
   - Unread notification badges on `AppHeader` and `AppSidebar` are synchronized using `notificationService.subscribe()`. When marking notifications read, call the existing service methods so all UI elements update together reactively.
5. **Always Verify Builds:**
   - Run `npm run build` after making modifications to ensure 0 bundle errors or broken imports before submitting changes.
