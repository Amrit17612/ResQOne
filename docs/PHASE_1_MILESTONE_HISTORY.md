# ResQOne — Phase 1 Milestone History & Verification Record

> **Repository:** [https://github.com/Amrit17612/ResQOne](https://github.com/Amrit17612/ResQOne)  
> **Phase:** Phase 1 — Citizen Frontend Development  
> **Total Milestones:** 9 of 9 Completed & Verified  
> **Initial Remote Baseline Commit:** `802ad05` (`Initial commit`)  
> **Final Phase 1 Head Commit:** `e59eee8` (`test: audit and stabilize citizen frontend`)

---

## 1. Milestone Verification Summary Matrix

All 9 commits have been verified directly in the repository's Git commit history (`git log --oneline`). The table below records the verified commit hashes, timestamps, messages, and validation results:

| Milestone | Verified Short Hash | Full Git Commit SHA | Commit Message | Verified Date | Build Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Initial Repo** | `802ad05` | `802ad052a443fbde3842b51c1ee6db970230c13d` | `Initial commit` | 2026-10-16 22:32 | Baseline |
| **Milestone 1** | `396d43e` | `396d43ea0d2d1dfcc7bcd1aa9dde881a1b4b4ea8` | `chore: set up ResQOne citizen frontend scaffold` | 2026-10-16 22:39 | Verified |
| **Milestone 2** | `dfb12e8` | `dfb12e8830b0143b6eeea71a6ad3e450465aa499` | `feat: add shared layout and design system` | 2026-10-16 22:53 | Verified |
| **Milestone 3** | `7a334b6` | `7a334b69c174a4acb2d9e3cb88f30121f23c2d2b` | `feat: build responsive citizen landing page` | 2026-10-16 23:00 | Verified |
| **Milestone 4** | `13f2ed7` | `13f2ed7f61fedd1e584082df194fbf8f1dc6ae01` | `feat: add citizen login and registration pages` | 2026-10-16 23:11 | Verified |
| **Milestone 5** | `190869c` | `190869cc3d101784b6332a2263ad1ade78d81b3c` | `feat: build citizen dashboard` | 2026-10-16 23:31 | Verified |
| **Milestone 6** | `33d8d4f` | `33d8d4f586ba3cf2dedf78563006f5173e62dd3d` | `feat: add emergency reporting interface` | 2026-10-16 23:40 | Verified |
| **Milestone 7** | `0f93b65` | `0f93b6502cad1f49bfd5727af46d1f14b6b331a1` | `feat: add citizen incident tracking and details` | 2026-10-16 23:52 | Verified |
| **Milestone 8** | `b2e375f` | `b2e375f5388adee80ecbd9266ad723be9512a138` | `feat: add citizen profile and notifications` | 2026-10-17 00:09 | Verified |
| **Milestone 9** | `e59eee8` | `e59eee8c8d3c466dabd14666e67135c6f2304284` | `test: audit and stabilize citizen frontend` | 2026-10-17 00:26 | Verified |

---

## 2. Detailed Chronological Milestone Records

---

### Milestone 1: Project Scaffold, Build Tooling & Environment
- **Commit Hash:** `396d43e` (`396d43ea0d2d1dfcc7bcd1aa9dde881a1b4b4ea8`)
- **Author:** Amrit Raj
- **Date:** Fri Oct 16 22:39:42 2026 +0530
- **Commit Message:** `chore: set up ResQOne citizen frontend scaffold`
- **Objective:** Establish the clean Vite + React + Tailwind CSS project scaffolding in the existing cloned repository without overwriting git history, and prepare the core folder structure.
- **Implemented Functionality:**
  - Initialized Vite 5 + React 18 configuration configured to run on port 3000.
  - Installed and configured Tailwind CSS 3.4, PostCSS, Autoprefixer, React Router DOM 6, and Lucide React.
  - Established standardized project directory structure (`assets/`, `components/`, `context/`, `hooks/`, `layouts/`, `pages/`, `services/`, `utils/`).
  - Added `.env.example` defining `VITE_API_BASE_URL=http://localhost:5000/api`.
  - Added `.gitignore` protecting dependencies, environment files, and build outputs.
- **Files Created / Modified (20 files, +2918 lines):**
  - `.env.example`
  - `.gitignore`
  - `README.md`
  - `index.html`
  - `package.json`
  - `package-lock.json`
  - `postcss.config.js`
  - `tailwind.config.js`
  - `vite.config.js`
  - `src/App.jsx`
  - `src/main.jsx`
  - `src/index.css`
  - Directory `.gitkeep` files (`assets`, `components`, `context`, `hooks`, `layouts`, `pages`, `services`, `utils`)
- **Technical Decisions:**
  - Kept build tooling modern and lightweight using Vite instead of Create React App.
  - Specified fixed development port 3000 in `vite.config.js` for consistent local testing.
- **Verified Validation Evidence:**
  - `npm run build` executed successfully producing initial bundle.
  - Local server responded at `http://localhost:3000`.
- **Known Limitations:**
  - Barebones scaffold with temporary placeholder routes; no application UI components.
- **Next Milestone Dependency:** Provided base tooling and directory structure required for Milestone 2 design tokens and reusable UI components.

---

### Milestone 2: Design System, Reusable UI Components & Layouts
- **Commit Hash:** `dfb12e8` (`dfb12e8830b0143b6eeea71a6ad3e450465aa499`)
- **Author:** Amrit Raj
- **Date:** Fri Oct 16 22:53:34 2026 +0530
- **Commit Message:** `feat: add shared layout and design system`
- **Objective:** Introduce the master visual reference image (`src/assets/mockup_reference.png`), define design tokens in Tailwind, build the shared layout shells, and construct reusable atomic UI components.
- **Implemented Functionality:**
  - Integrated `src/assets/mockup_reference.png` as the single source of design truth.
  - Configured custom Tailwind tokens: Emergency Red (`#dc2626`), Red Hover (`#b91c1c`), Deep Navy Sidebar (`#111827`, dark `#0f172a`), Surface slates, and Status badge colors (progress amber, resolved green, reported blue, verified purple).
  - Built 9 reusable UI components: `Button`, `Input`, `Card`, `Badge`, `Alert`, `Modal`, `Logo`, `LoadingSpinner`, `EmptyState`.
  - Built layout shells: `PublicLayout` (with `PublicNavbar` and `PublicFooter`) and `AppLayout` (with persistent desktop `AppSidebar` and sticky `AppHeader`).
  - Built interactive `/design-system` page displaying live components and swatches.
  - Created placeholder pages for upcoming milestones (`LandingPlaceholder`, `AuthPlaceholders`, `AppPlaceholders`, `NotFoundPage`).
- **Files Created / Modified (24 files, +1747 lines, -64 lines):**
  - `src/assets/mockup_reference.png` (Binary, ~1.8 MB)
  - `src/components/common/Alert.jsx`
  - `src/components/common/Badge.jsx`
  - `src/components/common/Button.jsx`
  - `src/components/common/Card.jsx`
  - `src/components/common/EmptyState.jsx`
  - `src/components/common/Input.jsx`
  - `src/components/common/LoadingSpinner.jsx`
  - `src/components/common/Logo.jsx`
  - `src/components/common/Modal.jsx`
  - `src/components/layout/AppHeader.jsx`
  - `src/components/layout/AppSidebar.jsx`
  - `src/components/layout/PublicFooter.jsx`
  - `src/components/layout/PublicNavbar.jsx`
  - `src/layouts/AppLayout.jsx`
  - `src/layouts/PublicLayout.jsx`
  - `src/pages/AppPlaceholders.jsx`
  - `src/pages/AuthPlaceholders.jsx`
  - `src/pages/DesignSystemPage.jsx`
  - `src/pages/LandingPlaceholder.jsx`
  - `src/pages/NotFoundPage.jsx`
  - `src/App.jsx`
  - `src/index.css`
  - `tailwind.config.js`
- **Technical Decisions:**
  - Extracted color codes directly from the mockup reference to guarantee 100% visual fidelity.
  - Decoupled `PublicLayout` from `AppLayout` to support marketing pages vs workspace experiences.
- **Verified Validation Evidence:**
  - Visual verification of `/design-system` in browser showing buttons, badges, modals, and tokens.
  - `npm run build` passed with 0 errors.
- **Known Limitations:**
  - Application pages (Dashboard, Incidents, etc.) displayed placeholder cards awaiting their respective milestones.
- **Next Milestone Dependency:** Created the foundational `PublicLayout` and `PublicNavbar` needed to construct the Citizen Landing Page in Milestone 3.

---

### Milestone 3: Responsive Citizen Landing Page
- **Commit Hash:** `7a334b6` (`7a334b69c174a4acb2d9e3cb88f30121f23c2d2b`)
- **Author:** Amrit Raj
- **Date:** Fri Oct 16 23:00:13 2026 +0530
- **Commit Message:** `feat: build responsive citizen landing page`
- **Objective:** Construct the responsive public landing page matching the upper-left hero section of `mockup_reference.png`.
- **Implemented Functionality:**
  - Added hero emergency ambulance visual (`src/assets/hero_ambulance.jpg`).
  - Built `src/pages/LandingPage.jsx`:
    - Bold headline: *"Faster Response, Safer Communities"*.
    - Supporting value proposition text and primary emergency-red CTA button *"Report an Emergency"*.
    - Secondary outline button *"Learn More"*.
    - Three feature highlight cards (*24/7 Rapid Dispatch*, *Verified Responders*, *Real-time Tracking*).
    - 3-step "How It Works" workflow cards.
    - Safety advisory preparedness banner.
    - Official 112 hotline reminder.
  - Updated `PublicNavbar.jsx` with smooth anchor navigation and mobile hamburger toggle.
  - Replaced `LandingPlaceholder` route with real `LandingPage` in `src/App.jsx`.
- **Files Created / Modified (4 files, +440 lines, -4 lines):**
  - `src/assets/hero_ambulance.jpg` (Binary, ~874 KB)
  - `src/pages/LandingPage.jsx`
  - `src/components/layout/PublicNavbar.jsx`
  - `src/App.jsx`
- **Technical Decisions:**
  - Used high-resolution imagery optimized for fast web delivery.
  - Ensured CTA buttons directly navigate into app workflows (`/report`, `/dashboard`).
- **Verified Validation Evidence:**
  - Browser inspection confirmed layout matching mockup proportions across desktop (1280px) and mobile (375px).
  - `npm run build` completed successfully.
- **Known Limitations:**
  - Login and Register buttons pointed to placeholder pages.
- **Next Milestone Dependency:** Unlocked Citizen Auth implementation in Milestone 4.

---

### Milestone 4: Citizen Login and Registration Pages
- **Commit Hash:** `13f2ed7` (`13f2ed7f61fedd1e584082df194fbf8f1dc6ae01`)
- **Author:** Amrit Raj
- **Date:** Fri Oct 16 23:11:37 2026 +0530
- **Commit Message:** `feat: add citizen login and registration pages`
- **Objective:** Implement full split-screen Login and Registration pages matching the top row of `mockup_reference.png`.
- **Implemented Functionality:**
  - Added dark first-responder imagery (`src/assets/auth_rescue.jpg`).
  - Created `src/services/authService.js` with structured API method stubs (`login`, `register`, `requestPasswordReset`) configured with `VITE_API_BASE_URL`.
  - Built `src/pages/LoginPage.jsx`:
    - Left 40% deep navy photographic panel with vignette and logo.
    - Right form surface with Email, Password (with eye toggle), Remember Me checkbox.
    - Forgot Password modal with email submission.
    - Client-side validation for email regex and minimum 6 character password.
    - Direct preview shortcut link to `/dashboard` for demo exploration.
  - Built `src/pages/RegisterPage.jsx`:
    - 4-field registration: Full Name, Email, Mobile (+91), Password.
    - Per-field validation with red inline error states.
    - Checkbox agreement for emergency terms.
  - Removed obsolete `AuthPlaceholders.jsx` and updated `src/App.jsx`.
- **Files Created / Modified (6 files, +713 lines, -81 lines):**
  - `src/assets/auth_rescue.jpg` (Binary, ~939 KB)
  - `src/pages/LoginPage.jsx`
  - `src/pages/RegisterPage.jsx`
  - `src/services/authService.js`
  - `src/pages/AuthPlaceholders.jsx` (Deleted)
  - `src/App.jsx`
- **Technical Decisions:**
  - Rendered Login and Register outside `PublicLayout` and `AppLayout` as standalone split screens to match the reference mockup.
  - Maintained honest UI feedback: form submits validate on client and display clear notice that backend auth service is pending.
- **Verified Validation Evidence:**
  - Browser automation tested invalid form inputs (triggered red error labels) and valid submissions (triggered honest status notice).
  - Production build passed with 0 errors.
- **Known Limitations:**
  - No real user session created; submissions do not write to a backend database.
- **Next Milestone Dependency:** Provided entry point into the Citizen Dashboard implemented in Milestone 5.

---

### Milestone 5: Citizen Dashboard
- **Commit Hash:** `190869c` (`190869cc3d101784b6332a2263ad1ade78d81b3c`)
- **Author:** Amrit Raj
- **Date:** Fri Oct 16 23:31:07 2026 +0530
- **Commit Message:** `feat: build citizen dashboard`
- **Objective:** Construct the citizen dashboard matching the middle-left section of `mockup_reference.png`.
- **Implemented Functionality:**
  - Added accident photo (`src/assets/incident_car_accident.jpg`) and safety banner (`src/assets/safety_rain.jpg`).
  - Created `src/services/incidentService.js` hosting `DEMO_INCIDENTS` (`inc-001`, `inc-002`, `inc-003`) and `getSummaryCounts()`.
  - Built `src/pages/DashboardPage.jsx`:
    - Three summary metric cards (*Total Incidents: 3*, *In Progress: 1*, *Resolved: 2*) calculated dynamically.
    - Prominent emergency reporting banner: *"Are you in an emergency? Report it now to get fast assistance."* with red button linking to `/report`.
    - Interactive Safety Tips carousel cycling through 3 advisories with navigation arrows and indicator dots.
    - Recent Incidents list showing Road Accident (In Progress), Fire (Resolved), and Medical Emergency (Resolved) with links to details.
  - Updated `src/App.jsx` and `AppPlaceholders.jsx`.
- **Files Created / Modified (6 files, +419 lines, -40 lines):**
  - `src/assets/incident_car_accident.jpg` (Binary, ~900 KB)
  - `src/assets/safety_rain.jpg` (Binary, ~1.0 MB)
  - `src/pages/DashboardPage.jsx`
  - `src/services/incidentService.js`
  - `src/pages/AppPlaceholders.jsx`
  - `src/App.jsx`
- **Technical Decisions:**
  - Dynamic derivation: Stat counts are never hardcoded in JSX; they are computed dynamically from `incidentService.getSummaryCounts()`.
- **Verified Validation Evidence:**
  - Browser test verified stat card values, carousel navigation, and incident card clicks.
  - `npm run build` executed successfully.
- **Known Limitations:**
  - Incident list is populated from in-memory demo data.
- **Next Milestone Dependency:** Provided links directly into the Emergency Reporting Interface in Milestone 6.

---

### Milestone 6: Emergency Reporting Interface
- **Commit Hash:** `33d8d4f` (`33d8d4f586ba3cf2dedf78563006f5173e62dd3d`)
- **Author:** Amrit Raj
- **Date:** Fri Oct 16 23:40:12 2026 +0530
- **Commit Message:** `feat: add emergency reporting interface`
- **Objective:** Construct the comprehensive emergency report form matching the middle-right section of `mockup_reference.png`.
- **Implemented Functionality:**
  - Built `src/pages/ReportEmergencyPage.jsx`:
    - 7 incident-type selector cards (Road Accident, Fire, Medical, Flood, Road Blockage, Crime, Other Hazard).
    - Emergency red active state with checkmark on the selected type.
    - Description textarea with character validation.
    - Location input with 1-click *"Use My Location"* button integrated with real browser `navigator.geolocation` API.
    - Drag-and-drop media upload panel with size caps (15MB), thumbnail preview, and removal button.
    - Emergency hotline 112 notice banner.
    - Full-width red *"Submit Report"* button with loading state.
  - Added `submitIncidentReport()` method in `src/services/incidentService.js`.
  - Updated `src/App.jsx` routing.
- **Files Created / Modified (4 files, +578 lines, -24 lines):**
  - `src/pages/ReportEmergencyPage.jsx`
  - `src/services/incidentService.js`
  - `src/pages/AppPlaceholders.jsx`
  - `src/App.jsx`
- **Technical Decisions:**
  - Integrated real browser GPS geolocation instead of mock coordinates, providing true device latitude/longitude when permitted by the user.
  - Handled file uploads client-side via `FileReader` with instant thumbnail preview.
- **Verified Validation Evidence:**
  - Browser testing verified incident selection, validation error triggers, GPS button click, and drag-and-drop file upload.
  - Build passed with 0 errors.
- **Known Limitations:**
  - Submitted incident is not transmitted to live 112 police/fire dispatch centers.
- **Next Milestone Dependency:** Generated client reports that citizens track in "My Incidents" implemented in Milestone 7.

---

### Milestone 7: My Incidents and Incident Details
- **Commit Hash:** `0f93b65` (`0f93b6502cad1f49bfd5727af46d1f14b6b331a1`)
- **Author:** Amrit Raj
- **Date:** Fri Oct 16 23:52:33 2026 +0530
- **Commit Message:** `feat: add citizen incident tracking and details`
- **Objective:** Build the incident tracking ledger and detailed incident views matching the bottom-left section of `mockup_reference.png`.
- **Implemented Functionality:**
  - Built `src/pages/MyIncidentsPage.jsx`:
    - Status tabs (*All*, *In Progress*, *Resolved*) with dynamic count badges.
    - Live search query input matching incident type, address, or description.
    - Incident list rows with badges, locations, timestamps, and chevron links.
  - Built `src/pages/IncidentDetailsPage.jsx`:
    - Dynamic route matching `/incidents/:id`.
    - 5-stage visual timeline (*Reported*, *Verified*, *Assigned*, *In Progress*, *Resolved*) with completion checkmarks and active animated pulse.
    - Assigned Responder card (e.g., PCR Van #14, Driver Vikram Rathore, responder phone dialer).
    - Location coordinates card with 1-click clipboard copy and external Google Maps navigation link.
    - Incident photographic evidence viewer.
    - Graceful 404 card for unknown incident IDs.
  - Updated `src/App.jsx` routing.
- **Files Created / Modified (5 files, +635 lines, -51 lines):**
  - `src/pages/MyIncidentsPage.jsx`
  - `src/pages/IncidentDetailsPage.jsx`
  - `src/services/incidentService.js`
  - `src/pages/AppPlaceholders.jsx`
  - `src/App.jsx`
- **Technical Decisions:**
  - Used React Router's `useParams` for clean RESTful URL parameters (`/incidents/:id`).
  - Added clipboard copy utility for incident IDs to simplify sharing with dispatchers.
- **Verified Validation Evidence:**
  - Browser automation validated tab filtering, search filtering, navigation to `/incidents/inc-001`, and unknown ID `/incidents/unknown-999`.
  - Production build passed cleanly.
- **Known Limitations:**
  - Responders on scene are part of the demo dataset; telemetry does not update live without WebSockets.
- **Next Milestone Dependency:** Laid groundwork for Citizen Profile and Notifications in Milestone 8.

---

### Milestone 8: Citizen Profile and Notifications
- **Commit Hash:** `b2e375f` (`b2e375f5388adee80ecbd9266ad723be9512a138`)
- **Author:** Amrit Raj
- **Date:** Sat Oct 17 00:09:50 2026 +0530
- **Commit Message:** `feat: add citizen profile and notifications`
- **Objective:** Build the Citizen Profile and Notifications center matching the bottom-right section of `mockup_reference.png`.
- **Implemented Functionality:**
  - Created `src/services/notificationService.js`:
    - 5 demo notifications categorized by severity (Danger, Warning, Success, Info).
    - `markAsRead(id)`, `markAllAsRead()`, `getSummaryCounts()`.
    - **In-memory Pub/Sub event subscriber (`notificationService.subscribe`)**.
  - Created `src/services/profileService.js`:
    - Manages `INITIAL_DEMO_PROFILE` (Rohan Singh, `rohan@example.com`, Indore, blood group O+, emergency contact Priya Singh).
    - In-memory `updateProfile()` with session persistence.
  - Built `src/pages/ProfilePage.jsx`:
    - Citizen header with avatar, name, verified badge.
    - In-place editable form with client validation.
    - Emergency contact card with relation and phone.
    - Interactive modals for Change Password, Notification Preferences, and Privacy.
    - Recent notifications feed.
  - Built `src/pages/NotificationsPage.jsx`:
    - All vs Unread tab filters with live count badges.
    - Individual "Mark as Read" and bulk "Mark All as Read" actions.
  - Wired `notificationService.subscribe()` into `AppHeader.jsx` and `AppSidebar.jsx` for reactive unread count badges.
- **Files Created / Modified (7 files, +1208 lines, -10 lines):**
  - `src/pages/ProfilePage.jsx`
  - `src/pages/NotificationsPage.jsx`
  - `src/services/profileService.js`
  - `src/services/notificationService.js`
  - `src/components/layout/AppHeader.jsx`
  - `src/components/layout/AppSidebar.jsx`
  - `src/App.jsx`
- **Technical Decisions:**
  - Used an in-memory pub/sub listener pattern in `notificationService` instead of heavy external state management libraries (Redux/Zustand), maintaining zero bundle bloat while ensuring instant reactivity across separate components.
- **Verified Validation Evidence:**
  - Browser tests verified marking a notification read immediately decreased the unread badge in the header and sidebar.
  - Profile edit form successfully updated citizen data.
  - Production build passed with 0 errors.
- **Known Limitations:**
  - Profile changes persist only in browser memory during the session; page refresh resets to default.
- **Next Milestone Dependency:** Completed the full feature suite; enabled Milestone 9 integration QA and stabilization.

---

### Milestone 9: End-to-End Integration QA, Bug Fixes & Stabilization
- **Commit Hash:** `e59eee8` (`e59eee8c8d3c466dabd14666e67135c6f2304284`)
- **Author:** Amrit Raj
- **Date:** Sat Oct 17 00:26:45 2026 +0530
- **Commit Message:** `test: audit and stabilize citizen frontend`
- **Objective:** Perform end-to-end quality assurance across all 11 routes, identify real integration bugs, fix inconsistencies, and verify production build.
- **Implemented Functionality & Bug Fixes:**
  - **Route Alias Fix:** Added `/report-emergency` as a first-class route alias in `src/App.jsx` alongside `/report`.
  - **Sidebar Active Navigation Fix:** Updated `src/components/layout/AppSidebar.jsx` so the "Report Emergency" nav item stays highlighted in emergency red when navigating to either `/report` or `/report-emergency`.
  - **Dynamic Header Metadata Fix:** Updated `src/layouts/AppLayout.jsx` to correctly display the title *"Report an Emergency"* and subtitle for `/report-emergency`.
  - **Sidebar Unread Badge Synchronization:** Added active notification count badge to the sidebar's "Notifications" nav item linked to `notificationService.subscribe()`.
  - **Profile Form State Reset Fix:** Corrected `src/pages/ProfilePage.jsx` so cancelling an in-progress edit cleanly rolls back form inputs to current saved profile values.
- **Files Modified (4 files, +21 lines, -14 lines):**
  - `src/App.jsx`
  - `src/components/layout/AppSidebar.jsx`
  - `src/layouts/AppLayout.jsx`
  - `src/pages/ProfilePage.jsx`
- **Technical Decisions:**
  - Addressed subtle routing and state edge cases without altering design system aesthetics or breaking API stubs.
- **Verified Validation Evidence:**
  - Browser subagent performed comprehensive multi-route audit: `/`, `/login`, `/register`, `/dashboard`, `/report`, `/report-emergency`, `/incidents`, `/incidents/inc-001`, `/profile`, `/notifications`, `/design-system`, `/404`.
  - `npm run build` executed with 0 errors in 1.67s.
- **Known Limitations:**
  - Live emergency dispatch and database persistence remain deferred to Phase 2 backend development.
- **Handover Outcome:** The Citizen Frontend is complete, hardened, and ready for technical documentation and backend API integration.
