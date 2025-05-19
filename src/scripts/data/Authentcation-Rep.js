import api from "./api.js";
import API_CONFIG from "../config/ApiConfig.js";

class AuthRepository {
  constructor() {
    this._authStorageKey = "auth_token";
    this._userDataKey = "user_data";
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password (min 8 characters)
   * @returns {Promise<Object>} Registration response
   */
  async register({ name, email, password }) {
    return api.post(
      API_CONFIG.ENDPOINTS.REGISTER,
      { name, email, password },
      false
    );
  }

  /**
   * Login user and store auth token
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Login response with user data and token
   */
  async login({ email, password }) {
    console.log('Attempting login with email:', email); // Debug log
    try {
      console.log('Making API call to:', API_CONFIG.ENDPOINTS.LOGIN); // Debug log
      const response = await api.post(
        API_CONFIG.ENDPOINTS.LOGIN,
        { email, password },
        false
      );
      console.log('Login API response received:', response); // Debug log

      if (response.loginResult) {
        console.log('Saving auth data'); // Debug log
        this._saveAuthData(response.loginResult);
      } else {
        throw new Error('Invalid login response format');
      }

      return response;
    } catch (error) {
      console.error('Login API call failed:', error); // Debug log
      throw error;
    }
  }

  /**
   * Logout user and clear auth data
   */
  logout() {
    localStorage.removeItem(this._authStorageKey);
    localStorage.removeItem(this._userDataKey);

    window.dispatchEvent(new Event("user-logged-out"));
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated, false otherwise
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Get authentication token
   * @returns {string|null} Auth token or null if not authenticated
   */
  getToken() {
    return localStorage.getItem(this._authStorageKey);
  }

  /**
   * Get authenticated user data
   * @returns {Object|null} User data or null if not authenticated
   */
  getUserData() {
    const userData = localStorage.getItem(this._userDataKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Save authentication data to local storage
   * @param {Object} loginResult - Login result from API
   * @param {string} loginResult.token - Auth token
   * @param {string} loginResult.userId - User ID
   * @param {string} loginResult.name - User's name
   * @private
   */
  _saveAuthData(loginResult) {
    if (!loginResult || !loginResult.token) {
      throw new Error('Invalid login result');
    }

    const { token, userId, name } = loginResult;

    localStorage.setItem(this._authStorageKey, token);
    localStorage.setItem(this._userDataKey, JSON.stringify({
      userId: userId || loginResult.id, // Handle both userId and id fields
      name: name || loginResult.name
    }));

    window.dispatchEvent(new Event("user-logged-in"));
  }
}

const authRepository = new AuthRepository();
export default authRepository;
