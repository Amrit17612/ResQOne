/**
 * ResQOne Incident Service & Demo Data Module
 * 
 * Note: Real backend endpoints are managed by the Backend team member.
 * This service encapsulates incident data fetching and calculation.
 * It provides the documented dataset matching the mockup reference
 * with transparent demo-mode indicators until the backend API is connected.
 */

import carAccidentImg from '../assets/incident_car_accident.jpg';
import rescuePersonnelImg from '../assets/auth_rescue.jpg';
import ambulanceImg from '../assets/hero_ambulance.jpg';

export const DEMO_INCIDENTS = [
  {
    id: 'inc-001',
    type: 'Road Accident',
    location: 'MG Road, Indore',
    relativeTime: '2 hours ago',
    formattedDate: '12 Jan 2025, 10:30 AM',
    status: 'In Progress',
    description: 'Two vehicles collided near the main signal. Multiple people injured. Ambulance required.',
    image: carAccidentImg,
    coordinates: { lat: 22.7196, lng: 75.8577 },
    timeline: [
      { step: 'Reported', time: '12 Jan 2025, 10:30 AM', completed: true },
      { step: 'Verified', time: '12 Jan 2025, 10:45 AM', completed: true },
      { step: 'Assigned', time: '12 Jan 2025, 11:10 AM', completed: true },
      { step: 'In Progress', time: '12 Jan 2025, 11:30 AM', active: true },
      { step: 'Resolved', time: 'Pending on-site completion', pending: true },
    ],
  },
  {
    id: 'inc-002',
    type: 'Fire',
    location: 'Vijay Nagar, Indore',
    relativeTime: '1 day ago',
    formattedDate: '10 Jan 2025, 05:20 PM',
    status: 'Resolved',
    description: 'Electrical transformer fire outside commercial complex. Fire brigade deployed 2 water tenders and secured area.',
    image: rescuePersonnelImg,
    coordinates: { lat: 22.7533, lng: 75.8937 },
    timeline: [
      { step: 'Reported', time: '10 Jan 2025, 05:20 PM', completed: true },
      { step: 'Verified', time: '10 Jan 2025, 05:25 PM', completed: true },
      { step: 'Assigned', time: '10 Jan 2025, 05:32 PM', completed: true },
      { step: 'In Progress', time: '10 Jan 2025, 05:40 PM', completed: true },
      { step: 'Resolved', time: '10 Jan 2025, 06:15 PM', completed: true },
    ],
  },
  {
    id: 'inc-003',
    type: 'Medical Emergency',
    location: 'Scheme No. 54, Indore',
    relativeTime: '3 days ago',
    formattedDate: '08 Jan 2025, 09:15 AM',
    status: 'Resolved',
    description: 'Elderly citizen experienced severe shortness of breath. Emergency BLS ambulance dispatched with oxygen supply.',
    image: ambulanceImg,
    coordinates: { lat: 22.7601, lng: 75.8894 },
    timeline: [
      { step: 'Reported', time: '08 Jan 2025, 09:15 AM', completed: true },
      { step: 'Verified', time: '08 Jan 2025, 09:18 AM', completed: true },
      { step: 'Assigned', time: '08 Jan 2025, 09:22 AM', completed: true },
      { step: 'In Progress', time: '08 Jan 2025, 09:30 AM', completed: true },
      { step: 'Resolved', time: '08 Jan 2025, 10:05 AM', completed: true },
    ],
  },
];

export const incidentService = {
  /**
   * Fetch all incidents for the logged in citizen (currently demo dataset)
   */
  async getIncidents() {
    return {
      isDemo: true,
      data: DEMO_INCIDENTS,
    };
  },

  /**
   * Fetch a single incident by ID
   * @param {string} id
   */
  async getIncidentById(id) {
    const incident = DEMO_INCIDENTS.find((item) => item.id === id) || DEMO_INCIDENTS[0];
    return {
      isDemo: true,
      data: incident,
    };
  },

  /**
   * Calculate summary metrics dynamically from the dataset
   * @param {Array} incidents
   */
  getSummaryCounts(incidents = DEMO_INCIDENTS) {
    const total = incidents.length;
    const inProgress = incidents.filter(
      (item) => item.status.toLowerCase() === 'in progress'
    ).length;
    const resolved = incidents.filter(
      (item) => item.status.toLowerCase() === 'resolved'
    ).length;

    return { total, inProgress, resolved };
  },

  /**
   * Submit emergency incident report
   * Encapsulates client-side submission logic for future backend API integration.
   * @param {Object} reportData - { type, description, location, coordinates, file }
   */
  async submitIncidentReport(reportData) {
    return {
      status: 'pending_backend',
      isDemo: true,
      message: 'Report payload validated on client. Live dispatch connection pending backend API integration.',
      data: {
        id: `inc-demo-${Date.now()}`,
        ...reportData,
        status: 'Reported',
        formattedDate: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    };
  },
};

export default incidentService;
