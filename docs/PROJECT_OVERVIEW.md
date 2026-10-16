# ResQOne — Project Overview & Functional Architecture

> **Repository:** [https://github.com/Amrit17612/ResQOne](https://github.com/Amrit17612/ResQOne)  
> **Development Phase:** Phase 1 (Citizen Frontend Completed)  
> **Current Status:** Verified Frontend Scaffolding with In-Memory Demo Services  
> **Design Reference:** [`src/assets/mockup_reference.png`](../src/assets/mockup_reference.png)

---

## 1. Problem Statement & Mission

In critical emergency situations—such as road traffic collisions, building fires, sudden acute medical distress, urban flash floods, or road blockages—every second counts. Today, citizens facing crises often encounter severe friction:
1. **Inefficient Dispatch Communication:** Communicating precise locations and incident contexts over chaotic voice calls often leads to confusion and delayed responder arrival.
2. **Lack of Transparency & Incident Tracking:** After making an emergency call, citizens are frequently left in the dark regarding whether their report was verified, which unit was assigned, or when responders will arrive on scene.
3. **Disorganized Emergency Records:** Citizens have no central history of past incidents, responder actions, or verified outcomes.
4. **Scattered Safety & Advisory Information:** Weather warnings and civic safety tips are rarely coupled with active emergency response platforms.

### The ResQOne Mission
**ResQOne** bridges this gap by providing an intuitive, transparent, and responsive digital emergency platform. It empowers citizens to:
- Rapidly report incidents with 1-click GPS geolocation and photo evidence.
- Track responder status across a clear 5-stage live timeline (*Reported -> Verified -> Assigned -> In Progress -> Resolved*).
- Receive real-time civic advisories and safety notifications.
- Manage essential emergency contact information and medical profiles for instant responder access.

---

## 2. Target Users & Stakeholders

| User Persona | Role in Platform | Current Phase 1 Status |
| :--- | :--- | :--- |
| **Distressed Citizen** | Primary end user reporting active emergencies, sharing live GPS coordinates, and tracking responders. | **Implemented** (Client-side workflows complete in Phase 1). |
| **Civic Observer / Bystander** | Citizen reporting an accident or hazard on behalf of others; viewing district safety advisories. | **Implemented** (Supported in incident reporting and safety tips). |
| **First Responders** (Police, Firefighters, Paramedics) | Field units receiving dispatches, updating status, and arriving on scene. | **Future Phase (Phase 2 / Backend)**. Field responder portal to be built separately. |
| **Central Dispatch Administrators** | Emergency operators triaging reports, dispatching resources, and broadcasting regional alerts. | **Future Phase (Phase 3 / Backend)**. Admin/dispatcher console to be built separately. |

---

## 3. Citizen-Facing User Journey & Navigation Flow

The complete citizen experience follows an intuitive, zero-confusion pipeline from initial discovery to active resolution:

```
+-------------------------------------------------------------------------------------------------------+
|                                    ResQOne Citizen User Journey                                       |
+-------------------------------------------------------------------------------------------------------+
|                                                                                                       |
|  [ Public Visitor ]                                                                                   |
|         |                                                                                             |
|         v                                                                                             |
|   Landing Page (/) --------> Feature Cards / Safety Advisories / Emergency 112 Notice                 |
|         |                                                                                             |
|         +-------------------------+                                                                   |
|         |                         |                                                                   |
|         v                         v                                                                   |
|    Login Page (/login)     Register Page (/register)                                                  |
|         |                         |                                                                   |
|         +-------------------------+                                                                   |
|         |                                                                                             |
|         v (Client-side validation & preview redirect)                                                 |
|                                                                                                       |
|  [ Authenticated Application Shell (AppLayout) ]                                                      |
|         |                                                                                             |
|         +-------------------------------------------------------------+                               |
|         |                                                             |                               |
|         v                                                             v                               |
|   Dashboard (/dashboard)                                      Report Emergency (/report)              |
|   - Dynamic Stats (Total, In Progress, Resolved)              - 7 Incident Type Cards                 |
|   - Red Emergency Report CTA Banner                           - Description Field                     |
|   - Interactive Safety Carousel                               - GPS Geolocation ("Use My Location")   |
|   - Recent Incidents List                                     - Drag-and-Drop Media Upload            |
|         |                                                     - Validation & Client Submission        |
|         |                                                             |                               |
|         |                                                             v                               |
|         +-----------------------------+-------------------------------+                               |
|                                       |                                                               |
|                                       v                                                               |
|                               My Incidents (/incidents)                                               |
|                               - Status Filters (All, In Progress, Resolved)                           |
|                               - Live Search Query (Type, Location, Description)                       |
|                                       |                                                               |
|                                       v (Click Incident Card)                                         |
|                               Incident Details (/incidents/:id)                                       |
|                               - 5-Step Visual Timeline (Reported -> Resolved)                         |
|                               - Responder Unit Card & Contact Details                                 |
|                               - Location Coordinates & External Navigation                            |
|                               - Incident Photo / Evidence Preview                                     |
|                                                                                                       |
|  [ Supporting Services ]                                                                              |
|         |                                                                                             |
|         +-----------------------------+-------------------------------+                               |
|         |                                                             |                               |
|         v                                                             v                               |
|   Profile Page (/profile)                                     Notifications Page (/notifications)     |
|   - Edit Personal Info (Name, Phone, Address)                 - Filter by All vs Unread               |
|   - Blood Group & Emergency Contact                           - Single "Mark as Read"                 |
|   - Modals for Security, Notifications, Privacy               - "Mark All as Read" Bulk Action        |
|                                                               - Live Sync with Header & Sidebar       |
+-------------------------------------------------------------------------------------------------------+
```

---

## 4. Detailed Page Breakdown & Feature Inventory

### 4.1 Public & Authentication Pages

#### 1. Public Landing Page (`/`)
- **Component:** `src/pages/LandingPage.jsx` (wrapped in `PublicLayout`).
- **Purpose:** Citizen landing portal conveying trust, urgency, and capability.
- **Key Features:**
  - Responsive header with ResQOne logo, navigation links (`Home`, `About`, `How It Works`, `Contact`), and CTA buttons (`Login`, `Report an Emergency`).
  - High-impact Hero section: Bold headline (*"Faster Response, Safer Communities"*), primary red CTA button, secondary outline button, and ambulance photographic visual (`src/assets/hero_ambulance.jpg`).
  - Three highlight feature pills (*24/7 Rapid Dispatch*, *Verified Responders*, *Real-time Tracking*).
  - How It Works 3-step grid (*1. Report Emergency*, *2. Immediate Dispatch*, *3. Real-Time Tracking*).
  - Safety & Preparedness banner with advisory guidance.
  - Civic 112 emergency hotline alert footer.

#### 2. Citizen Login Page (`/login`)
- **Component:** `src/pages/LoginPage.jsx` (standalone split-screen layout).
- **Purpose:** Citizen authentication portal.
- **Key Features:**
  - Left Panel: Dark navy photographic panel (`#0b1329`) featuring rescue responders on scene (`src/assets/auth_rescue.jpg`) with dark vignette overlay.
  - Right Panel: Clean form surface with email input, password input with show/hide toggle, "Remember Me" checkbox, and "Forgot Password?" modal.
  - Rigorous client-side regex validation (email format, minimum 6 characters).
  - Emergency-red submit button (*"Sign In"*).
  - Quick-access demo preview link to bypass login and test `/dashboard`.

#### 3. Citizen Registration Page (`/register`)
- **Component:** `src/pages/RegisterPage.jsx` (standalone split-screen layout).
- **Purpose:** Account creation for new citizens.
- **Key Features:**
  - Matching split-screen aesthetic with left navy photographic panel.
  - Four input fields: Full Name, Email Address, Mobile Number (10 digits with `+91` prefix), and Password.
  - Form validation with specific error messages per field.
  - Terms of Service & Privacy Policy consent notice.
  - Direct redirect link back to `/login`.

#### 4. 404 Not Found Page (`/404`)
- **Component:** `src/pages/NotFoundPage.jsx` (wrapped in `PublicLayout`).
- **Purpose:** Friendly error handling for unknown URLs.
- **Key Features:**
  - Clear 404 headline and explanation.
  - Direct action buttons to return to Dashboard (`/dashboard`) or Landing (`/`).

---

### 4.2 Authenticated Application Pages (Inside `AppLayout`)

All pages within this section share the persistent layout:
- **Desktop:** Persistent deep navy sidebar (`#111827`) with active navigation indicator highlighted in emergency red (`#dc2626`).
- **Mobile:** Off-canvas drawer opened via hamburger button in `AppHeader`.
- **Header:** Sticky header with dynamic page titles, unread notification indicator badge, and citizen profile pill (Rohan Singh / `RS`).

#### 5. Citizen Dashboard (`/dashboard`)
- **Component:** `src/pages/DashboardPage.jsx`.
- **Purpose:** Central command view for the logged-in citizen.
- **Key Features:**
  - **Dynamic Summary Stat Cards:** Total Incidents, In Progress, and Resolved (computed dynamically via `incidentService.getSummaryCounts()`).
  - **Emergency Banner:** Prominent red banner with prompt: *"Are you in an emergency? Report it now to get fast assistance."* with immediate link to `/report`.
  - **Safety Tips Carousel:** Interactive carousel cycling through 3 advisories (Heavy Rain Advisory, Road Collision Safety, Fire Evacuation Protocol) with navigation arrows, dots, and image previews (`safety_rain.jpg`, `incident_car_accident.jpg`, `auth_rescue.jpg`).
  - **Recent Incidents List:** Compact cards displaying reported incidents, color-coded status badges, formatted dates, and deep links to `/incidents/:id`.

#### 6. Report Emergency Interface (`/report`, `/report-emergency`)
- **Component:** `src/pages/ReportEmergencyPage.jsx`.
- **Purpose:** Rapid, frictionless emergency reporting form.
- **Key Features:**
  - **7 Incident Type Selector Cards:** Road Accident (default selected), Fire, Medical Emergency, Flood, Road Blockage, Crime, and Other Hazard. Selected card glows in emergency red with checkmark.
  - **Description Textarea:** Multi-line input with client validation requiring a clear situational description.
  - **Location Search & Real Browser Geolocation:** Input field paired with a *"Use My Location"* button that queries the browser's `navigator.geolocation` API, captures exact latitude/longitude, and formats coordinates.
  - **Media Upload Panel:** Drag-and-drop zone supporting image/video attachments (up to 15MB) with instant client-side thumbnail preview and remove button.
  - **Civic Safety Warning:** Highlights dial **112** for life-threatening situations.
  - **Submission Handler:** Formats validated payload, dispatches to `incidentService.submitIncidentReport()`, and renders an honest success alert explaining that client validation succeeded while backend dispatch is pending.

#### 7. My Incidents List (`/incidents`)
- **Component:** `src/pages/MyIncidentsPage.jsx`.
- **Purpose:** Citizen incident tracking ledger.
- **Key Features:**
  - **Filter Tabs:** All Incidents, In Progress, and Resolved with live count badges.
  - **Real-Time Search:** Instant client-side filtering matching incident type, address/landmark, or description.
  - **Incident Rows:** Visual cards with incident icon, type, address, timestamp, status badge, and chevron navigating to `/incidents/:id`.
  - **Empty States:** Clean fallback state if no incidents match the search query or active filter tab.

#### 8. Incident Details Page (`/incidents/:id`)
- **Component:** `src/pages/IncidentDetailsPage.jsx`.
- **Purpose:** Deep-dive view into a specific reported incident.
- **Key Features:**
  - **5-Stage Visual Timeline:** *Reported -> Verified -> Assigned -> In Progress -> Resolved* with completed checkmarks, active animated pulse indicator, and pending states.
  - **Responder Unit Card:** Assigned responder details (e.g., PCR Van #14, Driver Vikram Rathore, contact dialer).
  - **Incident Metadata:** Formatted timestamp, exact address, GPS coordinates with 1-click copy and Google Maps link.
  - **Incident Photo:** High-resolution image preview of the scene.
  - **Invalid ID Handling:** Graceful fallback if an invalid incident ID is supplied in the URL.

#### 9. Citizen Profile Page (`/profile`)
- **Component:** `src/pages/ProfilePage.jsx`.
- **Purpose:** Account details and emergency contact management.
- **Key Features:**
  - **Profile Summary Header:** Avatar, citizen name (Rohan Singh), email, phone, and *"Verified Citizen"* badge.
  - **Interactive Edit Form:** In-place editing of Full Name, Mobile Number, Residential Address, and Blood Group.
  - **Emergency Contact Card:** Dedicated section managing Primary Emergency Contact (Name, Relationship, Phone Number).
  - **Account Settings Modals:** Working modal dialogs for Change Password, Notification Preferences, and Data Privacy.
  - **Recent Notifications Feed:** Snapshot of the 3 latest alerts with direct links.

#### 10. Notifications Page (`/notifications`)
- **Component:** `src/pages/NotificationsPage.jsx`.
- **Purpose:** Central notification center for alerts and status changes.
- **Key Features:**
  - **Tab Filters:** Filter by *All Notifications* vs *Unread Only*.
  - **Read Actions:** Individual *"Mark as Read"* button per notification item + global *"Mark All as Read"* header action.
  - **Category Indicators:** Color-coded severity styling (Danger/Red for safety alerts, Amber for in-progress, Green for resolved, Blue for info).
  - **Real-Time Reactive Synchronization:** Reads emit updates to `notificationService`, instantly updating the unread badge in `AppHeader` and `AppSidebar`.

#### 11. Design System Showcase (`/design-system`)
- **Component:** `src/pages/DesignSystemPage.jsx`.
- **Purpose:** Visual audit and component testing catalog.
- **Key Features:** Live swatches of brand colors, status badge variants, buttons, inputs, alerts, cards, and modal dialogs.

---

## 5. Public Pages vs Authenticated-Area Pages

The application clearly separates public visitor experiences from authenticated citizen workspaces:

```
+-----------------------------------------------------------------------------------------+
|                                    Layout Comparison                                    |
+------------------------------+------------------------------+---------------------------+
| Feature / Attribute          | Public Experience            | Authenticated Workspace   |
+------------------------------+------------------------------+---------------------------+
| **Parent Layout**            | `PublicLayout.jsx`           | `AppLayout.jsx`           |
| **Navigation Mechanism**     | Top sticky `PublicNavbar`    | Left persistent `AppSidebar` (Navy #111827) |
| **Header**                   | Public marketing header      | Dynamic `AppHeader` with unread badge |
| **Footer**                   | Comprehensive `PublicFooter` | No footer (Clean workspace view) |
| **Route Scope**              | `/`, `/404`                  | `/dashboard`, `/report`, `/incidents`, |
|                              |                              | `/profile`, `/notifications`, `/design-system` |
| **Auth Enforcement**         | None (Open to public)        | Client-side demo mode (All open for testing) |
+------------------------------+------------------------------+---------------------------+
```

> **Note on Authentication State:**  
> In Phase 1, there are **no route guards or JWT redirects blocking app routes**. This intentional architectural decision enables developers, QA testers, and AI agents to freely inspect and test all 11 pages without needing an active backend session. Once real auth is integrated in Phase 2, an `AuthGuard` or `RequireAuth` wrapper will protect `/dashboard`, `/report`, etc.

---

## 6. Current Demo Behavior vs Expected Backend Behavior

| Functional Domain | Current Phase 1 Frontend (Verified) | Future Phase 2 Backend Requirement |
| :--- | :--- | :--- |
| **User Authentication** | Form fields perform client regex validation; submission calls `authService.login()`; returns `pending_backend` status with a demo shortcut to `/dashboard`. | Endpoint `POST /api/auth/login` validates credentials against database, issues HTTP-only JWT cookie or bearer token, and initializes citizen session. |
| **User Registration** | Validates name, email, mobile, password; returns `pending_backend` status. | Endpoint `POST /api/auth/register` saves new user to database, hashes password with bcrypt, and sends verification SMS/email. |
| **Incident Reporting** | Captures incident type, description, real browser GPS coords, and file; calls `incidentService.submitIncidentReport()`; stores in client state; renders demo notice. | Endpoint `POST /api/incidents` uploads media to S3/Cloud Storage, creates incident record in PostgreSQL/MongoDB, and dispatches notification to nearest responder unit. |
| **Incident Tracking** | Retrieves 3 hardcoded demo records (`inc-001`, `inc-002`, `inc-003`) from `incidentService.js`. | Endpoint `GET /api/incidents` queries database for incidents reported by the authenticated citizen; supports pagination and live status updates. |
| **Incident Details** | Finds incident matching `:id` from in-memory array; displays static 5-step timeline. | Endpoint `GET /api/incidents/:id` fetches real-time responder telemetry, active stage, and live GPS location of the dispatched vehicle. |
| **Citizen Profile** | Modifies in-memory `currentProfile` object in `profileService.js`; changes persist during the session but reset upon browser reload. | Endpoints `GET /api/profile` and `PUT /api/profile` persist citizen phone, address, and emergency contact in database. |
| **Notifications** | Reads initial 5 demo notifications; updates read state in memory; synchronizes via internal `notificationService.subscribe()` pub/sub. | Endpoint `GET /api/notifications` + WebSocket / SSE channel for real-time dispatch alerts and safety broadcasts. |

---

## 7. Scope Boundaries: In-Scope vs Out-of-Scope

### In-Scope (Phase 1 — Citizen Frontend — Completed):
- [x] Complete visual implementation matching `src/assets/mockup_reference.png`.
- [x] Full client-side routing across 11 pages with route aliases (`/report` & `/report-emergency`).
- [x] Comprehensive form validations (regex, required fields, size checks).
- [x] Real browser Geolocation API integration (`navigator.geolocation`).
- [x] Drag-and-drop file upload with preview and size caps.
- [x] Dynamic metric calculations for incident statuses and notifications.
- [x] In-memory reactive state synchronization for unread notification badges.
- [x] Production build validation (`npm run build` passing with 0 errors).

### Out-of-Scope (Deferred to Phase 2 & Future Backend Development):
- [ ] Live PostgreSQL / MongoDB database.
- [ ] Real user password hashing and JWT token management.
- [ ] Real cloud object storage (AWS S3, Cloudinary) for incident images.
- [ ] Live communication with official 112 / Police / Fire / EMS dispatch centers.
- [ ] Dispatcher administrative portal and emergency triage dashboard.
- [ ] Field responder mobile application.
- [ ] SMS gateway (Twilio, Gupshup) for SOS broadcasts.
