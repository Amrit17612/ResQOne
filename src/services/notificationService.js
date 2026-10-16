/**
 * ResQOne Notification Service
 * 
 * Note: Real-time emergency notifications and push dispatch channels are managed by
 * the Backend team. This service module encapsulates demo notifications matching
 * the reference mockup with working All/Unread filters and in-memory read-state updates.
 */

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Your incident is in progress',
    message: 'Emergency responders (PCR Van #14) have been dispatched to MG Road for Road Accident #INC-001.',
    incidentType: 'Road Accident',
    incidentId: 'inc-001',
    category: 'incident_status', // 'incident_status' | 'safety_alert' | 'account'
    timestamp: '10:45 AM',
    relativeTime: '2 hours ago',
    read: false,
    severity: 'warning',
  },
  {
    id: 'notif-2',
    title: 'Your incident has been resolved',
    message: 'Fire tender unit completed cooling operations at Vijay Nagar transformer fire (#INC-002). Area secured.',
    incidentType: 'Fire',
    incidentId: 'inc-002',
    category: 'incident_status',
    timestamp: '05:40 PM',
    relativeTime: '1 day ago',
    read: false,
    severity: 'success',
  },
  {
    id: 'notif-3',
    title: 'New safety alert',
    message: 'Heavy rain expected in your area. During heavy rain, avoid low-lying areas and waterlogged underpasses.',
    category: 'safety_alert',
    timestamp: '09:00 AM',
    relativeTime: '2 days ago',
    read: false,
    severity: 'danger',
  },
  {
    id: 'notif-4',
    title: 'Your incident has been verified',
    message: 'Medical Emergency #INC-003 was verified by the central dispatch hub. BLS ambulance dispatched.',
    incidentType: 'Medical Emergency',
    incidentId: 'inc-003',
    category: 'incident_status',
    timestamp: '09:18 AM',
    relativeTime: '3 days ago',
    read: true,
    severity: 'info',
  },
  {
    id: 'notif-5',
    title: 'Emergency contact verified',
    message: 'Primary emergency contact (+91 98765 12345) verified for automated SOS broadcast.',
    category: 'account',
    timestamp: '04:30 PM',
    relativeTime: '5 days ago',
    read: true,
    severity: 'info',
  },
];

// In-memory notifications state
let currentNotifications = INITIAL_NOTIFICATIONS.map((n) => ({ ...n }));
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((callback) => {
    try {
      callback([...currentNotifications]);
    } catch (e) {
      console.error('Notification listener error:', e);
    }
  });
}

export const notificationService = {
  /**
   * Fetch all notifications
   */
  async getNotifications() {
    return {
      isDemo: true,
      data: [...currentNotifications],
    };
  },

  /**
   * Get dynamic summary counts for filters
   */
  getSummaryCounts(notifications = currentNotifications) {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const read = notifications.filter((n) => n.read).length;
    return { total, unread, read };
  },

  /**
   * Mark a single notification as read
   * @param {string} id
   */
  async markAsRead(id) {
    currentNotifications = currentNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    notifyListeners();
    return {
      isDemo: true,
      success: true,
      data: [...currentNotifications],
    };
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    currentNotifications = currentNotifications.map((n) => ({ ...n, read: true }));
    notifyListeners();
    return {
      isDemo: true,
      success: true,
      data: [...currentNotifications],
    };
  },

  /**
   * Subscribe to notification updates (e.g., for badges)
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  subscribe(callback) {
    listeners.add(callback);
    callback([...currentNotifications]);
    return () => {
      listeners.delete(callback);
    };
  },

  /**
   * Reset notifications back to default demo state
   */
  resetNotifications() {
    currentNotifications = INITIAL_NOTIFICATIONS.map((n) => ({ ...n }));
    notifyListeners();
    return [...currentNotifications];
  },
};

export default notificationService;
