/**
 * ResQOne Profile Service
 * 
 * Note: Citizen authentication and profile persistence are managed by the Backend team.
 * This service layer encapsulates demo citizen profile state in memory.
 * Any updates performed in the UI are temporary demo changes for testing and do not persist
 * across full page reloads until official backend profile API endpoints are integrated.
 */

export const INITIAL_DEMO_PROFILE = {
  fullName: 'Rohan Singh',
  email: 'rohan@example.com',
  phone: '+91 98765 43210',
  address: 'Scheme No. 54, Vijay Nagar, Indore, MP - 452010',
  bloodGroup: 'O+',
  emergencyContact: {
    name: 'Priya Singh',
    relation: 'Spouse',
    phone: '+91 98765 12345',
  },
  role: 'Verified Citizen',
  memberSince: 'January 2025',
};

// In-memory demo profile state
let currentProfile = { ...INITIAL_DEMO_PROFILE };

export const profileService = {
  /**
   * Fetch current citizen profile data
   */
  async getProfile() {
    return {
      isDemo: true,
      data: { ...currentProfile },
    };
  },

  /**
   * Update profile data in local component/service memory
   * @param {Object} updatedFields
   */
  async updateProfile(updatedFields) {
    currentProfile = {
      ...currentProfile,
      ...updatedFields,
      emergencyContact: {
        ...currentProfile.emergencyContact,
        ...(updatedFields.emergencyContact || {}),
      },
    };

    return {
      isDemo: true,
      status: 'success_in_memory',
      message: 'Profile updated in component memory (temporary demo interaction). Real persistence requires backend citizen profile API integration.',
      data: { ...currentProfile },
    };
  },

  /**
   * Reset profile data back to original demo values
   */
  resetProfile() {
    currentProfile = { ...INITIAL_DEMO_PROFILE };
    return { ...currentProfile };
  },
};

export default profileService;
