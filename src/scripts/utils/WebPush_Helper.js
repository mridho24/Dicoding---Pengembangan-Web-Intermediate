import API_CONFIG from "../config/ApiConfig.js";
import storyRepository from "../data/StoryRepository.js";
import Swal from "sweetalert2";

class WebPushHelper {
  constructor() {
    this._swRegistration = null;
    this._isSubscribed = false;
    this._initializePromise = null;
  }

  /**
   * Initialize web push functionality
   * @returns {Promise<boolean>} Whether push is supported and initialized
   */
  async init() {
    if (this._initializePromise) {
      return this._initializePromise;
    }

    this._initializePromise = (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Push notifications are not supported");
        return false;
      }

      try {
        // Wait for service worker to be ready
        this._swRegistration = await navigator.serviceWorker.ready;

        if (!this._swRegistration) {
          console.error('No service worker registration found');
          return false;
        }

        console.log('Service Worker registered with scope:', this._swRegistration.scope);

        // Check existing subscription
        await this._updateSubscriptionState();

        return true;
      } catch (error) {
        console.error("Service Worker registration failed:", error);
        return false;
      }
    })();

    return this._initializePromise;
  }

  /**
   * Request notification permission
   * @returns {Promise<string>} Permission state
   */
  async requestPermission() {
    try {
      const result = await Notification.requestPermission();
      console.log('Notification permission result:', result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  /**
   * Subscribe to push notifications
   * @returns {Promise<void>}
   */
  async subscribe() {
    if (!this._swRegistration) {
      const initialized = await this.init();
      if (!initialized) {
        throw new Error('Push notification initialization failed');
      }
    }

    try {
      // Request notification permission if not already granted
      if (Notification.permission !== 'granted') {
        const permission = await this.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission denied');
        }
      }

      // Check for existing subscription
      const existingSubscription = await this._swRegistration.pushManager.getSubscription();
      if (existingSubscription) {
        // If already subscribed, update state and return
        await this._updateSubscriptionState();
        return;
      }

      // Convert VAPID key
      const applicationServerKey = this._urlBase64ToUint8Array(
        API_CONFIG.WEB_PUSH.VAPID_PUBLIC_KEY
      );

      // Subscribe to push with vapid key
      const subscription = await this._swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log('Push Subscription successful:', subscription);

      const subscriptionData = this._formatSubscriptionForApi(subscription);

      // Send subscription to server
      await storyRepository.subscribeToPushNotifications(subscriptionData);

      // Update subscription state after successful server registration
      await this._updateSubscriptionState();

      await Swal.fire({
        title: 'Notifikasi Aktif!',
        text: 'Anda akan menerima notifikasi saat ada story baru.',
        icon: 'success',
        confirmButtonColor: '#2563EB',
      });
    } catch (error) {
      console.error('Push subscription failed:', error);
      await Swal.fire({
        title: 'Gagal Mengaktifkan Notifikasi',
        text: error.message || 'Terjadi kesalahan saat mengaktifkan notifikasi.',
        icon: 'error',
        confirmButtonColor: '#2563EB',
      });
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   * @returns {Promise<void>}
   */
  async unsubscribe() {
    if (!this._swRegistration) {
      const initialized = await this.init();
      if (!initialized) {
        throw new Error('Push notification initialization failed');
      }
    }

    try {
      const subscription = await this._swRegistration.pushManager.getSubscription();

      if (!subscription) {
        await this._updateSubscriptionState();
        return;
      }

      const endpoint = subscription.endpoint;

      // Unsubscribe locally
      await subscription.unsubscribe();

      // Unsubscribe from server
      await storyRepository.unsubscribeFromPushNotifications(endpoint);

      // Update subscription state after successful unsubscription
      await this._updateSubscriptionState();

      await Swal.fire({
        title: "Notifikasi Dinonaktifkan",
        text: "Anda tidak akan menerima notifikasi lagi.",
        icon: "info",
        confirmButtonColor: "#2563EB",
      });
    } catch (error) {
      console.error('Error unsubscribing:', error);

      await Swal.fire({
        title: "Gagal Menonaktifkan Notifikasi",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#2563EB",
      });

      throw error;
    }
  }

  /**
   * Update subscription state and dispatch event
   * @returns {Promise<void>}
   * @private
   */
  async _updateSubscriptionState() {
    if (!this._swRegistration) {
      this._isSubscribed = false;
    } else {
      const subscription = await this._swRegistration.pushManager.getSubscription();
      this._isSubscribed = !!subscription;
    }

    this._dispatchSubscriptionChange(this._isSubscribed);
  }

  /**
   * Dispatch subscription change event
   * @param {boolean} isSubscribed - Current subscription state
   * @private
   */
  _dispatchSubscriptionChange(isSubscribed) {
    window.dispatchEvent(new CustomEvent('subscription-changed', {
      detail: { isSubscribed }
    }));
  }

  /**
   * Format subscription data for API
   * @param {PushSubscription} subscription - Push subscription
   * @returns {Object} Formatted subscription data
   * @private
   */
  _formatSubscriptionForApi(subscription) {
    const subscriptionJson = subscription.toJSON();
    return {
      endpoint: subscriptionJson.endpoint,
      keys: {
        p256dh: subscriptionJson.keys.p256dh,
        auth: subscriptionJson.keys.auth,
      },
    };
  }

  /**
   * Convert base64 string to Uint8Array for applicationServerKey
   * @param {string} base64String - Base64 encoded string
   * @returns {Uint8Array} Converted array
   * @private
   */
  _urlBase64ToUint8Array(base64String) {
    try {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      return outputArray;
    } catch (error) {
      console.error('Error converting VAPID key:', error);
      throw new Error('Invalid VAPID key format');
    }
  }

  /**
   * Check if user is subscribed to push notifications
   * @returns {Promise<boolean>} Whether user is subscribed
   */
  async isSubscribed() {
    if (!this._swRegistration) {
      return false;
    }
    const subscription = await this._swRegistration.pushManager.getSubscription();
    return !!subscription;
  }
}

export default new WebPushHelper();
