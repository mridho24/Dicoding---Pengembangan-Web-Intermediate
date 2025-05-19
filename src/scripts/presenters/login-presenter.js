import LoginPage from "../views/pages/LoginPage.js";
import authRepository from "../data/Authentcation-Rep.js";
import webPushHelper from "../utils/WebPush_Helper.js";
import { applyCustomAnimation } from "../utils/view-transition.js";
import Swal from "sweetalert2";

class LoginPresenter {
  constructor(params = {}) {
    this._params = params;
    this._view = null;
    this._container = params.container;
    this._error = null;
    this._isLoading = false;

    this._handleLogin = this._handleLogin.bind(this);
  }

  async init() {
    if (authRepository.isAuthenticated()) {
      window.location.hash = "#/";
      return;
    }

    applyCustomAnimation("#pageContent", {
      name: "login-transition",
      duration: 400,
    });

    this._renderView();
  }

  /**
   * Render the view with current state
   */
  _renderView() {
    console.log('Rendering login view'); // Debug log
    this._view = new LoginPage({
      error: this._error,
      isLoading: this._isLoading,
      container: this._container,
    });

    this._view.render();
    this._view.setLoginHandler(this._handleLogin);
  }

  /**
   * Handle login form submission
   * @param {Object} credentials - Login credentials
   */
  async _handleLogin(credentials) {
    console.log('Login handler called with credentials:', { email: credentials.email }); // Debug log

    if (this._isLoading) {
      console.log('Already loading, ignoring request'); // Debug log
      return;
    }

    try {
      this._isLoading = true;
      console.log('Setting loading state'); // Debug log

      if (this._view) {
        this._view.setLoading(true);
      }

      console.log('Calling auth repository login'); // Debug log
      const response = await authRepository.login(credentials);
      console.log('Login successful, response:', response); // Debug log

      // Show success toast
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });

      await Toast.fire({
        icon: "success",
        title: "Login berhasil",
      });

      // Initialize web push after successful login
      await this._initializeWebPush();

      // Ensure we're authenticated before navigating
      if (authRepository.isAuthenticated()) {
        console.log('Authentication confirmed, navigating to home'); // Debug log
        window.location.hash = "#/";
      } else {
        throw new Error('Authentication failed after successful login');
      }
    } catch (error) {
      console.error("Login failed:", error);

      this._error =
        error.message ||
        "Login failed. Please check your credentials and try again.";
      this._isLoading = false;
      this._renderView();
    } finally {
      this._isLoading = false;

      if (this._view) {
        this._view.setLoading(false);
      }
    }
  }

  async _initializeWebPush() {
    try {
      const isPushSupported = await webPushHelper.init();

      if (isPushSupported) {
        const permission = Notification.permission;

        if (permission === "default") {
          await webPushHelper.requestPermission();
        }

        if (
          Notification.permission === "granted" &&
          !webPushHelper.isSubscribed()
        ) {
          await webPushHelper.subscribe();
        }
      }
    } catch (error) {
      console.error("Failed to initialize push notifications:", error);
    }
  }

  cleanup() {
    if (this._view) {
      this._view.cleanup();
    }
  }
}

export default LoginPresenter;
