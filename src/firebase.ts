// Mock Firebase implementation
export const app = {};
export const db = {};
export const auth = {
  currentUser: {
    uid: localStorage.getItem('guest_uid') || 'guest_123',
    email: 'guest@neuroenglish.ai',
    emailVerified: false,
    isAnonymous: true,
    tenantId: null,
    providerData: []
  }
};
export const googleProvider = {};
