import ApiConfig from '../config/ApiConfig';

const NotificationHelper = {
    async requestPermission() {
        if (!('Notification' in window)) {
            console.error('Browser tidak mendukung notifikasi');
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.error('Izin notifikasi tidak diberikan');
            return false;
        }

        return true;
    },

    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.error('Service Worker tidak didukung browser ini.');
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.register('/WorkService.js', {
                scope: '/'
            });

            // Tunggu hingga service worker aktif
            if (registration.active) {
                return registration;
            }

            return new Promise((resolve) => {
                registration.addEventListener('activate', () => {
                    resolve(registration);
                });
            });
        } catch (error) {
            console.error('Registrasi service worker gagal:', error);
            return null;
        }
    },

    async getExistingSubscription() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            return subscription;
        } catch (error) {
            console.error('Error getting subscription:', error);
            return null;
        }
    },

    urlBase64ToUint8Array(base64String) {
        try {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }

            return outputArray;
        } catch (error) {
            console.error('Error converting VAPID key:', error);
            throw error;
        }
    },

    async subscribePushMessage(registration) {
        try {
            // Tunggu service worker aktif
            await navigator.serviceWorker.ready;

            const vapidKey = ApiConfig.WEB_PUSH.VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                throw new Error('VAPID public key is not configured');
            }

            const applicationServerKey = this.urlBase64ToUint8Array(vapidKey);
            const options = {
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            };

            const subscription = await registration.pushManager.subscribe(options);
            if (subscription) {
                console.log('Push Notification subscription success:', subscription);
                return subscription;
            }

            throw new Error('Failed to get push subscription');
        } catch (error) {
            console.error('Gagal melakukan subscribe:', error);
            throw error;
        }
    },

    async unsubscribePushMessage() {
        try {
            const subscription = await this.getExistingSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error unsubscribing:', error);
            throw error;
        }
    }
};

export default NotificationHelper; 