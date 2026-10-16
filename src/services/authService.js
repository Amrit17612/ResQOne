/**
 * ResQOne Authentication Service
 * 
 * Note: Backend authentication endpoints are managed by the Backend team member.
 * This service layer is configured with the environment base URL and prepared
 * for real API integration once backend contracts and payloads are provided.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const authService = {
  /**
   * Pending backend endpoint for Citizen Login
   * @param {Object} credentials - { email, password, rememberMe }
   */
  async login(credentials) {
    // Contract placeholder: when backend endpoint is live:
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials)
    // });
    // return response.json();
    return {
      status: 'pending_backend',
      message: 'Backend authentication service is not yet connected. Integration pending backend endpoint availability.',
    };
  },

  /**
   * Pending backend endpoint for Citizen Registration
   * @param {Object} userData - { fullName, email, mobileNumber, password }
   */
  async register(userData) {
    return {
      status: 'pending_backend',
      message: 'Backend registration service is not yet connected. Integration pending backend endpoint availability.',
    };
  },

  /**
   * Password reset request placeholder
   * @param {string} email
   */
  async requestPasswordReset(email) {
    return {
      status: 'pending_backend',
      message: 'Password reset service will be integrated with the official backend mailer.',
    };
  },
};

export default authService;
