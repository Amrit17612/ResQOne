# ResQOne — Backend Integration Guide & API Specifications

> **Audience:** Backend Engineers (Team Member 2), Full-Stack Integrators, and AI Handover Agents  
> **Status:** Phase 1 Complete (Frontend Service Stubs Prepared)  
> **Target API Base URL:** Configured in `.env.example` as `VITE_API_BASE_URL=http://localhost:5000/api`

---

## 1. Overview & Integration Philosophy

During Phase 1, the Citizen Frontend was designed with **complete service layer decoupling**. UI components do **not** contain hardcoded URLs or ad-hoc data schemas. Instead, all data fetching, mutations, and status checks pass through four dedicated service modules inside `src/services/`:

1. `src/services/authService.js` (Citizen Authentication & Password Management)
2. `src/services/incidentService.js` (Incident Reporting, Tracking, and Summaries)
3. `src/services/notificationService.js` (Emergency Advisories & Read State)
4. `src/services/profileService.js` (Citizen Information & Emergency Contacts)

When the backend REST API becomes available, the integration task requires **modifying only these four service files** to point to real HTTP endpoints. No UI components need to be rewritten!

---

## 2. Environment Configuration

### Setup `.env.local`
To connect the frontend to a local or remote backend:
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Update the API base URL to match your backend port:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
3. In Vite, environment variables prefixed with `VITE_` are exposed via `import.meta.env.VITE_API_BASE_URL`.

### Vite Dev Server Proxy (Optional / Recommended for Local Dev)
To avoid CORS issues during local testing, you can optionally configure a proxy in `vite.config.js`:
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

---

## 3. Recommended API Specifications & Payload Contracts

### 3.1 Authentication Endpoints (`src/services/authService.js`)

#### 1. Citizen Login
- **Endpoint:** `POST /api/auth/login`
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "rohan@example.com",
    "password": "Password123!",
    "rememberMe": true
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr-001",
      "fullName": "Rohan Singh",
      "email": "rohan@example.com",
      "role": "Verified Citizen"
    }
  }
  ```
- **Error Response (`401 Unauthorized`):**
  ```json
  {
    "success": false,
    "message": "Invalid email or password."
  }
  ```

#### 2. Citizen Registration
- **Endpoint:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "fullName": "Rohan Singh",
    "email": "rohan@example.com",
    "mobileNumber": "9876543210",
    "password": "Password123!"
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Citizen registered successfully. Verification SMS sent.",
    "token": "jwt_token_here",
    "user": { ... }
  }
  ```

---

### 3.2 Emergency Incident Endpoints (`src/services/incidentService.js`)

#### 1. Get Citizen Incidents
- **Endpoint:** `GET /api/incidents`
- **Request Headers:** `Authorization: Bearer <TOKEN>`
- **Query Parameters:** `?status=in-progress` (optional filter)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "inc-001",
        "type": "Road Accident",
        "location": "MG Road, Indore",
        "relativeTime": "2 hours ago",
        "formattedDate": "12 Jan 2025, 10:30 AM",
        "status": "In Progress",
        "description": "Two vehicles collided near the main signal.",
        "image": "https://cdn.resqone.org/incidents/inc-001.jpg",
        "coordinates": { "lat": 22.7196, "lng": 75.8577 },
        "timeline": [
          { "step": "Reported", "time": "12 Jan 2025, 10:30 AM", "completed": true },
          { "step": "Verified", "time": "12 Jan 2025, 10:45 AM", "completed": true },
          { "step": "Assigned", "time": "12 Jan 2025, 11:10 AM", "completed": true },
          { "step": "In Progress", "time": "12 Jan 2025, 11:30 AM", "active": true },
          { "step": "Resolved", "time": "Pending on-site completion", "pending": true }
        ]
      }
    ]
  }
  ```

#### 2. Get Incident by ID
- **Endpoint:** `GET /api/incidents/:id`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "inc-001",
      "type": "Road Accident",
      "status": "In Progress",
      "location": "MG Road, Indore",
      "coordinates": { "lat": 22.7196, "lng": 75.8577 },
      "responderUnit": {
        "unitName": "PCR Van #14",
        "driver": "Vikram Rathore",
        "phone": "+91 98765 00014"
      },
      "timeline": [ ... ]
    }
  }
  ```

#### 3. Submit Emergency Incident Report
- **Endpoint:** `POST /api/incidents`
- **Content-Type:** `multipart/form-data` (to support media attachments)
- **Form Data Fields:**
  - `type`: String (`Road Accident`, `Fire`, `Medical`, `Flood`, etc.)
  - `description`: String
  - `location`: String (e.g., "MG Road, Indore")
  - `lat`: Number (Optional, GPS latitude e.g. `22.7196`)
  - `lng`: Number (Optional, GPS longitude e.g. `75.8577`)
  - `media`: File (Binary image or video)
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Incident report dispatched to central command.",
    "data": {
      "id": "inc-10948",
      "status": "Reported",
      "formattedDate": "17 Oct 2026, 01:15 AM"
    }
  }
  ```

---

### 3.3 Notification Endpoints (`src/services/notificationService.js`)

#### 1. Fetch All Notifications
- **Endpoint:** `GET /api/notifications`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "notif-1",
        "title": "Your incident is in progress",
        "message": "Responders dispatched for #INC-001.",
        "category": "incident_status",
        "timestamp": "10:45 AM",
        "relativeTime": "2 hours ago",
        "read": false,
        "severity": "warning"
      }
    ]
  }
  ```

#### 2. Mark Single Notification as Read
- **Endpoint:** `PATCH /api/notifications/:id/read`
- **Success Response (`200 OK`):** `{ "success": true }`

#### 3. Mark All Notifications as Read
- **Endpoint:** `PATCH /api/notifications/read-all`
- **Success Response (`200 OK`):** `{ "success": true }`

---

### 3.4 Citizen Profile Endpoints (`src/services/profileService.js`)

#### 1. Fetch Citizen Profile
- **Endpoint:** `GET /api/profile`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "fullName": "Rohan Singh",
      "email": "rohan@example.com",
      "phone": "+91 98765 43210",
      "address": "Scheme No. 54, Vijay Nagar, Indore, MP - 452010",
      "bloodGroup": "O+",
      "emergencyContact": {
        "name": "Priya Singh",
        "relation": "Spouse",
        "phone": "+91 98765 12345"
      },
      "role": "Verified Citizen",
      "memberSince": "January 2025"
    }
  }
  ```

#### 2. Update Citizen Profile
- **Endpoint:** `PUT /api/profile`
- **Request Body:** Partial profile fields to update
- **Success Response (`200 OK`):** `{ "success": true, "data": { ... } }`

---

## 4. Step-by-Step Backend Connection Checklist

When connecting the real backend, follow this sequence:

1. **Step 1:** Confirm the backend server is running and responding to `GET /api/health` or similar.
2. **Step 2:** Update `src/services/authService.js` to execute real `fetch()` calls to `/api/auth/login` and `/api/auth/register`, storing the JWT in `localStorage` or relying on HTTP-only cookies.
3. **Step 3:** Update `src/services/incidentService.js` to replace `DEMO_INCIDENTS` with `fetch(`${API_BASE_URL}/incidents`)`.
4. **Step 4:** Update `src/services/incidentService.js submitIncidentReport()` to construct a `FormData` object and post to `${API_BASE_URL}/incidents`.
5. **Step 5:** Update `src/services/notificationService.js` to query `${API_BASE_URL}/notifications` and post read state updates.
6. **Step 6:** Run `npm run build` and test the live flows in the browser.
