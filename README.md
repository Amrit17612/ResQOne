# ResQOne - AI-Powered Emergency Response & Multi-Department Coordination Platform

> **Capstone Project**: Final Year B.Tech Computer Science  
> **Tech Stack**: Pure JavaScript (Node.js/Express ES Modules + React 18 + MongoDB + Socket.IO + Tailwind CSS)

---

## 1. Quick Start

### Backend
```bash
cd backend
npm install
npm run seed     # Seeds 10 specialized emergency role accounts, hospitals & ambulances
npm run dev      # Runs on port 5001
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # Runs on port 5173
```

---

## 2. 10 Specialized Dashboards Built & Connected

1. **Citizen Portal** (`/citizen`): Public reporting wizard, GPS auto-locate, verified hospital bed finder, real-time report tracker, and offline draft queue with automatic sync.
2. **Central Emergency Admin Dashboard** (`/admin`): Real-time intake queue, AI Advisory Decision Engine with confidence scores, priority override, and multi-agency routing.
3. **Police Command Dashboard** (`/police`): PCR van dispatch, crime and accident tracking, scene perimeter protection.
4. **Fire & Rescue Dashboard** (`/fire`): Water tender deployments, ladder trucks, hydrant logistics, and structural fire cooling logs.
5. **Hospital Dashboard** (`/hospital`): Live Bed Board (General, Oxygen, ICU, Trauma), optimistic locking controls, and incoming mass-casualty allocation acceptance.
6. **Ambulance & EMS Dashboard** (`/ambulance`): Fleet telematics, real-time GPS coordinate telemetry via WebSockets, and 9-stage patient transport lifecycle stepper.
7. **Disaster Management Dashboard** (`/disaster`): NDRF regional coordination for floods, earthquakes, and cyclones with hazard zones.
8. **Shelter & Relief Dashboard** (`/shelter`): Evacuee accommodation gates, drinking water, meal packet, and medical supplies inventory.
9. **Volunteer Dashboard** (`/volunteer`): Vetted humanitarian tasks, parcel distribution, and crowd coordination.
10. **Super Admin Dashboard** (`/superadmin`): Identity governance, role-permission matrix, MongoDB health, and tamper-evident audit logs.

---

## 3. Evaluation Demo Credentials

All test accounts share the password: `password123`

| Portal Role | Official Email | Clearance |
| :--- | :--- | :--- |
| **Citizen** | `citizen@resqone.org` | Public / Reporting |
| **Central Admin** | `admin@resqone.org` | Full Triage & Routing |
| **Police Dispatch** | `police@resqone.org` | Law Enforcement |
| **Fire Commander** | `fire@resqone.org` | Fire & Rescue |
| **Hospital Coordinator** | `hospital@resqone.org` | Critical Bed Inventory |
| **Ambulance Paramedic** | `ambulance@resqone.org` | Fleet Telematics |
| **Disaster Officer** | `disaster@resqone.org` | Macro Regional Crisis |
| **Shelter Manager** | `shelter@resqone.org` | Evacuee Accommodation |
| **Volunteer** | `volunteer@resqone.org` | Humanitarian Field Aid |
| **Super Admin** | `superadmin@resqone.org` | Global Governance |

*Note: The Login page also features a **1-Click Role Switcher** to test all 10 dashboards.*

