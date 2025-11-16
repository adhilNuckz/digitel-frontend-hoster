import { account } from './appwrite';
import { ID } from 'appwrite';

export const authService = {
  // Create account with email/password
  async createAccount(email, password, name) {
    try {
      const userAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      return userAccount;
    } catch (error) {
      throw error;
    }
  },

  // Login with email/password
  async login(email, password) {
    try {
      return await account.createEmailSession(email, password);
    } catch (error) {
      throw error;
    }
  },

  // Login with GitHub OAuth
  async loginWithGitHub() {
    try {
      account.createOAuth2Session(
        'github',
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/login`
      );
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  },

  // Logout
  async logout() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      throw error;
    }
  },

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
};
